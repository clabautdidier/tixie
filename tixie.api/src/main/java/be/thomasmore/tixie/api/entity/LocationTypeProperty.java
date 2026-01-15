package be.thomasmore.tixie.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "location_type_properties")
@Data
public class LocationTypeProperty {
    @EmbeddedId
    private LocationTypePropertyId id = new LocationTypePropertyId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("locationTypeId")
    @JsonIgnore
    private LocationType locationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("propertyDefinitionId")
    private PropertyDefinition propertyDefinition;

    @Column(name = "required")
    private boolean required;
}