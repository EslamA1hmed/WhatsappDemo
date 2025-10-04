export interface WhatsAppTemplatesResponseDTO {
  data: TemplateDTO[];
  paging?: PagingDTO;
}

export interface TemplateDTO {
  id: string;
  name: string;
  parameter_format: string;
  language: string;
  status: string;
  category: string;
  previous_category?: string; // Added for templates like offer_discount
  components?: ComponentDTO[];
  message_send_ttl_seconds?: number; // For authentication templates
}

export interface ComponentDTO {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  buttons?: ButtonDTO[];
  example?: TemplateExampleDTO;
  add_security_recommendation?: boolean; // For AUTHENTICATION templates
  code_expiration_minutes?: number; // For AUTHENTICATION templates
}

export interface ButtonDTO {
  type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY' | 'OTP' | 'CATALOG';
  text: string;
  url?: string; // For URL buttons, may contain variables like {{1}}
  phone_number?: string; // For PHONE_NUMBER buttons, fixed value
  example?: string[]; // For button variables (e.g., URL parameters)
  otp_type?: 'COPY_CODE' | 'ONE_TAP'; // For OTP buttons
  autofill_text?: string; // For ONE_TAP buttons
  package_name?: string; // For ONE_TAP buttons
  signature_hash?: string; // For ONE_TAP buttons
}

export interface TemplateExampleDTO {
  header_text?: string[];
  body_text?: string[][];
  header_handle?: string[];
}

export interface PagingDTO {
  cursors?: CursorsDTO;
}

export interface CursorsDTO {
  before?: string;
  after?: string;
}