-- ==========================================================
-- UITGEBREIDE TESTDATA VOOR TIXIE CMDB (IT & Assets)
-- ==========================================================

-- ==========================================================
-- TESTDATA VOOR TIXIE CMDB (Locaties & Eigenschappen)
-- ==========================================================

-- 1. Eigenschappen definiëren (De Library)
INSERT INTO property_definitions (uuid, name, data_type) VALUES
                                                             (gen_random_uuid(), 'Capaciteit', 'INTEGER'),
                                                             (gen_random_uuid(), 'Airco Aanwezig', 'BOOLEAN'),
                                                             (gen_random_uuid(), 'Type Slot', 'TEXT'), -- Loper, Sleutel, Badge
                                                             (gen_random_uuid(), 'Aantal Stopcontacten', 'INTEGER'),
                                                             (gen_random_uuid(), 'Type Bord', 'TEXT'), -- Whiteboard, Krijtbord, Digitaal Bord
                                                             (gen_random_uuid(), 'Beamer Aanwezig', 'BOOLEAN');

-- 2. Locatie Types aanmaken
INSERT INTO location_types (uuid, name, description) VALUES
                                                         (gen_random_uuid(), 'Campus', 'Hoofdlocatie'),
                                                         (gen_random_uuid(), 'Gebouw', 'Fysiek gebouwblok'),
                                                         (gen_random_uuid(), 'Aula', 'Groot lokaal voor hoorcolleges'),
                                                         (gen_random_uuid(), 'Leslokaal', 'Standaard leslokaal'),
                                                         (gen_random_uuid(), 'Labo', 'Gespecialiseerde praktijkruimte'),
                                                         (gen_random_uuid(), 'Kantoor', 'Personeelsruimte'),
                                                         (gen_random_uuid(), 'Technische Ruimte', 'Serverrooms en patchkasten');

-- 3. Koppelen van Eigenschappen aan Types (De Blauwdrukken)
-- We maken alles optioneel (required = FALSE) behalve voor Leslokalen
INSERT INTO location_type_properties (location_type_id, property_definition_id, required)
SELECT lt.id, pd.id, TRUE
FROM location_types lt, property_definitions pd
WHERE lt.name IN ('Aula', 'Leslokaal', 'Labo') AND pd.name IN ('Capaciteit', 'Type Bord', 'Type Slot');

-- 4. Campussen aanmaken
INSERT INTO locations (uuid, name, location_type_id, parent_id)
SELECT gen_random_uuid(), 'Campus Sint-Katelijne-Waver', id, NULL FROM location_types WHERE name = 'Campus';

INSERT INTO locations (uuid, name, location_type_id, parent_id)
SELECT gen_random_uuid(), 'Campus Sint-Andries', id, NULL FROM location_types WHERE name = 'Campus';

-- 5. Gebouwen voor SKW (A-blok t/m G-blok en K-blok)
DO $$
DECLARE
    skw_id BIGINT;
    gebouw_type_id BIGINT;
    letter TEXT;
BEGIN
    SELECT id INTO skw_id FROM locations WHERE name = 'Campus Sint-Katelijne-Waver';
    SELECT id INTO gebouw_type_id FROM location_types WHERE name = 'Gebouw';

    FOREACH letter IN ARRAY ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G', 'K'] LOOP
        INSERT INTO locations (uuid, name, location_type_id, parent_id)
        VALUES (gen_random_uuid(), letter || '-blok', gebouw_type_id, skw_id);
    END LOOP;
END $$;

