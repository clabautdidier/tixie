package be.thomasmore.tixie.api.controller;

import be.thomasmore.tixie.api.dto.ConfigurationItemTypeRequest;
import be.thomasmore.tixie.api.dto.ConfigurationItemTypeResponse;
import be.thomasmore.tixie.api.service.ConfigurationItemTypeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/configuration-item-types")
@PreAuthorize("hasAnyRole('ADMIN', 'CONFIGADMIN')")
public class ConfigurationItemTypeController {

    private final ConfigurationItemTypeService configurationItemTypeService;

    public ConfigurationItemTypeController(ConfigurationItemTypeService configurationItemTypeService) {
        this.configurationItemTypeService = configurationItemTypeService;
    }

    @GetMapping
    public ResponseEntity<List<ConfigurationItemTypeResponse>> getAllTypes() {
        return ResponseEntity.ok(configurationItemTypeService.findAll());
    }

    @PostMapping
    public ResponseEntity<ConfigurationItemTypeResponse> createType(@RequestBody ConfigurationItemTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(configurationItemTypeService.create(request));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ConfigurationItemTypeResponse> updateType(
            @PathVariable String uuid, 
            @RequestBody ConfigurationItemTypeRequest request) {
        return ResponseEntity.ok(configurationItemTypeService.update(uuid, request));
    }
}