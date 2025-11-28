-- CreateTable
CREATE TABLE "amenity" (
    "id" INTEGER NOT NULL,
    "type" VARCHAR(128),
    "item_description" VARCHAR(255),

    CONSTRAINT "amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "building" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255),
    "address" VARCHAR(255),

    CONSTRAINT "building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renovation_date" (
    "id" INTEGER NOT NULL,
    "venue_id" INTEGER,
    "begin_date" DATE,
    "end_date" DATE,

    CONSTRAINT "renovation_date_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" INTEGER NOT NULL,
    "parent_user" INTEGER,
    "parent_venue" INTEGER,
    "start_datetime" TIMESTAMP(6),
    "end_datetime" TIMESTAMP(6),
    "participant_count" INTEGER,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "usertype" INTEGER,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "lastname" VARCHAR(32),
    "firstname" VARCHAR(32),
    "middlename" VARCHAR(32),
    "birthdate" DATE,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue" (
    "id" INTEGER NOT NULL,
    "agent_id" INTEGER,
    "venue_name" VARCHAR(255),
    "venue_type" VARCHAR(128),
    "capacity" INTEGER,
    "floor" INTEGER,
    "floor_area" INTEGER,

    CONSTRAINT "venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_amenity" (
    "amenity_id" INTEGER NOT NULL,
    "venue_id" INTEGER NOT NULL,
    "quantity" INTEGER DEFAULT 1,

    CONSTRAINT "venue_amenity_pkey" PRIMARY KEY ("venue_id","amenity_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "renovation_date" ADD CONSTRAINT "renovation_date_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venue"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_parent_user_fkey" FOREIGN KEY ("parent_user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_parent_venue_fkey" FOREIGN KEY ("parent_venue") REFERENCES "venue"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "venue" ADD CONSTRAINT "venue_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "venue_amenity" ADD CONSTRAINT "venue_amenity_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenity"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "venue_amenity" ADD CONSTRAINT "venue_amenity_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venue"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
