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
import { HostListener } from '@angular/core';
import { EMOJI_CATEGORIES, EmojiCategory } from './emoji-data';


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
  // Inputs and Outputs
  @Input() contact: Contact | null = null;
  @Output() backToSidebar = new EventEmitter<void>();

  // ViewChild References
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('formPanelContainer') formPanelContainer!: ElementRef;


  // Message State
  messages: ChatMessage[] = [];
  loading = false;
  currentPage = 0;
  pageSize = 10;
  hasMore = true;
  newMessage = '';
  replyingTo: ChatMessage | null = null;

  // Recording State
  isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  recordedAudioUrl: string | null = null;
  recordedAudioFile: File | null = null;
  recordingTime = 0;
  private recordingInterval: any;

  audioStates: Map<string, {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    progress: number;
  }> = new Map();

  // Audio Element References
  private audioElements: Map<string, HTMLAudioElement> = new Map();

  // Message Type and Options
  messageType: 'text' | 'image' | 'video' | 'document' | 'template' | 'audio' = 'text';
  showMessageOptions = false;
  showPreview = false;

  // Media Upload Properties
  selectedFile: File | null = null;
  localPreviewUrl: string = '';
  isUploading = false;
  uploadProgress = 0;
  uploadedMediaId: string = '';

  // Media Links and Captions
  imageLink = '';
  imageCaption = '';
  videoLink = '';
  videoCaption = '';
  docLink = '';
  docFilename = '';

  // Template Properties
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

  // Subscriptions and Observers
  private scrollSubject = new Subject<void>();
  private formPanelObserver?: MutationObserver;
  private messageSubscription?: Subscription;
  private statusSubscription?: Subscription;

  @ViewChild('messageInput') messageInput!: ElementRef<HTMLInputElement>;

  showEmojiPicker = false;
  emojiCategories = EMOJI_CATEGORIES;
  selectedEmojiCategory: EmojiCategory = this.emojiCategories[0];
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

  // Lifecycle Hooks
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
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.audioElements.clear();
    this.audioStates.clear();
  }

  // Initialization Methods
  private initializeChat() {
    if (!this.contact) return;
    console.log('Initializing chat for:', this.contact.phoneNumber);
    this.loadMessages();
    this.loadTemplateNames();
    this.setupWebSocketSubscriptions();
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
  
  // Message Handling
  private handleIncomingMessage(message: ChatMessage) {
    if (!this.contact) return;

    const currentPhone = this.contact.phoneNumber;
    const messagePhone = message.direction === 'RECEIVED' ? message.from : message.to;

    if (messagePhone !== currentPhone) return;

    const existingMessageIndex = this.messages.findIndex(m => m.messageId === message.messageId);
    let messageToProcess: ChatMessage;

    if (existingMessageIndex > -1) {
      console.log('Updating existing message with data from WebSocket:', message);
      this.messages[existingMessageIndex] = { ...this.messages[existingMessageIndex], ...message };
      messageToProcess = this.messages[existingMessageIndex];
    } else {
      console.log('Adding new message from WebSocket');
      messageToProcess = message;
      this.messages.push(messageToProcess);

      // ✅ Initialize audio state for new audio messages
      if (messageToProcess.type === 'audio') {
        this.initAudioState(messageToProcess.messageId);
      }

      if (message.direction === 'RECEIVED') {
        this.markCurrentChatAsRead();
        this.playNotificationSound();
      }
      setTimeout(() => this.scrollToBottom(), 50);
    }

    if (messageToProcess.mediaId && !messageToProcess.mediaUrl &&
      (messageToProcess.type === 'image' || messageToProcess.type === 'video' ||
        messageToProcess.type === 'document' || messageToProcess.type === 'audio')) {
      console.log(`Triggering lazy-load for real-time message ID: ${messageToProcess.messageId}`);
      this.mediaService.downloadMediaAsBlob(messageToProcess.mediaId).subscribe({
        next: (blobUrl) => {
          const msg = this.messages.find(m => m.messageId === messageToProcess.messageId);
          if (msg) {
            msg.mediaUrl = blobUrl;

            // ✅ Initialize audio state when media URL is loaded
            if (msg.type === 'audio') {
              this.initAudioState(msg.messageId);
            }

            this.messages = [...this.messages];
          }
        },
        error: (err) => {
          console.error('Failed to lazy-load media for real-time message:', err);
        }
      });
    }

    this.messages = [...this.messages];
  }

  private handleStatusUpdate(status: StatusDTO) {
    const message = this.messages.find(m => m.messageId === status.messageId);
    if (message) {
      message.status = status.status;
      this.messages = [...this.messages];
    }
  }

  private markCurrentChatAsRead() {
    if (!this.contact) return;
    this.messageService.markMessagesAsRead(this.contact.phoneNumber).subscribe({
      next: () => console.log(`Auto-marked messages as read for ${this.contact?.phoneNumber}`),
      error: (err) => console.error('Failed to auto-mark messages as read:', err)
    });
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
      newMessages.forEach(message => {
        if (message.mediaId && !message.mediaUrl) {
          message.mediaLoading = true;
        }
        
        // ✅ Initialize audio state for audio messages
        if (message.type === 'audio') {
          this.initAudioState(message.messageId);
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

      newMessages.forEach(message => {
        if (message.mediaId && !message.mediaUrl) {
          this.mediaService.downloadMediaAsBlob(message.mediaId).subscribe({
            next: (blobUrl) => {
              const msg = this.messages.find(m => m.messageId === message.messageId);
              if (msg) {
                console.log(`[loadMessages] Successfully loaded media for message ID: ${msg.messageId}, Type: ${msg.type}`);
                msg.mediaUrl = blobUrl;
                msg.mediaLoading = false;
                
                // ✅ Ensure audio state is initialized
                if (msg.type === 'audio') {
                  this.initAudioState(msg.messageId);
                }
                
                this.messages = [...this.messages];
              }
            },
            error: (err) => {
              console.error(`[loadMessages] Failed to load media for message ID: ${message.messageId}`, err);
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

  // Recording Methods
  async startRecording() {
    if (this.isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.isRecording = true;
      this.audioChunks = [];
      const options = { mimeType: 'audio/ogg; codecs=opus' };
      try {
        this.mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        console.warn('ogg/opus not supported, trying default');
        this.mediaRecorder = new MediaRecorder(stream);
      }

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/ogg' });
        this.recordedAudioUrl = URL.createObjectURL(audioBlob);
        this.recordedAudioFile = new File([audioBlob], `recording-${Date.now()}.ogg`, { type: audioBlob.type });
        this.isRecording = false;
        clearInterval(this.recordingInterval);
        this.recordingTime = 0;
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.startRecordingTimer();
      console.log('Recording started');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please grant permission.');
      this.isRecording = false;
    }
  }

  stopRecording() {
    if (!this.mediaRecorder || !this.isRecording) return;
    this.mediaRecorder.stop();
    console.log('Recording stopped');
  }

  startRecordingTimer() {
    this.recordingTime = 0;
    this.recordingInterval = setInterval(() => {
      this.recordingTime++;
    }, 1000);
  }
  getAudioState(messageId: string) {
    this.initAudioState(messageId);
    return this.audioStates.get(messageId);
  }
  discardRecording() {
    // Stop and cleanup preview audio
    const previewAudio = this.audioElements.get('preview');
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    }

    // Clear preview state
    this.audioStates.delete('preview');
    this.audioElements.delete('preview');

    // Cleanup URLs
    if (this.recordedAudioUrl) {
      URL.revokeObjectURL(this.recordedAudioUrl);
    }

    this.recordedAudioUrl = null;
    this.recordedAudioFile = null;
    this.audioChunks = [];
    this.isRecording = false;

    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
    }
    this.recordingTime = 0;
  }

  sendRecording() {
    if (!this.recordedAudioFile || !this.contact) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    this.mediaService.uploadMedia(this.recordedAudioFile, 'audio').subscribe({
      next: (response) => {
        this.uploadProgress = 100;
        console.log('✅ Audio uploaded successfully:', response);
        this.sendMediaWithId('audio', response.id);
        this.discardRecording();
      },
      error: (err) => {
        this.isUploading = false;
        alert(`Failed to upload audio: ${err.error?.message || err.message}`);
        console.error(err);
        this.discardRecording();
      }
    });
  }
  initAudioState(messageId: string): void {
    if (!this.audioStates.has(messageId)) {
      this.audioStates.set(messageId, {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        progress: 0
      });
    }
  }

  // تشغيل/إيقاف الـ audio
  toggleAudio(messageId: string, audioElement: HTMLAudioElement): void {
    this.initAudioState(messageId);
    const state = this.audioStates.get(messageId)!;

    if (state.isPlaying) {
      audioElement.pause();
      state.isPlaying = false;
    } else {
      // إيقاف أي audio آخر قيد التشغيل
      this.audioElements.forEach((el, id) => {
        if (id !== messageId && !el.paused) {
          el.pause();
          const otherState = this.audioStates.get(id);
          if (otherState) {
            otherState.isPlaying = false;
          }
        }
      });

      audioElement.play();
      state.isPlaying = true;
    }

    this.audioStates = new Map(this.audioStates);
  }

  // تحديث وقت التشغيل
  onAudioTimeUpdate(messageId: string, audioElement: HTMLAudioElement): void {
    const state = this.audioStates.get(messageId);
    if (state) {
      state.currentTime = audioElement.currentTime;
      state.duration = audioElement.duration || 0;
      state.progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
      this.audioStates = new Map(this.audioStates);
    }
  }

  // عند انتهاء التشغيل
  onAudioEnded(messageId: string): void {
    const state = this.audioStates.get(messageId);
    if (state) {
      state.isPlaying = false;
      state.currentTime = 0;
      state.progress = 0;
      this.audioStates = new Map(this.audioStates);
    }
  }

  // تحميل البيانات الأساسية للـ audio
  onAudioLoadedMetadata(messageId: string, audioElement: HTMLAudioElement): void {
    this.initAudioState(messageId);
    const state = this.audioStates.get(messageId)!;
    state.duration = audioElement.duration || 0;
    this.audioElements.set(messageId, audioElement);
    this.audioStates = new Map(this.audioStates);
  }

  // تحويل الثواني إلى دقائق:ثواني
  formatAudioTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // تغيير موضع التشغيل عند الضغط على الـ progress bar
  seekAudio(messageId: string, event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;

    const audioElement = this.audioElements.get(messageId);
    const state = this.audioStates.get(messageId);

    if (audioElement && state && state.duration > 0) {
      const newTime = percent * state.duration;
      audioElement.currentTime = newTime;
      state.currentTime = newTime;
      state.progress = percent * 100;
      this.audioStates = new Map(this.audioStates);
    }
  }
 toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    if (this.showEmojiPicker) {
      this.showMessageOptions = false; // أغلق قائمة المرفقات
    }
  }

  // دالة اختيار قسم الإيموجي
  selectEmojiCategory(category: EmojiCategory) {
    this.selectedEmojiCategory = category;
  }

  // دالة إضافة الإيموجي (بنفس المنطق القديم للـ cursor)
  addEmoji(emoji: string) {
    if (this.messageType !== 'text') {
      this.messageType = 'text'; // تأكد أننا في وضع النص
    }

    if (this.messageInput) {
      const input = this.messageInput.nativeElement;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      
      this.newMessage = 
        this.newMessage.substring(0, start) + 
        emoji + 
        this.newMessage.substring(end);

      // تحريك المؤشر إلى ما بعد الإيموجي
      setTimeout(() => {
        const newPos = start + emoji.length;
        input.selectionStart = newPos;
        input.selectionEnd = newPos;
        input.focus();
      }, 0);

    } else {
      this.newMessage += emoji;
    }
  }

  // دالة لإغلاق المنتقي عند الضغط خارجه
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    
    // ابحث عن العناصر عن طريق الـ class
    const emojiPicker = document.querySelector('.manual-emoji-picker');
    const emojiButton = document.querySelector('.emoji-btn');

    // إذا كان الكليك خارج المنتقي وخارج الزر، قم بالإغلاق
    if (emojiPicker && !emojiPicker.contains(target) && 
        emojiButton && !emojiButton.contains(target)) {
      this.showEmojiPicker = false;
    }
  }

  // Media Handling
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

    if (!this.mediaService.validateFileType(file, this.messageType as any)) {
      alert(`Invalid file type for ${this.messageType}. Please select a valid file.`);
      input.value = '';
      return;
    }

    if (!this.mediaService.validateFileSize(file)) {
      alert('File size exceeds 16MB limit');
      input.value = '';
      return;
    }

    this.selectedFile = file;
    this.localPreviewUrl = this.mediaService.createPreviewUrl(file);

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

  // Message Sending
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
    } else if (this.messageType === 'audio') {
      this.sendAudioMessage();
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

  sendAudioMessage() {
    if (!this.contact) return;
    if (this.uploadedMediaId) {
      this.sendMediaWithId('audio', this.uploadedMediaId);
    } else if (this.selectedFile) {
      this.uploadAndSendMedia('audio');
    } else {
      alert('Please select an audio file or record a voice message.');
    }
  }

  private uploadAndSendMedia(type: 'image' | 'video' | 'document' | 'audio') {
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

        this.sendMediaWithId(type, response.id, caption);
      },
      error: (err) => {
        this.isUploading = false;
        alert(`Failed to upload ${type}: ${err.error?.message || err.message}`);
        console.error(err);
      }
    });
  }

  private sendMediaWithId(type: 'image' | 'video' | 'document' | 'audio', mediaId: string, caption?: string) {
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

  // Template Handling
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
                (b.type === 'OTP' && b.otp_type === 'ONE_TAP'));
              this.templateButtonValues = new Array(dynamicButtons.length).fill('');
              this.oneTapParams = buttonComponent.buttons.map(b =>
                b.type === 'OTP' && b.otp_type === 'ONE_TAP' ?
                  { autofillText: b.autofill_text || 'Autofill', packageName: b.package_name || '', signatureHash: b.signature_hash || '' } :
                  { autofillText: '', packageName: '', signatureHash: '' });
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

  // UI Interaction Methods
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
    // (اختياري) أغلق منتقي الإيموجي لو كان مفتوحاً
    if (this.showMessageOptions) {
      this.showEmojiPicker = false;
    }
  }

  selectMessageType(type: 'text' | 'image' | 'video' | 'document' | 'template' | 'audio') {
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

  clearChat() {
    if (this.contact) {
      this.websocketService.unsubscribeFromContact(this.contact.phoneNumber);
    }
    this.cleanupSubscriptions();
    this.clearAllData();
    this.contact = null;
    this.emitBackToSidebar();
  }

  emitBackToSidebar() {
    this.backToSidebar.emit();
  }

  // Utility Methods
  hasContentForNonTextType(): boolean {
    return !!(
      (this.messageType === 'image' && (this.imageLink || this.selectedFile)) ||
      (this.messageType === 'video' && (this.videoLink || this.selectedFile)) ||
      (this.messageType === 'document' && (this.docLink || this.selectedFile)) ||
      (this.messageType === 'template' && this.selectedTemplate) ||
      (this.messageType === 'audio' && this.selectedFile)
    );
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

  hasReplyContext(message: ChatMessage): boolean {
    return !!(message.contextMessageId &&
      message.contextMessageId.trim() &&
      this.messages.some(m => m.messageId === message.contextMessageId));
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