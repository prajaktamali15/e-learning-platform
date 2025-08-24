// src/courses/courses.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  NotFoundException,
  BadRequestException,
  Query,Delete,Patch
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/roles.enum';
import type { Request } from 'express';

// ✅ Ensure user type safety
interface RequestWithUser extends Request {
  user: { id: number; role: Role };
}

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // -----------------------------
  // Public routes (accessible by anyone)
  // -----------------------------
  @Get('public')
  async getPublicCourses(@Query('studentId') studentId?: string) {
    const id = studentId ? Number(studentId) : undefined;
    return this.coursesService.findAll(id, true); // pass flag to filter PUBLISHED
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const courseId = Number(id);
    if (isNaN(courseId)) {
      throw new BadRequestException('Invalid course ID');
    }
    return this.coursesService.findById(courseId);
  }

  @Get('public')  
   async findAllPublic()
    {     try {      
       return await this.coursesService.findAll();
          } catch (err) 
          {      
             throw new NotFoundException('Failed to fetch courses'); 
                } 
                }

  // -----------------------------
  // Authenticated routes (student dashboard)
  // -----------------------------
  @Get('auth/me')
  @UseGuards(JwtAuthGuard)
  async findAllForStudent(@Req() req: RequestWithUser) {
    return this.coursesService.findAll(req.user.id);
  }

  // -----------------------------
  // Instructor-only routes
  // -----------------------------
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  async createCourse(
    @Body() body: { title: string; description?: string },
    @Req() req: RequestWithUser,
  ) {
    const instructorId = req.user.id;
    if (!body.title) {
      throw new BadRequestException('Course title is required');
    }
    return this.coursesService.create({ ...body, instructorId });
  }

  @Patch(':id/status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.INSTRUCTOR)
async updateStatus(
  @Param('id') id: string,
  @Body('status') status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED',
  @Req() req: RequestWithUser
) {
  return this.coursesService.updateStatus(Number(id), status, req.user.id);
}


 @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  async deleteCourse(@Param('id') id: string, @Req() req: RequestWithUser) {
    const courseId = Number(id);
    if (isNaN(courseId)) throw new BadRequestException('Invalid course ID');

    return this.coursesService.deleteCourse(courseId, req.user.id);
  }
    

@Get('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.INSTRUCTOR)
async getCourseAnalytics(@Req() req: RequestWithUser) {
  return this.coursesService.getCourseAnalytics(req.user.id);
}


  @Post(':id/lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  async addLesson(
    @Param('id') id: string,
    @Body() body: { title: string; content?: string; videoUrl?: string },
  ) {
    const courseId = Number(id);
    if (isNaN(courseId)) {
      throw new BadRequestException('Invalid course ID');
    }
    if (!body.title) {
      throw new BadRequestException('Lesson title is required');
    }
    return this.coursesService.addLesson(courseId, body);
  }

  @Post(':id/prerequisites')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  async addPrerequisite(
    @Param('id') id: string,
    @Body() body: { prerequisiteName: string }, // changed to string
  ) {
    const courseId = Number(id);
    if (isNaN(courseId)) {
      throw new BadRequestException('Invalid course ID');
    }
    if (!body.prerequisiteName) {
      throw new BadRequestException('Prerequisite name is required');
    }
    return this.coursesService.addPrerequisite(courseId, body.prerequisiteName);
  }
   

@Post(':id/request-publish')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.INSTRUCTOR)
async requestPublish(
  @Param('id') id: string,
  @Req() req: RequestWithUser
) {
  const courseId = Number(id);
  if (isNaN(courseId)) throw new BadRequestException('Invalid course ID');

  return this.coursesService.requestPublish(courseId, req.user.id);
}

  // -----------------------------
  // Instructor dashboard: get own courses
  // -----------------------------
  @Get('instructor/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  async findCoursesForInstructor(@Req() req: RequestWithUser) {
    const instructorId = req.user.id;
    return this.coursesService.findByInstructor(instructorId);
  }
}
