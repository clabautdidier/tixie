package be.thomasmore.tixie.api.dto;

import java.util.List;

/**
 * Representeert de koppeling tussen een LocationType en een PropertyDefinition.
 * Bevat zowel de definitie-info als de context-specifieke 'required' vlag.
 */
public record LocationTypePropertyDTO(
    String propertyUuid, // De UUID van de PropertyDefinition
    String name,         // De naam uit de PropertyDefinition (handig voor UI)
    String dataType,     // Het type uit de PropertyDefinition (handig voor UI)
    boolean required     // Is deze eigenschap verplicht voor DIT locatietype?
) {}

