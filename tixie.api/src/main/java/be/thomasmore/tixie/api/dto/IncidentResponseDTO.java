package be.thomasmore.tixie.api.dto;

import be.thomasmore.tixie.api.entity.IncidentPriority;
import be.thomasmore.tixie.api.entity.IncidentStatus;

import java.time.LocalDateTime;

public record IncidentResponseDTO(
        String uuid,
        String title,
        String description,
        IncidentStatus status,
        IncidentPriority priority,
        String locationUuid,
        String locationName,
        String locationPath,
        String configurationItemUuid,
        String configurationItemName,
        String configurationItemPath,
        String customerUsername,
        String customerFullName,
        String assignedToUsername,
        String assignedToFullName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
