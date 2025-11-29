/*
  Warnings:

  - You are about to drop the column `begin_date` on the `renovation_date` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `renovation_date` table. All the data in the column will be lost.
  - Added the required column `end_datetime` to the `renovation_date` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_datetime` to the `renovation_date` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "renovation_date" DROP COLUMN "begin_date",
DROP COLUMN "end_date",
ADD COLUMN     "end_datetime" DATE NOT NULL,
ADD COLUMN     "start_datetime" DATE NOT NULL;
