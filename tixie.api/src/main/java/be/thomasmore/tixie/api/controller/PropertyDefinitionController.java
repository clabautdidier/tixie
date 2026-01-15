package be.thomasmore.tixie.api.controller;

import be.thomasmore.tixie.api.entity.PropertyDefinition;
import be.thomasmore.tixie.api.repository.PropertyDefinitionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@PreAuthorize("hasAnyRole('ADMIN')")
public class PropertyDefinitionController {

    private final PropertyDefinitionRepository propertyDefinitionRepository;

    public PropertyDefinitionController(PropertyDefinitionRepository propertyDefinitionRepository) {
        this.propertyDefinitionRepository = propertyDefinitionRepository;
    }

    @GetMapping
    public List<PropertyDefinition> getAllProperties() {
        return propertyDefinitionRepository.findAll();
    }

    @GetMapping("/{uuid}")
    public PropertyDefinition getPropertyByUuid(@PathVariable String uuid) {
        return propertyDefinitionRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Property Definition niet gevonden: " + uuid));
    }

    @PostMapping
    public PropertyDefinition createProperty(@RequestBody PropertyDefinition propertyDefinition) {
        // Zorg dat de target niet null is bij creatie
        if (propertyDefinition.getTarget() == null) {
            propertyDefinition.setTarget(be.thomasmore.tixie.api.entity.PropertyTarget.ALL);
        }
        return propertyDefinitionRepository.save(propertyDefinition);
    }

    @PutMapping("/{uuid}")
    public PropertyDefinition updateProperty(@PathVariable String uuid, @RequestBody PropertyDefinition updatedPropertyDefinition) {
        PropertyDefinition existingPropertyDefinition = propertyDefinitionRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Property Definition niet gevonden: " + uuid));

        existingPropertyDefinition.setName(updatedPropertyDefinition.getName());
        existingPropertyDefinition.setDataType(updatedPropertyDefinition.getDataType());

        // CRUCIAAL: Voeg de target toe aan de update logica
        if (updatedPropertyDefinition.getTarget() != null) {
            existingPropertyDefinition.setTarget(updatedPropertyDefinition.getTarget());
        }

        return propertyDefinitionRepository.save(existingPropertyDefinition);
    }
}