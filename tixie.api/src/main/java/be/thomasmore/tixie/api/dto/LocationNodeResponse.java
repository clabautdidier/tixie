package be.thomasmore.tixie.api.dto;

import java.util.List;

public record LocationNodeResponse(
    String uuid,
    String name,
    String locationTypeName,
    List<LocationNodeResponse> children
) {}