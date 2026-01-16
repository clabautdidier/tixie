package be.thomasmore.tixie.api.service;

import be.thomasmore.tixie.api.entity.User;
import be.thomasmore.tixie.api.repository.UserRepository;
import be.thomasmore.tixie.api.security.CustomUserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Zoek de gebruiker in de database
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Gebruiker niet gevonden: " + username));

        // 2. Controleer of de gebruiker actief is (ITIL requirement)
        if (!user.isActive()) {
            throw new UsernameNotFoundException("Account is gedeactiveerd.");
        }

        // 3. Vertaal de rollen (Strings) naar GrantedAuthority objecten
        var authorities = user.getRoles().stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        // 4. Retourneer een CustomUserDetails object met de volledige naam
        return new CustomUserDetails(
                user.getUsername(),
                user.getPassword(),
                authorities,
                user.getFullName()
        );
    }
}