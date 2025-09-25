package com.example.whatsappdemo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.whatsappdemo.dto.LoginRequestDTO;
import com.example.whatsappdemo.dto.LoginResponseDTO;
import com.example.whatsappdemo.dto.UserRegisterRequestDTO;
import com.example.whatsappdemo.dto.UserResponseDTO;
import com.example.whatsappdemo.entity.User;
import com.example.whatsappdemo.enums.UserRole;
import com.example.whatsappdemo.repo.UserRepository;
import com.example.whatsappdemo.scuirty.util.JwtUtil;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtService;

    public LoginResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new LoginResponseDTO(token);
    }

    public UserResponseDTO register(UserRegisterRequestDTO request) {
        System.out.println(request.getPhoneNumber());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.existsByPhone(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .phone(request.getPhoneNumber())
                .gender(request.getGender())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .build();
     user = userRepository.save(user);

        return UserResponseDTO.builder().createdAt(user.getCreatedAt()).
        email(user.getEmail()).gender(user.getGender()).
        id(user.getId()).phone(user.getPhone()).roles(user.getRole()).build();
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}
