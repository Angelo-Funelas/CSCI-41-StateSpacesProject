DROP TABLE USER CASCADE;
DROP TABLE BUILDING;
DROP TABLE VENUE_AMENITY;
DROP TABLE RENOVATION_DATE;
DROP TABLE RESERVATION;
DROP TABLE VENUE;
DROP TABLE AMENITY;

CREATE TABLE IF NOT EXISTS "building" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "amenity" (
    "id" SERIAL PRIMARY KEY,
    "type" VARCHAR(128) NOT NULL,
    "item_description" VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS "User" (
    "id" SERIAL PRIMARY KEY,
    "usertype" INTEGER NOT NULL DEFAULT 0,
    "username" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "lastname" VARCHAR(32) NOT NULL,
    "firstname" VARCHAR(32) NOT NULL,
    "middlename" VARCHAR(32) NOT NULL,
    "birthdate" DATE NOT NULL,
    "managed_bldg_id" INTEGER NOT NULL,
    FOREIGN KEY ("managed_bldg_id") REFERENCES "building"("id")
);

CREATE TABLE IF NOT EXISTS "venue" (
    "id" SERIAL PRIMARY KEY,
    "agent_id" INTEGER,
    "venue_name" VARCHAR(255) NOT NULL,
    "venue_type" VARCHAR(128) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "floor" INTEGER NOT NULL,
    "floor_area" INTEGER NOT NULL,
    "buildingId" INTEGER NOT NULL,
    FOREIGN KEY ("agent_id") REFERENCES "User"("id") ON DELETE SET NULL,
    FOREIGN KEY ("buildingId") REFERENCES "building"("id")
);

CREATE TABLE IF NOT EXISTS "venue_amenity" (
    "amenity_id" INTEGER NOT NULL,
    "venue_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "bldg_id" INTEGER NOT NULL,
    PRIMARY KEY ("venue_id", "amenity_id"),
    FOREIGN KEY ("venue_id") REFERENCES "venue"("id") ON DELETE CASCADE,
    FOREIGN KEY ("amenity_id") REFERENCES "amenity"("id"),
    FOREIGN KEY ("bldg_id") REFERENCES "building"("id")
);

CREATE TABLE IF NOT EXISTS "renovation_date" (
    "id" SERIAL PRIMARY KEY,
    "venue_id" INTEGER NOT NULL,
    "begin_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    FOREIGN KEY ("venue_id") REFERENCES "venue"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "reservation" (
    "id" SERIAL PRIMARY KEY,
    "parent_user" INTEGER NOT NULL,
    "parent_venue" INTEGER NOT NULL,
    "start_datetime" TIMESTAMP(6) NOT NULL,
    "end_datetime" TIMESTAMP(6) NOT NULL,
    "participant_count" INTEGER NOT NULL,
    FOREIGN KEY ("parent_user") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("parent_venue") REFERENCES "venue"("id") ON DELETE CASCADE
);