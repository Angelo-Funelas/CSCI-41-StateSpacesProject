-- DISCLAIMER: i have NOT checked if these are correct 
--             but based on observation, they seem to be fine lmao

insert into amenity(id, type, item_description) values
    (1, 'chair', 'you sit on it'),
    (2, 'table', 'you put things on it'),
    (3, 'tv', 'you see things on it'),
    (4, 'lights', 'it lets you see things'),
    (5, 'PC workstations', 'gaming baby'),
    (6, 'microwave ovens', 'heats food up'),
    (7, 'coffee press', 'makes coffee'),
    (8, 'sinks', 'wash hand'),
    (9, 'plates', 'eat on'),
    (10, 'utensil sets', 'eat with'),
    (11, 'long table', 'table but long'),
    (12, 'round table', 'table but round');

insert into building(id, name, address) values
    (1, 'Revana Peak', '81st Street, 3rd District, Metro City'),
    (2, 'Mavia Center', 'Maker Street, 4th District, Metro City');

insert into renovation_date(id, venue_id, begin_date, end_date) values
    (1, 1, '2026-01-01', '2026-01-04'),
    (2, 3, '2026-01-10', '2026-01-20');

insert into reservation(id, parent_user, parent_venue, start_datetime, end_datetime, participant_count) values
    (1, 1, 1, '2025-11-30 00:00:00', '2025-12-15 12:00:00', 25),
    (2, 1, 3, '2025-11-20 00:00:00', '2025-11-25 12:00:00', 25),
    (3, 1, 4, '2025-11-25 00:00:00', '2025-11-26 12:00:00', 48),
    (4, 1, 5, '2025-12-01 00:00:00', '2025-12-03 12:00:00', 2);

insert into ss_user(id, usertype, lastname, firstname, middlename, birthdate) values
    (1, 0, 'Carbonell', 'Paige', 'J', '2025-11-22'),
    (2, 0, 'Funelas', 'Gelo', 'M', '2025-11-22'),
    (3, 1, 'Marcellino', 'Jaren', 'G', '2025-11-22'),
    (4, 1, 'Mones', 'Martin', 'C', '2025-11-22'),
    (5, 0, 'Tabo', 'Ken', 'C', '2025-11-22');

insert into venue(id, agent_id, venue_name, venue_type, capacity, floor, floor_area) values
    (1, 3, 'Lumina Workstation', 'Computer workstations', 50, 5, 156),
    (2, 3, 'Agila Room', 'Meeting room', 22, 6, 30),
    (3, 3, 'White Table Pantry', 'Pantry', 59, 5, 82),
    (4, 4, 'Maestro Cuisina', 'Banquet Hall', 50, 1, 200),
    (5, 4, 'Lancasteria Study Halls', 'Study Area', 10, 2, 67);

insert into venue_amenity(amenity_id, venue_id, quantity) values
    (3, 2, 1),
    (2, 2, 1),
    (1, 2, 22),
    (5, 1, 50),
    (6, 3, 2),
    (7, 3, 1),
    (8, 3, 2),
    (9, 3, 50),
    (10, 3, 80),
    (11, 3, 6),
    (12, 3, 4),
    (1, 3, 65),
    (1, 4, 50),
    (2, 4, 20),
    (8, 4, 5),
    (2, 5, 10),
    (1, 5, 10);