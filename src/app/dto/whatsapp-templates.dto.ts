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
  components?: ComponentDTO[];
}

export interface ComponentDTO {
  type: string;
  format?: string;
  text?: string;
  buttons?: ButtonDTO[];
  example?: TemplateExampleDTO;
}

export interface ButtonDTO {
  type: string;
  text: string;
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
