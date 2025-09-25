package com.example.whatsappdemo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "message_template_parameters")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageTemplateParameter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // text, image, document, video, currency, date_time

    @Column(columnDefinition = "TEXT")
    private String text; // في حالة text/currency/date_time

    // في حالة image
    private String imageLink;
    private String imageCaption;

    // في حالة video
    private String videoLink;
    private String videoCaption;

    // في حالة document
    private String documentLink;
    private String documentFilename;

    @ManyToOne
    @JoinColumn(name = "component_id")
    private MessageTemplateComponent component;
}
