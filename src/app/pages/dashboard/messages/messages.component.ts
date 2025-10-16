import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, map } from 'rxjs'; // ✨ 1. استيراد forkJoin و map

// ✨ 2. استيراد الخدمات والنماذج اللازمة
import { MessageService } from './message.service';
import { MediaService } from '../../../services/MediaService';
import { ContactService, Contact } from '../../../services/contact.service'; // تأكد من صحة المسار
import { DashboardStatsComponent } from './dashboard-stats.component';

// ✨ 3. إضافة الخاصية الجديدة للواجهة (Interface)
interface Message {
  to: string;
  createdAt: string;
  status: string;
  type: string;
  recipientName?: string; // ✅ الخاصية الجديدة لعرض الاسم
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
  pageSize = 6;
  loading = true;
  error = '';
  searchTerm = '';
  activeView: 'messages' | 'statistics' = 'messages';

  private messageService = inject(MessageService);
  private mediaService = inject(MediaService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private contactService = inject(ContactService); // ✨ 4. حقن خدمة جهات الاتصال

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

  // ✨ 5. تعديل دالة `loadMessages` بالكامل
  loadMessages() {
    this.loading = true;
    this.error = '';

    // إعداد الطلبات التي سيتم تنفيذها بالتوازي
    const messagesRequest$ = this.messageService.getMessages(this.currentPage, this.pageSize);
    const contactsRequest$ = this.contactService.getAllContacts(0, 200); // جلب عدد كبير من جهات الاتصال

    forkJoin({
      messagesResponse: messagesRequest$,
      contacts: contactsRequest$
    }).pipe(
      map(({ messagesResponse, contacts }) => {
        // إنشاء خريطة للبحث السريع باستخدام رقم الهاتف
        const contactMap = new Map<string, string>();
        contacts.forEach(contact => {
          // قم بإزالة أي رموز غير رقمية لتوحيد الصيغة
          const cleanPhoneNumber = contact.phoneNumber.replace(/\D/g, '');
          contactMap.set(cleanPhoneNumber, contact.name);
        });

        // معالجة كل رسالة لإضافة اسم المستلم
        const processedMessages = messagesResponse.content.map((msg: Message) => {
          const cleanToNumber = msg.to.replace(/\D/g, '');
          const recipientName = contactMap.get(cleanToNumber);
          const mediaUrl = msg.mediaUrl || msg.mediaURL;

          return {
            ...msg,
            recipientName: recipientName || `+${msg.to}`, // إذا لم يتم العثور على اسم، استخدم الرقم
            mediaUrl: mediaUrl,
            hasMedia: !!(mediaUrl || msg.mediaId),
            hasButtons: msg.buttons && msg.buttons.length > 0,
            mediaLoaded: false,
            mediaError: false,
            isLoadingMedia: false
          };
        });

        return { messages: processedMessages, totalPages: messagesResponse.totalPages };
      })
    ).subscribe({
      next: ({ messages, totalPages }) => {
        this.allMessages = messages;
        this.messages = [...this.allMessages];
        this.totalPages = totalPages;
        this.loading = false;

        this.messages.forEach(msg => {
          if (msg.mediaId && !msg.mediaUrl && msg.hasMedia) {
            this.loadMediaUrl(msg);
          }
        });
      },
      error: (err: any) => {
        console.error('API Error:', err);
        this.error = 'Failed to load messages or contacts. Please try again.';
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

  // ✨ 6. تعديل دالة `getInitials` لتكون أكثر ذكاءً
  getInitials(nameOrPhone: string): string {
    if (!nameOrPhone) return '?';
    
    // التحقق إذا كان الإدخال يحتوي على حروف (مما يعني أنه اسم)
    if (/[a-zA-Z]/.test(nameOrPhone)) {
      const words = nameOrPhone.trim().split(' ').filter(w => w);
      if (words.length > 1) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
      }
      return nameOrPhone.substring(0, 2).toUpperCase();
    }
    
    // إذا كان رقمًا، استخدم آخر رقمين
    const digits = nameOrPhone.replace(/\D/g, '');
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
    // البحث بالاسم أو الرقم
    this.messages = this.allMessages.filter(msg => 
      msg.recipientName?.toLowerCase().includes(term) || msg.to?.toLowerCase().includes(term)
    );
  }

  setView(view: 'statistics' | 'messages'): void {
    this.activeView = view;
  }
}
