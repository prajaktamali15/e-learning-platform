import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, CourseStatus } from '@prisma/client';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InstructorService {
  private prisma = new PrismaClient();

  // ----------------------
  // Profile Methods
  // ----------------------
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async updateProfile(
    userId: number,
    body: { name?: string; email?: string; currentPassword?: string; newPassword?: string }
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    if (body.newPassword) {
      if (!body.currentPassword) throw new BadRequestException('Current password required');
      const isMatch = await bcrypt.compare(body.currentPassword, user.password);
      if (!isMatch) throw new BadRequestException('Current password is incorrect');
      const hashedPassword = await bcrypt.hash(body.newPassword, 10);
      user.password = hashedPassword;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name ?? user.name,
        email: body.email ?? user.email,
        password: body.newPassword ? user.password : undefined,
      },
    });

    return { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role };
  }

  // ----------------------
  // Delete course
  // ----------------------
  async deleteCourse(userId: number, courseId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: true, enrollments: true },
    });

    if (!course || course.instructorId !== userId) {
      throw new NotFoundException('Course not found or not owned by you');
    }

    if (course.status !== CourseStatus.PENDING && course.status !== CourseStatus.DRAFT) {
      throw new BadRequestException('Only pending or draft courses can be deleted');
    }

    await this.prisma.lesson.deleteMany({ where: { courseId } });
    await this.prisma.enrollment.deleteMany({ where: { courseId } });

    return this.prisma.course.delete({ where: { id: courseId } });
  }

  async getPendingCourses(userId: number) {
    return this.prisma.course.findMany({
      where: { instructorId: userId, status: CourseStatus.PENDING },
      include: { lessons: true },
    });
  }

  // ----------------------
  // Course Methods
  // ----------------------
  async createCourse(userId: number, dto: CreateCourseDto) {
    if (dto.lessons) {
      dto.lessons.forEach((lesson) => {
        if (!lesson.title) throw new BadRequestException('Each lesson must have a title');
      });
    }

    const course = await this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description ?? undefined,
        instructorId: userId,
        categoryId: dto.categoryId ?? undefined,
        status: CourseStatus.PENDING,
        prerequisites: dto.prerequisites ?? [],
      },
    });

    if (dto.lessons?.length) {
      const lessonsData = dto.lessons.map((lesson) => ({
        title: lesson.title!,
        content: lesson.content ?? undefined,
        videoUrl: lesson.videoUrl ?? undefined,
        attachmentUrl: lesson.attachmentUrl ?? undefined,
        courseId: course.id,
      }));
      await this.prisma.lesson.createMany({ data: lessonsData });
    }

    return this.prisma.course.findUnique({
      where: { id: course.id },
      include: { lessons: true, category: true as any },
    });
  }

  async updateCourse(courseId: number, userId: number, dto: UpdateCourseDto) {
    const existingCourse = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!existingCourse || existingCourse.instructorId !== userId) {
      throw new NotFoundException('Course not found or not owned by instructor');
    }

    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        title: dto.title ?? existingCourse.title,
        description: dto.description ?? existingCourse.description,
        categoryId: dto.categoryId ?? existingCourse.categoryId,
        prerequisites: dto.prerequisites ?? existingCourse.prerequisites ?? [],
      },
    });

    if (dto.lessons?.length) {
      for (const lesson of dto.lessons) {
        if (lesson.id) {
          await this.prisma.lesson.update({
            where: { id: lesson.id },
            data: {
              title: lesson.title ?? undefined,
              content: lesson.content ?? undefined,
              videoUrl: lesson.videoUrl ?? undefined,
              attachmentUrl: lesson.attachmentUrl ?? undefined,
            },
          });
        } else {
          if (!lesson.title) throw new BadRequestException('New lesson must have a title');
          await this.prisma.lesson.create({
            data: {
              title: lesson.title,
              content: lesson.content ?? undefined,
              videoUrl: lesson.videoUrl ?? undefined,
              attachmentUrl: lesson.attachmentUrl ?? undefined,
              courseId,
            },
          });
        }
      }
    }

    return this.prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: true, category: true as any },
    });
  }

  // ----------------------
  // Add lesson with file support
  // ----------------------
  async addLesson(
    userId: number,
    courseId: number,
    lesson: { title: string; content?: string; videoUrl?: string; attachmentUrl?: string }
  ) {
    if (!courseId) throw new BadRequestException('courseId is required');
    if (!lesson.title) throw new BadRequestException('Lesson must have a title');

    const course = await this.prisma.course.findUnique({ where: { id: Number(courseId) } });
    if (!course || course.instructorId !== userId) {
      throw new NotFoundException('Course not found or not owned by instructor');
    }

    return this.prisma.lesson.create({
      data: {
        title: lesson.title,
        content: lesson.content ?? undefined,
        videoUrl: lesson.videoUrl ?? undefined,
        attachmentUrl: lesson.attachmentUrl ?? undefined,
        courseId: Number(courseId),
      },
    });
  }

  // ----------------------
  // Delete a lesson
  // ----------------------
  async deleteLesson(userId: number, lessonId: number) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const course = await this.prisma.course.findUnique({ where: { id: lesson.courseId } });
    if (!course || course.instructorId !== userId) {
      throw new BadRequestException('You do not have permission to delete this lesson');
    }

    return this.prisma.lesson.delete({ where: { id: lessonId } });
  }

  // ----------------------
  // Update a lesson
  // ----------------------
  async updateLesson(
    userId: number,
    lessonId: number,
    data: { title?: string; content?: string; videoUrl?: string; attachmentUrl?: string }
  ) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const course = await this.prisma.course.findUnique({ where: { id: lesson.courseId } });
    if (!course || course.instructorId !== userId) {
      throw new BadRequestException('You do not have permission to update this lesson');
    }

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: data.title ?? lesson.title,
        content: data.content ?? lesson.content,
        videoUrl: data.videoUrl ?? lesson.videoUrl,
        attachmentUrl: data.attachmentUrl ?? lesson.attachmentUrl,
      },
    });
  }

  // ----------------------
  // Cancel Publish & Status Update
  // ----------------------
  async cancelPublishRequest(userId: number, courseId: number) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== userId) {
      throw new NotFoundException('Course not found or not owned by you');
    }

    if (course.status !== CourseStatus.PENDING) {
      throw new BadRequestException('Only pending courses can cancel the publish request');
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: { status: CourseStatus.DRAFT },
    });
  }

  async updateCourseStatus(userId: number, courseId: number, status: CourseStatus) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== userId) {
      throw new NotFoundException('Course not found or not owned by you');
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: { status },
    });
  }

  // ----------------------
  // Search courses
  // ----------------------
  async searchCourses(instructorId: number, query: string) {
    if (!query) return [];

    return this.prisma.course.findMany({
      where: {
        instructorId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { lessons: true, enrollments: true },
    });
  }
}
