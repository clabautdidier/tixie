package be.thomasmore.tixie.api.dto;

public record ConfigurationItemValueRequestDTO(
    String propertyDefinitionUuid,
    String value
) {}