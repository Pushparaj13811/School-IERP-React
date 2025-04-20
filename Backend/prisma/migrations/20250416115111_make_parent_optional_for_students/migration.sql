-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_parentId_fkey";

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "parentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
