-- ==========================================================
-- Flyway Migratie: V1__Initial_Database_Setup.sql
-- Beschrijving: Gebruikersbeheer, Locaties en Dynamisch CMDB
-- ==========================================================

-- 1. GEBRUIKERSBEHEER
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    manager_id BIGINT,
    CONSTRAINT fk_user_manager FOREIGN KEY (manager_id) REFERENCES users(id)
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role_name),
    CONSTRAINT fk_role_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. DYNAMISCHE DEFINITIES (De "Library")
CREATE TABLE property_definitions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    data_type VARCHAR(50) NOT NULL, -- Bijv. TEXT, INTEGER, BOOLEAN, DATE, etc.
    target VARCHAR(25) NOT NULL DEFAULT 'ALL'
);

CREATE TABLE location_types (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- De koppeltabel tussen Type en Definition (Attributed Association)
CREATE TABLE location_type_properties (
    location_type_id BIGINT REFERENCES location_types(id) ON DELETE CASCADE,
    property_definition_id BIGINT REFERENCES property_definitions(id) ON DELETE CASCADE,
    required BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (location_type_id, property_definition_id)
);

-- 3. LOCATIE DATA
CREATE TABLE locations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    location_type_id BIGINT REFERENCES location_types(id),
    parent_id BIGINT,

    CONSTRAINT fk_location_parent
       FOREIGN KEY (parent_id)
           REFERENCES locations(id)
           ON DELETE SET NULL
);

CREATE TABLE location_values (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    property_definition_id BIGINT NOT NULL REFERENCES property_definitions(id),
    value TEXT, -- Slaat alles op als string, conversie gebeurt in Java

    CONSTRAINT uk_location_property UNIQUE (location_id, property_definition_id)
);

CREATE TABLE configuration_item_types (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
description TEXT
);

CREATE TABLE configuration_item_type_properties (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- Dit komt overeen met het @Id veld in Java
    configuration_item_type_id BIGINT NOT NULL REFERENCES configuration_item_types(id) ON DELETE CASCADE,
    property_definition_id BIGINT NOT NULL REFERENCES property_definitions(id) ON DELETE CASCADE,
    required BOOLEAN DEFAULT FALSE,

    CONSTRAINT unique_type_property_combination UNIQUE (configuration_item_type_id, property_definition_id)
);

CREATE TABLE configuration_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    configuration_item_type_id BIGINT REFERENCES configuration_item_types(id),
    parent_configuration_item_id BIGINT REFERENCES configuration_items(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL
);

CREATE TABLE configuration_item_values (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    configuration_item_id BIGINT NOT NULL REFERENCES configuration_items(id) ON DELETE CASCADE,
    property_definition_id BIGINT NOT NULL REFERENCES property_definitions(id),
    value TEXT,
    CONSTRAINT uk_configuration_item_property UNIQUE (configuration_item_id, property_definition_id)
);

CREATE INDEX idx_users_uuid ON users(uuid);
CREATE INDEX idx_locations_uuid ON locations(uuid);
CREATE INDEX idx_locations_parent ON locations(parent_id);
CREATE INDEX idx_location_values_loc ON location_values(location_id);
CREATE INDEX idx_prop_defs_uuid ON property_definitions(uuid);
CREATE INDEX idx_configuration_item_parent ON configuration_items(parent_configuration_item_id);