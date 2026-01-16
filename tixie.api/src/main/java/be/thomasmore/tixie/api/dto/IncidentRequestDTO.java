package be.thomasmore.tixie.api.dto;

import be.thomasmore.tixie.api.entity.IncidentPriority;

public record IncidentRequestDTO(
        String title,
        String description,
        IncidentPriority priority
) {
}
