package com.example.whatsappdemo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateExample {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // body_text: [["Mark","Tuscan Getaway package","800"]]
    @OneToMany(mappedBy = "example", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<TemplateExampleBody> bodyTexts = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "template_example_header", joinColumns = @JoinColumn(name = "example_id"))
    @Column(name = "header_handle")
    private List<String> headerHandles = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "template_example_header_text", joinColumns = @JoinColumn(name = "example_id"))
    @Column(name = "header_text")
    private List<String> headerTexts = new ArrayList<>();

}
