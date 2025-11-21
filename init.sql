DROP TABLE SS_USER CASCADE;
DROP TABLE BUILDING;
DROP TABLE VENUE_AMENITY;
DROP TABLE RENOVATION_DATE;
DROP TABLE RESERVATION;
DROP TABLE VENUE;
DROP TABLE AMENITY;

CREATE TABLE IF NOT EXISTS SS_USER (
    id integer unique primary key,
    usertype integer,
    lastname varchar(32),
    firstname varchar(32),
    middlename varchar(32),
    birthdate date
);

CREATE TABLE IF NOT EXISTS AMENITY (
    id integer unique primary key,
    type varchar(128),
    item_description varchar(255)
);

CREATE TABLE IF NOT EXISTS BUILDING (
    id integer unique primary key,
    name varchar(255),
    address varchar(255)
);

CREATE TABLE IF NOT EXISTS VENUE (
    id integer unique primary key,
    agent_id integer,
    venue_name varchar(255),
    venue_type varchar(128),
    capacity integer,
    floor integer,
    floor_area integer,
    FOREIGN KEY (agent_id) REFERENCES SS_USER(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS VENUE_AMENITY (
    amenity_id integer,
    venue_id integer,
    quantity integer DEFAULT 1,
    FOREIGN KEY (venue_id) REFERENCES VENUE(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES AMENITY(id) ON DELETE RESTRICT,
    PRIMARY KEY (venue_id, amenity_id)
);

CREATE TABLE IF NOT EXISTS RENOVATION_DATE (
    id integer unique primary key,
    venue_id integer,
    begin_date date,
    end_date date,
    FOREIGN KEY (venue_id) REFERENCES VENUE(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS RESERVATION (
    id integer unique primary key,
    parent_user integer,
    parent_venue integer,
    start_datetime timestamp,
    end_datetime timestamp,
    participant_count integer,
    FOREIGN KEY (parent_user) REFERENCES SS_USER(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_venue) REFERENCES VENUE(id) ON DELETE CASCADE
);