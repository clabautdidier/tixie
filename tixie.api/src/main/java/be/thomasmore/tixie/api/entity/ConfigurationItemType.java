package be.thomasmore.tixie.api.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "configuration_item_types")
@Data
public class ConfigurationItemType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String uuid = UUID.randomUUID().toString();

    @Column(unique = true, nullable = false)
    private String name;

    private String description;

    @OneToMany(mappedBy = "configurationItemType", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConfigurationItemTypeProperty> properties = new ArrayList<>();

}