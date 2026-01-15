package be.thomasmore.tixie.api.repository;

import be.thomasmore.tixie.api.entity.LocationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationTypeRepository extends JpaRepository<LocationType, Integer> {

    /**
     * Haalt alle LocationTypes op inclusief hun gekoppelde properties 
     * in één enkele database query.
     */
    @Query("SELECT lt FROM LocationType lt LEFT JOIN FETCH lt.properties p LEFT JOIN FETCH p.propertyDefinition WHERE lt.uuid = :uuid")
    Optional<LocationType> findByUuid(@Param("uuid") String uuid);

    /**
     * Haalt de volledige lijst op met alle relaties direct ingeladen.
     * Dit is optimaal voor het hoofdscherm van Location Types.
     */
    @Query("SELECT DISTINCT lt FROM LocationType lt LEFT JOIN FETCH lt.properties p LEFT JOIN FETCH p.propertyDefinition")
    List<LocationType> findAllWithProperties();

    /**
     * Controleert of een naam al in gebruik is.
     */
    boolean existsByName(String name);
}