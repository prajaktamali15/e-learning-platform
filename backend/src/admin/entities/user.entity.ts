export interface UserEntity {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}
