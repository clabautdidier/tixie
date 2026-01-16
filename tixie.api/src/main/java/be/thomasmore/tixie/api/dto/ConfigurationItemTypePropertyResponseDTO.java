package be.thomasmore.tixie.api.dto;

public record ConfigurationItemTypePropertyResponseDTO(
    String propertyUuid,
    String name,
    String dataType,
    boolean required
) {}