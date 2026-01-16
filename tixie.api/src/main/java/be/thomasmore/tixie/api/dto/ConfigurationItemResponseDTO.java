package be.thomasmore.tixie.api.dto;

import java.util.List;

public record ConfigurationItemResponseDTO(
    String uuid,
    String name,
    String configurationItemTypeUuid,
    String configurationItemTypeName,
    String status,
    String parentConfigurationItemUuid,
    String parentConfigurationItemName,
    String locationUuid,
    List<ConfigurationItemValueResponseDTO> values
) {}