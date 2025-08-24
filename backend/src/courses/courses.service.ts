// src/courses/courses.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, CourseStatus } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // -----------------------------
  // Course Management
  // -----------------------------
  async create(data: {
    title: string;
    description?: string;
    instructorId: number;
    status?: CourseStatus;
  }) {
    return this.prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        instructorId: data.instructorId,
        status: data.status ?? CourseStatus.DRAFT,
      },
    });
  }

  async findAll(studentId?: number, onlyPublished = false) {
    const courses = await this.prisma.course.findMany({
      where: onlyPublished ? { status: CourseStatus.PUBLISHED } : {},
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        enrollments: true,
        lessons: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (studentId) {
      const studentEnrollments = await this.prisma.enrollment.findMany({
        where: { studentId },
        select: { courseId: true },
      });
      const enrolledCourseIds = new Set(studentEnrollments.map((e) => e.courseId));

      return courses.map((c) => ({
        ...c,
        enrolled: enrolledCourseIds.has(c.id),
      }));
    }

    return courses;
  }

  async deleteCourse(courseId: number, instructorId: number) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    if (course.instructorId !== instructorId) {
      throw new BadRequestException('You do not have permission to delete this course');
    }

    return this.prisma.course.delete({ where: { id: courseId } });
  }

  async updateStatus(courseId: number, status: CourseStatus, instructorId: number) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId) throw new BadRequestException('No permission');

    return this.prisma.course.update({
      where: { id: courseId },
      data: { status }, // use enum CourseStatus
    });
  }

  async findById(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        enrollments: true,
        lessons: true,
        category: true,
      },
    });

    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async findByInstructor(instructorId: number) {
    return this.prisma.course.findMany({
      where: { instructorId },
      include: {
        enrollments: true,
        lessons: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // -----------------------------
  // Lesson Management
  // -----------------------------
  async addLesson(
    courseId: number,
    data: { title: string; content?: string; videoUrl?: string },
  ) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    return this.prisma.lesson.create({
      data: {
        title: data.title,
        content: data.content,
        videoUrl: data.videoUrl,
        courseId,
      },
    });
  }

  async getCourseAnalytics(instructorId: number) {
  const courses = await this.prisma.course.findMany({
    where: { instructorId },
    include: {
      enrollments: true, // include enrollments
      lessons: true,     // include lessons
    },
  });

  return courses.map(course => {
    const totalEnrollments = course.enrollments?.length || 0;

    // Count students with completedAt not null in enrollments
    const completedEnrollments = course.enrollments?.filter(e => e.completedAt !== null).length || 0;

    const completionRate = totalEnrollments ? (completedEnrollments / totalEnrollments) * 100 : 0;

    return {
      id: course.id,
      title: course.title,
      totalEnrollments,
      completionRate: Number(completionRate.toFixed(2)),
      lessonsCount: course.lessons?.length || 0,
    };
  });
}


  // -----------------------------
  // Request admin to publish
  // -----------------------------
  async requestPublish(courseId: number, instructorId: number) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    if (course.instructorId !== instructorId) {
      throw new BadRequestException('You do not have permission to request publish for this course');
    }

    if (course.status !== CourseStatus.DRAFT) {
      throw new BadRequestException('Only Draft courses can be requested for publish');
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: { status: CourseStatus.PENDING },
    });
  }

  // -----------------------------
  // Prerequisite Management (JSON array of strings)
  // -----------------------------
  async addPrerequisite(courseId: number, prerequisiteName: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { prerequisites: true },
    });

    if (!course) throw new NotFoundException('Course not found');

    let currentPrereqs: string[] = [];

    if (Array.isArray(course.prerequisites)) {
      currentPrereqs = course.prerequisites.filter((p): p is string => typeof p === 'string');
    }

    if (!currentPrereqs.includes(prerequisiteName)) {
      currentPrereqs.push(prerequisiteName);
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        prerequisites: currentPrereqs as Prisma.InputJsonValue,
      },
    });
  }
}
