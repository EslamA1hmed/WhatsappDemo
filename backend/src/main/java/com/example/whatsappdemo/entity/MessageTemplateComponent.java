package com.example.whatsappdemo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@Table(name = "message_template_components")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageTemplateComponent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // BODY, HEADER, FOOTER, BUTTONS

    @ManyToOne
    @JoinColumn(name = "template_id")
    private MessageTemplate template;

    @OneToMany(mappedBy = "component", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MessageTemplateParameter> parameters;
}
