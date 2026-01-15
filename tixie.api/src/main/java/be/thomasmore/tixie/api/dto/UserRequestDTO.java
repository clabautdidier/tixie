package be.thomasmore.tixie.api.dto;

import java.util.Set;

public record UserRequestDTO(
    String username,
    String password,
    String email,
    String fullName,
    Set<String> roles,
    String managerUuid
) {}