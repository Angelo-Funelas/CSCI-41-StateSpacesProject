-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_managed_bldg_id_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "managed_bldg_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managed_bldg_id_fkey" FOREIGN KEY ("managed_bldg_id") REFERENCES "building"("id") ON DELETE SET NULL ON UPDATE CASCADE;
