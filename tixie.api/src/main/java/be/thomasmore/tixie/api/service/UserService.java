package be.thomasmore.tixie.api.service;

import be.thomasmore.tixie.api.dto.UserRequestDTO;
import be.thomasmore.tixie.api.dto.UserResponseDTO;
import be.thomasmore.tixie.api.entity.User;
import be.thomasmore.tixie.api.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> findAll() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponseDTO findByUuid(String uuid) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }

    public UserResponseDTO findByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }

    public UserResponseDTO update(String uuid, UserRequestDTO request) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setRoles(request.roles());
        
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        
        if (request.managerUuid() != null) {
            userRepository.findByUuid(request.managerUuid())
                    .ifPresent(user::setManager);
        } else {
            user.setManager(null);
        }

        userRepository.save(user);
        return convertToDto(user);
    }

    public UserResponseDTO createUser(UserRequestDTO dto) {
        User user = new User();
        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setFullName(dto.fullName());
        user.setRoles(dto.roles());
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setActive(true);

        if (dto.managerUuid() != null && !dto.managerUuid().isEmpty()) {
            userRepository.findByUuid(dto.managerUuid())
                    .ifPresent(user::setManager);
        }

        userRepository.save(user);
        return convertToDto(user);
    }

    public UserResponseDTO toggleStatus(String uuid) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setActive(!user.isActive());
        userRepository.save(user);
        return convertToDto(user);
    }

    public UserResponseDTO updateProfile(String username, UserRequestDTO updatedUser) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setFullName(updatedUser.fullName());
        user.setEmail(updatedUser.email());
        
        userRepository.save(user);
        return convertToDto(user);
    }

    public void resetPassword(String uuid, String newPassword) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public UserResponseDTO modifyPassword(String uuid, UserRequestDTO passwordRequest) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only allow updating password field
        user.setPassword(passwordEncoder.encode(passwordRequest.password()));
        userRepository.save(user);
        return convertToDto(user);
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