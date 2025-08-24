// src/instructor/dto/create-course.dto.ts
import { IsString, IsOptional, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LessonDTO {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string; // optional file/pdf
}

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];  // list of prerequisite names

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LessonDTO)
  lessons?: LessonDTO[];
}
