/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");
