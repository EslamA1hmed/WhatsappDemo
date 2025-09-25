package com.example.whatsappdemo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateExampleBody {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "template_example_body_values", joinColumns = @JoinColumn(name = "body_id"))
    @Column(name = "value")
    private List<String> values;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "example_id")
    private TemplateExample example;
}
