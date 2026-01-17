ALTER TABLE incidents
ADD COLUMN location_id BIGINT,
ADD COLUMN configuration_item_id BIGINT;

ALTER TABLE incidents
ADD CONSTRAINT fk_incidents_location
FOREIGN KEY (location_id) REFERENCES locations(id);

ALTER TABLE incidents
ADD CONSTRAINT fk_incidents_configuration_item
FOREIGN KEY (configuration_item_id) REFERENCES configuration_items(id);