package com.example.whatsappdemo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@Table(name = "components")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Component {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // BODY, HEADER, FOOTER, BUTTONS

    @Column(columnDefinition = "TEXT")
    private String text;

    private String format;

    // خاص بالـ Authentication Templates
    @Column(name = "add_security_recommendation")
    private Boolean addSecurityRecommendation;

    @Column(name = "code_expiration_minutes")
    private Integer codeExpirationMinutes;

    // العلاقة مع Template الرئيسي
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private Template template;

    // العلاقة مع Buttons
    @OneToMany(mappedBy = "component", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Button> buttons;

    // العلاقة مع Example
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true,fetch = FetchType.EAGER)
    @JoinColumn(name = "example_id")
    private TemplateExample example;
}
