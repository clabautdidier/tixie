package be.thomasmore.tixie.api.dto;

import java.util.List;

public record ConfigurationItemRequestDTO(
    String name,
    String configurationItemTypeUuid,
    String status,
    String locationUuid,
    String parentConfigurationItemUuid,
    List<ConfigurationItemValueRequestDTO> values
) {}