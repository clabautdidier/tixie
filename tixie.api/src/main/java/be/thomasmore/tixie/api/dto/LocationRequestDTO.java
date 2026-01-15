package be.thomasmore.tixie.api.dto;

import java.util.List;

public record LocationRequestDTO(
    String name,
    String parentUuid,
    String typeUuid, // UUID van de LocationType
    List<LocationValueDTO> values
) {}