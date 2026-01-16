package be.thomasmore.tixie.api.service;

import be.thomasmore.tixie.api.dto.ConfigurationItemTypePropertyRequestDTO;
import be.thomasmore.tixie.api.dto.ConfigurationItemTypePropertyResponseDTO;
import be.thomasmore.tixie.api.dto.ConfigurationItemTypeRequestDTO;
import be.thomasmore.tixie.api.dto.ConfigurationItemTypeResponseDTO;
import be.thomasmore.tixie.api.entity.ConfigurationItemType;
import be.thomasmore.tixie.api.entity.ConfigurationItemTypeProperty;
import be.thomasmore.tixie.api.entity.PropertyDefinition;
import be.thomasmore.tixie.api.repository.ConfigurationItemTypeRepository;
import be.thomasmore.tixie.api.repository.PropertyDefinitionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ConfigurationItemTypeService {

    private final ConfigurationItemTypeRepository configurationItemTypeRepository;
    private final PropertyDefinitionRepository propertyDefinitionRepository;

    public ConfigurationItemTypeService(
            ConfigurationItemTypeRepository configurationItemTypeRepository,
            PropertyDefinitionRepository propertyDefinitionRepository) {
        this.configurationItemTypeRepository = configurationItemTypeRepository;
        this.propertyDefinitionRepository = propertyDefinitionRepository;
    }

public List<ConfigurationItemTypeResponseDTO> findAll() {
        return configurationItemTypeRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ConfigurationItemTypeResponseDTO create(ConfigurationItemTypeRequestDTO request) {
        ConfigurationItemType configurationItemType = new ConfigurationItemType();
        configurationItemType.setName(request.name());
        configurationItemType.setDescription(request.description());

        updateProperties(configurationItemType, request.properties());

        ConfigurationItemType savedType = configurationItemTypeRepository.save(configurationItemType);
        return mapToResponse(savedType);
    }

    public ConfigurationItemTypeResponseDTO update(String uuid, ConfigurationItemTypeRequestDTO request) {
        ConfigurationItemType configurationItemType = configurationItemTypeRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("ConfigurationItemType niet gevonden met uuid: " + uuid));

        configurationItemType.setName(request.name());
        configurationItemType.setDescription(request.description());

        // Verwijder bestaande koppelingen en voeg nieuwe toe
        configurationItemType.getProperties().clear();
        updateProperties(configurationItemType, request.properties());

        ConfigurationItemType updatedType = configurationItemTypeRepository.save(configurationItemType);
        return mapToResponse(updatedType);
    }

private void updateProperties(ConfigurationItemType type, List<ConfigurationItemTypePropertyRequestDTO> propertyRequests) {
        for (ConfigurationItemTypePropertyRequestDTO propertyRequest : propertyRequests) {
            PropertyDefinition propertyDefinition = propertyDefinitionRepository.findByUuid(propertyRequest.propertyUuid())
                    .orElseThrow(() -> new EntityNotFoundException("PropertyDefinition niet gevonden"));

            ConfigurationItemTypeProperty typeProperty = new ConfigurationItemTypeProperty();
            typeProperty.setConfigurationItemType(type);
            typeProperty.setPropertyDefinition(propertyDefinition);
            typeProperty.setRequired(propertyRequest.required());

            type.getProperties().add(typeProperty);
        }
    }

private ConfigurationItemTypeResponseDTO mapToResponse(ConfigurationItemType type) {
        List<ConfigurationItemTypePropertyResponseDTO> propertyResponses = type.getProperties().stream()
                .map(prop -> new ConfigurationItemTypePropertyResponseDTO(
                        prop.getPropertyDefinition().getUuid(),
                        prop.getPropertyDefinition().getName(),
                        prop.getPropertyDefinition().getDataType().name(),
                        prop.isRequired()
                )).toList();

        return new ConfigurationItemTypeResponseDTO(
                type.getUuid(),
                type.getName(),
                type.getDescription(),
                propertyResponses
        );
    }
}