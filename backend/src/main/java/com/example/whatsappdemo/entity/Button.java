package com.example.whatsappdemo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "buttons")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Button {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // QUICK_REPLY, URL, PHONE_NUMBER, OTP

    private String text;

    // URL button
    private String url;

    // PHONE_NUMBER button
    @Column(name = "phone_number")
    private String phoneNumber;

    // OTP button
    @Column(name = "otp_type")
    private String otpType; // ONE_TAP, COPY_CODE

    @Column(name = "autofill_text")
    private String autofillText;

    @Column(name = "package_name")
    private String packageName;

    @Column(name = "signature_hash")
    private String signatureHash;

    // في بعض الحالات زي URL buttons بيكون فيه example (list of strings)
    @Column(columnDefinition = "TEXT")
    private String example;

    @ManyToOne
    @JoinColumn(name = "component_id")
    private Component component;
}
