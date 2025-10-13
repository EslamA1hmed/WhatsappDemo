// src/app/constants/chat.constants.ts

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    CONTACTS: '/contacts',
    MESSAGES: '/messages',
    MEDIA: '/media',
    TEMPLATES: '/templates'
  },
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  CONTACTS_PAGE_SIZE: 100,
  MESSAGES_PAGE_SIZE: 20,
  INITIAL_PAGE: 0
};

/**
 * Message status icons
 */
export const MESSAGE_STATUS_ICONS = {
  SENT: '✓',
  DELIVERED: '✓✓',
  READ: '✓✓',
  FAILED: '✗',
  PENDING: '⏱'
} as const;

/**
 * Message status colors
 */
export const MESSAGE_STATUS_COLORS = {
  SENT: '#9E9E9E',
  DELIVERED: '#25D366',
  READ: '#34B7F1',
  FAILED: '#c62828',
  PENDING: '#e65100'
} as const;

/**
 * Message type icons
 */
export const MESSAGE_TYPE_ICONS = {
  TEXT: '💬',
  IMAGE: '📷',
  VIDEO: '🎥',
  DOCUMENT: '📄',
  AUDIO: '🎵',
  TEMPLATE: '📋',
  LOCATION: '📍',
  CONTACT: '👤'
} as const;

/**
 * Supported media types
 */
export const MEDIA_TYPES = {
  IMAGE: {
    MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  VIDEO: {
    MIME_TYPES: ['video/mp4', 'video/mpeg', 'video/quicktime'],
    MAX_SIZE: 16 * 1024 * 1024, // 16MB
    EXTENSIONS: ['.mp4', '.mpeg', '.mov']
  },
  DOCUMENT: {
    MIME_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
  },
  AUDIO: {
    MIME_TYPES: ['audio/mpeg', 'audio/ogg', 'audio/wav'],
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    EXTENSIONS: ['.mp3', '.ogg', '.wav']
  }
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 350,
  MESSAGE_MAX_WIDTH: '65%',
  AVATAR_SIZE: 45,
  SCROLL_THRESHOLD: 50,
  DEBOUNCE_DELAY: 300,
  AUTO_SCROLL_DELAY: 100,
  TYPING_INDICATOR_DELAY: 1000
};

/**
 * Colors
 */
export const COLORS = {
  PRIMARY: '#B00000',
  PRIMARY_DARK: '#E60000',
  SECONDARY: '#25D366',
  BACKGROUND: '#F5F5F5',
  WHITE: '#FFFFFF',
  TEXT_PRIMARY: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  BORDER: '#E0E0E0',
  SENT_BUBBLE: '#DCF8C6',
  RECEIVED_BUBBLE: '#FFFFFF',
  ERROR: '#DC3545',
  SUCCESS: '#25D366',
  WARNING: '#E65100'
};

/**
 * Validation rules
 */
export const VALIDATION = {
  PHONE_NUMBER: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    PATTERN: /^[0-9]{10,15}$/
  },
  CONTACT_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\u0600-\u06FF\s]+$/
  },
  MESSAGE_TEXT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 4096
  },
  CAPTION: {
    MAX_LENGTH: 1024
  }
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_PHONE: 'Invalid phone number format.',
  INVALID_NAME: 'Invalid contact name.',
  MESSAGE_TOO_LONG: 'Message is too long.',
  FILE_TOO_LARGE: 'File size exceeds limit.',
  UNSUPPORTED_FILE: 'Unsupported file type.',
  CONTACT_EXISTS: 'Contact already exists.',
  CONTACT_NOT_FOUND: 'Contact not found.',
  MESSAGE_SEND_FAILED: 'Failed to send message.',
  LOAD_MESSAGES_FAILED: 'Failed to load messages.',
  LOAD_CONTACTS_FAILED: 'Failed to load contacts.',
  DELETE_CONTACT_FAILED: 'Failed to delete contact.'
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message sent successfully',
  CONTACT_ADDED: 'Contact added successfully',
  CONTACT_DELETED: 'Contact deleted successfully',
  TEXT_COPIED: 'Text copied to clipboard'
};

/**
 * Placeholders
 */
export const PLACEHOLDERS = {
  SEARCH_CONTACTS: '🔍 Search contacts...',
  TYPE_MESSAGE: 'Type a message...',
  PHONE_NUMBER: 'Phone Number',
  CONTACT_NAME: 'Name',
  NO_CONTACTS: 'No contacts found',
  NO_MESSAGES: 'No messages yet',
  START_CONVERSATION: 'Start a conversation'
};

/**
 * Animations
 */
export const ANIMATIONS = {
  FADE_IN: 'fadeIn 0.3s ease',
  SLIDE_UP: 'slideUp 0.3s ease',
  SLIDE_DOWN: 'slideDown 0.3s ease',
  SCALE_IN: 'scaleIn 0.2s ease'
};

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  SEND_MESSAGE: 'Enter',
  NEW_LINE: 'Shift+Enter',
  SEARCH: 'Ctrl+F',
  ESCAPE: 'Escape'
};

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_PREFERENCES: 'user_preferences',
  DRAFT_MESSAGES: 'draft_messages',
  SELECTED_CONTACT: 'selected_contact'
};

/**
 * Date/Time formats
 */
export const DATE_FORMATS = {
  MESSAGE_TIME: { hour: '2-digit', minute: '2-digit', hour12: true },
  MESSAGE_DATE: { month: 'short', day: 'numeric' },
  FULL_DATE: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  SHORT_DATE: { month: 'numeric', day: 'numeric', year: 'numeric' }
} as const;

/**
 * Regular expressions
 */
export const REGEX = {
  RTL_CHARS: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF]/,
  PHONE_NUMBER: /^[+]?[0-9]{10,15}$/,
  URL: /(https?:\/\/[^\s]+)/g,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMOJI: /[\u{1F600}-\u{1F64F}]/gu,
  TEMPLATE_VAR: /\{\{(\d+)\}\}/g
};

/**
 * WhatsApp Business API limits
 */
export const WHATSAPP_LIMITS = {
  MESSAGE_LENGTH: 4096,
  CAPTION_LENGTH: 1024,
  BUTTONS_MAX: 3,
  QUICK_REPLIES_MAX: 10,
  LIST_ITEMS_MAX: 10,
  TEMPLATE_PARAMS_MAX: 10
};

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 5000,
  BACKOFF_MULTIPLIER: 2
};

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
  ENABLE_VOICE_MESSAGES: false,
  ENABLE_GROUP_CHAT: false,
  ENABLE_VIDEO_CALL: false,
  ENABLE_REACTIONS: false,
  ENABLE_STORIES: false,
  ENABLE_WEBSOCKET: false
};

/**
 * Notification settings
 */
export const NOTIFICATION_CONFIG = {
  ENABLED: true,
  SOUND: true,
  VIBRATE: true,
  DURATION: 5000
};