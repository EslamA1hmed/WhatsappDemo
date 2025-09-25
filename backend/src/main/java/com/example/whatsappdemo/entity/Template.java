package com.example.whatsappdemo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "templates")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Template {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, length = 50)
    private String category; // MARKETING / UTILITY / AUTHENTICATION
    
    @Embedded
    private TemplateLanguage language;

    @Column(nullable = false)
    private String status;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true , fetch = FetchType.EAGER)
    private List<Component> components;
}
