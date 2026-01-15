package be.thomasmore.tixie.api.repository;

import be.thomasmore.tixie.api.entity.PropertyDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PropertyDefinitionRepository extends JpaRepository<PropertyDefinition, Integer> {
    Optional<PropertyDefinition> findByUuid(String uuid);
    Optional<PropertyDefinition> findByName(String name);
}