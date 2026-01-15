package be.thomasmore.tixie.api.dto;

/**
 * Koppelt een bestaande PropertyDefinition aan een LocationType via de UUID.
 */
public record LocationTypePropertyRequest(
    String propertyUuid,
    boolean required
) {}