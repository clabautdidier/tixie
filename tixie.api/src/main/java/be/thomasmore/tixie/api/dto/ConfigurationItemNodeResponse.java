package be.thomasmore.tixie.api.dto;

import java.util.List;

/**
 * DTO voor de hiërarchische weergave van Configuration Items in een boomstructuur.
 */
public record ConfigurationItemNodeResponse(
        String uuid,
        String name,
        String configurationItemTypeName,
        List<ConfigurationItemNodeResponse> children
) {}