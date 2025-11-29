/*
  Warnings:

  - Made the column `usertype` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastname` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstname` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `middlename` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `birthdate` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `managed_bldg_id` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `amenity` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `building` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `building` required. This step will fail if there are existing NULL values in that column.
  - Made the column `venue_id` on table `renovation_date` required. This step will fail if there are existing NULL values in that column.
  - Made the column `begin_date` on table `renovation_date` required. This step will fail if there are existing NULL values in that column.
  - Made the column `end_date` on table `renovation_date` required. This step will fail if there are existing NULL values in that column.
  - Made the column `parent_user` on table `reservation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `parent_venue` on table `reservation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `start_datetime` on table `reservation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `end_datetime` on table `reservation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `participant_count` on table `reservation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `venue_name` on table `venue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `venue_type` on table `venue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `capacity` on table `venue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `floor` on table `venue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `floor_area` on table `venue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `buildingId` on table `venue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quantity` on table `venue_amenity` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_managed_bldg_id_fkey";

-- DropForeignKey
ALTER TABLE "venue" DROP CONSTRAINT "venue_buildingId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "usertype" SET NOT NULL,
ALTER COLUMN "usertype" SET DEFAULT 0,
ALTER COLUMN "lastname" SET NOT NULL,
ALTER COLUMN "firstname" SET NOT NULL,
ALTER COLUMN "middlename" SET NOT NULL,
ALTER COLUMN "birthdate" SET NOT NULL,
ALTER COLUMN "managed_bldg_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "amenity" ALTER COLUMN "type" SET NOT NULL;

-- AlterTable
ALTER TABLE "building" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL;

-- AlterTable
ALTER TABLE "renovation_date" ALTER COLUMN "venue_id" SET NOT NULL,
ALTER COLUMN "begin_date" SET NOT NULL,
ALTER COLUMN "end_date" SET NOT NULL;

-- AlterTable
ALTER TABLE "reservation" ALTER COLUMN "parent_user" SET NOT NULL,
ALTER COLUMN "parent_venue" SET NOT NULL,
ALTER COLUMN "start_datetime" SET NOT NULL,
ALTER COLUMN "end_datetime" SET NOT NULL,
ALTER COLUMN "participant_count" SET NOT NULL;

-- AlterTable
ALTER TABLE "venue" ALTER COLUMN "venue_name" SET NOT NULL,
ALTER COLUMN "venue_type" SET NOT NULL,
ALTER COLUMN "capacity" SET NOT NULL,
ALTER COLUMN "floor" SET NOT NULL,
ALTER COLUMN "floor_area" SET NOT NULL,
ALTER COLUMN "buildingId" SET NOT NULL;

-- AlterTable
ALTER TABLE "venue_amenity" ALTER COLUMN "quantity" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managed_bldg_id_fkey" FOREIGN KEY ("managed_bldg_id") REFERENCES "building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue" ADD CONSTRAINT "venue_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
