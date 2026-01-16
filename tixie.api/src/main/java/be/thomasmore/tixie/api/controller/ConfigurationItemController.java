package be.thomasmore.tixie.api.controller;

import be.thomasmore.tixie.api.dto.ConfigurationItemNodeResponseDTO;
import be.thomasmore.tixie.api.dto.ConfigurationItemRequestDTO;
import be.thomasmore.tixie.api.dto.ConfigurationItemResponseDTO;
import be.thomasmore.tixie.api.dto.LocationNodeResponseDTO;
import be.thomasmore.tixie.api.service.ConfigurationItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/configuration-items")
@PreAuthorize("hasAnyRole('ADMIN', 'CONFIGADMIN')")
public class ConfigurationItemController {

    private final ConfigurationItemService configurationItemService;

    public ConfigurationItemController(ConfigurationItemService configurationItemService) {
        this.configurationItemService = configurationItemService;
    }

    /**
     * Haalt een lijst op van alle geregistreerde Configuration Items.
     * @return Een lijst met ConfigurationItemResponse objecten.
     */
    @GetMapping
public ResponseEntity<List<ConfigurationItemResponseDTO>> getAllConfigurationItems() {
        List<ConfigurationItemResponseDTO> configurationItems = configurationItemService.findAll();
        return ResponseEntity.ok(configurationItems);
    }

    /**
     * Maakt een nieuw Configuration Item aan met bijbehorende dynamische waarden.
     * @param configurationItemRequest De data voor het nieuwe item.
     * @return Het aangemaakte item als ConfigurationItemResponse.
     */
    @PostMapping
public ResponseEntity<ConfigurationItemResponseDTO> createConfigurationItem(
            @RequestBody ConfigurationItemRequestDTO configurationItemRequest) {
        ConfigurationItemResponseDTO createdItem = configurationItemService.createConfigurationItem(configurationItemRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
    }

    /**
     * Haalt de details op van één specifiek Configuration Item op basis van zijn UUID.
     * @param uuid De unieke identificatie van het item.
     * @return Het gevraagde item.
     */
    @GetMapping("/{uuid}")
public ResponseEntity<ConfigurationItemResponseDTO> getConfigurationItemByUuid(@PathVariable String uuid) {
        ConfigurationItemResponseDTO configurationItem = configurationItemService.findByUuid(uuid);
        return ResponseEntity.ok(configurationItem);
    }

    @GetMapping("/tree")
    public List<ConfigurationItemNodeResponseDTO> getTree() {
        return configurationItemService.getConfigurationItemTree();
    }

    /**
     * Werkt een bestaand Configuration Item bij.
     * @param uuid De UUID van het bij te werken item.
     * @param configurationItemRequest De nieuwe data.
     * @return Het bijgewerkte item.
     */
    @PutMapping("/{uuid}")
public ResponseEntity<ConfigurationItemResponseDTO> updateConfigurationItem(
            @PathVariable String uuid,
            @RequestBody ConfigurationItemRequestDTO configurationItemRequest) {
        ConfigurationItemResponseDTO updatedItem = configurationItemService.updateConfigurationItem(uuid, configurationItemRequest);
        return ResponseEntity.ok(updatedItem);
    }

    /**
     * Verwijdert een Configuration Item uit het systeem.
     * @param uuid De UUID van het te verwijderen item.
     * @return Een 204 No Content status bij succes.
     */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> deleteConfigurationItem(@PathVariable String uuid) {
        configurationItemService.deleteConfigurationItem(uuid);
        return ResponseEntity.noContent().build();
    }
}