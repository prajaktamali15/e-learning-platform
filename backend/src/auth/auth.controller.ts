// src/auth/auth.controller.ts
import { Controller, Post, Body, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { Role } from '../users/roles.enum';

interface RegisterDto {
  email: string;
  password: string;
  name?: string;
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'; // allow role selection
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // -----------------------------
  // Login
  // -----------------------------
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );
    if (!user) throw new UnauthorizedException('Invalid credentials');

    return this.authService.login(user);
  }

  // -----------------------------
  // Register
  // -----------------------------
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const roleMap = {
        STUDENT: Role.STUDENT,
        INSTRUCTOR: Role.INSTRUCTOR,
        ADMIN: Role.ADMIN,
      };

      const roleEnum: Role = registerDto.role
        ? roleMap[registerDto.role]
        : Role.STUDENT; // default

      // Call AuthService.register
      const authResponse = await this.authService.register(
        registerDto.email,
        registerDto.password,
        registerDto.name,
        roleEnum
      );

      // Return response exactly as before
      return {
        message: 'Registration successful!',
        user: authResponse.user,
        authResponse,
      };
    } catch (error: any) {
      // Handle duplicate email properly
      if (error instanceof ConflictException || error.message.includes('already exists')) {
        throw new BadRequestException('User already exists');
      }
      throw new BadRequestException(error.message || 'Registration failed');
    }
  }
}
