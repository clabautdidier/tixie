package be.thomasmore.tixie.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "location_values")
@Data
public class LocationValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    @JsonIgnore
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_definition_id")
    private PropertyDefinition propertyDefinition;

    private String value;
}