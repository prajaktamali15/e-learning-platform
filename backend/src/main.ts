import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:3000', // your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // allow cookies if needed
  });


const publicPath = join(process.cwd(), 'public');
// 1️⃣ Serve certificates from the folder where PDFs are actually saved
  const certificatesPath = join(process.cwd(), 'public', 'certificates');
  app.use('/certificates', express.static(certificatesPath));
  console.log('📂 Serving certificates from:', certificatesPath);
  
// Serve certificates statically
app.use('/certificates', express.static(certificatesPath));
console.log('📂 Serving certificates from:', certificatesPath);




  // Serve lesson videos, attachments, and any uploaded files
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Serve profile pictures (can coexist with general uploads)
  app.use(
    '/uploads/profile-pictures',
    express.static(join(process.cwd(), 'uploads', 'profile-pictures')),
  );

  const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();
