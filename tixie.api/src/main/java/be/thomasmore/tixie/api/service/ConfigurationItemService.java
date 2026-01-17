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
    public List<ConfigurationItemNodeResponseDTO> getConfigurationItemTree(String locationUuid) {
        List<ConfigurationItem> rootConfigurationItems;
        
        if (locationUuid != null && !locationUuid.isBlank()) {
            Location location = locationRepository.findByUuid(locationUuid)
                    .orElseThrow(() -> new EntityNotFoundException("Location not found: " + locationUuid));
            // Filter root items by location
            // Note: This assumes a simple filtering where we only check if the item itself is at the location.
            // If items inherit location from parents or if we need to find items in sub-locations, this logic needs to be more complex.
            // For now, we'll filter the roots and then filter children recursively in mapToNodeResponse if needed, 
            // but typically location filtering on tree roots is a good start.
            // However, since the repository method findAllByParentConfigurationItemIdIsNull() doesn't take location,
            // we might need a custom query or filter in memory.
            
            // Let's filter in memory for now as the dataset might not be huge, or add a repo method.
            // Better approach: Find all items at location, then reconstruct tree or just show flat list?
            // The requirement implies filtering the selection.
            
            // Let's try to find roots that match the location OR have descendants at the location?
            // Or simply: Show only items that are at the specific location.
            
            // If the requirement is "limit configuration items to the selected location", it likely means
            // we should only show items physically located there.
            
            rootConfigurationItems = configurationItemRepository.findAllByParentConfigurationItemIdIsNull().stream()
                    .filter(ci -> isAtLocation(ci, location.getId()))
                    .toList();
        } else {
            rootConfigurationItems = configurationItemRepository.findAllByParentConfigurationItemIdIsNull();
        }

        return rootConfigurationItems.stream()
                .map(ci -> mapToNodeResponse(ci, locationUuid != null ? locationRepository.findByUuid(locationUuid).map(Location::getId).orElse(null) : null))
                .filter(node -> node != null) // Filter out nulls if mapToNodeResponse returns null for non-matching nodes
                .toList();
    }
    
    private boolean isAtLocation(ConfigurationItem item, Long locationId) {
        // Check if item is at location
        if (item.getLocationId() != null && item.getLocationId().equals(locationId)) {
            return true;
        }
        // Check if any child is at location (recursive) - if we want to show parents of items at location
        // But usually for selection we just want the items themselves.
        // If the tree structure is important, we might need to show parents even if they are not at the location,
        // but disable selection? Or just show the sub-tree rooted at the location?
        
        // Let's assume strict filtering: Only show items at the location.
        // But wait, getConfigurationItemTree returns a tree. If a parent is NOT at the location but a child IS,
        // should we show the parent?
        
        // Simplest interpretation: Filter the tree to only include nodes (and their paths) relevant to the location.
        // Or maybe just filter the list of available items if it wasn't a tree.
        // Since it IS a tree, let's try to keep the structure but filter nodes.
        
        return checkItemOrChildrenAtLocation(item, locationId);
    }

    private boolean checkItemOrChildrenAtLocation(ConfigurationItem item, Long locationId) {
        if (item.getLocationId() != null && item.getLocationId().equals(locationId)) {
            return true;
        }
        for (ConfigurationItem child : item.getChildConfigurationItems()) {
            if (checkItemOrChildrenAtLocation(child, locationId)) {
                return true;
            }
        }
        return false;
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

    private ConfigurationItemNodeResponseDTO mapToNodeResponse(ConfigurationItem configurationItem, Long filterLocationId) {
        // If filtering by location, only include children that are relevant (at location or have descendants at location)
        List<ConfigurationItemNodeResponseDTO> children = configurationItem.getChildConfigurationItems().stream()
                .filter(child -> filterLocationId == null || checkItemOrChildrenAtLocation(child, filterLocationId))
                .map(child -> mapToNodeResponse(child, filterLocationId))
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