package be.thomasmore.tixie.api.dto;

public record ConfigurationItemTypePropertyRequest(
    String propertyUuid,
    boolean required
) {}