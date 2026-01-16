package be.thomasmore.tixie.api.dto;

public record ConfigurationItemTypePropertyRequestDTO(
    String propertyUuid,
    boolean required
) {}