package be.thomasmore.tixie.api.dto;

import java.util.List;

/**
 * DTO voor het ontvangen van gegevens om een LocationType aan te maken of bij te werken.
 */
public record LocationTypeRequestDTO(
    String name,
    String description,
    List<LocationTypePropertyRequestDTO> properties
) {}