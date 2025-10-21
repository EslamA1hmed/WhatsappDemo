import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MessageResponseDTO } from '../dto/message-response.dto';
import { StatusDTO } from '../dto/status.dto';
import { ChatMessage } from '../services/chat-message.service'; // افترض إن ChatMessage موجود هنا

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client | null = null;
  private connected = new BehaviorSubject<boolean>(false);
  private subscriptions: { [phoneNumber: string]: { messages: number; status: number } } = {}; // Track subscription count

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => console.log(str),
        splitLargeFrames: true
      });

      this.client.onConnect = () => {
        console.log('Connected to WebSocket');
        this.connected.next(true);
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP error:', frame);
        this.connected.next(false);
      };

      this.client.activate();
    }
  }

  getConnectedStatus(): Observable<boolean> {
    return this.connected.asObservable();
  }

  subscribeToMessages(phoneNumber: string): Observable<ChatMessage> {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return of();
    }

    if (!this.subscriptions[phoneNumber]) {
      this.subscriptions[phoneNumber] = { messages: 0, status: 0 };
    }
    this.subscriptions[phoneNumber].messages++;

    return new Observable<ChatMessage>(observer => {
      const subscription = this.client!.subscribe(`/topic/chat/${phoneNumber}`, (msg) => {
        const body = JSON.parse(msg.body) as MessageResponseDTO;
        const message: ChatMessage = {
          id: body.id || 0,
          messageId: body.messageId,
          direction: body.direction as 'SENT' | 'RECEIVED',
          status: body.status,
          to: body.to,
          from: body.from,
          type: body.type,
          textBody: body.textBody,
          templateName: body.templateName,
          templateBody: body.templateBody,
          templateHeader: body.templateHeader,
          templateFooter: body.templateFooter,
          mediaId: body.mediaId,
          mimeType: body.mimeType,
          mediaUrl: body.mediaUrl,
          width: body.width,
          height: body.height,
          thumbnail: body.thumbnail,
          caption: body.caption,
          isPlaying : body.isPlaying,
          currentTime : body.currentTime ,
          duration :  body.duration,
          filename: body.filename,
          progressPercent : body.progressPercent,
          contextMessageId: body.contextMessageId,
          contextFrom: body.contextFrom,
          buttons: body.buttons,
          createdAt: body.createdAt
        };
        observer.next(message);
      });

      return () => {
        subscription.unsubscribe();
        this.subscriptions[phoneNumber].messages--;
        if (this.subscriptions[phoneNumber].messages === 0 && this.subscriptions[phoneNumber].status === 0) {
          delete this.subscriptions[phoneNumber];
        }
      };
    });
  }

  subscribeToStatus(phoneNumber: string): Observable<StatusDTO> {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return of();
    }

    if (!this.subscriptions[phoneNumber]) {
      this.subscriptions[phoneNumber] = { messages: 0, status: 0 };
    }
    this.subscriptions[phoneNumber].status++;

    return new Observable<StatusDTO>(observer => {
      const subscription = this.client!.subscribe(`/topic/status/${phoneNumber}`, (msg) => {
        const body = JSON.parse(msg.body) as StatusDTO;
        observer.next(body);
      });

      return () => {
        subscription.unsubscribe();
        this.subscriptions[phoneNumber].status--;
        if (this.subscriptions[phoneNumber].messages === 0 && this.subscriptions[phoneNumber].status === 0) {
          delete this.subscriptions[phoneNumber];
        }
      };
    });
  }

  unsubscribeFromContact(phoneNumber: string) {
    if (this.subscriptions[phoneNumber]) {
      delete this.subscriptions[phoneNumber];
    }
  }

  disconnect() {
    if (isPlatformBrowser(this.platformId) && this.client) {
      this.client.deactivate();
      this.connected.next(false);
    }
  }
}