-- DropForeignKey
ALTER TABLE "subject_results" DROP CONSTRAINT "subject_results_gradeId_fkey";

-- AddForeignKey
ALTER TABLE "subject_results" ADD CONSTRAINT "subject_results_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grade_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
