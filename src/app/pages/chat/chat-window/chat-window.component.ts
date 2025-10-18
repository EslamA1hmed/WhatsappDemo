import { Component, Input, OnInit, OnChanges, AfterViewInit, SimpleChanges, ViewChild, ElementRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChatMessageService, ChatMessage, MessagePageResponse } from '../../../services/chat-message.service';
import { Contact } from '../../../services/contact.service';
import { AuthService } from '../../../services/auth.service';
import { WebSocketService } from '../../../services/websocket.service';
import { MediaService } from '../../../services/MediaService';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

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

export interface StatusDTO {
  status: string;
  messageId: string;
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
export class ChatWindowComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() contact: Contact | null = null;
  @Output() backToSidebar = new EventEmitter<void>();
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  messages: ChatMessage[] = [];
  loading = false;
  currentPage = 0;
  pageSize = 10;
  hasMore = true;
  newMessage = '';
  replyingTo: ChatMessage | null = null;
  private scrollSubject = new Subject<void>();

  @ViewChild('formPanelContainer') formPanelContainer!: ElementRef;
  private formPanelObserver?: MutationObserver;

  private messageSubscription?: Subscription;
  private statusSubscription?: Subscription;

  messageType: 'text' | 'image' | 'video' | 'document' | 'template' = 'text';
  showMessageOptions = false;
  showPreview = false;

  imageLink = '';
  imageCaption = '';
  videoLink = '';
  videoCaption = '';
  docLink = '';
  docFilename = '';

  // ✅ Local file upload properties
  selectedFile: File | null = null;
  localPreviewUrl: string = '';
  isUploading = false;
  uploadProgress = 0;
  uploadedMediaId: string = '';

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
    private authService: AuthService,
    private websocketService: WebSocketService,
    private mediaService: MediaService
  ) {
    this.scrollSubject.pipe(debounceTime(100)).subscribe(() => {
      this.handleScroll();
    });
  }

  ngOnInit() {
    if (this.contact) {
      this.initializeChat();
    }
  }

  ngAfterViewInit() {
    if (this.formPanelContainer) {
      this.setupFormPanelObserver();
    }
  }

  private setupFormPanelObserver() {
    const targetNode = this.formPanelContainer.nativeElement;
    const callback = (mutationsList: MutationRecord[], observer: MutationObserver) => {
      setTimeout(() => this.scrollToBottom(), 0);
    };
    this.formPanelObserver = new MutationObserver(callback);
    const config = { childList: true, subtree: true };
    this.formPanelObserver.observe(targetNode, config);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contact']) {
      const previousContact = changes['contact'].previousValue as Contact;
      const currentContact = changes['contact'].currentValue as Contact;

      if (previousContact) {
        this.websocketService.unsubscribeFromContact(previousContact.phoneNumber);
        this.cleanupSubscriptions();
      }

      if (currentContact) {
        this.clearAllData();
        setTimeout(() => {
          this.initializeChat();
        }, 50);
      }
    }
  }

  ngOnDestroy() {
    this.cleanupSubscriptions();
    if (this.contact) {
      this.websocketService.unsubscribeFromContact(this.contact.phoneNumber);
    }
    if (this.formPanelObserver) {
      this.formPanelObserver.disconnect();
    }
    this.cleanupLocalPreview();
  }

  private initializeChat() {
    if (!this.contact) return;
    console.log('Initializing chat for:', this.contact.phoneNumber);
    this.loadMessages();
    this.loadTemplateNames();
    this.setupWebSocketSubscriptions();
  }

  private clearAllData() {
    console.log('Clearing all data...');
    this.messages = [];
    this.currentPage = 0;
    this.hasMore = true;
    this.loading = false;
    this.replyingTo = null;
    this.showPreview = false;
    this.resetMessageForm();
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = 0;
    }
  }

  private setupWebSocketSubscriptions() {
    if (!this.contact) return;
    const phoneNumber = this.contact.phoneNumber;

    this.messageSubscription = this.websocketService
      .subscribeToMessages(phoneNumber)
      .subscribe((message) => {
        if (message) {
          console.log('Real-time message received:', message);
          this.handleIncomingMessage(message);
        }
      });

    this.statusSubscription = this.websocketService
      .subscribeToStatus(phoneNumber)
      .subscribe((status) => {
        if (status) {
          console.log('Status update received:', status);
          this.handleStatusUpdate(status);
        }
      });
  }

  private cleanupSubscriptions() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = undefined;
    }
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
      this.statusSubscription = undefined;
    }
  }

 // ✅ استبدل الدالة الحالية بهذه النسخة المحسّنة
