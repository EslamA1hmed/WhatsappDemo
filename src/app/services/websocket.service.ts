import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MessageResponseDTO } from '../dto/message-response.dto';
import { StatusDTO } from '../dto/status.dto';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client | null = null;
  private connected = new BehaviorSubject<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.client = new Client({
        webSocketFactory: () => new SockJS('ws://localhost:8080/ws'),
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

      this.client.onWebSocketError = (error) => {
        console.error('WebSocket error:', error);
      };

      this.client.onWebSocketClose = (event) => {
        console.log('WebSocket closed:', event);
      };

      this.client.activate();
    }
  }

  getConnectedStatus(): Observable<boolean> {
    return this.connected.asObservable();
  }

  subscribeToChat(phoneNumber: string): Observable<MessageResponseDTO> {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return of();
    }
    return new Observable<MessageResponseDTO>(observer => {
      const subscription = this.client!.subscribe(`/topic/chat/${phoneNumber}`, (msg) => {
        const body = JSON.parse(msg.body) as MessageResponseDTO;
        observer.next(body);
      });

      return () => {
        subscription.unsubscribe();
      };
    });
  }

  subscribeToStatus(phoneNumber: string): Observable<StatusDTO> {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return of();
    }
    return new Observable<StatusDTO>(observer => {
      const subscription = this.client!.subscribe(`/topic/status/${phoneNumber}`, (msg) => {
        const body = JSON.parse(msg.body) as StatusDTO;
        observer.next(body);
      });

      return () => {
        subscription.unsubscribe();
      };
    });
  }

  disconnect() {
    if (isPlatformBrowser(this.platformId) && this.client) {
      this.client.deactivate();
      this.connected.next(false);
    }
  }
}