package be.thomasmore.tixie.api.dto;

public record ConfigurationItemTypePropertyResponse(
    String propertyUuid,
    String name,
    String dataType,
    boolean required
) {}