package be.thomasmore.tixie.api.controller;

import be.thomasmore.tixie.api.dto.IncidentRequestDTO;
import be.thomasmore.tixie.api.dto.IncidentResponseDTO;
import be.thomasmore.tixie.api.service.IncidentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<IncidentResponseDTO>> getMyIncidents(@AuthenticationPrincipal UserDetails userDetails) {
        List<IncidentResponseDTO> incidents = incidentService.findAllByCustomerUsername(userDetails.getUsername());
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/{uuid}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<IncidentResponseDTO> getIncidentByUuid(
            @PathVariable String uuid,
            @AuthenticationPrincipal UserDetails userDetails) {
        IncidentResponseDTO incident = incidentService.findByUuid(uuid, userDetails.getUsername());
        return ResponseEntity.ok(incident);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<IncidentResponseDTO> createIncident(
            @RequestBody IncidentRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        IncidentResponseDTO created = incidentService.createIncident(dto, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
