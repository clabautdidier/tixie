package be.thomasmore.tixie.api.dto;

import java.util.List;

// Wat we ontvangen van de frontend
public record LoginRequestDTO(String username, String password) {}