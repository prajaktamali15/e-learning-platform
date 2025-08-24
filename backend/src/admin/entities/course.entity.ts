export interface CourseEntity {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
  instructorId: number;
  createdAt: Date;
  updatedAt: Date;
}
