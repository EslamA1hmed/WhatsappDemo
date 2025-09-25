package com.example.whatsappdemo.service;

import com.example.whatsappdemo.dto.WhatsAppTemplateCreateDTO;
import com.example.whatsappdemo.dto.WhatsAppTemplateCreateResponseDTO;
import com.example.whatsappdemo.dto.WhatsAppTemplatesResponseDTO;
import com.example.whatsappdemo.entity.Template;
import com.example.whatsappdemo.mapper.TemplateMapper;
import com.example.whatsappdemo.repo.TemplateRepo;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class TemplateService {
    @Value("${whatsapp.api.url_tem}")
    private String apiUrl;

    @Value("${whatsapp.api.token}")
    private String apiToken;
    private String wabaId = "5";

    @Autowired
    private TemplateRepo templateRepo;

    private final RestTemplate restTemplate = new RestTemplate();

    public WhatsAppTemplateCreateResponseDTO createTemplate(WhatsAppTemplateCreateDTO whatsAppTemplateCreateDTO) {
        String url = apiUrl + "/message_templates";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiToken);

        HttpEntity<WhatsAppTemplateCreateDTO> request = new HttpEntity<>(whatsAppTemplateCreateDTO, headers);

        ResponseEntity<WhatsAppTemplateCreateResponseDTO> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                WhatsAppTemplateCreateResponseDTO.class);
        whatsAppTemplateCreateDTO.setStatus(response.getBody().getStatus());
        templateRepo.save(TemplateMapper.toEntity(whatsAppTemplateCreateDTO));

        return response.getBody();
    }

    public WhatsAppTemplatesResponseDTO getAllTemplates() {
        String url = apiUrl + "/message_templates";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<WhatsAppTemplatesResponseDTO> response = restTemplate.exchange(
                url,
                HttpMethod.GET, // ✅ لازم GET مش POST
                request,
                WhatsAppTemplatesResponseDTO.class);

        return response.getBody(); // ده بيرجع Object فيه data + paging
    }
public WhatsAppTemplatesResponseDTO.TemplateDTO getTemplateByName(String templateName) {
    String url = apiUrl + "/" + wabaId + "/message_templates?name=" + URLEncoder.encode(templateName, StandardCharsets.UTF_8);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(apiToken);

    HttpEntity<Void> request = new HttpEntity<>(headers);

    ResponseEntity<WhatsAppTemplatesResponseDTO> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            request,
            WhatsAppTemplatesResponseDTO.class);

    WhatsAppTemplatesResponseDTO body = response.getBody();
    if (body != null && body.getData() != null && !body.getData().isEmpty()) {
        return body.getData().get(0);
    }
    return null;
}
public WhatsAppTemplatesResponseDTO.TemplateDTO getTemplateByNameV2(String templateName) {
    List<Template> l = new ArrayList<>();
    l.add(templateRepo.findByName(templateName));
    return TemplateMapper.toResponse(l).getData().get(0);
}
 public Page<String> getTemplateNames(Pageable pageable) {
        return templateRepo.findAllTemplateNames(pageable);
    }
}
