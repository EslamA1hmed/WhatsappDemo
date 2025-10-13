import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChatMessageService, ChatMessage, MessagePageResponse } from '../../../services/chat-message.service';
import { Contact } from '../../../services/contact.service';
import { AuthService } from '../../../services/auth.service';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface TemplateDTO {
  name: string;
  language: string;
  category: string;
  components?: ComponentDTO[];
}

interface ComponentDTO {
  type: string;
  format?: string;
  text?: string;
  example?: {
    header_text?: string[];
    body_text?: string[][];
  };
  buttons?: ButtonDTO[];
  add_security_recommendation?: boolean;
  code_expiration_minutes?: number;
}

interface ButtonDTO {
  type: string;
  text: string;
  url?: string;
  phone_number?: string;
  example?: string[];
  otp_type?: string;
  autofill_text?: string;
  package_name?: string;
  signature_hash?: string;
}

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, OnChanges {
  @Input() contact: Contact | null = null;
  @Output() backToSidebar = new EventEmitter<void>();
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  loading = false;
  currentPage = 0;
  pageSize = 10;
  hasMore = true;
  newMessage = '';
  replyingTo: ChatMessage | null = null;
  private scrollSubject = new Subject<void>();

  messageType: 'text' | 'image' | 'video' | 'document' | 'template' = 'text';
  showMessageOptions = false;
  showPreview = false; // Added to toggle preview on mobile

  imageLink = '';
  imageCaption = '';
  videoLink = '';
  videoCaption = '';
  docLink = '';
  docFilename = '';

  templateNames: string[] = [];
  selectedTemplateName = '';
  selectedTemplate: TemplateDTO | null = null;
  templateHeaderVariables: string[] = [];
  templateHeaderMedia = '';
  templateBodyVariables: string[] = [];
  templateButtonValues: string[] = [];
  oneTapParams: { autofillText: string; packageName: string; signatureHash: string }[] = [];
  headerComponent: ComponentDTO | null = null;
  headerFormat: string | null = null;
  footerText: string | null = null;

  constructor(
    private messageService: ChatMessageService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.scrollSubject.pipe(debounceTime(100)).subscribe(() => {
      this.handleScroll();
    });
  }

  ngOnInit() {
    if (this.contact) {
      this.loadMessages();
      this.loadTemplateNames();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contact'] && changes['contact'].currentValue) {
      this.messages = [];
      this.currentPage = 0;
      this.hasMore = true;
      this.replyingTo = null;
      this.resetMessageForm();
      this.loadMessages();
      this.loadTemplateNames();
      this.showPreview = false; // Reset preview visibility
    }
  }

  // TrackBy functions to fix cursor issue
  trackByIndex(index: number): number {
    return index;
  }

  trackByButtonIndex(index: number, item: ButtonDTO): string {
    return `${item.type}-${index}`;
  }

  loadTemplateNames() {
    this.http.get<{ content: string[] }>('http://localhost:8080/template/names')
      .subscribe({
        next: (res) => {
          this.templateNames = res.content;
        },
        error: (err) => {
          console.error('Error loading templates:', err);
        }
      });
  }

  onTemplateChange() {
    if (this.selectedTemplateName) {
      this.http.get<TemplateDTO>(`http://localhost:8080/template/${this.selectedTemplateName}`)
        .subscribe({
          next: (res) => {
            this.selectedTemplate = res;
            this.headerComponent = this.selectedTemplate?.components?.find(c => c.type === 'HEADER') || null;
            this.headerFormat = this.headerComponent?.format ?? null;
            
            if (this.headerComponent?.example?.header_text) {
              this.templateHeaderVariables = new Array(this.headerComponent.example.header_text.length).fill('');
            } else {
              this.templateHeaderVariables = [];
            }
            
            const bodyComponent = this.selectedTemplate?.components?.find(c => c.type === 'BODY');
            if (bodyComponent?.example?.body_text) {
              const variableCount = bodyComponent.example.body_text[0]?.length || 0;
              this.templateBodyVariables = new Array(variableCount).fill('');
            } else {
              this.templateBodyVariables = [];
            }
            
            const buttonComponent = this.selectedTemplate?.components?.find(c => c.type === 'BUTTONS');
            if (buttonComponent?.buttons) {
              const dynamicButtons = buttonComponent.buttons.filter(b => 
                (b.type === 'URL' && b.example && b.example.length > 0) || 
                (b.type === 'OTP' && b.otp_type === 'ONE_TAP')
              );
              this.templateButtonValues = new Array(dynamicButtons.length).fill('');
              this.oneTapParams = buttonComponent.buttons.map(b => 
                b.type === 'OTP' && b.otp_type === 'ONE_TAP' 
                  ? { autofillText: b.autofill_text || 'Autofill', packageName: b.package_name || '', signatureHash: b.signature_hash || '' }
                  : { autofillText: '', packageName: '', signatureHash: '' }
              );
            } else {
              this.templateButtonValues = [];
              this.oneTapParams = [];
            }
            
            const footerComponent = this.selectedTemplate?.components?.find(c => c.type === 'FOOTER');
            this.footerText = footerComponent?.text || null;
          },
          error: (err) => {
            console.error('Error loading template:', err);
            alert('Failed to load template');
          }
        });
    }
  }

  resetMessageForm() {
    this.newMessage = '';
    this.messageType = 'text';
    this.imageLink = '';
    this.imageCaption = '';
    this.videoLink = '';
    this.videoCaption = '';
    this.docLink = '';
    this.docFilename = '';
    this.selectedTemplateName = '';
    this.selectedTemplate = null;
    this.templateHeaderVariables = [];
    this.templateHeaderMedia = '';
    this.templateBodyVariables = [];
    this.templateButtonValues = [];
    this.oneTapParams = [];
    this.showMessageOptions = false;
  }

  onMessagesScroll(event: Event) {
    const element = event.target as HTMLElement;
    if (!element || this.loading || !this.hasMore) return;
    if (element.scrollTop < 200) {
      this.scrollSubject.next();
    }
  }

  handleScroll() {
    if (this.loading || !this.hasMore) return;
    this.loadMoreMessages();
  }

  loadMessages() {
    if (!this.contact || this.loading) return;

    this.loading = true;
    const previousScrollHeight = this.messagesContainer?.nativeElement.scrollHeight || 0;

    this.messageService.getMessagesByContact(this.contact.phoneNumber, this.currentPage, this.pageSize).subscribe({
      next: (response: MessagePageResponse) => {
        const newMessages = response.content;

        if (this.currentPage === 0) {
          this.messages = [...newMessages].reverse();
        } else {
          this.messages = [...newMessages.reverse(), ...this.messages];
        }

        this.hasMore = !response.last && response.content.length > 0;
        this.loading = false;

        setTimeout(() => {
          if (this.currentPage === 0) {
            this.scrollToBottom();
            this.checkAndLoadMore();
          } else {
            const newScrollHeight = this.messagesContainer?.nativeElement.scrollHeight || 0;
            this.messagesContainer.nativeElement.scrollTop = newScrollHeight - previousScrollHeight;
            this.checkAndLoadMore();
          }
        }, 100);
      },
      error: (err: unknown) => {
        console.error('Error loading messages:', err);
        this.loading = false;
        alert('Failed to load messages');
      }
    });
  }

  checkAndLoadMore() {
    if (!this.messagesContainer || this.loading || !this.hasMore) return;
    const element = this.messagesContainer.nativeElement;
    const hasScroll = element.scrollHeight > element.clientHeight;
    if (!hasScroll && this.hasMore) {
      setTimeout(() => {
        this.currentPage++;
        this.loadMessages();
      }, 300);
    }
  }

  loadMoreMessages() {
    if (!this.hasMore || this.loading) return;
    this.currentPage++;
    this.loadMessages();
  }

  sendMessage() {
    if (!this.contact) return;

    if (this.messageType === 'text') {
      this.sendTextMessage();
    } else if (this.messageType === 'image') {
      this.sendImageMessage();
    } else if (this.messageType === 'video') {
      this.sendVideoMessage();
    } else if (this.messageType === 'document') {
      this.sendDocumentMessage();
    } else if (this.messageType === 'template') {
      this.sendTemplateMessage();
    }
  }

  sendTextMessage() {
    if (!this.newMessage.trim() || !this.contact) return;

    const contextMessageId = this.replyingTo?.messageId;

    this.messageService.sendTextMessage(
      this.contact.phoneNumber,
      this.newMessage,
      contextMessageId
    ).subscribe({
      next: (response: ChatMessage) => {
        this.messages.push(response);
        this.resetMessageForm();
        this.replyingTo = null;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err: unknown) => {
        alert('Failed to send message');
        console.error(err);
      }
    });
  }

  sendImageMessage() {
    if (!this.imageLink || !this.contact) {
      alert('Please provide an image link');
      return;
    }

    const payload: any = {
      messaging_product: 'whatsapp',
      to: this.contact.phoneNumber,
      type: 'image',
      image: { link: this.imageLink }
    };

    if (this.imageCaption) {
      payload.image.caption = this.imageCaption;
    }

    if (this.replyingTo) {
      payload.context = { message_id: this.replyingTo.messageId };
    }

    this.sendCustomMessage(payload);
  }

  sendVideoMessage() {
    if (!this.videoLink || !this.contact) {
      alert('Please provide a video link');
      return;
    }

    const payload: any = {
      messaging_product: 'whatsapp',
      to: this.contact.phoneNumber,
      type: 'video',
      video: { link: this.videoLink }
    };

    if (this.videoCaption) {
      payload.video.caption = this.videoCaption;
    }

    if (this.replyingTo) {
      payload.context = { message_id: this.replyingTo.messageId };
    }

    this.sendCustomMessage(payload);
  }

  sendDocumentMessage() {
    if (!this.docLink || !this.contact) {
      alert('Please provide a document link');
      return;
    }

    const payload: any = {
      messaging_product: 'whatsapp',
      to: this.contact.phoneNumber,
      type: 'document',
      document: { link: this.docLink }
    };

    if (this.docFilename) {
      payload.document.filename = this.docFilename;
    }

    if (this.replyingTo) {
      payload.context = { message_id: this.replyingTo.messageId };
    }

    this.sendCustomMessage(payload);
  }

  sendTemplateMessage() {
    if (!this.selectedTemplateName || !this.selectedTemplate || !this.contact) {
      alert('Please select a template');
      return;
    }

    if (!this.templateBodyVariables.every(v => v)) {
      alert('Please fill all body variables');
      return;
    }

    const payload: any = {
      messaging_product: 'whatsapp',
      to: this.contact.phoneNumber,
      type: 'template',
      template: {
        name: this.selectedTemplateName,
        language: { code: this.selectedTemplate.language },
        components: []
      }
    };

    if (this.headerComponent) {
      const header: any = { type: 'header', parameters: [] };
      if (this.headerComponent.format === 'TEXT' && this.templateHeaderVariables.length) {
        header.parameters = this.templateHeaderVariables.map(v => ({ type: 'text', text: v }));
      } else if (this.headerComponent.format && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(this.headerComponent.format) && this.templateHeaderMedia) {
        header.parameters.push({
          type: this.headerComponent.format.toLowerCase(),
          [this.headerComponent.format.toLowerCase()]: { link: this.templateHeaderMedia }
        });
      }
      if (header.parameters.length) {
        payload.template.components.push(header);
      }
    }

    const bodyComponent = this.selectedTemplate.components?.find(c => c.type === 'BODY');
    if (bodyComponent && this.templateBodyVariables.length) {
      payload.template.components.push({
        type: 'body',
        parameters: this.templateBodyVariables.map(v => ({ type: 'text', text: v }))
      });
    }

    const buttonComponent = this.selectedTemplate.components?.find(c => c.type === 'BUTTONS');
    if (buttonComponent?.buttons) {
      let buttonIndex = 0;
      buttonComponent.buttons.forEach((button, index) => {
        if (button.type === 'URL' && button.example && button.example.length > 0) {
          payload.template.components.push({
            type: 'button',
            sub_type: 'URL',
            index,
            parameters: [{ type: 'text', text: this.templateButtonValues[buttonIndex] }]
          });
          buttonIndex++;
        } else if (button.type === 'OTP' && button.otp_type === 'ONE_TAP' && this.templateButtonValues[buttonIndex]) {
          const params: any = [{ type: 'text', text: this.templateButtonValues[buttonIndex] }];
          if (this.oneTapParams[buttonIndex].autofillText) {
            params.push({ type: 'autofill_text', autofill_text: this.oneTapParams[buttonIndex].autofillText });
          }
          if (this.oneTapParams[buttonIndex].packageName && this.oneTapParams[buttonIndex].signatureHash) {
            params.push({
              type: 'app_destination',
              app_destination: {
                package_name: this.oneTapParams[buttonIndex].packageName,
                signature_hash: this.oneTapParams[buttonIndex].signatureHash
              }
            });
          }
          payload.template.components.push({
            type: 'button',
            sub_type: 'OTP',
            index,
            parameters: params
          });
          buttonIndex++;
        }
      });
    }

    if (this.replyingTo) {
      payload.context = { message_id: this.replyingTo.messageId };
    }

    this.sendCustomMessage(payload);
  }

  sendCustomMessage(payload: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });

    this.http.post<ChatMessage>('http://localhost:8080/message/send', payload, { headers }).subscribe({
      next: (response) => {
        this.messages.push(response);
        this.resetMessageForm();
        this.replyingTo = null;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        alert(`Failed to send message: ${err.error?.message || err.message}`);
        console.error(err);
      }
    });
  }

  onMessageClick(message: ChatMessage) {
    this.replyingTo = message;
  }

  cancelReply() {
    this.replyingTo = null;
  }

  toggleMessageOptions() {
    this.showMessageOptions = !this.showMessageOptions;
  }

  selectMessageType(type: 'text' | 'image' | 'video' | 'document' | 'template') {
    this.messageType = type;
    this.showMessageOptions = false;
    this.resetMessageForm();
    this.messageType = type;
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  clearChat() {
    this.contact = null;
    this.messages = [];
    this.currentPage = 0;
    this.hasMore = true;
    this.replyingTo = null;
    this.resetMessageForm();
    this.showPreview = false;
    this.emitBackToSidebar();
  }

  getReplyText(messageId: string | undefined): string {
    if (!messageId) return 'Message';
    const msg = this.messages.find(m => m.messageId === messageId);
    return msg ? this.getMessagePreview(msg) : 'Message';
  }

  getReplyPreview(message: ChatMessage): string {
    return this.getMessagePreview(message);
  }

  getMessagePreview(message: ChatMessage): string {
    if (message.type === 'text' && message.textBody) {
      return this.truncateText(message.textBody);
    } else if (message.type === 'template' && message.templateBody) {
      return this.truncateText(message.templateBody);
    } else if (message.type === 'media' && message.caption) {
      return this.truncateText(message.caption);
    } else if (message.type === 'media') {
      return 'Media';
    }
    return 'Message';
  }

  truncateText(text: string, maxLength: number = 50): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getInitials(name: string | undefined): string {
    if (!name || name.trim() === '') return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2 && words[0] && words[1]) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, Math.min(2, name.length)).toUpperCase();
  }

  isRTL(text: string | undefined): boolean {
    if (!text) return false;
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return rtlRegex.test(text);
  }

  getStatusIcon(status: string | undefined): string {
    const icons: { [key: string]: string } = {
      'sent': '✓',
      'delivered': '✓✓',
      'read': '✓✓',
      'failed': '✗',
      'pending': '⏱'
    };
    return icons[status?.toLowerCase() || ''] || '•';
  }

  formatMessageTime(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  emitBackToSidebar() {
    this.backToSidebar.emit();
  }

  hasButtonVariables(button: ButtonDTO): boolean {
    return button.type === 'URL' && !!button.example && button.example.length > 0;
  }

  getDynamicButtons(): ButtonDTO[] {
    const buttonComponent = this.selectedTemplate?.components?.find(c => c.type === 'BUTTONS');
    return buttonComponent?.buttons || [];
  }

  hasPreviewContent(): boolean {
    return !!(
      (this.messageType === 'text' && this.newMessage) ||
      (this.messageType === 'image' && this.imageLink) ||
      (this.messageType === 'video' && this.videoLink) ||
      (this.messageType === 'document' && this.docLink) ||
      (this.messageType === 'template' && this.selectedTemplate)
    );
  }

  isPreviewRTL(): boolean {
    if (this.messageType === 'text' && this.newMessage) {
      return this.isRTL(this.newMessage);
    } else if (this.messageType === 'template' && this.selectedTemplate) {
      const headerText = this.formatHeaderText();
      const bodyText = this.formatBodyText();
      const footerText = this.getFooterText();
      return this.isRTL(headerText) || this.isRTL(bodyText) || this.isRTL(footerText);
    } else if (this.messageType === 'image' && this.imageCaption) {
      return this.isRTL(this.imageCaption);
    } else if (this.messageType === 'video' && this.videoCaption) {
      return this.isRTL(this.videoCaption);
    }
    return false;
  }

  formatHeaderText(): string {
    if (!this.headerComponent?.text) return 'Header Preview';
    let text = this.headerComponent.text;
    this.templateHeaderVariables.forEach((variable, index) => {
      text = text.replace(`{{${index + 1}}}`, variable || `{{${index + 1}}}`);
    });
    return text;
  }

  formatBodyText(): string {
    const bodyComponent = this.selectedTemplate?.components?.find(c => c.type === 'BODY');
    if (!bodyComponent?.text) return 'Body Preview';
    let text = bodyComponent.text;
    this.templateBodyVariables.forEach((variable, index) => {
      text = text.replace(`{{${index + 1}}}`, variable || `{{${index + 1}}}`);
    });
    return text;
  }

  getFooterText(): string {
    return this.footerText || '';
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  hasHeaderVariables(): boolean {
    return !!this.headerComponent && this.headerComponent.format === 'TEXT' && !!this.headerComponent.example?.header_text?.length;
  }

  hasHeaderMedia(): boolean {
    return !!this.headerComponent && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(this.headerComponent.format || '');
  }

  getMediaFileName(url: string): string {
    return url.split('/').pop() || 'Document';
  }
}
