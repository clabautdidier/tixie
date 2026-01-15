package be.thomasmore.tixie.api.dto;

import java.util.Set;

public record UserResponseDTO(
    String uuid,
    String username,
    String email,
    String fullName,
    boolean active,
    Set<String> roles,
    String managerUuid,
    String managerName
) {}