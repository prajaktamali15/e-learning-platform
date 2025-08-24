-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'STUDENT';
