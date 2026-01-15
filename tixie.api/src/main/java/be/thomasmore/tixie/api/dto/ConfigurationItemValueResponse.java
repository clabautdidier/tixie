package be.thomasmore.tixie.api.dto;

public record ConfigurationItemValueResponse(
    String propertyDefinitionUuid,
    String propertyName,
    String dataType,
    String value
) {}