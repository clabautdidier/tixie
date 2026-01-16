package be.thomasmore.tixie.api.service;

import be.thomasmore.tixie.api.dto.IncidentRequestDTO;
import be.thomasmore.tixie.api.dto.IncidentResponseDTO;
import be.thomasmore.tixie.api.entity.Incident;
import be.thomasmore.tixie.api.entity.User;
import be.thomasmore.tixie.api.repository.IncidentRepository;
import be.thomasmore.tixie.api.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    public IncidentService(IncidentRepository incidentRepository, UserRepository userRepository) {
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
    }

    public List<IncidentResponseDTO> findAllByCustomerUsername(String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));
        return incidentRepository.findByCustomerOrderByCreatedAtDesc(customer).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public IncidentResponseDTO findByUuid(String uuid, String currentUsername) {
        Incident incident = incidentRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Incident not found: " + uuid));
        
        // Ensure customer can only view their own incidents
        if (!incident.getCustomer().getUsername().equals(currentUsername)) {
            throw new SecurityException("Access denied to incident: " + uuid);
        }
        
        return mapToResponse(incident);
    }

    public IncidentResponseDTO createIncident(IncidentRequestDTO dto, String customerUsername) {
        User customer = userRepository.findByUsername(customerUsername)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + customerUsername));

        Incident incident = new Incident();
        incident.setTitle(dto.title());
        incident.setDescription(dto.description());
        incident.setPriority(dto.priority() != null ? dto.priority() : be.thomasmore.tixie.api.entity.IncidentPriority.MEDIUM);
        incident.setCustomer(customer);

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
