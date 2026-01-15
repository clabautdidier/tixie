package be.thomasmore.tixie.api.dto;

import java.util.List;

public record ConfigurationItemTypeRequest(
    String name,
    String description,
    List<ConfigurationItemTypePropertyRequest> properties
) {}