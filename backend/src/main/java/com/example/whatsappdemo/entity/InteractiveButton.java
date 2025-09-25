package com.example.whatsappdemo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "interactive_buttons")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InteractiveButton {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // reply أو url
    private String replyId;
    private String replyTitle;

    @ManyToOne
    @JoinColumn(name = "interactive_id")
    private MessageInteractive interactive;
}
