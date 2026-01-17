package be.thomasmore.tixie.api.controller;

import be.thomasmore.tixie.api.dto.LocationNodeResponseDTO;
import be.thomasmore.tixie.api.dto.LocationRequestDTO;
import be.thomasmore.tixie.api.dto.LocationResponseDTO;
import be.thomasmore.tixie.api.service.LocationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CONFIGLOCATIONADMIN', 'USER')")
    public List<LocationResponseDTO> getAll() {
        return locationService.findAll();
    }

    @GetMapping("/tree")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONFIGLOCATIONADMIN', 'USER')")
    public List<LocationNodeResponseDTO> getTree() {
        return locationService.getLocationTree();
    }

    @GetMapping("/{uuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONFIGLOCATIONADMIN', 'USER')")
    public LocationResponseDTO getByUuid(@PathVariable String uuid) {
        return locationService.findByUuid(uuid);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CONFIGLOCATIONADMIN')")
    public LocationResponseDTO create(@RequestBody LocationRequestDTO request) {
        return locationService.create(request);
    }

    @PutMapping("/{uuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONFIGLOCATIONADMIN')")
    public LocationResponseDTO update(@PathVariable String uuid, @RequestBody LocationRequestDTO request) {
        return locationService.update(uuid, request);
    }

    @DeleteMapping("/{uuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONFIGLOCATIONADMIN')")
    public void delete(@PathVariable String uuid) {
        locationService.delete(uuid);
    }
}