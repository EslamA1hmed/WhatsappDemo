package com.example.whatsappdemo.controller;

import com.example.whatsappdemo.dto.WhatsAppTemplateCreateDTO;
import com.example.whatsappdemo.dto.WhatsAppTemplateCreateResponseDTO;
import com.example.whatsappdemo.dto.WhatsAppTemplatesResponseDTO;
import com.example.whatsappdemo.service.TemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/template")
public class TemplateController {

    @Autowired
    private TemplateService templateService;

    @PostMapping("/create")
    public ResponseEntity<WhatsAppTemplateCreateResponseDTO> sendMessage(
            @RequestBody WhatsAppTemplateCreateDTO whatsAppMessageDTO) {
        return ResponseEntity.ok().body(templateService.createTemplate(whatsAppMessageDTO));
    }

    @GetMapping("/get-all")
    public WhatsAppTemplatesResponseDTO getAllTemplates() {
        return templateService.getAllTemplates();
    }

    @GetMapping("/{name}")
    public ResponseEntity<WhatsAppTemplatesResponseDTO.TemplateDTO> getTemplateByName(
            @PathVariable String name) {
        WhatsAppTemplatesResponseDTO.TemplateDTO template = templateService.getTemplateByNameV2(name);
        if (template != null) {
            return ResponseEntity.ok(template);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/names")
    public Page<String> getTemplateNames(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return templateService.getTemplateNames(pageable);
    }
}
