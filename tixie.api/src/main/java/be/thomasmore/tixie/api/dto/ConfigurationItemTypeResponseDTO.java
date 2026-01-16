package be.thomasmore.tixie.api.dto;

import java.util.List;

public record ConfigurationItemTypeResponseDTO(
    String uuid,
    String name,
    String description,
    List<ConfigurationItemTypePropertyResponseDTO> properties
) {}