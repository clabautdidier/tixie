package be.thomasmore.tixie.api.repository;

import be.thomasmore.tixie.api.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    
    /**
     * Vind een locatie op basis van haar unieke publieke UUID.
     * Gebruikt voor GET, PUT en DELETE operaties vanuit de frontend.
     */
    Optional<Location> findByUuid(String uuid);
    
    /**
     * Optioneel: Handig om te controleren of een naam al bestaat 
     * binnen een bepaalde context (bijv. unieke ruimtenamen per gebouw).
     */
    boolean existsByName(String name);

    List<Location> findAllByParentIdIsNull();
}