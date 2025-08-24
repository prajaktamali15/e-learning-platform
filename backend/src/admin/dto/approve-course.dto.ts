import { IsInt } from 'class-validator';

export class ApproveCourseDto {
  @IsInt()
  courseId: number;
}
