package be.thomasmore.tixie.api.dto;

/**
 * Detailgegevens van een eigenschap die gekoppeld is aan een specifiek LocationType.
 */
public record LocationTypePropertyResponse(
    String propertyUuid,
    String name,
    String dataType,
    boolean required
) {}