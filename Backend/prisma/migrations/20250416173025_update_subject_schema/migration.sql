/*
  Warnings:

  - Added the required column `code` to the `subjects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `subjects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL;
