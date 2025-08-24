// src/admin/admin.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourseStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------ Courses ------------------

  async getAllCourses() {
    return this.prisma.course.findMany({
      include: { instructor: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCourseById(courseId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        lessons: true,
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async approveCourse(courseId: number) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== CourseStatus.PENDING)
      throw new BadRequestException('Only pending courses can be approved');

    return this.prisma.course.update({
      where: { id: courseId },
      data: { status: CourseStatus.PUBLISHED },
    });
  }

  async rejectCourse(courseId: number) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== CourseStatus.PENDING)
      throw new BadRequestException('Only pending courses can be rejected');

    return this.prisma.course.update({
      where: { id: courseId },
      data: { status: CourseStatus.REJECTED },
    });
  }

  async deleteCourse(courseId: number) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.course.delete({ where: { id: courseId } });
  }

  // ------------------ Users ------------------

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ------------------ Search ------------------

  async search(query: string) {
    const courses = await this.prisma.course.findMany({
      where: { title: { contains: query, mode: 'insensitive' } },
      include: { instructor: { select: { name: true } } },
    });

    const users = await this.prisma.user.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
    });

    return [
      ...courses.map(c => ({
        id: c.id,
        type: 'course',
        name: c.title,
        extra: c.instructor.name,
      })),
      ...users.map(u => ({
        id: u.id,
        type: 'user',
        name: u.name,
        extra: u.role,
      })),
    ];
  }

  // ------------------ Analytics ------------------

  async getAnalytics() {
    const totalCourses = await this.prisma.course.count();
    const totalStudents = await this.prisma.user.count({ where: { role: 'STUDENT' } });
    const totalInstructors = await this.prisma.user.count({ where: { role: 'INSTRUCTOR' } });

    const coursesPerInstructorRaw = await this.prisma.course.groupBy({
      by: ['instructorId'],
      _count: { id: true },
    });

    const coursesPerInstructor = await Promise.all(
      coursesPerInstructorRaw.map(async (cpi) => {
        const instructor = await this.prisma.user.findUnique({
          where: { id: cpi.instructorId },
        });
        return {
          instructorName: instructor?.name || 'N/A',
          courseCount: cpi._count.id,
        };
      }),
    );

    // Students per course
    const studentsPerCourseRaw = await this.prisma.enrollment.groupBy({
      by: ['courseId'],
      _count: { id: true },
    });

    const studentsPerCourse = await Promise.all(
      studentsPerCourseRaw.map(async (spc) => {
        const course = await this.prisma.course.findUnique({
          where: { id: spc.courseId },
        });
        return {
          courseTitle: course?.title || 'N/A',
          studentCount: spc._count.id,
        };
      }),
    );

    // Course status distribution
    const courseStatusDistributionRaw = await this.prisma.course.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const courseStatusDistribution = courseStatusDistributionRaw.map((cs) => ({
      status: cs.status,
      count: cs._count.id,
    }));

    return {
      totalCourses,
      totalStudents,
      totalInstructors,
      coursesPerInstructor,
      studentsPerCourse,
      courseStatusDistribution,
    };
  }

  // ------------------ Admin Profile ------------------

  async updateProfile(adminId: number, body: { name?: string; email?: string }) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    return this.prisma.user.update({
      where: { id: adminId },
      data: {
        name: body.name ?? admin.name,
        email: body.email ?? admin.email,
      },
    });
  }

  async getProfile(adminId: number) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }
}
