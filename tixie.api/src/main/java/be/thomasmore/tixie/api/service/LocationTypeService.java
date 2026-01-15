package be.thomasmore.tixie.api.service;

import be.thomasmore.tixie.api.dto.LocationTypePropertyRequest;
import be.thomasmore.tixie.api.dto.LocationTypePropertyResponse;
import be.thomasmore.tixie.api.dto.LocationTypeRequest;
import be.thomasmore.tixie.api.dto.LocationTypeResponse;
import be.thomasmore.tixie.api.entity.LocationType;
import be.thomasmore.tixie.api.entity.LocationTypeProperty;
import be.thomasmore.tixie.api.entity.PropertyDefinition;
import be.thomasmore.tixie.api.entity.PropertyTarget;
import be.thomasmore.tixie.api.repository.LocationTypeRepository;
import be.thomasmore.tixie.api.repository.PropertyDefinitionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LocationTypeService {

    private final LocationTypeRepository locationTypeRepository;
    private final PropertyDefinitionRepository propertyDefinitionRepository;

    public LocationTypeService(
            LocationTypeRepository locationTypeRepository,
            PropertyDefinitionRepository propertyDefinitionRepository) {
        this.locationTypeRepository = locationTypeRepository;
        this.propertyDefinitionRepository = propertyDefinitionRepository;
    }

    public List<LocationTypeResponse> findAll() {
        return locationTypeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LocationTypeResponse findByUuid(String uuid) {
        LocationType locationType = locationTypeRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Locatie type niet gevonden"));
        return mapToResponse(locationType);
    }

    public LocationTypeResponse create(LocationTypeRequest request) {
        LocationType locationType = new LocationType();
        locationType.setName(request.name());
        locationType.setDescription(request.description());

        this.applyPropertyRequestsToEntity(locationType, request.properties());

        LocationType savedLocationType = locationTypeRepository.save(locationType);
        return mapToResponse(savedLocationType);
    }

    public LocationTypeResponse update(String uuid, LocationTypeRequest request) {
        LocationType locationType = locationTypeRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Locatie type niet gevonden met UUID: " + uuid));

        locationType.setName(request.name());
        locationType.setDescription(request.description());

        // FIX: Verwijder oude eigenschappen en forceer flush om duplicate key/object errors te voorkomen
        locationType.getProperties().clear();
        locationTypeRepository.saveAndFlush(locationType);

        this.applyPropertyRequestsToEntity(locationType, request.properties());

        LocationType updatedLocationType = locationTypeRepository.save(locationType);
        return mapToResponse(updatedLocationType);
    }

    public void delete(String uuid) {
        LocationType locationType = locationTypeRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Locatie type niet gevonden"));
        locationTypeRepository.delete(locationType);
    }

    private void applyPropertyRequestsToEntity(LocationType locationType, List<LocationTypePropertyRequest> propertyRequests) {
        if (propertyRequests == null) return;

        for (LocationTypePropertyRequest propertyRequest : propertyRequests) {
            PropertyDefinition propertyDefinition = propertyDefinitionRepository
                    .findByUuid(propertyRequest.propertyUuid())
                    .orElseThrow(() -> new EntityNotFoundException("Eigenschap definitie niet gevonden"));

            LocationTypeProperty locationTypeProperty = new LocationTypeProperty();
            locationTypeProperty.setLocationType(locationType);
            locationTypeProperty.setPropertyDefinition(propertyDefinition);
            locationTypeProperty.setRequired(propertyRequest.required());

            locationType.getProperties().add(locationTypeProperty);
        }
    }

    private LocationTypeResponse mapToResponse(LocationType locationType) {
        List<LocationTypePropertyResponse> propertyResponses = locationType.getProperties().stream()
                .filter(property -> property.getPropertyDefinition().getTarget() == PropertyTarget.LOCATION ||
                        property.getPropertyDefinition().getTarget() == PropertyTarget.ALL)
                .map(property -> new LocationTypePropertyResponse(
                        property.getPropertyDefinition().getUuid(),
                        property.getPropertyDefinition().getName(),
                        property.getPropertyDefinition().getDataType().name(),
                        property.isRequired()
                )).collect(Collectors.toList());

        return new LocationTypeResponse(
                locationType.getUuid(),
                locationType.getName(),
                locationType.getDescription(),
                propertyResponses
        );
    }
}