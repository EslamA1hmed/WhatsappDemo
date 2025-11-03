"use strict";
// src/app/constants/chat.constants.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_CONFIG = exports.FEATURE_FLAGS = exports.RETRY_CONFIG = exports.WHATSAPP_LIMITS = exports.REGEX = exports.DATE_FORMATS = exports.STORAGE_KEYS = exports.KEYBOARD_SHORTCUTS = exports.ANIMATIONS = exports.PLACEHOLDERS = exports.SUCCESS_MESSAGES = exports.ERROR_MESSAGES = exports.VALIDATION = exports.COLORS = exports.UI_CONFIG = exports.MEDIA_TYPES = exports.MESSAGE_TYPE_ICONS = exports.MESSAGE_STATUS_COLORS = exports.MESSAGE_STATUS_ICONS = exports.PAGINATION = exports.API_CONFIG = void 0;
/**
 * API Configuration
 */
exports.API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api',
    ENDPOINTS: {
        CONTACTS: '/contacts',
        MESSAGES: '/messages',
        MEDIA: '/media',
        TEMPLATES: '/templates'
    },
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3
};
/**
 * Pagination defaults
 */
exports.PAGINATION = {
    CONTACTS_PAGE_SIZE: 100,
    MESSAGES_PAGE_SIZE: 20,
    INITIAL_PAGE: 0
};
/**
 * Message status icons
 */
exports.MESSAGE_STATUS_ICONS = {
    SENT: '✓',
    DELIVERED: '✓✓',
    READ: '✓✓',
    FAILED: '✗',
    PENDING: '⏱'
};
/**
 * Message status colors
 */
exports.MESSAGE_STATUS_COLORS = {
    SENT: '#9E9E9E',
    DELIVERED: '#25D366',
    READ: '#34B7F1',
    FAILED: '#c62828',
    PENDING: '#e65100'
};
/**
 * Message type icons
 */
exports.MESSAGE_TYPE_ICONS = {
    TEXT: '💬',
    IMAGE: '📷',
    VIDEO: '🎥',
    DOCUMENT: '📄',
    AUDIO: '🎵',
    TEMPLATE: '📋',
    LOCATION: '📍',
    CONTACT: '👤'
};
/**
 * Supported media types
 */
exports.MEDIA_TYPES = {
    IMAGE: {
        MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        MAX_SIZE: 5 * 1024 * 1024,
        EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    VIDEO: {
        MIME_TYPES: ['video/mp4', 'video/mpeg', 'video/quicktime'],
        MAX_SIZE: 16 * 1024 * 1024,
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
        MAX_SIZE: 10 * 1024 * 1024,
        EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
    },
    AUDIO: {
        MIME_TYPES: ['audio/mpeg', 'audio/ogg', 'audio/wav'],
        MAX_SIZE: 5 * 1024 * 1024,
        EXTENSIONS: ['.mp3', '.ogg', '.wav']
    }
};
/**
 * UI Configuration
 */
exports.UI_CONFIG = {
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
exports.COLORS = {
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
exports.VALIDATION = {
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
exports.ERROR_MESSAGES = {
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
exports.SUCCESS_MESSAGES = {
    MESSAGE_SENT: 'Message sent successfully',
    CONTACT_ADDED: 'Contact added successfully',
    CONTACT_DELETED: 'Contact deleted successfully',
    TEXT_COPIED: 'Text copied to clipboard'
};
/**
 * Placeholders
 */
exports.PLACEHOLDERS = {
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
exports.ANIMATIONS = {
    FADE_IN: 'fadeIn 0.3s ease',
    SLIDE_UP: 'slideUp 0.3s ease',
    SLIDE_DOWN: 'slideDown 0.3s ease',
    SCALE_IN: 'scaleIn 0.2s ease'
};
/**
 * Keyboard shortcuts
 */
exports.KEYBOARD_SHORTCUTS = {
    SEND_MESSAGE: 'Enter',
    NEW_LINE: 'Shift+Enter',
    SEARCH: 'Ctrl+F',
    ESCAPE: 'Escape'
};
/**
 * LocalStorage keys
 */
exports.STORAGE_KEYS = {
    AUTH_TOKEN: 'token',
    USER_PREFERENCES: 'user_preferences',
    DRAFT_MESSAGES: 'draft_messages',
    SELECTED_CONTACT: 'selected_contact'
};
/**
 * Date/Time formats
 */
exports.DATE_FORMATS = {
    MESSAGE_TIME: { hour: '2-digit', minute: '2-digit', hour12: true },
    MESSAGE_DATE: { month: 'short', day: 'numeric' },
    FULL_DATE: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    SHORT_DATE: { month: 'numeric', day: 'numeric', year: 'numeric' }
};
/**
 * Regular expressions
 */
exports.REGEX = {
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
exports.WHATSAPP_LIMITS = {
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
exports.RETRY_CONFIG = {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000,
    MAX_DELAY: 5000,
    BACKOFF_MULTIPLIER: 2
};
/**
 * Feature flags
 */
exports.FEATURE_FLAGS = {
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
exports.NOTIFICATION_CONFIG = {
    ENABLED: true,
    SOUND: true,
    VIBRATE: true,
    DURATION: 5000
};
