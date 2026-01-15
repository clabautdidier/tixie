package be.thomasmore.tixie.api.repository;

import be.thomasmore.tixie.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // Om geen ID te gebruiken op de frontend
    Optional<User> findByUuid(String uuid);

    /**
     * Essentieel voor de login flow: zoek de gebruiker op basis van de unieke username.
     */
    Optional<User> findByUsername(String username);

    /**
     * Handig voor de ROLE_SUPERVISOR: vind alle gebruikers die aan een specifieke manager rapporteren.
     */
    List<User> findByManagerId(Integer managerId);

    /**
     * Controleer of een username al bestaat (voor validatie bij het aanmaken van nieuwe gebruikers).
     */
    boolean existsByUsername(String username);

    /**
     * Zoek actieve of inactieve gebruikers (ITIL: opvragen van actieve medewerkers).
     */
    List<User> findByActiveTrue();
}