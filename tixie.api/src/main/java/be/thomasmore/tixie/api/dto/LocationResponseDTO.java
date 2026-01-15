package be.thomasmore.tixie.api.dto;

import java.util.List;

public record LocationResponseDTO(
    String uuid,
    String name,
    String typeName,
    String typeUuid,
    String parentUuid,
    String parentName,
    List<LocationValueDTO> values
) {}