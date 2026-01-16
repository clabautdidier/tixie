package be.thomasmore.tixie.api.service;

import be.thomasmore.tixie.api.dto.LocationNodeResponseDTO;
import be.thomasmore.tixie.api.dto.LocationRequestDTO;
import be.thomasmore.tixie.api.dto.LocationResponseDTO;
import be.thomasmore.tixie.api.dto.LocationValueDTO;
import be.thomasmore.tixie.api.entity.Location;
import be.thomasmore.tixie.api.entity.LocationType;
import be.thomasmore.tixie.api.entity.LocationValue;
import be.thomasmore.tixie.api.entity.PropertyDefinition;
import be.thomasmore.tixie.api.repository.LocationRepository;
import be.thomasmore.tixie.api.repository.LocationTypeRepository;
import be.thomasmore.tixie.api.repository.PropertyDefinitionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class LocationService {

    private final LocationRepository locationRepository;
    private final LocationTypeRepository locationTypeRepository;
    private final PropertyDefinitionRepository propertyDefinitionRepository;

    public LocationService(LocationRepository locationRepository,
                           LocationTypeRepository locationTypeRepository,
                           PropertyDefinitionRepository propertyDefinitionRepository) {
        this.locationRepository = locationRepository;
        this.locationTypeRepository = locationTypeRepository;
        this.propertyDefinitionRepository = propertyDefinitionRepository;
    }

    @Transactional(readOnly = true)
    public List<LocationResponseDTO> findAll() {
        return locationRepository.findAll().stream()
                .map(this::convertToResponseDto).toList();
    }

    @Transactional(readOnly = true)
    public LocationResponseDTO findByUuid(String uuid) {
        Location location = locationRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Locatie niet gevonden"));
        return convertToResponseDto(location);
    }

    @Transactional(readOnly = true)
    public List<LocationNodeResponseDTO> getLocationTree() {
        List<Location> rootLocations = locationRepository.findAllByParentIdIsNull();
        return rootLocations.stream()
                .map(this::mapToNode)
                .toList();
    }

    public LocationResponseDTO create(LocationRequestDTO request) {
        Location location = new Location();
        applyRequestToEntity(location, request);
        return convertToResponseDto(locationRepository.save(location));
    }

    public LocationResponseDTO update(String uuid, LocationRequestDTO request) {
        Location location = locationRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Locatie niet gevonden"));

        // FIX: Verwijder eerst de oude dynamische waarden en forceer de database-update
        location.getValues().clear();
        locationRepository.saveAndFlush(location);

        applyRequestToEntity(location, request);
        return convertToResponseDto(locationRepository.save(location));
    }

    public void delete(String uuid) {
        Location location = locationRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Locatie niet gevonden"));
        locationRepository.delete(location);
    }

    private void applyRequestToEntity(Location location, LocationRequestDTO request) {
        location.setName(request.name());

        // Type koppelen
        if (request.typeUuid() != null) {
            LocationType type = locationTypeRepository.findByUuid(request.typeUuid())
                    .orElseThrow(() -> new EntityNotFoundException("Location Type niet gevonden"));
            location.setLocationType(type);
        }

        // Parent koppelen met circulaire check
        if (request.parentUuid() != null && !request.parentUuid().isBlank()) {
            Location parent = locationRepository.findByUuid(request.parentUuid())
                    .orElseThrow(() -> new EntityNotFoundException("Parent Locatie niet gevonden"));

            if (location.getUuid() != null && isCircularReference(location, parent)) {
                throw new IllegalArgumentException("Circulaire referentie gedetecteerd in locatie-hiërarchie.");
            }
            location.setParent(parent);
        } else {
            location.setParent(null);
        }

        // Dynamische waarden verwerken
        if (request.values() != null) {
            for (LocationValueDTO valueDto : request.values()) {
                PropertyDefinition definition = propertyDefinitionRepository.findByUuid(valueDto.propertyUuid())
                        .orElseThrow(() -> new EntityNotFoundException("Eigenschap definitie niet gevonden"));

                LocationValue valueEntity = new LocationValue();
                valueEntity.setLocation(location);
                valueEntity.setPropertyDefinition(definition);
                valueEntity.setValue(valueDto.value());
                location.getValues().add(valueEntity);
            }
        }
    }

    private boolean isCircularReference(Location currentLocation, Location proposedParent) {
        Location checkStep = proposedParent;
        while (checkStep != null) {
            if (checkStep.getUuid().equals(currentLocation.getUuid())) {
                return true;
            }
            checkStep = checkStep.getParent();
        }
        return false;
    }

private LocationNodeResponseDTO mapToNode(Location location) {
        List<LocationNodeResponseDTO> children = location.getChildren().stream()
                .map(this::mapToNode)
                .toList();

        return new LocationNodeResponseDTO(
                location.getUuid(),
                location.getName(),
                location.getLocationType() != null ? location.getLocationType().getName() : "Onbekend",
                children
        );
    }

    private LocationResponseDTO convertToResponseDto(Location location) {
        List<LocationValueDTO> valueDtos = location.getValues().stream()
                .map(v -> new LocationValueDTO(
                        v.getPropertyDefinition().getUuid(),
                        v.getPropertyDefinition().getName(),
                        v.getValue()))
                .toList();

        return new LocationResponseDTO(
                location.getUuid(),
                location.getName(),
                location.getLocationType() != null ? location.getLocationType().getName() : null,
                location.getLocationType() != null ? location.getLocationType().getUuid() : null,
                location.getParent() != null ? location.getParent().getUuid() : null,
                location.getParent() != null ? location.getParent().getName() : null,
                valueDtos
        );
    }
}