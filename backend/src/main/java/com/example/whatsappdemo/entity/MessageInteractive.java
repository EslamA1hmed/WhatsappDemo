package com.example.whatsappdemo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@Table(name = "message_interactives")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageInteractive {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // button, list

    @Column(columnDefinition = "TEXT")
    private String bodyText;

    @OneToMany(mappedBy = "interactive", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InteractiveButton> buttons;

    @OneToMany(mappedBy = "interactive", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InteractiveSection> sections;
}
