package com.example.whatsappdemo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.whatsappdemo.dto.WhatsAppMessageDTO;
import com.example.whatsappdemo.service.MessageService;

@RestController
@RequestMapping("message")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<String>  sendMessage(@RequestBody WhatsAppMessageDTO whatsAppMessageDTO){
        System.out.println("YES");
        return ResponseEntity.ok().body(messageService.sendMessage(whatsAppMessageDTO));
    }
}
