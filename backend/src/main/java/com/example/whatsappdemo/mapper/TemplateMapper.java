package com.example.whatsappdemo.mapper;

import com.example.whatsappdemo.dto.WhatsAppTemplateCreateDTO;
import com.example.whatsappdemo.dto.WhatsAppTemplatesResponseDTO;
import com.example.whatsappdemo.entity.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class TemplateMapper {

    public static Template toEntity(WhatsAppTemplateCreateDTO dto) {
        if (dto == null) return null;

        Template template = Template.builder()
                .name(dto.getName())
                .category(dto.getCategory())
                .language(new TemplateLanguage(dto.getLanguage()))
                .status(dto.getStatus() != null ? dto.getStatus() : "PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        if (dto.getComponents() != null) {
            List<Component> components = dto.getComponents().stream()
                    .map(cdto -> toComponentEntity(cdto, template))
                    .collect(Collectors.toList());
            template.setComponents(components);
        }

        return template;
    }

    private static Component toComponentEntity(WhatsAppTemplateCreateDTO.ComponentDTO dto, Template template) {
        Component component = Component.builder()
                .type(dto.getType())
                .text(dto.getText())
                .format(dto.getFormat())
                .addSecurityRecommendation(dto.getAddSecurityRecommendation())
                .codeExpirationMinutes(dto.getCodeExpirationMinutes())
                .template(template) // 🔗 ربط بالـ Template
                .build();

        // Example
        if (dto.getExample() != null) {
            TemplateExample example = new TemplateExample();

            if (dto.getExample().getBodyTexts() != null) {
                List<TemplateExampleBody> bodies = dto.getExample().getBodyTexts().stream()
                        .map(values -> TemplateExampleBody.builder()
                                .values(values)
                                .example(example) // 🔗 ربط بالـ Example
                                .build())
                        .collect(Collectors.toList());
                example.setBodyTexts(bodies);
            }

            if (dto.getExample().getHeaderTexts() != null) {
                example.setHeaderTexts(dto.getExample().getHeaderTexts());
            }

            if (dto.getExample().getHeaderHandles() != null) {
                example.setHeaderHandles(dto.getExample().getHeaderHandles());
            }

            component.setExample(example);
        }

        // Buttons
        if (dto.getButtons() != null) {
            List<Button> buttons = dto.getButtons().stream()
                    .map(bdto -> toButtonEntity(bdto, component))
                    .collect(Collectors.toList());
            component.setButtons(buttons);
        }

        return component;
    }

    private static Button toButtonEntity(WhatsAppTemplateCreateDTO.ButtonDTO dto, Component component) {
        Button button = Button.builder()
                .type(dto.getType())
                .text(dto.getText())
                .url(dto.getUrl())
                .phoneNumber(dto.getPhoneNumber())
                .otpType(dto.getOtpType())
                .autofillText(dto.getAutofillText())
                .packageName(dto.getPackageName())
                .signatureHash(dto.getSignatureHash())
                .example(dto.getExample() != null ? String.join(",", dto.getExample()) : null)
                .component(component) // 🔗 ربط بالـ Component
                .build();

        return button;
    }

     public static WhatsAppTemplatesResponseDTO toResponse(List<Template> entities) {
        WhatsAppTemplatesResponseDTO response = new WhatsAppTemplatesResponseDTO();

        if (entities != null) {
            List<WhatsAppTemplatesResponseDTO.TemplateDTO> data = entities.stream()
                    .map(TemplateMapper::toTemplateDto)
                    .collect(Collectors.toList());
            response.setData(data);
        }

        // ممكن تحط paging حقيقية لو عامل pagination في DB
        WhatsAppTemplatesResponseDTO.PagingDTO paging = new WhatsAppTemplatesResponseDTO.PagingDTO();
        paging.setCursors(new WhatsAppTemplatesResponseDTO.CursorsDTO(null, null));
        response.setPaging(paging);

        return response;
    }

    // ------------------- Template ------------------- //
    private static WhatsAppTemplatesResponseDTO.TemplateDTO toTemplateDto(Template entity) {
        if (entity == null) return null;

        WhatsAppTemplatesResponseDTO.TemplateDTO dto = new WhatsAppTemplatesResponseDTO.TemplateDTO();
        dto.setId(entity.getId() != null ? entity.getId().toString() : null);
        dto.setName(entity.getName());
        dto.setParameterFormat("POSITIONAL"); // ثابت دلوقتي، لو عايز خزنه في DB
        dto.setLanguage(entity.getLanguage() != null ? entity.getLanguage().getCode() : null);
        dto.setStatus(entity.getStatus());
        dto.setCategory(entity.getCategory());

        if (entity.getComponents() != null) {
            dto.setComponents(
                    entity.getComponents().stream()
                            .map(TemplateMapper::toComponentDto)
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }

    // ------------------- Component ------------------- //
    private static WhatsAppTemplatesResponseDTO.ComponentDTO toComponentDto(Component entity) {
        if (entity == null) return null;

        WhatsAppTemplatesResponseDTO.ComponentDTO dto = new WhatsAppTemplatesResponseDTO.ComponentDTO();
        dto.setType(entity.getType());
        dto.setFormat(entity.getFormat());
        dto.setText(entity.getText());

        // Example
        if (entity.getExample() != null) {
            dto.setExample(toExampleDto(entity.getExample()));
        }

        // Buttons
        if (entity.getButtons() != null) {
            dto.setButtons(
                    entity.getButtons().stream()
                            .map(TemplateMapper::toButtonDto)
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }

    // ------------------- Example ------------------- //
    private static WhatsAppTemplatesResponseDTO.TemplateExampleDTO toExampleDto(TemplateExample entity) {
        if (entity == null) return null;

        WhatsAppTemplatesResponseDTO.TemplateExampleDTO dto = new WhatsAppTemplatesResponseDTO.TemplateExampleDTO();
        dto.setHeaderTexts(entity.getHeaderTexts());
        dto.setHeaderHandles(entity.getHeaderHandles());

        if (entity.getBodyTexts() != null) {
            dto.setBodyTexts(
                    entity.getBodyTexts().stream()
                            .map(TemplateExampleBody::getValues) // List<String>
                            .collect(Collectors.toList()) // يبقى List<List<String>>
            );
        }

        return dto;
    }

    // ------------------- Button ------------------- //
    private static WhatsAppTemplatesResponseDTO.ButtonDTO toButtonDto(Button entity) {
        if (entity == null) return null;

        WhatsAppTemplatesResponseDTO.ButtonDTO dto = new WhatsAppTemplatesResponseDTO.ButtonDTO();
        dto.setType(entity.getType());
        dto.setText(entity.getText());
        return dto;
    }
}
