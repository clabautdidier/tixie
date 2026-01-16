package be.thomasmore.tixie.api.controller;

import be.thomasmore.tixie.api.dto.LocationTypeRequestDTO;
import be.thomasmore.tixie.api.dto.LocationTypeResponseDTO;
import be.thomasmore.tixie.api.service.LocationTypeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/location-types")
public class LocationTypeController {

    private final LocationTypeService locationTypeService;

    public LocationTypeController(LocationTypeService locationTypeService) {
        this.locationTypeService = locationTypeService;
    }

    @GetMapping
public ResponseEntity<List<LocationTypeResponseDTO>> getAll() {
        return ResponseEntity.ok(locationTypeService.findAll());
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<LocationTypeResponseDTO> getByUuid(@PathVariable String uuid) {
        return ResponseEntity.ok(locationTypeService.findByUuid(uuid));
    }

    @PostMapping
    public ResponseEntity<LocationTypeResponseDTO> create(@RequestBody LocationTypeRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(locationTypeService.create(request));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<LocationTypeResponseDTO> update(
            @PathVariable String uuid, 
            @RequestBody LocationTypeRequestDTO request) {
        return ResponseEntity.ok(locationTypeService.update(uuid, request));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> delete(@PathVariable String uuid) {
        locationTypeService.delete(uuid);
        return ResponseEntity.noContent().build();
    }
}