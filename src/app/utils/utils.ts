// src/app/utils/chat.utils.ts

import { ChatMessage, MessageStatus, MessageGroup } from '../models/types';

/**
 * Format time for message display
 */
export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

/**
 * Format time for contact list (relative time)
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format date for message groups
 */
export function formatDateGroup(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Get status icon for message
 */
export function getStatusIcon(status: string): string {
  const icons: { [key: string]: string } = {
    'sent': '✓',
    'delivered': '✓✓',
    'read': '✓✓',
    'failed': '✗',
    'pending': '⏱'
  };
  return icons[status?.toLowerCase()] || '•';
}

/**
 * Get initials from name or phone number
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
}

/**
 * Check if text contains RTL characters (Arabic, Hebrew, etc.)
 */
export function isRTL(text: string | undefined): boolean {
  if (!text) return false;
  const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF]/;
  return rtlRegex.test(text);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Group messages by date
 */
export function groupMessagesByDate(messages: ChatMessage[]): MessageGroup[] {
  const groups: { [key: string]: ChatMessage[] } = {};
  
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

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as: +20 123 456 7890
  if (cleaned.startsWith('20') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  // Default: +phoneNumber
  return `+${cleaned}`;
}

/**
 * Validate phone number
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid length (10-15 digits)
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Get message preview text (for contact list)
 */
export function getMessagePreview(message: ChatMessage): string {
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
  const typePreview: { [key: string]: string } = {
    'image': '📷 Image',
    'video': '🎥 Video',
    'document': '📄 Document',
    'audio': '🎵 Audio',
    'template': '📋 Template',
    'location': '📍 Location'
  };
  
  return typePreview[message.type] || 'Message';
}

/**
 * Get file extension from mime type
 */
export function getFileExtension(mimeType: string): string {
  const mimeMap: { [key: string]: string } = {
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

/**
 * Download file from URL
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}

/**
 * Scroll element to bottom smoothly
 */
export function scrollToBottom(element: HTMLElement, smooth: boolean = true): void {
  if (!element) return;
  
  const scrollOptions: ScrollToOptions = {
    top: element.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  };
  
  element.scrollTo(scrollOptions);
}

/**
 * Check if element is scrolled to bottom
 */
export function isScrolledToBottom(element: HTMLElement, threshold: number = 50): boolean {
  if (!element) return false;
  
  const scrollTop = element.scrollTop;
  const scrollHeight = element.scrollHeight;
  const clientHeight = element.clientHeight;
  
  return scrollHeight - scrollTop - clientHeight < threshold;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Generate random color for avatar
 */
export function generateAvatarColor(id: number): string {
  const colors = [
    '#B00000', '#E60000', '#FF6B6B', '#4ECDC4',
    '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9',
    '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E'
  ];
  
  return colors[id % colors.length];
}

/**
 * Parse template variables from text
 */
export function parseTemplateVariables(template: string): string[] {
  const regex = /\{\{(\d+)\}\}/g;
  const matches = template.matchAll(regex);
  return Array.from(matches, m => m[1]);
}

/**
 * Replace template variables with values
 */
export function replaceTemplateVariables(template: string, values: string[]): string {
  let result = template;
  values.forEach((value, index) => {
    result = result.replace(`{{${index + 1}}}`, value);
  });
  return result;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if message is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return isSameDay(date, today);
}

/**
 * Get time ago string
 */
export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals: { [key: string]: number } = {
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