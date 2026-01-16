package be.thomasmore.tixie.api.security;

import be.thomasmore.tixie.api.entity.User;
import be.thomasmore.tixie.api.repository.UserRepository;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String @NonNull ... args) {
        if (userRepository.count() == 0) {
            String tempPass = "didier";
//            String tempPass = UUID.randomUUID().toString().substring(0, 8);
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode(tempPass));
            admin.setFullName("Administrator");
            admin.setEmail("admin@tixie.be");
            admin.setRoles(Set.of("ROLE_ADMIN"));
            userRepository.save(admin);
            System.out.println("!!! SECURITY ALERT: Default Admin created !!!");
            System.out.println("Username: admin | Password: " + tempPass);

            // Create a test customer user
            User customer = new User();
            customer.setUsername("customer");
            customer.setPassword(passwordEncoder.encode(tempPass));
            customer.setFullName("Test Customer");
            customer.setEmail("customer@example.com");
            customer.setRoles(Set.of("ROLE_USER"));
            userRepository.save(customer);
            System.out.println("!!! Test Customer created !!!");
            System.out.println("Username: customer | Password: " + tempPass);
        }
    }
}