package be.thomasmore.tixie.api.repository;

import be.thomasmore.tixie.api.entity.ConfigurationItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfigurationItemTypeRepository extends JpaRepository<ConfigurationItemType, Long> {

    /**
     * Zoekt een ConfigurationItemType op basis van zijn unieke universele identificatie (UUID).
     * * @param uuid De unieke string identificatie van het type.
     * @return Een Optional die het ConfigurationItemType bevat indien gevonden.
     */
    Optional<ConfigurationItemType> findByUuid(String uuid);

    /**
     * Controleert of een ConfigurationItemType reeds bestaat met de opgegeven naam.
     * Handig voor validatie tijdens het aanmaken van nieuwe types.
     * * @param name De naam van het type (bijv. "LAPTOP").
     * @return Waar indien de naam reeds in gebruik is.
     */
    boolean existsByName(String name);
}