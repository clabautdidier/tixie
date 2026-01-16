package be.thomasmore.tixie.api.dto;

import java.util.List;

public record LocationNodeResponseDTO(
    String uuid,
    String name,
    String locationTypeName,
    List<LocationNodeResponseDTO> children
) {}