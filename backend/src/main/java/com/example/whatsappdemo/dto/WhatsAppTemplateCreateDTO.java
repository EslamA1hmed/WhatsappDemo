package com.example.whatsappdemo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class WhatsAppTemplateCreateDTO {

    private String name;
    private String category;   // MARKETING / UTILITY / AUTHENTICATION
    private String language;   // en_US, ar, ...
    private String status;     // APPROVED / PENDING / REJECTED

    private List<ComponentDTO> components;

    // ---------------- Sub-Classes ---------------- //

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComponentDTO {
        private String type;   // BODY, HEADER, FOOTER, BUTTONS
        private String text;
        private String format; // IMAGE, TEXT, VIDEO...

        // خاص بالـ Authentication Templates
        @JsonProperty("add_security_recommendation")
        private Boolean addSecurityRecommendation; 

        @JsonProperty("code_expiration_minutes")
        private Integer codeExpirationMinutes;

        private List<ButtonDTO> buttons;
        private TemplateExampleDTO example;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ButtonDTO {
        private String type; // QUICK_REPLY, URL, PHONE_NUMBER, OTP
        private String text;

        // URL button
        private String url;
        private List<String> example;

        // PHONE_NUMBER button
        @JsonProperty("phone_number")
        private String phoneNumber;

        // OTP button
        @JsonProperty("otp_type")
        private String otpType;       // ONE_TAP, COPY_CODE
        @JsonProperty("autofill_text")
        private String autofillText;
        @JsonProperty("package_name")
        private String packageName;
        @JsonProperty("signature_hash")
        private String signatureHash;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateExampleDTO {
        @JsonProperty("header_text")
        private List<String> headerTexts;

        @JsonProperty("body_text")
        private List<List<String>> bodyTexts; // [["Mark","Tuscan Getaway package","800"]]

        @JsonProperty("header_handle")
        private List<String> headerHandles;   // ["4::aW..."]
    }
}
