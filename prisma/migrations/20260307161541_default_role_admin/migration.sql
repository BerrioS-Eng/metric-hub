/*
  Warnings:

  - The values [user,administrator] on the enum `Enum_Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Enum_Role_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "user" ALTER COLUMN "role" TYPE "Enum_Role_new" USING ("role"::text::"Enum_Role_new");
ALTER TYPE "Enum_Role" RENAME TO "Enum_Role_old";
ALTER TYPE "Enum_Role_new" RENAME TO "Enum_Role";
DROP TYPE "public"."Enum_Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'ADMIN';
