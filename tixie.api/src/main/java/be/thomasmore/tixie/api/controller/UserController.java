package be.thomasmore.tixie.api.controller;

import be.thomasmore.tixie.api.dto.UserRequestDTO;
import be.thomasmore.tixie.api.dto.UserResponseDTO;
import be.thomasmore.tixie.api.entity.User;
import be.thomasmore.tixie.api.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    @GetMapping("/{uuid}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO getUserByUuid(@PathVariable String uuid) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }

    @GetMapping("/me")
    public UserResponseDTO getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }

    @PutMapping("/me")
    public User updateProfile(@AuthenticationPrincipal UserDetails userDetails, @RequestBody User updatedUser) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setFullName(updatedUser.getFullName());
        user.setEmail(updatedUser.getEmail());
        
        return userRepository.save(user);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO createUser(@RequestBody UserRequestDTO dto) {
        User user = new User();
        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setFullName(dto.fullName());
        user.setRoles(dto.roles());
        user.setPassword(passwordEncoder.encode(dto.password()));

        if (dto.managerUuid() != null && !dto.managerUuid().isEmpty()) {
            User manager = userRepository.findByUuid(dto.managerUuid())
                    .orElseThrow(() -> new RuntimeException("Manager niet gevonden"));
            user.setManager(manager);
        }

        return convertToDto(userRepository.save(user));
    }

    @PatchMapping("/{uuid}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public User toggleUserStatus(@PathVariable String uuid) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("Gebruiker niet gevonden"));

        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    @PutMapping("/{uuid}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO updateUser(@PathVariable String uuid, @RequestBody UserRequestDTO dto) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("Gebruiker niet gevonden"));

        user.setFullName(dto.fullName());
        user.setEmail(dto.email());
        user.setRoles(dto.roles());

        // Manager koppelen via de UUID uit de DTO
        if (dto.managerUuid() != null && !dto.managerUuid().isEmpty()) {
            User manager = userRepository.findByUuid(dto.managerUuid())
                    .orElseThrow(() -> new RuntimeException("Manager niet gevonden"));
            user.setManager(manager);
        } else {
            user.setManager(null);
        }

        // Wachtwoord alleen updaten als het aanwezig is in de request
        if (dto.password() != null && !dto.password().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.password()));
        }

        return convertToDto(userRepository.save(user));
    }

    private UserResponseDTO convertToDto(User user) {
        return new UserResponseDTO(
                user.getUuid(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.isActive(),
                user.getRoles(),
                user.getManager() != null ? user.getManager().getUuid() : null,
                user.getManager() != null ? user.getManager().getFullName() : null
        );
    }
}