-- AlterTable
CREATE SEQUENCE amenity_id_seq;
ALTER TABLE "amenity" ALTER COLUMN "id" SET DEFAULT nextval('amenity_id_seq');
ALTER SEQUENCE amenity_id_seq OWNED BY "amenity"."id";

-- AlterTable
CREATE SEQUENCE building_id_seq;
ALTER TABLE "building" ALTER COLUMN "id" SET DEFAULT nextval('building_id_seq');
ALTER SEQUENCE building_id_seq OWNED BY "building"."id";

-- AlterTable
CREATE SEQUENCE renovation_date_id_seq;
ALTER TABLE "renovation_date" ALTER COLUMN "id" SET DEFAULT nextval('renovation_date_id_seq');
ALTER SEQUENCE renovation_date_id_seq OWNED BY "renovation_date"."id";

-- AlterTable
CREATE SEQUENCE reservation_id_seq;
ALTER TABLE "reservation" ALTER COLUMN "id" SET DEFAULT nextval('reservation_id_seq');
ALTER SEQUENCE reservation_id_seq OWNED BY "reservation"."id";

-- AlterTable
CREATE SEQUENCE venue_id_seq;
ALTER TABLE "venue" ALTER COLUMN "id" SET DEFAULT nextval('venue_id_seq');
ALTER SEQUENCE venue_id_seq OWNED BY "venue"."id";
