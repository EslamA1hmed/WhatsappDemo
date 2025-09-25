package com.example.whatsappdemo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.whatsappdemo.dto.WhatsAppTemplatesResponseDTO;
import com.example.whatsappdemo.entity.Template;
import com.example.whatsappdemo.repo.TemplateRepo;

@Service
public class TemplateStatusScheduler {

    @Value("${whatsapp.api.url_tem}")
    private String apiUrl;

    @Value("${whatsapp.api.token}")
    private String apiToken;

    private final RestTemplate restTemplate = new RestTemplate();
    
    @Autowired
    private TemplateRepo templateRepo;

    // كل ساعة بالضبط
    @Scheduled(fixedRate = 36000L)
    public void updateTemplateStatuses() {
        System.out.println("🔄 Running template status updater...");

        // هتجيب كل التيمبلتات من DB
        List<Template> templates = templateRepo.findAll();

        for (Template template : templates) {
            try {
                String url = apiUrl + "/message_templates?name=" + template.getName();

                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(apiToken);

                HttpEntity<Void> request = new HttpEntity<>(headers);

                ResponseEntity<WhatsAppTemplatesResponseDTO> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET, // ✅ لازم GET
                        request,
                        WhatsAppTemplatesResponseDTO.class);

                if (response.getStatusCode().is2xxSuccessful()
                        && response.getBody() != null
                        && response.getBody().getData() != null
                        && !response.getBody().getData().isEmpty()) {

                    // خد أول Template لأنه unique by name
                    String newStatus = response.getBody().getData().get(0).getStatus();

                    if (!newStatus.equalsIgnoreCase(template.getStatus())) {
                        System.out.printf("🔁 Updating template '%s' status: %s -> %s%n",
                                template.getName(), template.getStatus(), newStatus);

                        template.setStatus(newStatus);
                        templateRepo.save(template);
                    }
                }

            } catch (Exception e) {
                System.err.println("⚠ Error while updating template " + template.getName() + ": " + e.getMessage());
            }
        }
    }
}

