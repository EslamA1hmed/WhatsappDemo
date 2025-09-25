package com.example.whatsappdemo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "interactive_rows")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InteractiveRow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String rowId;
    private String title;
    private String description;

    @ManyToOne
    @JoinColumn(name = "section_id")
    private InteractiveSection section;
}
