/*
  Warnings:

  - You are about to drop the `subject_attendance` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId,month,year]` on the table `monthly_attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classId` to the `monthly_attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `percentage` to the `monthly_attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectionId` to the `monthly_attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `monthly_attendance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED');

-- DropForeignKey
ALTER TABLE "subject_attendance" DROP CONSTRAINT "subject_attendance_studentId_fkey";

-- DropForeignKey
ALTER TABLE "subject_attendance" DROP CONSTRAINT "subject_attendance_subjectId_fkey";

-- DropIndex
DROP INDEX "monthly_attendance_studentId_month_key";

-- AlterTable
ALTER TABLE "monthly_attendance" ADD COLUMN     "classId" INTEGER NOT NULL,
ADD COLUMN     "percentage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "sectionId" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- DropTable
DROP TABLE "subject_attendance";

-- CreateTable
CREATE TABLE "daily_attendance" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "remarks" TEXT,
    "markedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_teacher_assignments" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_teacher_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_attendance_studentId_date_key" ON "daily_attendance"("studentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "class_teacher_assignments_classId_sectionId_key" ON "class_teacher_assignments"("classId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_attendance_studentId_month_year_key" ON "monthly_attendance"("studentId", "month", "year");

-- AddForeignKey
ALTER TABLE "daily_attendance" ADD CONSTRAINT "daily_attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_attendance" ADD CONSTRAINT "daily_attendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_attendance" ADD CONSTRAINT "daily_attendance_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_attendance" ADD CONSTRAINT "daily_attendance_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_attendance" ADD CONSTRAINT "monthly_attendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_attendance" ADD CONSTRAINT "monthly_attendance_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_teacher_assignments" ADD CONSTRAINT "class_teacher_assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_teacher_assignments" ADD CONSTRAINT "class_teacher_assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_teacher_assignments" ADD CONSTRAINT "class_teacher_assignments_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
