/*
  Warnings:

  - Added the required column `bldg_id` to the `venue_amenity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "managed_bldg_id" INTEGER;

-- AlterTable
ALTER TABLE "venue" ADD COLUMN     "buildingId" INTEGER;

-- AlterTable
ALTER TABLE "venue_amenity" ADD COLUMN     "bldg_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managed_bldg_id_fkey" FOREIGN KEY ("managed_bldg_id") REFERENCES "building"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue" ADD CONSTRAINT "venue_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "building"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_amenity" ADD CONSTRAINT "venue_amenity_bldg_id_fkey" FOREIGN KEY ("bldg_id") REFERENCES "building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
