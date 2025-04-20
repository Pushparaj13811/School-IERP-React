/*
  Warnings:

  - You are about to drop the column `applicantId` on the `leave_applications` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "leave_applications" DROP CONSTRAINT "leave_applications_admin_fkey";

-- DropForeignKey
ALTER TABLE "leave_applications" DROP CONSTRAINT "leave_applications_student_fkey";

-- DropForeignKey
ALTER TABLE "leave_applications" DROP CONSTRAINT "leave_applications_teacher_fkey";

-- AlterTable
ALTER TABLE "leave_applications" DROP COLUMN "applicantId",
ADD COLUMN     "adminId" INTEGER,
ADD COLUMN     "studentId" INTEGER,
ADD COLUMN     "teacherId" INTEGER;

-- AddForeignKey
ALTER TABLE "leave_applications" ADD CONSTRAINT "leave_applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_applications" ADD CONSTRAINT "leave_applications_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_applications" ADD CONSTRAINT "leave_applications_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
