-- CreateTable
CREATE TABLE "teacher_sections" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_sections_teacherId_sectionId_key" ON "teacher_sections"("teacherId", "sectionId");

-- AddForeignKey
ALTER TABLE "teacher_sections" ADD CONSTRAINT "teacher_sections_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_sections" ADD CONSTRAINT "teacher_sections_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
