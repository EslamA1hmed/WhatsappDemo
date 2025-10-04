import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from './message.service';
import { MediaService } from './MediaService';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { DashboardStatsComponent } from './dashboard-stats.component';

interface Message {
  to: string;
  createdAt: string;
  status: string;
  type: string;
  textBody?: string;
  templateName?: string;
  templateHeader?: string;
  templateBody?: string;
  templateFooter?: string;
  mediaURL?: string;
  mediaId?: string;
  mimeType?: string;
  caption?: string;
  filename?: string;
  buttons?: Array<{ type: string; text: string; payload?: string; url?: string; phoneNumber?: string }>;
  hasMedia?: boolean;
  hasButtons?: boolean;
  mediaLoaded?: boolean;
  mediaError?: boolean;
  isLoadingMedia?: boolean;
  mediaUrl?: string;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardStatsComponent],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  allMessages: Message[] = [];
  currentPage = 0;
  totalPages = 0;
  pageSize = 6; // Changed from 5 to 6
  loading = true;
  error = '';
  searchTerm = '';
  activeView: 'messages' | 'statistics' = 'messages';

  private messageService = inject(MessageService);
  private mediaService = inject(MediaService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadMessages();
    } else {
      this.error = 'Messages cannot be loaded on this platform';
      this.loading = false;
    }
  }

  ngOnDestroy() {
    this.messages.forEach(msg => {
      if (msg.mediaUrl && msg.mediaUrl.startsWith('blob:')) {
        URL.revokeObjectURL(msg.mediaUrl);
      }
    });
  }

  loadMessages() {
    this.loading = true;
    this.error = '';
    
    this.messageService.getMessages(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        console.log('Raw API Response:', response);
        
        this.allMessages = response.content.map((msg: Message) => {
          console.log('Processing message:', msg);
          
          const mediaUrl = msg.mediaUrl || msg.mediaURL;
          
          const processedMsg = {
            ...msg,
            mediaUrl: mediaUrl,
            hasMedia: !!(mediaUrl || msg.mediaId),
            hasButtons: msg.buttons && msg.buttons.length > 0,
            mediaLoaded: false,
            mediaError: false,
            isLoadingMedia: false
          };
          
          console.log('Processed message:', processedMsg);
          return processedMsg;
        });
        
        this.messages = [...this.allMessages];
        
        this.messages.forEach(msg => {
          if (msg.mediaId && !msg.mediaUrl && msg.hasMedia) {
            console.log('Loading media for mediaId:', msg.mediaId);
            this.loadMediaUrl(msg);
          }
        });
        
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('API Error:', err);
        this.error = 'Failed to load messages. Please try again.';
        this.loading = false;
      }
    });
  }

  loadMediaUrl(message: Message) {
    if (!message.mediaId || message.mediaUrl) return;

    message.isLoadingMedia = true;
    
    this.mediaService.downloadMediaAsBlob(message.mediaId).subscribe({
      next: (blobUrl: string) => {
        message.mediaUrl = blobUrl;
        message.isLoadingMedia = false;
        message.mediaLoaded = false;
      },
      error: (err: any) => {
        console.error('Error downloading media for mediaId:', message.mediaId, err);
        message.mediaError = true;
        message.isLoadingMedia = false;
      }
    });
  }

  onMediaLoad(message: Message) {
    message.mediaLoaded = true;
    message.mediaError = false;
    message.isLoadingMedia = false;
  }

  onMediaError(message: Message) {
    console.error('Failed to load media for message:', message);
    message.mediaError = true;
    message.mediaLoaded = false;
    message.isLoadingMedia = false;
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadMessages();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  isRTL(text: string | undefined): boolean {
    if (!text) return false;
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return rtlRegex.test(text);
  }

  getInitials(phoneNumber: string): string {
    if (!phoneNumber) return '?';
    const digits = phoneNumber.replace(/\D/g, '');
    return digits.slice(-2) || '??';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'sent': '✓',
      'delivered': '✓✓',
      'read': '👁️',
      'failed': '✗',
      'pending': '⏱'
    };
    return icons[status?.toLowerCase()] || '•';
  }

  getTotalMessages(): number {
    return this.allMessages.length;
  }

  getMessagesByStatus(status: string): number {
    return this.allMessages.filter(m => m.status?.toLowerCase() === status.toLowerCase()).length;
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.messages = [...this.allMessages];
      return;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    this.messages = this.allMessages.filter(msg => 
      msg.to?.toLowerCase().includes(term)
    );
  }

  setView(view: 'statistics' | 'messages'): void {
    this.activeView = view;
  }
}
