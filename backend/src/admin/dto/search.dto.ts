import { IsString, IsOptional } from 'class-validator';

export class SearchDto {
  @IsString()
  query: string;

  @IsOptional()
  type?: 'course' | 'user';
}
