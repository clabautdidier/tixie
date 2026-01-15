package be.thomasmore.tixie.api.controller;

import be.thomasmore.tixie.api.dto.ConfigurationItemNodeResponse;
import be.thomasmore.tixie.api.dto.ConfigurationItemRequest;
import be.thomasmore.tixie.api.dto.ConfigurationItemResponse;
import be.thomasmore.tixie.api.dto.LocationNodeResponse;
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
    public ResponseEntity<List<ConfigurationItemResponse>> getAllConfigurationItems() {
        List<ConfigurationItemResponse> configurationItems = configurationItemService.findAll();
        return ResponseEntity.ok(configurationItems);
    }

    /**
     * Maakt een nieuw Configuration Item aan met bijbehorende dynamische waarden.
     * @param configurationItemRequest De data voor het nieuwe item.
     * @return Het aangemaakte item als ConfigurationItemResponse.
     */
    @PostMapping
    public ResponseEntity<ConfigurationItemResponse> createConfigurationItem(
            @RequestBody ConfigurationItemRequest configurationItemRequest) {
        ConfigurationItemResponse createdItem = configurationItemService.createConfigurationItem(configurationItemRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
    }

    /**
     * Haalt de details op van één specifiek Configuration Item op basis van zijn UUID.
     * @param uuid De unieke identificatie van het item.
     * @return Het gevraagde item.
     */
    @GetMapping("/{uuid}")
    public ResponseEntity<ConfigurationItemResponse> getConfigurationItemByUuid(@PathVariable String uuid) {
        ConfigurationItemResponse configurationItem = configurationItemService.findByUuid(uuid);
        return ResponseEntity.ok(configurationItem);
    }

    @GetMapping("/tree")
    public List<ConfigurationItemNodeResponse> getTree() {
        return configurationItemService.getConfigurationItemTree();
    }

    /**
     * Werkt een bestaand Configuration Item bij.
     * @param uuid De UUID van het bij te werken item.
     * @param configurationItemRequest De nieuwe data.
     * @return Het bijgewerkte item.
     */
    @PutMapping("/{uuid}")
    public ResponseEntity<ConfigurationItemResponse> updateConfigurationItem(
            @PathVariable String uuid,
            @RequestBody ConfigurationItemRequest configurationItemRequest) {
        ConfigurationItemResponse updatedItem = configurationItemService.updateConfigurationItem(uuid, configurationItemRequest);
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