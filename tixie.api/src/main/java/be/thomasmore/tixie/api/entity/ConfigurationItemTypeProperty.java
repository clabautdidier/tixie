package be.thomasmore.tixie.api.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "configuration_item_type_properties")
@Data
public class ConfigurationItemTypeProperty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "configuration_item_type_id")
    private ConfigurationItemType configurationItemType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_definition_id")
    private PropertyDefinition propertyDefinition;

    private boolean required;

}