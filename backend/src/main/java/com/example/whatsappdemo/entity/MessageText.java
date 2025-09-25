package com.example.whatsappdemo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "message_texts")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageText {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean previewUrl;
    @Column(columnDefinition = "TEXT")
    private String body;
}
