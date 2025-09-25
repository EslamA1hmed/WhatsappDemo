package com.example.whatsappdemo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WhatsAppMessageDTO {

    private String messaging_product = "whatsapp";
    private String to;
    private String type;
    private Context context;

    private String recipient_type;

    private Text text;
    private Image image;
    private Document document;
    private Video video;
    private Template template;
    private Interactive interactive;

    // ---------------- Sub-Classes ---------------- //

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Context {
        private String message_id; // ID للرسالة اللي بيرد عليها
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Text {
        private boolean preview_url;
        private String body;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Image {
        private String link;
        private String caption; // اختياري
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Document {
        private String link;
        private String filename; // اختياري
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Video {
        private String link;
        private String caption; // اختياري
    }

    // ---------------- Template ---------------- //

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Template {
        private String name;
        private Language language;
        private List<Component> components;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Language {
            private String code; // en_US, ar_EG, ...
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Component {
            private String type;       // BODY, HEADER, FOOTER, BUTTON
            private String sub_type;   // لو BUTTON (مثلاً: QUICK_REPLY, URL, CATALOG)
            private Integer index;     // index للـ button
            private List<Parameter> parameters;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Parameter {
            private String type;       // text, image, document, video, currency, date_time, action
            private String text;       // لو type = text
            private Image image;       // لو type = image
            private Document document; // لو type = document
            private Video video;       // لو type = video
            private Action action;     // لو type = action (للـ buttons الخاصة بالكاتالوج أو URL)
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Action {
            private String thumbnail_product_retailer_id; // للكاتالوج
            private String url;          // للـ URL button
            private String phone_number; // للـ Call button
        }
    }

    // ---------------- Interactive ---------------- //

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Interactive {
        private String type; // button أو list
        private Body body;
        private Action action;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Body {
            private String text;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Action {
            private List<Button> buttons;
            private List<Section> sections;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Button {
            private String type; // reply أو url
            private Reply reply;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Reply {
            private String id;
            private String title;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Section {
            private String title;
            private List<Row> rows;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Row {
            private String id;
            private String title;
            private String description;
        }
    }
}
