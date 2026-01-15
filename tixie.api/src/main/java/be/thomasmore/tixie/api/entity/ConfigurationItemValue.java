package be.thomasmore.tixie.api.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "configuration_item_values")
@Data
public class ConfigurationItemValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "configuration_item_id", nullable = false)
    private ConfigurationItem configurationItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_definition_id", nullable = false)
    private PropertyDefinition propertyDefinition;

    @Column(columnDefinition = "TEXT")
    private String value;

}