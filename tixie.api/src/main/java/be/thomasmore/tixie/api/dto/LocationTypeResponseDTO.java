package be.thomasmore.tixie.api.dto;

import java.util.List;

/**
 * DTO voor het versturen van LocationType gegevens naar de frontend.
 */
public record LocationTypeResponseDTO(
    String uuid,
    String name,
    String description,
    List<LocationTypePropertyResponseDTO> properties
) {}