// src/app/models/chat.types.ts

export interface Contact {
  id: number;
  phoneNumber: string;
  name: string;
  createdAt?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: number;
  messageId: string;
  direction: 'SENT' | 'RECEIVED';
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  to: string;
  from: string;
  type: 'text' | 'image' | 'video' | 'document' | 'template';
  textBody?: string;
  
  // Template fields
  templateName?: string;
  templateBody?: string;
  templateHeader?: string;
  templateFooter?: string;
  
  // Media fields
  mediaId?: string;
  mimeType?: string;
  mediaUrl?: string;
  caption?: string;
  filename?: string;
  
  // Context (Reply) fields
  contextMessageId?: string;
  contextFrom?: string;
  
  // Buttons
  buttons?: MessageButton[];
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
}

export interface MessageButton {
  type: 'quick_reply' | 'url' | 'call';
  text: string;
  payload?: string;
  url?: string;
  phoneNumber?: string;
}

export interface MessagePageResponse {
  content: ChatMessage[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  empty: boolean;
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
    components?: TemplateComponent[];
  };
  media?: {
    id?: string;
    link?: string;
    caption?: string;
  };
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'footer' | 'button';
  parameters?: TemplateParameter[];
  sub_type?: string;
  index?: number;
}

export interface TemplateParameter {
  type: 'text' | 'image' | 'document' | 'video';
  text?: string;
  image?: MediaObject;
  document?: MediaObject;
  video?: MediaObject;
}

export interface MediaObject {
  id?: string;
  link?: string;
  caption?: string;
  filename?: string;
}

export interface AddContactRequest {
  phoneNumber: string;
  name: string;
}

export interface ContactListResponse {
  content: Contact[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// Message Status Enum
export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

// Message Direction Enum
export enum MessageDirection {
  SENT = 'SENT',
  RECEIVED = 'RECEIVED'
}

// Message Type Enum
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  TEMPLATE = 'template',
  AUDIO = 'audio',
  LOCATION = 'location',
  CONTACTS = 'contacts'
}

// Chat Event Types للـ WebSocket (مستقبلاً)
export interface ChatEvent {
  type: 'message' | 'status_update' | 'typing' | 'online' | 'offline';
  data: any;
  timestamp: string;
}

export interface TypingEvent {
  contactId: number;
  phoneNumber: string;
  isTyping: boolean;
}

export interface StatusUpdateEvent {
  messageId: string;
  status: MessageStatus;
  timestamp: string;
}

// UI State Interfaces
export interface ChatUIState {
  selectedContact: Contact | null;
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;
  error: string | null;
}

export interface SidebarUIState {
  searchTerm: string;
  showAddContact: boolean;
  isLoading: boolean;
  error: string | null;
}

// Filter & Sort Options
export interface MessageFilter {
  contactId?: number;
  phoneNumber?: string;
  type?: MessageType;
  status?: MessageStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ContactFilter {
  searchTerm?: string;
  hasMessages?: boolean;
  sortBy?: 'name' | 'lastMessage' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Utility Types
export type MessageStatusIcon = '✓' | '✓✓' | '👁️' | '✗' | '⏱';

export interface MessageGroup {
  date: string;
  messages: ChatMessage[];
}

// API Response Wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
  path: string;
}