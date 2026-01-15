package be.thomasmore.tixie.api.dto;

import java.util.List;

public record ConfigurationItemTypeResponse(
    String uuid,
    String name,
    String description,
    List<ConfigurationItemTypePropertyResponse> properties
) {}