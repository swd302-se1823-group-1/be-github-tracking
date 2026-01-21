/*
  Warnings:

  - The primary key for the `classes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `classes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `commits` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `commits` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `project_members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `project_members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `projects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `projects` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `repositories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `repositories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `semesters` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `semesters` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `sync_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `sync_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `course_id` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `semester_id` on the `classes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `repository_id` on the `commits` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `project_member_id` to the `commits` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `class_id` on the `enrollments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `project_id` on the `project_members` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `class_id` on the `projects` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `project_id` on the `repositories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `repository_id` on the `sync_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_semester_id_fkey";

-- DropForeignKey
ALTER TABLE "commits" DROP CONSTRAINT "commits_project_member_id_fkey";

-- DropForeignKey
ALTER TABLE "commits" DROP CONSTRAINT "commits_repository_id_fkey";

-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_class_id_fkey";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_project_id_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_class_id_fkey";

-- DropForeignKey
ALTER TABLE "repositories" DROP CONSTRAINT "repositories_project_id_fkey";

-- DropForeignKey
ALTER TABLE "sync_logs" DROP CONSTRAINT "sync_logs_repository_id_fkey";

-- AlterTable
ALTER TABLE "classes" DROP CONSTRAINT "classes_pkey",
ADD COLUMN     "course_id" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
DROP COLUMN "semester_id",
ADD COLUMN     "semester_id" BIGINT NOT NULL,
ADD CONSTRAINT "classes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "commits" DROP CONSTRAINT "commits_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
DROP COLUMN "repository_id",
ADD COLUMN     "repository_id" UUID NOT NULL,
DROP COLUMN "project_member_id",
ADD COLUMN     "project_member_id" UUID NOT NULL,
ADD CONSTRAINT "commits_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "enrollments" DROP COLUMN "class_id",
ADD COLUMN     "class_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
DROP COLUMN "project_id",
ADD COLUMN     "project_id" UUID NOT NULL,
ADD CONSTRAINT "project_members_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "projects" DROP CONSTRAINT "projects_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
DROP COLUMN "class_id",
ADD COLUMN     "class_id" UUID NOT NULL,
ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "repositories" DROP CONSTRAINT "repositories_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
DROP COLUMN "project_id",
ADD COLUMN     "project_id" UUID NOT NULL,
ADD CONSTRAINT "repositories_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "semesters" DROP CONSTRAINT "semesters_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "semesters_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "sync_logs" DROP CONSTRAINT "sync_logs_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
DROP COLUMN "repository_id",
ADD COLUMN     "repository_id" UUID NOT NULL,
ADD CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- CreateIndex
CREATE INDEX "classes_semester_id_idx" ON "classes"("semester_id");

-- CreateIndex
CREATE INDEX "commits_repository_id_committed_date_idx" ON "commits"("repository_id", "committed_date");

-- CreateIndex
CREATE UNIQUE INDEX "commits_repository_id_hash_key" ON "commits"("repository_id", "hash");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_class_id_student_id_key" ON "enrollments"("class_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_student_id_key" ON "project_members"("project_id", "student_id");

-- CreateIndex
CREATE INDEX "repositories_project_id_idx" ON "repositories"("project_id");

-- CreateIndex
CREATE INDEX "repositories_project_id_scan_status_idx" ON "repositories"("project_id", "scan_status");

-- CreateIndex
CREATE INDEX "sync_logs_repository_id_idx" ON "sync_logs"("repository_id");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commits" ADD CONSTRAINT "commits_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commits" ADD CONSTRAINT "commits_project_member_id_fkey" FOREIGN KEY ("project_member_id") REFERENCES "project_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
