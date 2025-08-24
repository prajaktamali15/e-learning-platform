// src/admin/admin.controller.ts
import { Controller, Get, Patch, Delete, Param, Query, UseGuards, Body, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ------------------ Courses ------------------

  @Get('courses')
  async getAllCourses(): Promise<any> {
    return this.adminService.getAllCourses();
  }

  @Get('courses/:id')
  async getCourse(@Param('id') id: string): Promise<any> {
    return this.adminService.getCourseById(Number(id));
  }

  @Patch('courses/:id/approve')
  async approveCourse(@Param('id') id: string): Promise<any> {
    return this.adminService.approveCourse(Number(id));
  }

  @Patch('courses/:id/reject')
  async rejectCourse(@Param('id') id: string): Promise<any> {
    return this.adminService.rejectCourse(Number(id));
  }

  @Delete('courses/:id')
  async deleteCourse(@Param('id') id: string): Promise<any> {
    return this.adminService.deleteCourse(Number(id));
  }

  // ------------------ Admin Profile ------------------

  @Patch('profile')
  async updateProfile(
    @Body() body: { name?: string; email?: string },
    @Req() req: any, // JWT guard adds user info
  ) {
    const adminId = req.user.id;
    return this.adminService.updateProfile(adminId, body);
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    const adminId = req.user.id;
    return this.adminService.getProfile(adminId);
  }

  // ------------------ Users ------------------

  @Get('users')
  async getAllUsers(): Promise<any> {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string): Promise<any> {
    return this.adminService.getUserById(Number(id));
  }

  // ------------------ Search ------------------

  @Get('search')
  async search(@Query('q') query: string): Promise<any> {
    return this.adminService.search(query);
  }

  // ------------------ Analytics / Dashboard ------------------

  @Get('analytics')
  async getAnalytics(): Promise<any> {
    return this.adminService.getAnalytics();
  }
}
