package com.example.whatsappdemo.dto;

import java.time.LocalDateTime;

import com.example.whatsappdemo.enums.Gender;
import com.example.whatsappdemo.enums.UserRole;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponseDTO {
 private Long id;
    private String email;
    private String phone;
    private Gender gender;
    private UserRole roles;
    private LocalDateTime createdAt;
}
