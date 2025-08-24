// src/users/users.controller.ts
import { Controller, Get, Post, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client'; // Prisma Role enum
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

// Custom request type including user
interface AuthRequest extends Request {
  user: { id: number; email: string; role: Role };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // -----------------------------
  // Registration & User Management
  // -----------------------------

  // POST /users/register → Create new user (no email verification)
  @Post('register')
  async register(
    @Body() body: { email: string; name?: string; password: string; role?: string },
  ) {
    // Convert role string to Prisma Role enum safely
    const roleEnum: Role = body.role
      ? (Role[body.role.toUpperCase() as keyof typeof Role] ?? Role.STUDENT)
      : Role.STUDENT;

    return this.usersService.createUser({
      email: body.email,
      name: body.name,
      password: body.password,
      role: roleEnum,
    });
  }

  // GET /users → Only ADMIN can list all users
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // ✅ Pass Prisma enum value
  async findAll() {
    return this.usersService.findAll();
  }

  // -----------------------------
  // Profile Management Endpoints
  // -----------------------------

  // GET /users/me → Get current user's profile
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: AuthRequest) {
    return this.usersService.getMe(req.user.id);
  }

  // PATCH /users/me → Update current user's profile (name, password, etc.)
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @Req() req: AuthRequest,
    @Body() updateData: { name?: string; password?: string },
  ) {
    return this.usersService.updateProfile(req.user.id, updateData);
  }

  // -----------------------------
  // Enrollment Endpoints
  // -----------------------------

  // GET /users/me/enrollments → Get current user's enrolled courses
  @UseGuards(JwtAuthGuard)
  @Get('me/enrollments')
  async getMyEnrollments(@Req() req: AuthRequest) {
    return this.usersService.getMyEnrollments(req.user.id);
  }
}
