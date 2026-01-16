package be.thomasmore.tixie.api.controller;

import be.thomasmore.tixie.api.dto.UserRequestDTO;
import be.thomasmore.tixie.api.dto.UserResponseDTO;
import be.thomasmore.tixie.api.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponseDTO> getAllUsers() {
        return userService.findAll();
    }

    @GetMapping("/{uuid}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO getUserByUuid(@PathVariable String uuid) {
        return userService.findByUuid(uuid);
    }

    @GetMapping("/me")
    public UserResponseDTO getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return userService.findByUsername(userDetails.getUsername());
    }

    @PutMapping("/me")
    public UserResponseDTO updateProfile(@AuthenticationPrincipal UserDetails userDetails, @RequestBody UserRequestDTO updatedUser) {
        // Only allow updating profile fields, not password or roles
        return userService.updateProfile(userDetails.getUsername(), updatedUser);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO createUser(@RequestBody UserRequestDTO dto) {
        return userService.createUser(dto);
    }

    @PatchMapping("/{uuid}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO toggleUserStatus(@PathVariable String uuid) {
        return userService.toggleStatus(uuid);
    }

    @PutMapping("/{uuid}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO updateUser(@PathVariable String uuid, @RequestBody UserRequestDTO dto) {
        return userService.update(uuid, dto);
    }

    @PostMapping("/{uuid}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public void resetPassword(@PathVariable String uuid, @RequestBody String newPassword) {
        userService.resetPassword(uuid, newPassword);
    }

    @PutMapping("/{uuid}/password")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO modifyPassword(@PathVariable String uuid, @RequestBody UserRequestDTO passwordRequest) {
        return userService.modifyPassword(uuid, passwordRequest);
    }
}