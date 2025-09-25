package com.example.whatsappdemo.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.whatsappdemo.dto.WhatsAppMessageDTO;
import com.example.whatsappdemo.entity.*;

@Component
public class MessageMapper {

    public Message toEntity(WhatsAppMessageDTO dto) {
    if (dto == null) return null;

    // ================== Basic Message ==================
    Message message = Message.builder()
            .messagingProduct(dto.getMessaging_product())
            .to(dto.getTo())
            .type(dto.getType())
            .recipientType(dto.getRecipient_type())
            .build();

    // Context
    if (dto.getContext() != null) {
        message.setContext(new MessageContext(dto.getContext().getMessage_id()));
    }

    // Document
    if (dto.getDocument() != null) {
        message.setDocument(MessageDocument.builder()
                .filename(dto.getDocument().getFilename())
                .link(dto.getDocument().getLink())
                .build());
    }

    // Text
    if (dto.getText() != null) {
        message.setText(MessageText.builder()
                .body(dto.getText().getBody())
                .previewUrl(dto.getText().isPreview_url())
                .build());
    }

    // Image
    if (dto.getImage() != null) {
        message.setImage(MessageImage.builder()
                .caption(dto.getImage().getCaption())
                .link(dto.getImage().getLink())
                .build());
    }

    // ================== Template ==================
    if (dto.getTemplate() != null) {
        MessageTemplate template = MessageTemplate.builder()
                .name(dto.getTemplate().getName())
                .language(dto.getTemplate().getLanguage() != null
                        ? TemplateLanguage.builder()
                                .code(dto.getTemplate().getLanguage().getCode())
                                .build()
                        : null)
                .build();

        // Components mapping
        if (dto.getTemplate().getComponents() != null) {
            List<MessageTemplateComponent> components = dto.getTemplate().getComponents().stream()
                    .map(cdto -> {
                        MessageTemplateComponent comp = MessageTemplateComponent.builder()
                                .type(cdto.getType())
                                .build();

                        // Parameters mapping
                        if (cdto.getParameters() != null) {
                            List<MessageTemplateParameter> params = cdto.getParameters().stream()
                                    .map(p -> {
                                        MessageTemplateParameter param = MessageTemplateParameter.builder()
                                                .type(p.getType())
                                                .text(p.getText())
                                                .documentFilename(p.getDocument() != null ? p.getDocument().getFilename() : null)
                                                .documentLink(p.getDocument() != null ? p.getDocument().getLink() : null)
                                                .imageCaption(p.getImage() != null ? p.getImage().getCaption() : null)
                                                .imageLink(p.getImage() != null ? p.getImage().getLink() : null)
                                                .videoCaption(p.getVideo() != null ? p.getVideo().getCaption() : null)
                                                .videoLink(p.getVideo() != null ? p.getVideo().getLink() : null)
                                                .build();

                                        // 🔗 ربط parameter بالـ component
                                        param.setComponent(comp);
                                        return param;
                                    })
                                    .collect(Collectors.toList());

                            comp.setParameters(params);
                        }

                        // 🔗 ربط component بالـ template
                        comp.setTemplate(template);
                        return comp;
                    })
                    .collect(Collectors.toList());

            template.setComponents(components);
        }

        message.setTemplate(template);
    }

    return message;
}

}
