package com.example.whatsappdemo.service;

import com.example.whatsappdemo.dto.WhatsAppMessageDTO;
import com.example.whatsappdemo.mapper.MessageMapper;
import com.example.whatsappdemo.repo.MessageRepo;
import com.example.whatsappdemo.repo.TemplateRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MessageService {
    @Value("${whatsapp.api.url}")
    private String apiUrl;

    @Value("${whatsapp.api.token}")
    private String apiToken;

    @Autowired
    private MessageMapper messageMapper;

    @Autowired
    private MessageRepo messageRepo;
    @Autowired
    private TemplateRepo templateRepo;

    private final RestTemplate restTemplate = new RestTemplate();

    public String sendMessage(WhatsAppMessageDTO dto) {
        String url = apiUrl + "/messages";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiToken);
        if (dto.getTemplate() != null) {
            if (!templateRepo.findByName(dto.getTemplate().getName()).getStatus().equals("APPROVED")) {
                return "Message didn't sent beacause template not APPROVED";
            }
        }
        HttpEntity<WhatsAppMessageDTO> request = new HttpEntity<>(dto, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                String.class);
        saveMessage(dto);
        return response.getBody();
    }

    private boolean saveMessage(WhatsAppMessageDTO dto) {
        messageRepo.save(messageMapper.toEntity(dto));
        return true;
    }
}
