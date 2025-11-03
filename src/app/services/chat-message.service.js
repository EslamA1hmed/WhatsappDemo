"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessageService = void 0;
const core_1 = require("@angular/core");
const http_1 = require("@angular/common/http");
let ChatMessageService = class ChatMessageService {
    constructor(authService) {
        this.authService = authService;
        this.http = (0, core_1.inject)(http_1.HttpClient);
        this.apiUrl = 'http://localhost:8080/message'; // ❌ كان api/messages
        this.messagesApiUrl = 'http://localhost:8080/api/messages'; // ✅ للـ get messages
    }
    // للـ GET requests (تحميل الرسائل)
    getMessages(page = 0, size = 20) {
        return this.http.get(`${this.messagesApiUrl}?page=${page}&size=${size}`);
    }
    getMessagesByContact(phoneNumber, page = 0, size = 20) {
        return this.http.get(`${this.messagesApiUrl}/contact/${phoneNumber}?page=${page}&size=${size}`);
    }
    // للـ POST request (إرسال الرسائل)
    sendTextMessage(phoneNumber, message, contextMessageId) {
        const payload = {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'text',
            text: {
                preview_url: false,
                body: message
            }
        };
        if (contextMessageId) {
            payload.context = {
                message_id: contextMessageId
            };
        }
        const headers = new http_1.HttpHeaders({
            'Authorization': `Bearer ${this.authService.getToken()}`,
            'Content-Type': 'application/json'
        });
        return this.http.post(`${this.apiUrl}/send`, payload, { headers }); // ✅ هيبقى /message/send
    }
    sendTemplateMessage(to, templateName, components) {
        const request = {
            to,
            type: 'template',
            template: {
                name: templateName,
                language: { code: 'en' },
                components
            }
        };
        const headers = new http_1.HttpHeaders({
            'Authorization': `Bearer ${this.authService.getToken()}`,
            'Content-Type': 'application/json'
        });
        return this.http.post(`${this.apiUrl}/send`, request, { headers });
    }
    sendMediaMessage(to, mediaId, caption, contextMessageId) {
        const request = {
            to,
            type: 'media',
            media: {
                id: mediaId,
                caption
            }
        };
        if (contextMessageId) {
            request.context = { message_id: contextMessageId };
        }
        const headers = new http_1.HttpHeaders({
            'Authorization': `Bearer ${this.authService.getToken()}`,
            'Content-Type': 'application/json'
        });
        return this.http.post(`${this.apiUrl}/send`, request, { headers });
    }
    markMessagesAsRead(phoneNumber) {
        const headers = new http_1.HttpHeaders({
            'Authorization': `Bearer ${this.authService.getToken()}`
        });
        return this.http.put(`http://localhost:8080/incoming/messages/read/${phoneNumber}`, {}, { headers });
    }
    getLastMessageForContact(phoneNumber) {
        return this.http.get(`${this.messagesApiUrl}/last/${phoneNumber}`);
    }
};
ChatMessageService = __decorate([
    (0, core_1.Injectable)({
        providedIn: 'root'
    })
], ChatMessageService);
exports.ChatMessageService = ChatMessageService;