private handleIncomingMessage(message: ChatMessage) {
    if (!this.contact) {
        return;
    }

    const currentPhone = this.contact.phoneNumber;
    const messagePhone = message.direction === 'RECEIVED' ? message.from : message.to;

    if (messagePhone !== currentPhone) {
        return;
    }

    // -- الخطوة 1: ابحث عن الرسالة وقم بتحديثها أو إضافتها --
    const existingMessageIndex = this.messages.findIndex(m => m.messageId === message.messageId);
    let messageToProcess: ChatMessage;

    if (existingMessageIndex > -1) {
        // إذا كانت الرسالة موجودة، قم بدمج البيانات الجديدة (هذا مهم للرسائل الصادرة)
        console.log('Updating existing message with data from WebSocket:', message);
        this.messages[existingMessageIndex] = { ...this.messages[existingMessageIndex], ...message };
        messageToProcess = this.messages[existingMessageIndex];
    } else {
        // إذا كانت رسالة جديدة، قم بإضافتها
        console.log('Adding new message from WebSocket');
        messageToProcess = message;
        this.messages.push(messageToProcess);
        if (message.direction === 'RECEIVED') {
            this.markCurrentChatAsRead();
            this.playNotificationSound();
        }
        setTimeout(() => this.scrollToBottom(), 50);
    }
    
    // -- الخطوة 2 (الأهم): قم بتشغيل تحميل الصورة للرسالة الجديدة/المحدثة --
    if (messageToProcess.mediaId && !messageToProcess.mediaUrl && (messageToProcess.type === 'image' || messageToProcess.type === 'video')) {
        console.log(`Triggering lazy-load for real-time message ID: ${messageToProcess.messageId}`);
        
        this.mediaService.downloadMediaAsBlob(messageToProcess.mediaId).subscribe({
            next: (blobUrl) => {
                // ابحث عن الرسالة مرة أخرى للتأكد من أنها لا تزال موجودة
                const msg = this.messages.find(m => m.messageId === messageToProcess.messageId);
                if (msg) {
                    msg.mediaUrl = blobUrl; // ✅ هنا يتم تحميل الصورة الكاملة
                    this.messages = [...this.messages]; // لتحديث الواجهة
                }
            },
            error: (err) => {
                console.error('Failed to lazy-load media for real-time message:', err);
                const msg = this.messages.find(m => m.messageId === messageToProcess.messageId);
                if (msg) {
                    // يمكنك إضافة خاصية للخطأ إذا أردت
                }
            }
        });
    }

    // قم بتحديث القائمة لتفعيل التغييرات في الواجهة
    this.messages = [...this.messages];
}

  private markCurrentChatAsRead() {
    if (!this.contact) return;
    this.messageService.markMessagesAsRead(this.contact.phoneNumber).subscribe({
      next: () => console.log(`Auto-marked messages as read for ${this.contact?.phoneNumber}`),
      error: (err) => console.error('Failed to auto-mark messages as read:', err)
    });
  }

  private handleStatusUpdate(status: StatusDTO) {
    const message = this.messages.find(m => m.messageId === status.messageId);
    if (message) {
      message.status = status.status;
      this.messages = [...this.messages];
    }
  }

  private playNotificationSound() {
    try {
      const audio = new Audio('assets/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(err => console.log('Could not play sound:', err));
    } catch (error) {
      console.log('Notification sound not available');
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByButtonIndex(index: number, item: ButtonDTO): string {
    return `${item.type}-${index}`;
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.messageId;
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
              const dynamicButtons = buttonComponent.buttons.filter(b => (b.type === 'URL' && b.example && b.example.length > 0) || (b.type === 'OTP' && b.otp_type === 'ONE_TAP'));
              this.templateButtonValues = new Array(dynamicButtons.length).fill('');
              this.oneTapParams = buttonComponent.buttons.map(b => b.type === 'OTP' && b.otp_type === 'ONE_TAP' ? { autofillText: b.autofill_text || 'Autofill', packageName: b.package_name || '', signatureHash: b.signature_hash || '' } : { autofillText: '', packageName: '', signatureHash: '' });
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

  closeFormPanel() {
    this.selectMessageType('text');
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
    this.cleanupLocalPreview();
  }

  // ✅ File upload methods
  triggerFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.cleanupLocalPreview();

    // Validate file type
    if (!this.mediaService.validateFileType(file, this.messageType as any)) {
      alert(`Invalid file type for ${this.messageType}. Please select a valid file.`);
      input.value = '';
      return;
    }

    // Validate file size
    if (!this.mediaService.validateFileSize(file)) {
      alert('File size exceeds 16MB limit');
      input.value = '';
      return;
    }

    this.selectedFile = file;
    this.localPreviewUrl = this.mediaService.createPreviewUrl(file);
    
    // Auto-fill filename for documents
    if (this.messageType === 'document') {
      this.docFilename = file.name;
    }

    setTimeout(() => this.scrollToBottom(), 100);
    input.value = '';
  }

  private cleanupLocalPreview() {
    if (this.localPreviewUrl) {
      this.mediaService.revokePreviewUrl(this.localPreviewUrl);
      this.localPreviewUrl = '';
    }
    this.selectedFile = null;
    this.isUploading = false;
    this.uploadProgress = 0;
    this.uploadedMediaId = '';
  }

  removeSelectedFile() {
    this.cleanupLocalPreview();
  }

  getFileSize(): string {
    if (!this.selectedFile) return '';
    return this.mediaService.formatFileSize(this.selectedFile.size);
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

  hasReplyContext(message: ChatMessage): boolean {
    return !!(message.contextMessageId &&
      message.contextMessageId.trim() &&
      this.messages.some(m => m.messageId === message.contextMessageId));
  }

 loadMessages() {
  if (!this.contact || this.loading) return;

  this.loading = true;
  const previousScrollHeight = this.messagesContainer?.nativeElement.scrollHeight || 0;
  const previousScrollTop = this.messagesContainer?.nativeElement.scrollTop || 0;
  const currentContactPhone = this.contact.phoneNumber;
  const isInitialLoad = this.currentPage === 0;

  this.messageService.getMessagesByContact(this.contact.phoneNumber, this.currentPage, this.pageSize).subscribe({
    next: (response: MessagePageResponse) => {
      if (!this.contact || this.contact.phoneNumber !== currentContactPhone) {
        console.log('Contact changed during load, ignoring response');
        this.loading = false;
        return;
      }

      const newMessages = response.content;

      // ✅ Mark messages with mediaId as loading
      newMessages.forEach(message => {
        if (message.mediaId && !message.mediaUrl) {
          message.mediaLoading = true; // ✅ Add loading flag
        }
      });

      if (isInitialLoad) {
        this.messages = [...newMessages].reverse();
        setTimeout(() => this.scrollToBottom(), 0);
      } else {
        this.messages = [...newMessages.reverse(), ...this.messages];
        setTimeout(() => {
          const newScrollHeight = this.messagesContainer?.nativeElement.scrollHeight || 0;
          this.messagesContainer.nativeElement.scrollTop = newScrollHeight - previousScrollHeight + previousScrollTop;
        }, 50);
      }

      this.hasMore = !response.last && response.content.length > 0;
      this.loading = false;

      // ✅ Load media URLs asynchronously (after messages are displayed)
      newMessages.forEach(message => {
        if (message.mediaId && !message.mediaUrl) {
          this.mediaService.downloadMediaAsBlob(message.mediaId).subscribe({
            next: (blobUrl) => {
              const msg = this.messages.find(m => m.messageId === message.messageId);
              if (msg) {
                msg.mediaUrl = blobUrl;
                msg.mediaLoading = false; // ✅ Remove loading flag
                this.messages = [...this.messages]; // Force update
              }
            },
            error: (err) => {
              console.error('Failed to load media:', err);
              const msg = this.messages.find(m => m.messageId === message.messageId);
              if (msg) {
                msg.mediaLoading = false;
              }
            }
          });
        }
      });

      if (isInitialLoad) {
        this.checkAndLoadMore();
      }
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
        response.status = 'sent';
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
    if (!this.contact) return;

    // ✅ Check if we have uploaded media ID or need to upload
    if (this.uploadedMediaId) {
      this.sendMediaWithId('image', this.uploadedMediaId, this.imageCaption);
    } else if (this.selectedFile) {
      this.uploadAndSendMedia('image');
    } else if (this.imageLink) {
      this.sendMediaWithLink('image', this.imageLink, this.imageCaption);
    } else {
      alert('Please select a file or provide an image link');
    }
  }

  sendVideoMessage() {
    if (!this.contact) return;

    if (this.uploadedMediaId) {
      this.sendMediaWithId('video', this.uploadedMediaId, this.videoCaption);
    } else if (this.selectedFile) {
      this.uploadAndSendMedia('video');
    } else if (this.videoLink) {
      this.sendMediaWithLink('video', this.videoLink, this.videoCaption);
    } else {
      alert('Please select a file or provide a video link');
    }
  }

  sendDocumentMessage() {
    if (!this.contact) return;

    if (this.uploadedMediaId) {
      this.sendMediaWithId('document', this.uploadedMediaId, this.docFilename);
    } else if (this.selectedFile) {
      this.uploadAndSendMedia('document');
    } else if (this.docLink) {
      this.sendMediaWithLink('document', this.docLink, this.docFilename);
    } else {
      alert('Please select a file or provide a document link');
    }
  }

  // ✅ Upload file and send with media ID
  private uploadAndSendMedia(type: 'image' | 'video' | 'document') {
    if (!this.selectedFile || !this.contact) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    this.mediaService.uploadMedia(this.selectedFile, type).subscribe({
      next: (response) => {
        this.uploadProgress = 100;
        this.uploadedMediaId = response.id;
        
        console.log('✅ Media uploaded successfully:', response);
        console.log('📦 Media ID:', response.id);
        
        const caption = type === 'image' ? this.imageCaption : 
                       type === 'video' ? this.videoCaption : 
                       this.docFilename;
        
        // ✅ Send using media ID
        this.sendMediaWithId(type, response.id, caption);
      },
      error: (err) => {
        this.isUploading = false;
        alert(`Failed to upload ${type}: ${err.error?.message || err.message}`);
        console.error(err);
      }
    });
  }

  // ✅ Send media using media ID (from upload)
  private sendMediaWithId(type: 'image' | 'video' | 'document', mediaId: string, caption?: string) {
    if (!this.contact) return;

    const payload: any = {
      messaging_product: 'whatsapp',
      to: this.contact.phoneNumber,
      type: type,
      [type]: { id: mediaId }
    };

    if (caption && (type === 'image' || type === 'video')) {
      payload[type].caption = caption;
    }

    if (type === 'document' && caption) {
      payload.document.filename = caption;
    }

    if (this.replyingTo) {
      payload.context = { message_id: this.replyingTo.messageId };
    }

    console.log('📤 Sending media with ID:', payload);
    this.sendCustomMessage(payload);
  }

  // ✅ Send media using direct link
  private sendMediaWithLink(type: 'image' | 'video' | 'document', link: string, caption?: string) {
    if (!this.contact) return;

    const payload: any = {
      messaging_product: 'whatsapp',
      to: this.contact.phoneNumber,
      type: type,
      [type]: { link: link }
    };

    if (caption && (type === 'image' || type === 'video')) {
      payload[type].caption = caption;
    }

    if (type === 'document' && caption) {
      payload.document.filename = caption;
    }

    if (this.replyingTo) {
      payload.context = { message_id: this.replyingTo.messageId };
    }

    console.log('📤 Sending media with link:', payload);
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
        response.status = 'sent';
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
    console.log('Clicked message:', message);
    this.replyingTo = message;
    setTimeout(() => this.scrollToBottom(), 0);
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
    if (type !== 'text') {
      setTimeout(() => this.scrollToBottom(), 0);
    }
    if (type === 'text') {
      this.resetMessageForm();
    }
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  clearChat() {
    if (this.contact) {
      this.websocketService.unsubscribeFromContact(this.contact.phoneNumber);
    }
    this.cleanupSubscriptions();
    this.clearAllData();
    this.contact = null;
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
    if (!message) return 'Message';
    if (message.type === 'text' && message.textBody) {
      return this.truncateText(message.textBody);
    } else if (message.type === 'template' && message.templateBody) {
      return this.truncateText(message.templateBody);
    } else if (message.type === 'media' && message.caption) {
      return this.truncateText(message.caption);
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
      (this.messageType === 'image' && (this.imageLink || this.selectedFile)) ||
      (this.messageType === 'video' && (this.videoLink || this.selectedFile)) ||
      (this.messageType === 'document' && (this.docLink || this.selectedFile)) ||
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

  getPreviewUrl(): string {
    return this.localPreviewUrl || 
           (this.messageType === 'image' ? this.imageLink : 
            this.messageType === 'video' ? this.videoLink : 
            this.docLink);
  }

  getPreviewCaption(): string {
    return this.messageType === 'image' ? this.imageCaption :
           this.messageType === 'video' ? this.videoCaption :
           this.docFilename;
  }
}