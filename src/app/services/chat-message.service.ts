import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ChatMessage {
  id: number;
  messageId: string;
  direction: 'SENT' | 'RECEIVED';
  status: string;
  to: string;
  from: string;
  type: string;
  textBody?: string;
  templateName?: string;
  templateBody?: string;
  templateHeader?: string;
  templateFooter?: string;
  mediaId?: string;
  mimeType?: string;
  mediaUrl?: string;
  caption?: string;
  filename?: string;
  contextMessageId?: string;
  contextFrom?: string;
  buttons?: Array<{
    type: string;
    text: string;
    payload?: string;
    url?: string;
    phoneNumber?: string;
  }>;
  createdAt: string;
}

export interface MessagePageResponse {
  content: ChatMessage[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
}

export interface SendMessageRequest {
  to: string;
  type: 'text' | 'template' | 'media';
  text?: {
    body: string;
  };
  context?: {
    message_id: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  media?: {
    id?: string;
    link?: string;
    caption?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ChatMessageService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/message'; // ❌ كان api/messages
  private messagesApiUrl = 'http://localhost:8080/api/messages'; // ✅ للـ get messages
  
  constructor(private authService: AuthService) {}

  // للـ GET requests (تحميل الرسائل)
  getMessages(page: number = 0, size: number = 20): Observable<MessagePageResponse> {
    return this.http.get<MessagePageResponse>(`${this.messagesApiUrl}?page=${page}&size=${size}`);
  }

  getMessagesByContact(phoneNumber: string, page: number = 0, size: number = 20): Observable<MessagePageResponse> {
    return this.http.get<MessagePageResponse>(`${this.messagesApiUrl}/contact/${phoneNumber}?page=${page}&size=${size}`);
  }

  // للـ POST request (إرسال الرسائل)
  sendTextMessage(phoneNumber: string, message: string, contextMessageId?: string): Observable<ChatMessage> {
    const payload: any = {
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

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<ChatMessage>(`${this.apiUrl}/send`, payload, { headers }); // ✅ هيبقى /message/send
  }

  sendTemplateMessage(to: string, templateName: string, components?: any[]): Observable<any> {
    const request: SendMessageRequest = {
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components
      }
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/send`, request, { headers });
  }

  sendMediaMessage(to: string, mediaId: string, caption?: string, contextMessageId?: string): Observable<any> {
    const request: SendMessageRequest = {
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

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/send`, request, { headers });
  }

  getLastMessageForContact(phoneNumber: string): Observable<ChatMessage> {
    return this.http.get<ChatMessage>(`${this.messagesApiUrl}/last/${phoneNumber}`);
  }
}