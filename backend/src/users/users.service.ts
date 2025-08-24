// src/users/users.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // -----------------------------
  // User Creation (Password already hashed in AuthService)
  // -----------------------------
  async createUser(data: { email: string; name?: string; password: string; role?: Role }) {
    try {
      return await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: data.password, // already hashed
          role: data.role ?? Role.STUDENT,
        },
      });
    } catch (err: any) {
      console.error('Prisma createUser error:', err);

      // Explicitly handle unique constraint errors (duplicate email)
      if (err.code === 'P2002') {
        throw new ConflictException('Email already in use');
      }

      // Fallback for other errors
      throw new BadRequestException('Registration failed');
    }
  }

  // -----------------------------
  // Verification Helpers (future use)
  // -----------------------------
  generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  async setVerificationToken(userId: number) {
    const token = this.generateVerificationToken();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken: token,
        verificationTokenExpiry: expiry,
        isVerified: false,
      },
    });
    return token;
  }

  async findByVerificationToken(token: string) {
    return this.prisma.user.findFirst({ where: { verificationToken: token } });
  }

  async verifyEmail(token: string) {
    const user = await this.findByVerificationToken(token);
    if (!user) throw new NotFoundException('Invalid or expired verification token');
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      throw new UnauthorizedException('Verification token expired');
    }
    return this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null, verificationTokenExpiry: null },
    });
  }

  // -----------------------------
  // General Helpers
  // -----------------------------
  async updateUser(userId: number, data: any) {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, profile: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, profile: true },
    });
  }

  // -----------------------------
  // Profile Management
  // -----------------------------
  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, isVerified: true, profile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: number, data: { name?: string; password?: string; profile?: string }) {
    const updateData: { name?: string; password?: string; profile?: string } = {};
    if (data.name) updateData.name = data.name;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10); // hash before saving
    if (data.profile) updateData.profile = data.profile;

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, profile: true },
    });
  }

  // -----------------------------
  // Password Change
  // -----------------------------
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
      select: { id: true, email: true, name: true, role: true, profile: true },
    });
  }

  // -----------------------------
  // Enrollments
  // -----------------------------
  async getMyEnrollments(userId: number) {
    return this.prisma.enrollment.findMany({
      where: { studentId: userId },
      include: { course: { select: { id: true, title: true, description: true } } },
    });
  }
}
