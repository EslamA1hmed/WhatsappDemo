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
public class WhatsAppTemplatesResponseDTO {

    private List<TemplateDTO> data;
    private PagingDTO paging;

    // ---------------- Sub-Classes ---------------- //

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateDTO {
        private String id;
        private String name;
        
        @JsonProperty("parameter_format")
        private String parameterFormat; // POSITIONAL, NAMED
        
        private String language;
        private String status;
        private String category;
        private List<ComponentDTO> components;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComponentDTO {
        private String type;       // BODY, HEADER, FOOTER, BUTTONS
        private String format;     // TEXT, IMAGE, VIDEO...
        private String text;
        private List<ButtonDTO> buttons;
        private TemplateExampleDTO example;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ButtonDTO {
        private String type; // QUICK_REPLY, URL, PHONE_NUMBER, CATALOG, OTP
        private String text;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateExampleDTO {
        @JsonProperty("header_text")
        private List<String> headerTexts;

        @JsonProperty("body_text")
        private List<List<String>> bodyTexts;

        @JsonProperty("header_handle")
        private List<String> headerHandles;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PagingDTO {
        private CursorsDTO cursors;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CursorsDTO {
        private String before;
        private String after;
    }
}
