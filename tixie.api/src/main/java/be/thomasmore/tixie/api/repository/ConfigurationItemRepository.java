package be.thomasmore.tixie.api.repository;

import be.thomasmore.tixie.api.entity.ConfigurationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConfigurationItemRepository extends JpaRepository<ConfigurationItem, Long> {
    
    Optional<ConfigurationItem> findByUuid(String uuid);
    
    List<ConfigurationItem> findAllByConfigurationItemTypeUuid(String configurationItemTypeUuid);

    List<ConfigurationItem> findAllByParentConfigurationItemIdIsNull();
}