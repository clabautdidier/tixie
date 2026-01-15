package be.thomasmore.tixie.api.dto;

public record ConfigurationItemValueRequest(
    String propertyDefinitionUuid,
    String value
) {}