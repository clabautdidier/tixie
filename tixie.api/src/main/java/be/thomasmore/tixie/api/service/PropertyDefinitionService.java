package be.thomasmore.tixie.api.service;

import be.thomasmore.tixie.api.entity.PropertyDefinition;
import be.thomasmore.tixie.api.entity.PropertyTarget;
import be.thomasmore.tixie.api.repository.PropertyDefinitionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PropertyDefinitionService {

    private final PropertyDefinitionRepository propertyDefinitionRepository;

    public PropertyDefinitionService(PropertyDefinitionRepository propertyDefinitionRepository) {
        this.propertyDefinitionRepository = propertyDefinitionRepository;
    }

    @Transactional(readOnly = true)
    public List<PropertyDefinition> findAll() {
        return propertyDefinitionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public PropertyDefinition findByUuid(String uuid) {
        return propertyDefinitionRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Property Definition niet gevonden: " + uuid));
    }

    public PropertyDefinition create(PropertyDefinition propertyDefinition) {
        // Ensure target is not null when creating
        if (propertyDefinition.getTarget() == null) {
            propertyDefinition.setTarget(PropertyTarget.ALL);
        }
        return propertyDefinitionRepository.save(propertyDefinition);
    }

    public PropertyDefinition update(String uuid, PropertyDefinition updatedPropertyDefinition) {
        PropertyDefinition existingPropertyDefinition = propertyDefinitionRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Property Definition niet gevonden: " + uuid));

        existingPropertyDefinition.setName(updatedPropertyDefinition.getName());
        existingPropertyDefinition.setDataType(updatedPropertyDefinition.getDataType());

        // CRITICAL: Do not allow changing target from LOCATION to CONFIGURATION or vice versa
        // Only allow changing to/from ALL or null
        if (updatedPropertyDefinition.getTarget() == PropertyTarget.ALL || 
            existingPropertyDefinition.getTarget() == PropertyTarget.ALL) {
            existingPropertyDefinition.setTarget(updatedPropertyDefinition.getTarget());
        }

        return propertyDefinitionRepository.save(existingPropertyDefinition);
    }

    public void delete(String uuid) {
        PropertyDefinition propertyDefinition = propertyDefinitionRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Property Definition niet gevonden"));
        
        // Simple delete for now - can add validation later if needed
        propertyDefinitionRepository.delete(propertyDefinition);
    }
}