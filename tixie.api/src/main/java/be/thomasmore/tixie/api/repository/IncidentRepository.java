package be.thomasmore.tixie.api.repository;

import be.thomasmore.tixie.api.entity.Incident;
import be.thomasmore.tixie.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    Optional<Incident> findByUuid(String uuid);
    List<Incident> findByCustomer(User customer);
    List<Incident> findByCustomerOrderByCreatedAtDesc(User customer);
}
