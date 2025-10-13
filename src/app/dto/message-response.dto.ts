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
  caption?: string;
  filename?: string;
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