-- 6. Specifieke ruimtes aanmaken
-- SKW: A001 (Aula), G102 (Labo), K001 (Tech)
-- Sint-Andries: 101 (Leslokaal), 102 (Labo) - Direct onder campus
INSERT INTO locations (uuid, name, location_type_id, parent_id) VALUES
                                                                    (gen_random_uuid(), 'A001', (SELECT id FROM location_types WHERE name = 'Aula'), (SELECT id FROM locations WHERE name = 'A-blok')),
                                                                    (gen_random_uuid(), 'G102', (SELECT id FROM location_types WHERE name = 'Labo'), (SELECT id FROM locations WHERE name = 'G-blok')),
                                                                    (gen_random_uuid(), 'K001', (SELECT id FROM location_types WHERE name = 'Technische Ruimte'), (SELECT id FROM locations WHERE name = 'K-blok')),
                                                                    (gen_random_uuid(), '101', (SELECT id FROM location_types WHERE name = 'Leslokaal'), (SELECT id FROM locations WHERE name = 'Campus Sint-Andries')),
                                                                    (gen_random_uuid(), '102', (SELECT id FROM location_types WHERE name = 'Labo'), (SELECT id FROM locations WHERE name = 'Campus Sint-Andries'));

-- 7. Waarden invullen voor de ruimtes (Location Values)
-- Aula A001: 300 man, Krijtbord, Badge, Geen stopcontacten, Airco
WITH target_loc AS (SELECT id FROM locations WHERE name = 'A001')
INSERT INTO location_values (location_id, property_definition_id, value)
SELECT (SELECT id FROM target_loc), id, '300' FROM property_definitions WHERE name = 'Capaciteit' UNION ALL
SELECT (SELECT id FROM target_loc), id, 'Krijtbord' FROM property_definitions WHERE name = 'Type Bord' UNION ALL
SELECT (SELECT id FROM target_loc), id, 'Badge' FROM property_definitions WHERE name = 'Type Slot' UNION ALL
SELECT (SELECT id FROM target_loc), id, '0' FROM property_definitions WHERE name = 'Aantal Stopcontacten' UNION ALL
SELECT (SELECT id FROM target_loc), id, 'true' FROM property_definitions WHERE name = 'Airco Aanwezig';

-- Labo G102: 24 man, Digitaal Bord, Loper, Veel stopcontacten, Geen airco
WITH target_loc AS (SELECT id FROM locations WHERE name = 'G102')
INSERT INTO location_values (location_id, property_definition_id, value)
SELECT (SELECT id FROM target_loc), id, '24' FROM property_definitions WHERE name = 'Capaciteit' UNION ALL
SELECT (SELECT id FROM target_loc), id, 'Digitaal Bord' FROM property_definitions WHERE name = 'Type Bord' UNION ALL
SELECT (SELECT id FROM target_loc), id, 'Loper' FROM property_definitions WHERE name = 'Type Slot' UNION ALL
SELECT (SELECT id FROM target_loc), id, '40' FROM property_definitions WHERE name = 'Aantal Stopcontacten' UNION ALL
SELECT (SELECT id FROM target_loc), id, 'false' FROM property_definitions WHERE name = 'Airco Aanwezig';

-- 8. Configuration Item Types voor Assets
INSERT INTO configuration_item_types (uuid, name, description) VALUES
                                                                   (gen_random_uuid(), 'LAPTOP', 'Studenten en personeel laptops'),
                                                                   (gen_random_uuid(), 'SERVER', 'Fysieke servers in racks');

-- 9. Voorbeeld Assets (Configuration Items) gekoppeld aan locaties
INSERT INTO configuration_items (uuid, name, configuration_item_type_id, status, location_id)
SELECT gen_random_uuid(), 'Server-Storage-01', (SELECT id FROM configuration_item_types WHERE name = 'SERVER'), 'ACTIVE', (SELECT id FROM locations WHERE name = 'K001');

INSERT INTO configuration_items (uuid, name, configuration_item_type_id, status, location_id)
SELECT gen_random_uuid(), 'Beamer-Aula-A01', (SELECT id FROM configuration_item_types WHERE name = 'LAPTOP'), 'ACTIVE', (SELECT id FROM locations WHERE name = 'A001');

