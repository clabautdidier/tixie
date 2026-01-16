package be.thomasmore.tixie.api.dto;

public record ConfigurationItemValueResponseDTO(
    String propertyDefinitionUuid,
    String propertyName,
    String dataType,
    String value
) {}