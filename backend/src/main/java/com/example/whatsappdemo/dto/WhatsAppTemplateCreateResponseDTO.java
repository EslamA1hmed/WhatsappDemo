package com.example.whatsappdemo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WhatsAppTemplateCreateResponseDTO {

    private String id;        // ID الخاص بالـ Template
    private String status;    // PENDING / APPROVED / REJECTED
    private String category;  // MARKETING / UTILITY / AUTHENTICATION
}
