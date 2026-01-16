package be.thomasmore.tixie.api.dto;

import java.util.List;

public record ConfigurationItemTypeRequestDTO(
    String name,
    String description,
    List<ConfigurationItemTypePropertyRequestDTO> properties
) {}