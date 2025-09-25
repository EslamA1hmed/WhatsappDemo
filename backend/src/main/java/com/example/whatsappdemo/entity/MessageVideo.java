package com.example.whatsappdemo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "message_videos")
public class MessageVideo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String link;
    private String caption;
}
