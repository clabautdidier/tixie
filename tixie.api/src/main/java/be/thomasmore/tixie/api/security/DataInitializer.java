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
            admin.setRoles(Set.of("ROLE_ADMIN"));
            userRepository.save(admin);
            System.out.println("!!! SECURITY ALERT: Default Admin created !!!");
            System.out.println("Username: admin | Password: " + tempPass);
        }
    }
}