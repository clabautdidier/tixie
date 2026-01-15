package be.thomasmore.tixie.api.dto;

import java.util.List;

/**
 * De hoofd DTO voor LocationType.
 */
public record LocationTypeDTO(
    String uuid,
    String name,
    String description,
    List<LocationTypePropertyDTO> properties
) {}