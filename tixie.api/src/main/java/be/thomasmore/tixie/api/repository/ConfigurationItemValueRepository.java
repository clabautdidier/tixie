package be.thomasmore.tixie.api.repository;

import be.thomasmore.tixie.api.entity.ConfigurationItemValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfigurationItemValueRepository extends JpaRepository<ConfigurationItemValue, Long> {
    
    void deleteAllByConfigurationItemUuid(String configurationItemUuid);
}