package be.thomasmore.tixie.api.service;

import be.thomasmore.tixie.api.dto.IncidentRequestDTO;
import be.thomasmore.tixie.api.dto.IncidentResponseDTO;
import be.thomasmore.tixie.api.entity.ConfigurationItem;
import be.thomasmore.tixie.api.entity.Incident;
import be.thomasmore.tixie.api.entity.IncidentStatus;
import be.thomasmore.tixie.api.entity.Location;
import be.thomasmore.tixie.api.entity.User;
import be.thomasmore.tixie.api.repository.ConfigurationItemRepository;
import be.thomasmore.tixie.api.repository.IncidentRepository;
import be.thomasmore.tixie.api.repository.LocationRepository;
import be.thomasmore.tixie.api.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static be.thomasmore.tixie.api.entity.IncidentPriority.MEDIUM;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final ConfigurationItemRepository configurationItemRepository;

    public IncidentService(IncidentRepository incidentRepository, UserRepository userRepository,
                           LocationRepository locationRepository, ConfigurationItemRepository configurationItemRepository) {
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.configurationItemRepository = configurationItemRepository;
    }

    @Transactional(readOnly = true)
    public List<IncidentResponseDTO> findAllByCustomerUsername(String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));
        return incidentRepository.findByCustomerOrderByCreatedAtDesc(customer).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public IncidentResponseDTO findByUuid(String uuid, String currentUsername) {
        Incident incident = incidentRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Incident not found: " + uuid));
        
        // Ensure customer can only view their own incidents
        if (!incident.getCustomer().getUsername().equals(currentUsername)) {
            throw new SecurityException("Access denied to incident: " + uuid);
        }
        
        return mapToResponse(incident);
    }

    @Transactional
    public IncidentResponseDTO createIncident(IncidentRequestDTO dto, String customerUsername) {
        if ((dto.locationUuid() == null || dto.locationUuid().isBlank()) && (dto.configurationItemUuid() == null || dto.configurationItemUuid().isBlank())) {
            throw new IllegalArgumentException("Either location or configuration item must be provided");
        }

        User customer = userRepository.findByUsername(customerUsername)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + customerUsername));

        Incident incident = new Incident();
        incident.setTitle(dto.title());
        incident.setDescription(dto.description());
        incident.setPriority(dto.priority() != null ? dto.priority() : MEDIUM);
        incident.setCustomer(customer);

        if (dto.locationUuid() != null && !dto.locationUuid().isBlank()) {
            Location location = locationRepository.findByUuid(dto.locationUuid())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found: " + dto.locationUuid()));
            incident.setLocation(location);
        }

        if (dto.configurationItemUuid() != null && !dto.configurationItemUuid().isBlank()) {
            ConfigurationItem ci = configurationItemRepository.findByUuid(dto.configurationItemUuid())
                    .orElseThrow(() -> new EntityNotFoundException("Configuration Item not found: " + dto.configurationItemUuid()));
            incident.setConfigurationItem(ci);
        }

        Incident saved = incidentRepository.save(incident);
        return mapToResponse(saved);
    }

    @Transactional
    public IncidentResponseDTO updateIncident(String uuid, IncidentRequestDTO dto, String customerUsername) {
        Incident incident = incidentRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Incident not found: " + uuid));

        // Ensure customer can only update their own incidents
        if (!incident.getCustomer().getUsername().equals(customerUsername)) {
            throw new SecurityException("Access denied to incident: " + uuid);
        }

        // Ensure incident is in OPEN status
        if (incident.getStatus() != IncidentStatus.OPEN) {
            throw new IllegalStateException("Only incidents with status OPEN can be edited.");
        }

        if ((dto.locationUuid() == null || dto.locationUuid().isBlank()) && (dto.configurationItemUuid() == null || dto.configurationItemUuid().isBlank())) {
            throw new IllegalArgumentException("Either location or configuration item must be provided");
        }

        incident.setTitle(dto.title());
        incident.setDescription(dto.description());
        if (dto.priority() != null) {
            incident.setPriority(dto.priority());
        }

        if (dto.locationUuid() != null && !dto.locationUuid().isBlank()) {
            Location location = locationRepository.findByUuid(dto.locationUuid())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found: " + dto.locationUuid()));
            incident.setLocation(location);
        } else {
            incident.setLocation(null);
        }

        if (dto.configurationItemUuid() != null && !dto.configurationItemUuid().isBlank()) {
            ConfigurationItem ci = configurationItemRepository.findByUuid(dto.configurationItemUuid())
                    .orElseThrow(() -> new EntityNotFoundException("Configuration Item not found: " + dto.configurationItemUuid()));
            incident.setConfigurationItem(ci);
        } else {
            incident.setConfigurationItem(null);
        }

        Incident saved = incidentRepository.save(incident);
        return mapToResponse(saved);
    }

    private IncidentResponseDTO mapToResponse(Incident incident) {
        return new IncidentResponseDTO(
                incident.getUuid(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getStatus(),
                incident.getPriority(),
                incident.getLocation() != null ? incident.getLocation().getUuid() : null,
                incident.getLocation() != null ? incident.getLocation().getName() : null,
                buildLocationPath(incident.getLocation()),
                incident.getConfigurationItem() != null ? incident.getConfigurationItem().getUuid() : null,
                incident.getConfigurationItem() != null ? incident.getConfigurationItem().getName() : null,
                buildConfigurationItemPath(incident.getConfigurationItem()),
                incident.getCustomer().getUsername(),
                incident.getCustomer().getFullName(),
                incident.getAssignedTo() != null ? incident.getAssignedTo().getUsername() : null,
                incident.getAssignedTo() != null ? incident.getAssignedTo().getFullName() : null,
                incident.getCreatedAt(),
                incident.getUpdatedAt()
        );
    }

    private String buildLocationPath(Location location) {
        if (location == null) return null;
        List<String> path = new ArrayList<>();
        Location current = location;
        while (current != null) {
            path.add(current.getName());
            current = current.getParent();
        }
        Collections.reverse(path);
        return String.join(" > ", path);
    }

    private String buildConfigurationItemPath(ConfigurationItem ci) {
        if (ci == null) return null;
        List<String> path = new ArrayList<>();
        ConfigurationItem current = ci;
        while (current != null) {
            path.add(current.getName());
            current = current.getParentConfigurationItem();
        }
        Collections.reverse(path);
        return String.join(" > ", path);
    }
}
