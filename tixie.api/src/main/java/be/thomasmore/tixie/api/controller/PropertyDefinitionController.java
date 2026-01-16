package be.thomasmore.tixie.api.controller;

import be.thomasmore.tixie.api.entity.PropertyDefinition;
import be.thomasmore.tixie.api.service.PropertyDefinitionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@PreAuthorize("hasAnyRole('ADMIN')")
public class PropertyDefinitionController {

    private final PropertyDefinitionService propertyDefinitionService;

    public PropertyDefinitionController(PropertyDefinitionService propertyDefinitionService) {
        this.propertyDefinitionService = propertyDefinitionService;
    }

    @GetMapping
    public List<PropertyDefinition> getAllProperties() {
        return propertyDefinitionService.findAll();
    }

    @GetMapping("/{uuid}")
    public PropertyDefinition getPropertyByUuid(@PathVariable String uuid) {
        return propertyDefinitionService.findByUuid(uuid);
    }

    @PostMapping
    public PropertyDefinition createProperty(@RequestBody PropertyDefinition propertyDefinition) {
        return propertyDefinitionService.create(propertyDefinition);
    }

    @PutMapping("/{uuid}")
    public PropertyDefinition updateProperty(@PathVariable String uuid, @RequestBody PropertyDefinition updatedPropertyDefinition) {
        return propertyDefinitionService.update(uuid, updatedPropertyDefinition);
    }

    @DeleteMapping("/{uuid}")
    public void deleteProperty(@PathVariable String uuid) {
        propertyDefinitionService.delete(uuid);
    }
}
