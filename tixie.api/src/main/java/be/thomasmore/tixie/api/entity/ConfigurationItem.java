package be.thomasmore.tixie.api.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "configuration_items")
@Data
public class ConfigurationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String uuid = UUID.randomUUID().toString();

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "configuration_item_type_id", nullable = false)
    private ConfigurationItemType configurationItemType;

    @Column(nullable = false)
    private String status = "ACTIVE";

    // Optionele koppeling naar een locatie (bijv. in welk lokaal staat deze server?)
    @Column(name = "location_id")
    private Long locationId;

    @OneToMany(mappedBy = "configurationItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConfigurationItemValue> values = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_configuration_item_id")
    private ConfigurationItem parentConfigurationItem;

    @OneToMany(mappedBy = "parentConfigurationItem", cascade = CascadeType.ALL)
    private List<ConfigurationItem> childConfigurationItems = new ArrayList<>();
}