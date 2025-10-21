export interface MessageResponseDTO {
  id: number;
  messageId: string;
  direction: 'SENT' | 'RECEIVED';
  status: string;
  to: string;
  from: string;
  type: string;
  textBody?: string;
  createdAt: string; // بدل LocalDateTime، بنستخدم string لأن JSON بيحول التاريخ لـ ISO string
  templateName?: string;
  templateBody?: string;
  templateHeader?: string;
  templateFooter?: string;
  mediaId?: string;
  mimeType?: string;
  mediaUrl?: string;
  mediaLoading?: boolean;
  thumbnail?: string; // سيحتوي على Base64 string
  width?: number;
  height?: number;
  caption?: string;
  filename?: string;
  isPlaying?: boolean;       // هل الريكورد شغال حاليًا؟
  currentTime?: number;    // الوقت الحالي بالثواني
  duration?: number;       // مدة الريكورد الكلية بالثواني
  progressPercent?: number;
  contextMessageId?: string;
  contextFrom?: string;
  buttons?: ButtonDTO[];
}

export interface ButtonDTO {
  type: string; // quick_reply, url, call
  text: string;
  payload?: string;
  url?: string;
  phoneNumber?: string;
}