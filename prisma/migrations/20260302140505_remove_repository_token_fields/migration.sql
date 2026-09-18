/*
  Warnings:

  - You are about to drop the column `encrypted_access_token` on the `repositories` table. All the data in the column will be lost.
  - You are about to drop the column `token_iv` on the `repositories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "repositories" DROP COLUMN "encrypted_access_token",
DROP COLUMN "token_iv",
ALTER COLUMN "scan_status" SET DEFAULT 'pending',
ALTER COLUMN "error_message" DROP NOT NULL;
