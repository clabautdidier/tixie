package be.thomasmore.tixie.api.dto;

public record LocationValueDTO(
    String propertyUuid,
    String propertyName,
    String value
) {}