-- 1. Property Definitions (Library met Targets)
-- We voegen de nieuwe 'target' kolom toe in de inserts
INSERT INTO property_definitions (uuid, name, data_type, target) VALUES
-- IT / Asset specifiek
(gen_random_uuid(), 'Merk', 'TEXT', 'CONFIGURATION_ITEM'),
(gen_random_uuid(), 'RAM (GB)', 'INTEGER', 'CONFIGURATION_ITEM'),
(gen_random_uuid(), 'Opslag (GB)', 'INTEGER', 'CONFIGURATION_ITEM'),
(gen_random_uuid(), 'Besturingssysteem', 'TEXT', 'CONFIGURATION_ITEM'),
(gen_random_uuid(), 'Softwareversie', 'TEXT', 'CONFIGURATION_ITEM'),
(gen_random_uuid(), 'Licentietype', 'TEXT', 'CONFIGURATION_ITEM'),
(gen_random_uuid(), 'IP Adres', 'TEXT', 'CONFIGURATION_ITEM'),
(gen_random_uuid(), 'MAC Adres', 'TEXT', 'CONFIGURATION_ITEM'),
(gen_random_uuid(), 'Aantal Poorten', 'INTEGER', 'CONFIGURATION_ITEM'),
-- Beide
(gen_random_uuid(), 'Aankoopdatum', 'DATE', 'ALL'),
(gen_random_uuid(), 'Serienummer', 'TEXT', 'CONFIGURATION_ITEM');

-- 2. Configuration Item Types (Blueprints)
INSERT INTO configuration_item_types (uuid, name, description) VALUES
                                                                   (gen_random_uuid(), 'WORKSTATION', 'Vaste PC voor administratie'),
                                                                   (gen_random_uuid(), 'ROUTER', 'Core en Edge routers'),
                                                                   (gen_random_uuid(), 'SWITCH', 'Netwerk switches voor lokalen'),
                                                                   (gen_random_uuid(), 'ACCESS_POINT', 'WiFi Access Points');

-- 3. Koppelen van Eigenschappen aan CI Types
-- Voor Laptops & PC's
INSERT INTO configuration_item_type_properties (configuration_item_type_id, property_definition_id)
SELECT cit.id, pd.id FROM configuration_item_types cit, property_definitions pd
WHERE cit.name IN ('WORKSTATION', 'LAPTOP') AND pd.name IN ('Merk', 'RAM (GB)', 'Opslag (GB)', 'Besturingssysteem', 'Serienummer');

-- Voor Netwerkapparatuur
INSERT INTO configuration_item_type_properties (configuration_item_type_id, property_definition_id)
SELECT cit.id, pd.id FROM configuration_item_types cit, property_definitions pd
WHERE cit.name IN ('ROUTER', 'SWITCH', 'ACCESS_POINT') AND pd.name IN ('Merk', 'Softwareversie', 'IP Adres', 'MAC Adres', 'Aantal Poorten');

-- Voor Servers
INSERT INTO configuration_item_type_properties (configuration_item_type_id, property_definition_id)
SELECT cit.id, pd.id FROM configuration_item_types cit, property_definitions pd
WHERE cit.name = 'SERVER' AND pd.name IN ('Merk', 'RAM (GB)', 'Opslag (GB)', 'Besturingssysteem', 'IP Adres');

-- 4. Aanmaken van Assets (Configuration Items)

-- Administratie PC's (SKW A-blok)
INSERT INTO configuration_items (uuid, name, configuration_item_type_id, status, location_id)
SELECT gen_random_uuid(), 'ADMIN-PC-001', id, 'ACTIVE', (SELECT id FROM locations WHERE name = 'A-blok')
FROM configuration_item_types WHERE name = 'WORKSTATION';

INSERT INTO configuration_items (uuid, name, configuration_item_type_id, status, location_id)
SELECT gen_random_uuid(), 'ADMIN-PC-002', id, 'ACTIVE', (SELECT id FROM locations WHERE name = 'A-blok')
FROM configuration_item_types WHERE name = 'WORKSTATION';

