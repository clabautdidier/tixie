package be.thomasmore.tixie.api.service;

import be.thomasmore.tixie.api.dto.IncidentRequestDTO;
import be.thomasmore.tixie.api.dto.IncidentResponseDTO;
import be.thomasmore.tixie.api.entity.Incident;
import be.thomasmore.tixie.api.entity.IncidentStatus;
import be.thomasmore.tixie.api.entity.User;
import be.thomasmore.tixie.api.repository.IncidentRepository;
import be.thomasmore.tixie.api.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static be.thomasmore.tixie.api.entity.IncidentPriority.MEDIUM;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    public IncidentService(IncidentRepository incidentRepository, UserRepository userRepository) {
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
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
        User customer = userRepository.findByUsername(customerUsername)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + customerUsername));

        Incident incident = new Incident();
        incident.setTitle(dto.title());
        incident.setDescription(dto.description());
        incident.setPriority(dto.priority() != null ? dto.priority() : MEDIUM);
        incident.setCustomer(customer);

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

        incident.setTitle(dto.title());
        incident.setDescription(dto.description());
        if (dto.priority() != null) {
            incident.setPriority(dto.priority());
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
                incident.getCustomer().getUsername(),
                incident.getCustomer().getFullName(),
                incident.getAssignedTo() != null ? incident.getAssignedTo().getUsername() : null,
                incident.getAssignedTo() != null ? incident.getAssignedTo().getFullName() : null,
                incident.getCreatedAt(),
                incident.getUpdatedAt()
        );
    }
}
