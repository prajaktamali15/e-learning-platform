// import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// import { User } from '../users/user.entity';
// import { Course } from '../courses/course.entity';

// @Entity()
// export class Enrollment {
//   @PrimaryGeneratedColumn()
//   id: number;

//   // Relation to the student
//   @ManyToOne(() => User, (user) => user.enrollments, { eager: true })
//   student: User;

//   // Relation to the course
//   @ManyToOne(() => Course, (course) => course.enrollments, { eager: true })
//   course: Course;

//   // Store progress percentage (0–100)
//   @Column({ default: 0 })
//   progress: number;

//   // Track which lessons are completed (lesson IDs array)
//   @Column({ type: 'simple-json', nullable: true })
//   completedLessonIds: string[];

//   // Mark when the student completed the course
//   @Column({ type: 'timestamp', nullable: true })
//   completedAt: Date | null;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;
// }

// src/enrollments/enrollment.entity.ts
import type {
  Enrollment as PrismaEnrollment,
  User as PrismaUser,
  Course as PrismaCourse,
} from '@prisma/client';

export type Enrollment = PrismaEnrollment & {
  student?: PrismaUser | null;
  course?: PrismaCourse | null;
};

export type EnrollmentWithRelations = Enrollment;
