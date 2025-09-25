package com.example.whatsappdemo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.whatsappdemo.dto.LoginRequestDTO;
import com.example.whatsappdemo.dto.LoginResponseDTO;
import com.example.whatsappdemo.dto.UserRegisterRequestDTO;
import com.example.whatsappdemo.dto.UserResponseDTO;
import com.example.whatsappdemo.service.UserService;

@RestController
@RequestMapping("api/auth")
public class AuthController {
@Autowired
    private UserService userService;


    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@RequestBody UserRegisterRequestDTO request) {
        UserResponseDTO newUser = userService.register(request);
        return ResponseEntity.ok(newUser);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        System.out.println("Success");
        LoginResponseDTO response = userService.login(request);
        return ResponseEntity.ok(response);
    }

}
