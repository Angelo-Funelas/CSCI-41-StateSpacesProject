TRUNCATE TABLE "venue_amenity" CASCADE;
TRUNCATE TABLE "reservation" CASCADE;
TRUNCATE TABLE "renovation_date" CASCADE;
TRUNCATE TABLE "venue" CASCADE;
TRUNCATE TABLE "amenity" CASCADE;
TRUNCATE TABLE "User" CASCADE;
TRUNCATE TABLE "building" CASCADE;

INSERT INTO "building" ("name", "address") VALUES
('Science Complex', '123 University Ave'),
('Liberal Arts Hall', '124 University Ave'),
('Engineering Wing', '125 University Ave'),
('Student Center', '126 University Ave'),
('Main Library', '127 University Ave'),
('Administration Bldg', '128 University Ave'),
('Sports Center', '129 University Ave'),
('Dormitory A', '130 University Ave'),
('Research Hub', '131 University Ave'),
('Alumni House', '132 University Ave');

INSERT INTO "amenity" ("type", "item_description") VALUES
('Visual Aid', 'LCD Projector with HDMI'),
('Audio', 'Wireless Microphone Set'),
('Furniture', 'Ergonomic Office Chairs'),
('Connectivity', 'High-Speed Wi-Fi Router'),
('Climate', 'Split-type Air Conditioner'),
('Visual Aid', 'Whiteboard (Rolling)'),
('Audio', 'Surround Sound Speakers'),
('Furniture', 'Conference Table (12-seater)'),
('Equipment', 'Podium with light'),
('Equipment', 'Extension Cords (Heavy Duty)');

INSERT INTO "venue" ("agent_id", "venue_name", "venue_type", "capacity", "floor", "floor_area", "buildingId") VALUES
(NULL, 'Lecture Hall 101', 'Classroom', 50, 1, 80, 1),
(NULL, 'Comp Lab A', 'Laboratory', 30, 2, 100, 1),
(NULL, 'Art Studio 1', 'Studio', 20, 1, 60, 2),
(NULL, 'Grand Auditorium', 'Auditorium', 300, 1, 500, 2),
(NULL, 'Meeting Room A', 'Meeting Room', 10, 3, 25, 3),
(NULL, 'Open Court', 'Sports', 100, 1, 600, 7),
(NULL, 'Study Lounge', 'Lounge', 40, 2, 120, 5),
(NULL, 'Function Room B', 'Event Hall', 80, 4, 150, 6),
(NULL, 'Physics Lab', 'Laboratory', 35, 3, 110, 1),
(NULL, 'Music Room', 'Studio', 15, 2, 40, 2);

INSERT INTO "venue_amenity" ("venue_id", "amenity_id", "quantity", "bldg_id") VALUES
(1, 1, 1, 1), -- Lecture Hall gets Projector
(1, 6, 1, 1), -- Lecture Hall gets Whiteboard
(2, 4, 2, 1), -- Comp Lab gets 2 Wifi Routers
(2, 5, 2, 1), -- Comp Lab gets 2 ACs
(4, 2, 4, 2), -- Auditorium gets 4 Mics
(4, 7, 10, 2), -- Auditorium gets 10 Speakers
(5, 8, 1, 3), -- Meeting Room gets Table
(8, 9, 1, 6), -- Function Room gets Podium
(9, 6, 2, 1), -- Physics Lab gets 2 Whiteboards
(3, 3, 20, 2); -- Art Studio gets 20 Chairs

INSERT INTO "renovation_date" ("venue_id", "begin_date", "end_date") VALUES
(1, '2023-01-10', '2023-02-10'),
(2, '2022-05-15', '2022-06-01'),
(3, '2021-11-20', '2021-12-20'),
(4, '2023-06-01', '2023-08-01'),
(5, '2020-03-10', '2020-03-15'),
(6, '2022-09-01', '2022-09-30'),
(7, '2023-12-01', '2023-12-15'),
(8, '2021-04-05', '2021-04-20'),
(9, '2022-07-10', '2022-08-10'),
(10, '2023-10-01', '2023-10-14');