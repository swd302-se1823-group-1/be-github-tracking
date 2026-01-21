/*
  Warnings:

  - A unique constraint covering the columns `[repository_id,hash]` on the table `commits` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[github_email]` on the table `github_mappings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[github_username]` on the table `github_mappings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider,provider_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "provider" VARCHAR(50),
ADD COLUMN     "provider_id" VARCHAR(255);

-- CreateIndex
CREATE INDEX "classes_semester_id_idx" ON "classes"("semester_id");

-- CreateIndex
CREATE INDEX "classes_lecturer_id_idx" ON "classes"("lecturer_id");

-- CreateIndex
CREATE INDEX "classes_code_idx" ON "classes"("code");

-- CreateIndex
CREATE INDEX "commits_repository_id_committed_date_idx" ON "commits"("repository_id", "committed_date");

-- CreateIndex
CREATE INDEX "commits_author_email_raw_idx" ON "commits"("author_email_raw");

-- CreateIndex
CREATE INDEX "commits_committed_date_idx" ON "commits"("committed_date");

-- CreateIndex
CREATE INDEX "commits_hash_idx" ON "commits"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "commits_repository_id_hash_key" ON "commits"("repository_id", "hash");

-- CreateIndex
CREATE INDEX "github_mappings_student_id_is_verified_idx" ON "github_mappings"("student_id", "is_verified");

-- CreateIndex
CREATE INDEX "github_mappings_is_verified_idx" ON "github_mappings"("is_verified");

-- CreateIndex
CREATE UNIQUE INDEX "github_mappings_github_email_key" ON "github_mappings"("github_email");

-- CreateIndex
CREATE UNIQUE INDEX "github_mappings_github_username_key" ON "github_mappings"("github_username");

-- CreateIndex
CREATE INDEX "repositories_project_id_idx" ON "repositories"("project_id");

-- CreateIndex
CREATE INDEX "repositories_scan_status_idx" ON "repositories"("scan_status");

-- CreateIndex
CREATE INDEX "repositories_last_scanned_at_idx" ON "repositories"("last_scanned_at");

-- CreateIndex
CREATE INDEX "repositories_project_id_scan_status_idx" ON "repositories"("project_id", "scan_status");

-- CreateIndex
CREATE INDEX "semesters_is_active_idx" ON "semesters"("is_active");

-- CreateIndex
CREATE INDEX "semesters_start_date_end_date_idx" ON "semesters"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "students_student_code_idx" ON "students"("student_code");

-- CreateIndex
CREATE INDEX "students_university_email_idx" ON "students"("university_email");

-- CreateIndex
CREATE INDEX "sync_logs_repository_id_idx" ON "sync_logs"("repository_id");

-- CreateIndex
CREATE INDEX "sync_logs_status_idx" ON "sync_logs"("status");

-- CreateIndex
CREATE INDEX "sync_logs_started_at_idx" ON "sync_logs"("started_at");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_is_active_idx" ON "users"("role", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "users_provider_provider_id_key" ON "users"("provider", "provider_id");
