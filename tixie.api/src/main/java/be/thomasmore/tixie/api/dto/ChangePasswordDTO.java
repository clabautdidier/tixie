package be.thomasmore.tixie.api.dto;

public record ChangePasswordDTO(String currentPassword, String newPassword) {
}