package be.thomasmore.tixie.api.service;

import be.thomasmore.tixie.api.dto.*;
import be.thomasmore.tixie.api.entity.*;
import be.thomasmore.tixie.api.repository.ConfigurationItemRepository;
import be.thomasmore.tixie.api.repository.ConfigurationItemTypeRepository;
import be.thomasmore.tixie.api.repository.LocationRepository;
import be.thomasmore.tixie.api.repository.PropertyDefinitionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ConfigurationItemService {

    private final ConfigurationItemRepository configurationItemRepository;
    private final ConfigurationItemTypeRepository configurationItemTypeRepository;
    private final PropertyDefinitionRepository propertyDefinitionRepository;
    private final LocationRepository locationRepository;

    public ConfigurationItemService(
            ConfigurationItemRepository configurationItemRepository,
            ConfigurationItemTypeRepository configurationItemTypeRepository,
            PropertyDefinitionRepository propertyDefinitionRepository,
            LocationRepository locationRepository) {
        this.configurationItemRepository = configurationItemRepository;
        this.configurationItemTypeRepository = configurationItemTypeRepository;
        this.propertyDefinitionRepository = propertyDefinitionRepository;
        this.locationRepository = locationRepository;
    }

    /**
     * Bouwt de volledige hiërarchische boomstructuur van alle Configuration Items op.
     */
    @Transactional(readOnly = true)
    public List<ConfigurationItemNodeResponseDTO> getConfigurationItemTree() {
        // Haal de hoofditems op (items zonder parent CI)
        List<ConfigurationItem> rootConfigurationItems = configurationItemRepository.findAllByParentConfigurationItemIdIsNull();

        return rootConfigurationItems.stream()
                .map(this::mapToNodeResponse)
                .toList();
    }

    public ConfigurationItemResponseDTO createConfigurationItem(ConfigurationItemRequestDTO request) {
        ConfigurationItemType configurationItemType = configurationItemTypeRepository
                .findByUuid(request.configurationItemTypeUuid())
                .orElseThrow(() -> new EntityNotFoundException("Configuration Item Type niet gevonden"));

        ConfigurationItem configurationItem = new ConfigurationItem();
        configurationItem.setName(request.name());
        configurationItem.setConfigurationItemType(configurationItemType);
        configurationItem.setStatus(request.status() != null ? request.status() : "ACTIVE");

        this.applyParentRelation(configurationItem, request.parentConfigurationItemUuid());

        if (request.locationUuid() != null) {
            locationRepository.findByUuid(request.locationUuid())
                    .ifPresent(location -> configurationItem.setLocationId(location.getId()));
        }

        this.applyValuesToEntity(configurationItem, request.values());

        ConfigurationItem savedConfigurationItem = configurationItemRepository.save(configurationItem);
        return mapToResponse(savedConfigurationItem);
    }

    public ConfigurationItemResponseDTO updateConfigurationItem(String uuid, ConfigurationItemRequestDTO request) {
        ConfigurationItem configurationItem = configurationItemRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Configuration Item niet gevonden: " + uuid));

        configurationItem.setName(request.name());
        configurationItem.setStatus(request.status());

        this.applyParentRelation(configurationItem, request.parentConfigurationItemUuid());

        if (request.locationUuid() != null) {
            locationRepository.findByUuid(request.locationUuid())
                    .ifPresent(location -> configurationItem.setLocationId(location.getId()));
        } else {
            configurationItem.setLocationId(null);
        }

        // FIX: Eerst de oude dynamische waarden verwijderen om Unique Constraint errors te vermijden
        configurationItem.getValues().clear();
        configurationItemRepository.saveAndFlush(configurationItem);

        this.applyValuesToEntity(configurationItem, request.values());

        ConfigurationItem updatedConfigurationItem = configurationItemRepository.save(configurationItem);
        return mapToResponse(updatedConfigurationItem);
    }

    private void applyParentRelation(ConfigurationItem configurationItem, String parentConfigurationItemUuid) {
        if (parentConfigurationItemUuid != null && !parentConfigurationItemUuid.isBlank()) {
            ConfigurationItem proposedParent = configurationItemRepository.findByUuid(parentConfigurationItemUuid)
                    .orElseThrow(() -> new EntityNotFoundException("Parent Configuration Item niet gevonden"));

            if (isCircularReference(configurationItem, proposedParent)) {
                throw new IllegalArgumentException("Deze relatie is niet toegestaan: dit zou een circulaire referentie veroorzaken.");
            }

            configurationItem.setParentConfigurationItem(proposedParent);
        } else {
            configurationItem.setParentConfigurationItem(null);
        }
    }

    private boolean isCircularReference(ConfigurationItem currentConfigurationItem, ConfigurationItem proposedParent) {
        if (currentConfigurationItem.getId() == null) {
            return false;
        }

        ConfigurationItem checkStep = proposedParent;
        while (checkStep != null) {
            if (checkStep.getId().equals(currentConfigurationItem.getId())) {
                return true;
            }
            checkStep = checkStep.getParentConfigurationItem();
        }
        return false;
    }

    private void applyValuesToEntity(ConfigurationItem item, List<ConfigurationItemValueRequestDTO> valueRequests) {
        if (valueRequests == null) return;
        for (ConfigurationItemValueRequestDTO valueRequest : valueRequests) {
            PropertyDefinition propertyDefinition = propertyDefinitionRepository
                    .findByUuid(valueRequest.propertyDefinitionUuid())
                    .orElseThrow(() -> new EntityNotFoundException("Property Definition niet gevonden"));

            ConfigurationItemValue configurationItemValue = new ConfigurationItemValue();
            configurationItemValue.setConfigurationItem(item);
            configurationItemValue.setPropertyDefinition(propertyDefinition);
            configurationItemValue.setValue(valueRequest.value());
            item.getValues().add(configurationItemValue);
        }
    }

private ConfigurationItemNodeResponseDTO mapToNodeResponse(ConfigurationItem configurationItem) {
        List<ConfigurationItemNodeResponseDTO> children = configurationItem.getChildConfigurationItems().stream()
                .map(this::mapToNodeResponse)
                .toList();

        return new ConfigurationItemNodeResponseDTO(
                configurationItem.getUuid(),
                configurationItem.getName(),
                configurationItem.getConfigurationItemType() != null ? configurationItem.getConfigurationItemType().getName() : "Onbekend",
                children
        );
    }

    private ConfigurationItemResponseDTO mapToResponse(ConfigurationItem item) {
        String parentUuid = (item.getParentConfigurationItem() != null) ? item.getParentConfigurationItem().getUuid() : null;
        String parentName = (item.getParentConfigurationItem() != null) ? item.getParentConfigurationItem().getName() : null;

List<ConfigurationItemValueResponseDTO> valueResponses = item.getValues().stream()
                .map(val -> new ConfigurationItemValueResponseDTO(
                        val.getPropertyDefinition().getUuid(),
                        val.getPropertyDefinition().getName(),
                        val.getPropertyDefinition().getDataType().name(),
                        val.getValue()
                )).toList();

        return new ConfigurationItemResponseDTO(
                item.getUuid(),
                item.getName(),
                item.getConfigurationItemType().getUuid(),
                item.getConfigurationItemType().getName(),
                item.getStatus(),
                parentUuid,
                parentName,
                item.getLocationId() == null ? null : locationRepository.findById(item.getLocationId()).map(Location::getUuid).orElse(null),
                valueResponses
        );
    }

public List<ConfigurationItemResponseDTO> findAll() {
        return configurationItemRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public ConfigurationItemResponseDTO findByUuid(String uuid) {
        return configurationItemRepository.findByUuid(uuid).map(this::mapToResponse)
                .orElseThrow(() -> new EntityNotFoundException("Item niet gevonden"));
    }

    public void deleteConfigurationItem(String uuid) {
        ConfigurationItem configurationItem = configurationItemRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Item niet gevonden"));
        configurationItemRepository.delete(configurationItem);
    }
}