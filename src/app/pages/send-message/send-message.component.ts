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
  templateButtonValues: string[] = []; // For button parameters (URL/OTP)
  oneTapParams: { autofillText: string; packageName: string; signatureHash: string }[] = []; // For ONE_TAP buttons
  headerComponent: ComponentDTO | null = null;
  headerFormat: string | null = null;
  footerText: string | null = null;
  addSecurityRecommendation: boolean | null = null;
  codeExpirationMinutes: number | null = null;

  errorMsg = '';
  successMsg = '';
  responseData: any = null;

  constructor() {
    this.loadTemplateNames();
  }

  isRTL(text: string): boolean {
    if (!text) return false;
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return rtlRegex.test(text);
  }

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
    this.oneTapParams = [];
    this.headerComponent = null;
    this.headerFormat = null;
    this.footerText = null;
    this.addSecurityRecommendation = null;
    this.codeExpirationMinutes = null;
    this.errorMsg = '';
    this.successMsg = '';
  }

  onTemplateChange(event: any) {
    this.errorMsg = '';
    this.selectedTemplateName = event.target.value;
    if (this.selectedTemplateName) {
      this.http.get<TemplateDTO>(`http://localhost:8080/template/${this.selectedTemplateName}`)
        .subscribe({
          next: (res) => {
            this.selectedTemplate = res;
            this.headerComponent = this.selectedTemplate?.components?.find(c => c.type === 'HEADER') || null;
            this.headerFormat = this.headerComponent?.format || null;
            if (this.headerComponent?.example?.header_text) {
              this.templateHeaderVariables = new Array(this.headerComponent.example.header_text.length).fill('');
            } else {
              this.templateHeaderVariables = [];
            }
            const bodyComponent = this.selectedTemplate?.components?.find(c => c.type === 'BODY');
            if (bodyComponent?.example?.body_text) {
              const variableCount = bodyComponent.example.body_text[0]?.length || 0;
              this.templateBodyVariables = new Array(variableCount).fill('');
            } else {
              this.templateBodyVariables = [];
            }
            const buttonComponent = this.selectedTemplate?.components?.find(c => c.type === 'BUTTONS');
            if (buttonComponent?.buttons) {
              // Only URL buttons with variables and ONE_TAP OTP buttons need input
              const dynamicButtons = buttonComponent.buttons.filter(b => 
                (b.type === 'URL' && b.example && b.example.length > 0) || 
                (b.type === 'OTP' && b.otp_type === 'ONE_TAP')
              );
              this.templateButtonValues = new Array(dynamicButtons.length).fill('');
              this.oneTapParams = buttonComponent.buttons.map(b => 
                b.type === 'OTP' && b.otp_type === 'ONE_TAP' 
                  ? { 
                      autofillText: b.autofill_text || 'Autofill', 
                      packageName: b.package_name || '', 
                      signatureHash: b.signature_hash || '' 
                    }
                  : { autofillText: '', packageName: '', signatureHash: '' }
              );
            } else {
              this.templateButtonValues = [];
              this.oneTapParams = [];
            }
            const footerComponent = this.selectedTemplate?.components?.find(c => c.type === 'FOOTER');
            this.footerText = footerComponent?.text || null;
            this.addSecurityRecommendation = bodyComponent?.add_security_recommendation || null;
            this.codeExpirationMinutes = footerComponent?.code_expiration_minutes || null;
          },
          error: (err) => {
            this.errorMsg = `❌ Error fetching template: ${err.message || err.statusText}`;
            this.selectedTemplate = null;
            this.headerComponent = null;
            this.headerFormat = null;
            this.footerText = null;
            this.addSecurityRecommendation = null;
            this.codeExpirationMinutes = null;
            this.templateHeaderVariables = [];
            this.templateBodyVariables = [];
            this.templateButtonValues = [];
            this.oneTapParams = [];
          }
        });
    } else {
      this.selectedTemplate = null;
      this.headerComponent = null;
      this.headerFormat = null;
      this.footerText = null;
      this.addSecurityRecommendation = null;
      this.codeExpirationMinutes = null;
      this.templateHeaderVariables = [];
      this.templateBodyVariables = [];
      this.templateButtonValues = [];
      this.oneTapParams = [];
    }
  }

  hasButtonVariables(button: ButtonDTO): boolean {
    return button.type === 'URL' && !!button.example && button.example.length > 0;
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
      if (this.hasHeaderVariables() && !this.templateHeaderVariables.every(v => v)) {
        this.errorMsg = '⚠️ Please fill all header variables.';
        return;
      }
      if (this.hasHeaderMedia() && !this.templateHeaderMedia) {
        this.errorMsg = '⚠️ Please provide a header media link.';
        return;
      }
      const buttonComponent = this.selectedTemplate.components?.find(c => c.type === 'BUTTONS');
      if (buttonComponent?.buttons) {
        const dynamicButtons = buttonComponent.buttons.filter(b => 
          (b.type === 'URL' && b.example && b.example.length > 0) || 
          (b.type === 'OTP' && b.otp_type === 'ONE_TAP')
        );
        if (dynamicButtons.length > 0 && !this.templateButtonValues.slice(0, dynamicButtons.length).every(v => v)) {
          this.errorMsg = '⚠️ Please fill all required button parameters.';
          return;
        }
        if (dynamicButtons.some((b, i) => b.otp_type === 'ONE_TAP' && (!this.oneTapParams[i].packageName || !this.oneTapParams[i].signatureHash))) {
          this.errorMsg = '⚠️ Please provide package name and signature hash for ONE_TAP buttons.';
          return;
        }
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
      if (buttonComponent?.buttons) {
        let buttonIndex = 0;
        buttonComponent.buttons.forEach((button, index) => {
          if (button.type === 'URL' && this.hasButtonVariables(button)) {
            payload.template.components.push({
              type: 'button',
              sub_type: 'URL',
              index,
              parameters: [{
                type: 'text',
                text: this.templateButtonValues[buttonIndex]
              }]
            });
            buttonIndex++;
          } else if (button.type === 'OTP' && button.otp_type === 'ONE_TAP' && this.templateButtonValues[buttonIndex]) {
            const params: any = [{
              type: 'text',
              text: this.templateButtonValues[buttonIndex]
            }];
            if (this.oneTapParams[buttonIndex].autofillText) {
              params.push({
                type: 'autofill_text',
                autofill_text: this.oneTapParams[buttonIndex].autofillText
              });
            }
            if (this.oneTapParams[buttonIndex].packageName && this.oneTapParams[buttonIndex].signatureHash) {
              params.push({
                type: 'app_destination',
                app_destination: {
                  package_name: this.oneTapParams[buttonIndex].packageName,
                  signature_hash: this.oneTapParams[buttonIndex].signatureHash
                }
              });
            }
            payload.template.components.push({
              type: 'button',
              sub_type: 'OTP',
              index,
              parameters: params
            });
            buttonIndex++;
          }
          // QUICK_REPLY, PHONE_NUMBER, COPY_CODE, and CATALOG buttons don't need parameters
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
    let footerText = this.footerText || '';
    if (this.codeExpirationMinutes) {
      footerText =`This code expires in ${this.codeExpirationMinutes} minutes.`;
    }
    return footerText;
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

  getButtonDisplayValue(button: ButtonDTO, index: number): string {
    return button.text; // Show the actual text on the button for all types
  }
}