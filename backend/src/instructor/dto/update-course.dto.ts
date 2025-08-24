import { IsString, IsOptional, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LessonUpdateDTO {
  @IsInt()
  id: number; // lesson id to update

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[]; // updated to string array

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonUpdateDTO)
  lessons?: LessonUpdateDTO[];
}
