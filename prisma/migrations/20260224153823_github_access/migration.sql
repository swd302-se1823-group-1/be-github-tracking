/*
  Warnings:

  - The primary key for the `github_mappings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[student_id]` on the table `github_mappings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[github_id]` on the table `github_mappings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `access_token` to the `github_mappings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `github_id` to the `github_mappings` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `github_mappings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "github_mappings" DROP CONSTRAINT "github_mappings_pkey",
ADD COLUMN     "access_token" VARCHAR(255) NOT NULL,
ADD COLUMN     "github_id" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "github_mappings_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "github_mappings_student_id_key" ON "github_mappings"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_mappings_github_id_key" ON "github_mappings"("github_id");
