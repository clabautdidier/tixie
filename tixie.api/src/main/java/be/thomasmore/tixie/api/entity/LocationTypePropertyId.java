package be.thomasmore.tixie.api.entity;

import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;

@Embeddable
@Data
public class LocationTypePropertyId implements Serializable {
    private Long locationTypeId;
    private Long propertyDefinitionId;
}