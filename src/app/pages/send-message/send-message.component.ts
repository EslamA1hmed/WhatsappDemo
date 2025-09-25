import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '/home/islam/vodafone-auth/src/app/services/auth.service';
import { WhatsAppTemplatesResponseDTO, TemplateDTO, ComponentDTO, ButtonDTO } from '/home/islam/vodafone-auth/src/app/dto/whatsapp-templates.dto';

@Component({
  selector: 'app-send-message',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.css']
})
export class SendMessageComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  to = '';
  type = '';
  textBody = '';
  imageLink = '';
  imageCaption = '';
  videoLink = '';
  videoCaption = '';
  docLink = '';
  docFilename = '';

  // Template-related fields
  templateNames: string[] = [];
  selectedTemplateName = '';
  selectedTemplate: TemplateDTO | null = null;
  templateHeaderVariables: string[] = []; // For header text variables
  templateHeaderMedia = ''; // For header media (IMAGE/VIDEO/DOCUMENT)
  templateBodyVariables: string[] = []; // For body variables
  templateButtonValues: string[] = []; // For button parameters (URL/PHONE_NUMBER)
  headerComponent: ComponentDTO | null = null; // Store header component
  headerFormat: string | null = null; // Store header format
  footerText: string | null = null; // Store footer text

  errorMsg = '';
  successMsg = '';
  responseData: any = null;

  constructor() {
    this.loadTemplateNames();
  }

  // Check if text is RTL (Arabic or other RTL languages)
  isRTL(text: string): boolean {
    if (!text) return false;
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/; // Arabic, Arabic Supplement, Arabic Extended
    return rtlRegex.test(text);
  }

  // Determine if the preview should be RTL based on header, body, or footer text
  isPreviewRTL(): boolean {
    if (this.type === 'text' && this.textBody) {
      return this.isRTL(this.textBody);
    } else if (this.type === 'template' && this.selectedTemplate) {
      const headerText = this.formatHeaderText();
      const bodyText = this.formatBodyText();
      const footerText = this.getFooterText();
      return this.isRTL(headerText) || this.isRTL(bodyText) || this.isRTL(footerText);
    } else if (this.type === 'image' && this.imageCaption) {
      return this.isRTL(this.imageCaption);
    } else if (this.type === 'video' && this.videoCaption) {
      return this.isRTL(this.videoCaption);
    } else if (this.type === 'document' && this.docFilename) {
      return this.isRTL(this.docFilename);
    }
    return false;
  }

  loadTemplateNames() {
    this.http.get<{ content: string[] }>('http://localhost:8080/template/names')
      .subscribe({
        next: (res) => {
          this.templateNames = res.content;
          if (this.templateNames.length === 0) {
            this.errorMsg = '⚠️ No approved templates available.';
          }
        },
        error: (err) => {
          this.errorMsg = `❌ Error fetching template names: ${err.message || err.statusText}`;
        }
      });
  }

  onTypeChange(event: any) {
    this.type = event.target.value;
    // Reset fields when type changes
    this.textBody = '';
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
    this.headerComponent = null;
    this.headerFormat = null;
    this.footerText = null;
    this.errorMsg = '';
    this.successMsg = '';
  }

  onTemplateChange(event: any) {
    this.errorMsg = ''; // Clear error message when selecting a new template
    this.selectedTemplateName = event.target.value;
    if (this.selectedTemplateName) {
      this.http.get<TemplateDTO>(`http://localhost:8080/template/${this.selectedTemplateName}`)
        .subscribe({
          next: (res) => {
            this.selectedTemplate = res;
            // Initialize header component and format
            this.headerComponent = this.selectedTemplate?.components?.find(c => c.type === 'HEADER') || null;
            this.headerFormat = this.headerComponent?.format || null;
            // Initialize header variables
            if (this.headerComponent?.example?.header_text) {
              this.templateHeaderVariables = new Array(this.headerComponent.example.header_text.length).fill('');
            } else {
              this.templateHeaderVariables = [];
            }
            // Initialize body variables
            const bodyComponent = this.selectedTemplate?.components?.find(c => c.type === 'BODY');
            if (bodyComponent?.example?.body_text) {
              const variableCount = bodyComponent.example.body_text[0]?.length || 0;
              this.templateBodyVariables = new Array(variableCount).fill('');
            } else {
              this.templateBodyVariables = [];
            }
            // Initialize button values
            const buttonComponent = this.selectedTemplate?.components?.find(c => c.type === 'BUTTONS');
            if (buttonComponent?.buttons) {
              this.templateButtonValues = new Array(buttonComponent.buttons.filter(b => ['URL', 'PHONE_NUMBER'].includes(b.type)).length).fill('');
            } else {
              this.templateButtonValues = [];
            }
            // Initialize footer text
            const footerComponent = this.selectedTemplate?.components?.find(c => c.type === 'FOOTER');
            this.footerText = footerComponent?.text || null;
          },
          error: (err) => {
            this.errorMsg = `❌ Error fetching template: ${err.message || err.statusText}`;
            this.selectedTemplate = null;
            this.headerComponent = null;
            this.headerFormat = null;
            this.footerText = null;
            this.templateHeaderVariables = [];
            this.templateBodyVariables = [];
            this.templateButtonValues = [];
          }
        });
    } else {
      this.selectedTemplate = null;
      this.headerComponent = null;
      this.headerFormat = null;
      this.footerText = null;
      this.templateHeaderVariables = [];
      this.templateBodyVariables = [];
      this.templateButtonValues = [];
    }
  }

  onSend() {
    this.errorMsg = '';
    this.successMsg = '';
    this.responseData = null;

    if (!this.authService.isLoggedIn()) {
      this.errorMsg = '⚠️ Please login first!';
      return;
    }

    if (!this.to || !this.type) {
      this.errorMsg = '⚠️ Please enter recipient number and select message type.';
      return;
    }

    const payload: any = {
      messaging_product: 'whatsapp',
      to: this.to,
      type: this.type
    };

    if (this.type === 'text') {
      if (!this.textBody) {
        this.errorMsg = '⚠️ Please enter the message body.';
        return;
      }
      payload.text = { body: this.textBody, preview_url: false };
    } else if (this.type === 'image') {
      if (!this.imageLink) {
        this.errorMsg = '⚠️ Please enter the image link.';
        return;
      }
      payload.image = { link: this.imageLink };
      if (this.imageCaption) {
        payload.image.caption = this.imageCaption;
      }
    } else if (this.type === 'video') {
      if (!this.videoLink) {
        this.errorMsg = '⚠️ Please enter the video link.';
        return;
      }
      payload.video = { link: this.videoLink };
      if (this.videoCaption) {
        payload.video.caption = this.videoCaption;
      }
    } else if (this.type === 'document') {
      if (!this.docLink) {
        this.errorMsg = '⚠️ Please enter the document link.';
        return;
      }
      payload.document = { link: this.docLink };
      if (this.docFilename) {
        payload.document.filename = this.docFilename;
      }
    } else if (this.type === 'template') {
      if (!this.selectedTemplateName || !this.selectedTemplate) {
        this.errorMsg = '⚠️ Please select a template.';
        return;
      }
      if (!this.templateBodyVariables.every(v => v)) {
        this.errorMsg = '⚠️ Please fill all body variables.';
        return;
      }
      if (!this.templateButtonValues.every(v => v)) {
        this.errorMsg = '⚠️ Please fill all button parameters.';
        return;
      }
      if (this.hasHeaderVariables() && !this.templateHeaderVariables.every(v => v)) {
        this.errorMsg = '⚠️ Please fill all header variables.';
        return;
      }
      if (this.hasHeaderMedia() && !this.templateHeaderMedia) {
        this.errorMsg = '⚠️ Please provide a header media link.';
        return;
      }

      payload.template = {
        name: this.selectedTemplateName,
        language: { code: this.selectedTemplate.language },
        components: []
      };

      // Header
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

      // Body
      const bodyComponent = this.selectedTemplate.components?.find(c => c.type === 'BODY');
      if (bodyComponent && this.templateBodyVariables.length) {
        payload.template.components.push({
          type: 'body',
          parameters: this.templateBodyVariables.map(v => ({ type: 'text', text: v }))
        });
      }

      // Buttons
      const buttonComponent = this.selectedTemplate.components?.find(c => c.type === 'BUTTONS');
      if (buttonComponent?.buttons) {
        let buttonIndex = 0;
        buttonComponent.buttons.forEach((button, index) => {
          if (['URL', 'PHONE_NUMBER'].includes(button.type) && this.templateButtonValues[buttonIndex]) {
            payload.template.components.push({
              type: 'button',
              sub_type: button.type,
              index,
              parameters: [{
                type: button.type.toLowerCase(),
                [button.type.toLowerCase()]: button.type === 'URL' ? { url: this.templateButtonValues[buttonIndex] } : { phone_number: this.templateButtonValues[buttonIndex] }
              }]
            });
            buttonIndex++;
          }
        });
      }
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });

    this.http.post('http://localhost:8080/message/send', payload, { headers, observe: 'response' })
      .subscribe({
        next: (res) => {
          this.successMsg = '✅ Message sent successfully!';
          this.responseData = res.body;
          console.log('Full response:', res);
        },
        error: (err) => {
          this.errorMsg = `❌ Error ${err.status}: ${err.error?.message || err.message || err.statusText}`;
        }
      });
  }

  hasPreviewContent(): boolean {
    return !!(
      (this.type === 'text' && this.textBody) ||
      (this.type === 'image' && this.imageLink) ||
      (this.type === 'video' && this.videoLink) ||
      (this.type === 'document' && this.docLink) ||
      (this.type === 'template' && this.selectedTemplate)
    );
  }

  hasHeaderVariables(): boolean {
    return !!this.headerComponent && this.headerComponent.format === 'TEXT' && !!this.headerComponent.example?.header_text?.length;
  }

  hasHeaderMedia(): boolean {
    return !!this.headerComponent && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(this.headerComponent.format || '');
  }

  getHeaderVariables(): string[] {
    return this.headerComponent?.example?.header_text || [];
  }

  getBodyVariables(): string[] {
    const bodyComponent = this.selectedTemplate?.components?.find(c => c.type === 'BODY');
    return bodyComponent?.example?.body_text?.[0] || [];
  }

  getDynamicButtons(): ButtonDTO[] {
    const buttonComponent = this.selectedTemplate?.components?.find(c => c.type === 'BUTTONS');
    return buttonComponent?.buttons || [];
  }

  formatHeaderText(): string {
    if (!this.headerComponent?.text || !this.hasHeaderVariables()) return this.headerComponent?.text || 'Header Preview';
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

  getMediaFileName(url: string): string {
    return url.split('/').pop() || 'Document';
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}