package be.thomasmore.tixie.api.dto;

/**
 * Koppelt een bestaande PropertyDefinition aan een LocationType via de UUID.
 */
public record LocationTypePropertyRequestDTO(
    String propertyUuid,
    boolean required
) {}