-- Personeels Laptops
INSERT INTO configuration_items (uuid, name, configuration_item_type_id, status)
SELECT gen_random_uuid(), 'LAPTOP-DIR-01', id, 'ACTIVE' FROM configuration_item_types WHERE name = 'LAPTOP';

-- Netwerk Infrastructuur (SKW K-blok - Technische Ruimte)
DO $$
DECLARE
    tech_room_id BIGINT;
    router_type_id BIGINT;
    switch_type_id BIGINT;
    core_router_uuid TEXT := gen_random_uuid()::text;
BEGIN
    SELECT id INTO tech_room_id FROM locations WHERE name = 'K001';
    SELECT id INTO router_type_id FROM configuration_item_types WHERE name = 'ROUTER';
    SELECT id INTO switch_type_id FROM configuration_item_types WHERE name = 'SWITCH';

    -- Core Router
    INSERT INTO configuration_items (uuid, name, configuration_item_type_id, status, location_id)
    VALUES (core_router_uuid, 'CORE-ROUTER-SKW', router_type_id, 'ACTIVE', tech_room_id);

    -- Switches die afhangen van de Core Router (Hiërarchie!)
    INSERT INTO configuration_items (uuid, name, configuration_item_type_id, status, location_id, parent_configuration_item_id)
    VALUES (gen_random_uuid()::text, 'SWITCH-A-BLOK', switch_type_id, 'ACTIVE', tech_room_id, (SELECT id FROM configuration_items WHERE uuid = core_router_uuid));
END $$;

-- 5. Waarden invullen voor Assets (CI Values)

-- Waarden voor de Admin PC
WITH target_ci AS (SELECT id FROM configuration_items WHERE name = 'ADMIN-PC-001')
INSERT INTO configuration_item_values (configuration_item_id, property_definition_id, value)
SELECT (SELECT id FROM target_ci), id, 'Dell' FROM property_definitions WHERE name = 'Merk' UNION ALL
SELECT (SELECT id FROM target_ci), id, '16' FROM property_definitions WHERE name = 'RAM (GB)' UNION ALL
SELECT (SELECT id FROM target_ci), id, '512' FROM property_definitions WHERE name = 'Opslag (GB)' UNION ALL
SELECT (SELECT id FROM target_ci), id, 'Windows 11 Pro' FROM property_definitions WHERE name = 'Besturingssysteem';

-- Waarden voor de Core Router
WITH target_ci AS (SELECT id FROM configuration_items WHERE name = 'CORE-ROUTER-SKW')
INSERT INTO configuration_item_values (configuration_item_id, property_definition_id, value)
SELECT (SELECT id FROM target_ci), id, 'Cisco' FROM property_definitions WHERE name = 'Merk' UNION ALL
SELECT (SELECT id FROM target_ci), id, 'v17.3.4' FROM property_definitions WHERE name = 'Softwareversie' UNION ALL
SELECT (SELECT id FROM target_ci), id, '10.0.0.1' FROM property_definitions WHERE name = 'IP Adres' UNION ALL
SELECT (SELECT id FROM target_ci), id, '24' FROM property_definitions WHERE name = 'Aantal Poorten';

-- Waarden voor de Laptop
WITH target_ci AS (SELECT id FROM configuration_items WHERE name = 'LAPTOP-DIR-01')
INSERT INTO configuration_item_values (configuration_item_id, property_definition_id, value)
SELECT (SELECT id FROM target_ci), id, 'Apple' FROM property_definitions WHERE name = 'Merk' UNION ALL
SELECT (SELECT id FROM target_ci), id, 'MacBook Pro M3' FROM property_definitions WHERE name = 'Serienummer' UNION ALL
SELECT (SELECT id FROM target_ci), id, 'macOS Sonoma' FROM property_definitions WHERE name = 'Besturingssysteem' UNION ALL
SELECT (SELECT id FROM target_ci), id, '32' FROM property_definitions WHERE name = 'RAM (GB)';