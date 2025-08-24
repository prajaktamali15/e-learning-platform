import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  Patch,
  Get,
  Query,
  Param,
  UploadedFiles,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CourseStatus } from '@prisma/client';

@Controller('instructor/courses')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  // ----------------------
  // Profile Endpoints
  // ----------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  @Get('me')
  async getProfile(@Req() req: any) {
    const userId = req.user.id;
    return this.instructorService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  @Patch('me')
  async updateProfile(@Req() req: any, @Body() body: any) {
    const userId = req.user.id;
    return this.instructorService.updateProfile(userId, body);
  }

  // ----------------------
  // Course Endpoints
  // ----------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  @Post()
  async createCourse(@Req() req: any, @Body() dto: CreateCourseDto) {
    const userId = req.user.id;
    if (!userId) throw new BadRequestException('Invalid user');
    const course = await this.instructorService.createCourse(userId, dto);
    return { success: true, course };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  @Patch(':id')
  async updateCourse(
    @Req() req: any,
    @Param('id') courseId: string,
    @Body() dto: UpdateCourseDto
  ) {
    const userId = req.user.id;
    return this.instructorService.updateCourse(Number(courseId), userId, dto);
  }

  // ----------------------
  // Search Endpoint
  // ----------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  @Get('search')
  async searchCourses(@Req() req: any, @Query('query') query: string) {
    const instructorId = req.user.id;
    if (!query || query.trim() === '') return [];
    return this.instructorService.searchCourses(instructorId, query);
  }

  // ----------------------
  // Add Lesson with File Upload (Video + Attachment)
  // ----------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  @Post(':courseId/lessons')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'videoFile', maxCount: 1 },
        { name: 'attachmentFile', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + extname(file.originalname));
          },
        }),
        limits: { fileSize: 500 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
          if (!file.mimetype.match(/\/(pdf|mp4)$/)) {
            return cb(new BadRequestException('Only PDF and MP4 files are allowed'), false);
          }
          cb(null, true);
        },
      }
    )
  )
  async addLesson(
    @Param('courseId') courseId: string,
    @UploadedFiles()
    files: {
      videoFile?: Express.Multer.File[];
      attachmentFile?: Express.Multer.File[];
    },
    @Body() body: { title: string; content?: string },
    @Req() req: any
  ) {
    const userId = req.user.id;
    return this.instructorService.addLesson(userId, Number(courseId), {
      title: body.title,
      content: body.content,
      videoUrl: files.videoFile?.[0] ? `/uploads/${files.videoFile[0].filename}` : undefined,
      attachmentUrl: files.attachmentFile?.[0] ? `/uploads/${files.attachmentFile[0].filename}` : undefined,
    });
  }

  // ----------------------
  // Update Lesson with optional file uploads
  // ----------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  @Patch('lessons/:lessonId')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'videoFile', maxCount: 1 },
        { name: 'attachmentFile', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + extname(file.originalname));
          },
        }),
        limits: { fileSize: 500 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
          if (!file.mimetype.match(/\/(pdf|mp4)$/)) {
            return cb(new BadRequestException('Only PDF and MP4 files are allowed'), false);
          }
          cb(null, true);
        },
      }
    )
  )
  async updateLesson(
    @Req() req: any,
    @Param('lessonId') lessonId: string,
    @UploadedFiles() files: {
      videoFile?: Express.Multer.File[];
      attachmentFile?: Express.Multer.File[];
    },
    @Body() body: { title?: string; content?: string }
  ) {
    const userId = req.user.id;

    return this.instructorService.updateLesson(userId, Number(lessonId), {
      title: body.title,
      content: body.content,
      videoUrl: files.videoFile?.[0] ? `/uploads/${files.videoFile[0].filename}` : undefined,
      attachmentUrl: files.attachmentFile?.[0] ? `/uploads/${files.attachmentFile[0].filename}` : undefined,
    });
  }

  // ----------------------
  // Delete Lesson
  // ----------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  @Delete('lessons/:lessonId')
  async deleteLesson(@Req() req: any, @Param('lessonId') lessonId: string) {
    const userId = req.user.id;
    return this.instructorService.deleteLesson(userId, Number(lessonId));
  }

  // ----------------------
  // Cancel Publish & Status Update
  // ----------------------
  @Patch(':id/cancel-request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  async cancelPublishRequest(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.instructorService.cancelPublishRequest(userId, Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/status')
  async updateCourseStatus(
    @Req() req: any,
    @Param('id') courseId: string,
    @Body('status') status: string
  ) {
    if (!(status in CourseStatus)) throw new BadRequestException('Invalid status');
    const enumStatus = CourseStatus[status as keyof typeof CourseStatus];
    return this.instructorService.updateCourseStatus(req.user.id, Number(courseId), enumStatus);
  }

  // ----------------------
  // Pending & Delete Course Endpoints
  // ----------------------
  @Get('me/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  async getMyPendingCourses(@Req() req: any) {
    return this.instructorService.getPendingCourses(req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  async deleteCourse(@Req() req: any, @Param('id') id: string) {
    return this.instructorService.deleteCourse(req.user.id, Number(id));
  }
}
