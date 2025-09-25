package com.example.whatsappdemo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "messages")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    private String messagingProduct = "whatsapp";

    @Column(name = "`to`")
    private String to;
    @Column(name = "recipient_type")
    private String recipientType;

    @Column(name = "`type`")
    private String type;// text, image, video, document, template, interactive

    @CreatedDate
    private LocalDateTime createdAt = LocalDateTime.now();

    // ---------------- Relations ---------------- //

    @Embedded
    private MessageContext context;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "text_id")
    private MessageText text;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "image_id")
    private MessageImage image;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "document_id")
    private MessageDocument document;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "video_id")
    private MessageVideo video;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "template_id")
    private MessageTemplate template;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "interactive_id")
    private MessageInteractive interactive;
}
