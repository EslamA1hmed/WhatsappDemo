"use strict";
// src/app/utils/chat.utils.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeAgo = exports.isToday = exports.formatFileSize = exports.replaceTemplateVariables = exports.parseTemplateVariables = exports.generateAvatarColor = exports.debounce = exports.isScrolledToBottom = exports.scrollToBottom = exports.copyToClipboard = exports.downloadFile = exports.getFileExtension = exports.getMessagePreview = exports.isValidPhoneNumber = exports.formatPhoneNumber = exports.groupMessagesByDate = exports.truncateText = exports.isRTL = exports.getInitials = exports.getStatusIcon = exports.formatDateGroup = exports.formatRelativeTime = exports.formatMessageTime = void 0;
/**
 * Format time for message display
 */
function formatMessageTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}
exports.formatMessageTime = formatMessageTime;
/**
 * Format time for contact list (relative time)
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1)
        return 'now';
    if (diffMins < 60)
        return `${diffMins}m`;
    if (diffHours < 24)
        return `${diffHours}h`;
    if (diffDays === 1)
        return 'Yesterday';
    if (diffDays < 7)
        return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
exports.formatRelativeTime = formatRelativeTime;
/**
 * Format date for message groups
 */
function formatDateGroup(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(date, today))
        return 'Today';
    if (isSameDay(date, yesterday))
        return 'Yesterday';
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
}
exports.formatDateGroup = formatDateGroup;
/**
 * Check if two dates are the same day
 */
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}
/**
 * Get status icon for message
 */
function getStatusIcon(status) {
    const icons = {
        'sent': '✓',
        'delivered': '✓✓',
        'read': '✓✓',
        'failed': '✗',
        'pending': '⏱'
    };
    return icons[status === null || status === void 0 ? void 0 : status.toLowerCase()] || '•';
}
exports.getStatusIcon = getStatusIcon;
/**
 * Get initials from name or phone number
 */
function getInitials(name) {
    if (!name)
        return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}
exports.getInitials = getInitials;
/**
 * Check if text contains RTL characters (Arabic, Hebrew, etc.)
 */
function isRTL(text) {
    if (!text)
        return false;
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF]/;
    return rtlRegex.test(text);
}
exports.isRTL = isRTL;
/**
 * Truncate text with ellipsis
 */
function truncateText(text, maxLength = 50) {
    if (!text)
        return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
exports.truncateText = truncateText;
/**
 * Group messages by date
 */
function groupMessagesByDate(messages) {
    const groups = {};
    messages.forEach(message => {
        const date = new Date(message.createdAt);
        const dateKey = date.toDateString();
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(message);
    });
    return Object.keys(groups).map(dateKey => ({
        date: formatDateGroup(new Date(dateKey).toISOString()),
        messages: groups[dateKey]
    }));
}
exports.groupMessagesByDate = groupMessagesByDate;
/**
 * Format phone number for display
 */
function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber)
        return '';
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Format as: +20 123 456 7890
    if (cleaned.startsWith('20') && cleaned.length === 12) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    // Default: +phoneNumber
    return `+${cleaned}`;
}
exports.formatPhoneNumber = formatPhoneNumber;
/**
 * Validate phone number
 */
function isValidPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Check if it's a valid length (10-15 digits)
    return cleaned.length >= 10 && cleaned.length <= 15;
}
exports.isValidPhoneNumber = isValidPhoneNumber;
/**
 * Get message preview text (for contact list)
 */
function getMessagePreview(message) {
    if (message.textBody) {
        return truncateText(message.textBody, 40);
    }
    if (message.templateBody) {
        return truncateText(message.templateBody, 40);
    }
    if (message.caption) {
        return truncateText(message.caption, 40);
    }
    // Return type-based preview
    const typePreview = {
        'image': '📷 Image',
        'video': '🎥 Video',
        'document': '📄 Document',
        'audio': '🎵 Audio',
        'template': '📋 Template',
        'location': '📍 Location'
    };
    return typePreview[message.type] || 'Message';
}
exports.getMessagePreview = getMessagePreview;
/**
 * Get file extension from mime type
 */
function getFileExtension(mimeType) {
    const mimeMap = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'video/mp4': 'mp4',
        'video/mpeg': 'mpeg',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
    };
    return mimeMap[mimeType] || 'file';
}
exports.getFileExtension = getFileExtension;
/**
 * Download file from URL
 */
function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
exports.downloadFile = downloadFile;
/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield navigator.clipboard.writeText(text);
            return true;
        }
        catch (err) {
            console.error('Failed to copy text:', err);
            return false;
        }
    });
}
exports.copyToClipboard = copyToClipboard;
/**
 * Scroll element to bottom smoothly
 */
function scrollToBottom(element, smooth = true) {
    if (!element)
        return;
    const scrollOptions = {
        top: element.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
    };
    element.scrollTo(scrollOptions);
}
exports.scrollToBottom = scrollToBottom;
/**
 * Check if element is scrolled to bottom
 */
function isScrolledToBottom(element, threshold = 50) {
    if (!element)
        return false;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    return scrollHeight - scrollTop - clientHeight < threshold;
}
exports.isScrolledToBottom = isScrolledToBottom;
/**
 * Debounce function
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}
exports.debounce = debounce;
/**
 * Generate random color for avatar
 */
function generateAvatarColor(id) {
    const colors = [
        '#B00000', '#E60000', '#FF6B6B', '#4ECDC4',
        '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9',
        '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E'
    ];
    return colors[id % colors.length];
}
exports.generateAvatarColor = generateAvatarColor;
/**
 * Parse template variables from text
 */
function parseTemplateVariables(template) {
    const regex = /\{\{(\d+)\}\}/g;
    const matches = template.matchAll(regex);
    return Array.from(matches, m => m[1]);
}
exports.parseTemplateVariables = parseTemplateVariables;
/**
 * Replace template variables with values
 */
function replaceTemplateVariables(template, values) {
    let result = template;
    values.forEach((value, index) => {
        result = result.replace(`{{${index + 1}}}`, value);
    });
    return result;
}
exports.replaceTemplateVariables = replaceTemplateVariables;
/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
exports.formatFileSize = formatFileSize;
/**
 * Check if message is today
 */
function isToday(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    return isSameDay(date, today);
}
exports.isToday = isToday;
/**
 * Get time ago string
 */
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
}
exports.getTimeAgo = getTimeAgo;
