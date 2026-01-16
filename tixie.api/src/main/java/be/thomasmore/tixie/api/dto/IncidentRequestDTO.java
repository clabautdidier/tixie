package be.thomasmore.tixie.api.dto;

import be.thomasmore.tixie.api.entity.IncidentPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record IncidentRequestDTO(
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,
        
        @Size(max = 5000, message = "Description must not exceed 5000 characters")
        String description,
        
        @NotNull(message = "Priority is required")
        IncidentPriority priority
) {
}
