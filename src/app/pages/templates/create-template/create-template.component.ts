import { Component, inject, ViewChild, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplateService } from '../../../services/template.service';

type ComponentType = 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';

interface Variable {
  placeholder: string; // e.g., {{1}}
  example: string;
  type: 'text' | 'url' | 'phone_number'; // To distinguish variable type
}

interface Button {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';
  text?: string;
  url?: string;
  phone_number?: string;
  example?: string;
  variables?: Variable[];
}

interface TemplateComponent {
  type: ComponentType;
  text?: string;
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  variables?: Variable[];
  mediaUrl?: string;
  useVariable?: boolean;
  buttons?: Button[];
  mediaError?: boolean; // Track media loading errors
}

interface TemplateExample {
  header_text?: string[];
  body_text?: string[][];
  header_handle?: string[];
  buttons?: { type: string; example?: string[] }[];
}

@Pipe({ name: 'buttonTextVariables', standalone: true })
export class ButtonTextVariablesPipe implements PipeTransform {
  transform(variables: Variable[] | undefined): Variable[] {
    return variables?.filter(v => v.type === 'text') || [];
  }
}

@Pipe({ name: 'buttonUrlVariables', standalone: true })
export class ButtonUrlVariablesPipe implements PipeTransform {
  transform(variables: Variable[] | undefined): Variable[] {
    return variables?.filter(v => v.type === 'url') || [];
  }
}

@Pipe({ name: 'buttonPhoneVariables', standalone: true })
export class ButtonPhoneVariablesPipe implements PipeTransform {
  transform(variables: Variable[] | undefined): Variable[] {
    return variables?.filter(v => v.type === 'phone_number') || [];
  }
}

@Component({
  selector: 'app-create-template',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonTextVariablesPipe, ButtonUrlVariablesPipe, ButtonPhoneVariablesPipe],
  templateUrl: './create-template.component.html',
  styleUrls: ['./create-template.component.css']
})
export class CreateTemplateComponent {
  private templateService = inject(TemplateService);

  template = {
    name: '',
    category: 'UTILITY',
    language: 'en_US',
    components: [
      { type: 'HEADER' as const, text: '', format: 'TEXT' as const, variables: [] as Variable[], mediaUrl: '', useVariable: false, mediaError: false },
      { type: 'BODY' as const, text: '', format: 'TEXT' as const, variables: [] as Variable[] },
      { type: 'FOOTER' as const, text: '', format: 'TEXT' as const },
      { type: 'BUTTONS' as const, buttons: [] as Button[] }
    ] as TemplateComponent[]
  };

  successMessage = '';
  errorMessage = '';

  @ViewChild('headerText') headerText?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('bodyText') bodyText?: ElementRef<HTMLTextAreaElement>;

  isRTL(text: string): boolean {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  }

  isPreviewRTL(): boolean {
    const header = this.template.components.find(c => c.type === 'HEADER');
    const body = this.template.components.find(c => c.type === 'BODY');
    const footer = this.template.components.find(c => c.type === 'FOOTER');
    const buttons = this.template.components.find(c => c.type === 'BUTTONS');

    const texts = [
      header?.text || '',
      header?.variables?.map(v => v.example).join('') || '',
      body?.text || '',
      body?.variables?.map(v => v.example).join('') || '',
      footer?.text || '',
      buttons?.buttons?.map(b => b.text || b.example || '').join('') || ''
    ].filter(Boolean);

    return texts.some(text => this.isRTL(text));
  }

  onCategoryChange() {
    if (this.template.category === 'AUTHENTICATION') {
      const headerComp = this.template.components[0];
      headerComp.text = '';
      headerComp.format = 'TEXT';
      headerComp.variables = [];
      headerComp.mediaUrl = '';
      headerComp.useVariable = false;
      headerComp.mediaError = false;
      const buttonsComp = this.template.components[3];
      buttonsComp.buttons = [];
    }
  }

  onHeaderFormatChange() {
    const headerComp = this.template.components[0];
    headerComp.variables = [];
    headerComp.mediaUrl = '';
    headerComp.useVariable = false;
    headerComp.text = '';
    headerComp.mediaError = false;
  }

  onUseVariableChange(componentType: ComponentType) {
    const comp = this.template.components.find(c => c.type === componentType);
    if (!comp) return;
    if (comp.useVariable) {
      comp.variables = [];
      comp.mediaUrl = '{{1}}';
      this.addVariable(componentType);
    } else {
      comp.variables = [];
      comp.mediaUrl = '';
      comp.mediaError = false;
    }
  }

  addVariable(componentType: ComponentType) {
    const comp = this.template.components.find(c => c.type === componentType);
    if (!comp) return;

    if (!comp.variables) {
      comp.variables = [];
    }

    if (comp.format !== 'TEXT' && comp.variables.length >= 1) {
      alert('Media headers support only one variable ({{1}}) for the URL.');
      return;
    }

    const idx = comp.variables.length + 1;
    const placeholder = `{{${idx}}}`;
    comp.variables.push({ placeholder, example: '', type: comp.format === 'TEXT' ? 'text' : 'url' });

    if (comp.format === 'TEXT') {
      comp.text = (comp.text ? comp.text + ' ' : '') + placeholder;
    } else if (comp.useVariable) {
      comp.mediaUrl = placeholder;
    }
  }

  removeVariable(componentType: ComponentType, index: number) {
    const comp = this.template.components.find(c => c.type === componentType);
    if (!comp || !comp.variables) return;

    const removedVar = comp.variables[index];
    comp.variables.splice(index, 1);

    if (comp.format === 'TEXT' && comp.text) {
      comp.text = comp.text.replace(new RegExp(`\\s*${this.escapeRegExp(removedVar.placeholder)}\\s*`, 'g'), ' ');
      comp.text = comp.text.replace(/\s+/g, ' ').trim();
      this.reindexVariables(comp);
    } else if (comp.useVariable && comp.mediaUrl) {
      if (comp.variables.length === 0) {
        comp.mediaUrl = '';
        comp.mediaError = false;
      } else {
        this.reindexVariables(comp);
        comp.mediaUrl = comp.variables[0].placeholder;
      }
    }
  }

  addButton() {
    const buttonsComp = this.template.components.find(c => c.type === 'BUTTONS');
    if (!buttonsComp) return;

    if (!buttonsComp.buttons) {
      buttonsComp.buttons = [];
    }

    if (buttonsComp.buttons.length >= 4) {
      alert('Maximum of 4 buttons allowed.');
      return;
    }

    const newButton: Button = {
      type: this.template.category === 'AUTHENTICATION' ? 'COPY_CODE' : 'QUICK_REPLY',
      text: '',
      url: '',
      phone_number: '',
      example: '',
      variables: []
    };
    buttonsComp.buttons.push(newButton);
  }

  removeButton(index: number) {
    const buttonsComp = this.template.components.find(c => c.type === 'BUTTONS');
    if (!buttonsComp || !buttonsComp.buttons) return;
    buttonsComp.buttons.splice(index, 1);
  }

  addButtonVariable(buttonIndex: number, variableType: 'text' | 'url' | 'phone_number') {
    const buttonsComp = this.template.components.find(c => c.type === 'BUTTONS');
    if (!buttonsComp || !buttonsComp.buttons) return;

    const btn = buttonsComp.buttons[buttonIndex];
    if (!btn.variables) {
      btn.variables = [];
    }

    const existingVars = btn.variables.filter(v => v.type === variableType);
    if (existingVars.length >= 1) {
      alert(`Only one ${variableType} variable is allowed per button.`);
      return;
    }

    const idx = btn.variables.length + 1;
    const placeholder = `{{${idx}}}`;
    btn.variables.push({ placeholder, example: '', type: variableType });

    if (variableType === 'text') {
      btn.text = (btn.text ? btn.text + ' ' : '') + placeholder;
    } else if (variableType === 'url') {
      btn.url = (btn.url ? btn.url + '/' : '') + placeholder;
    } else if (variableType === 'phone_number') {
      btn.phone_number = placeholder;
    }
  }

  removeButtonVariable(buttonIndex: number, variableIndex: number) {
    const buttonsComp = this.template.components.find(c => c.type === 'BUTTONS');
    if (!buttonsComp || !buttonsComp.buttons || !buttonsComp.buttons[buttonIndex]) return;

    const btn = buttonsComp.buttons[buttonIndex];
    if (!btn.variables) return;

    const removedVar = btn.variables[variableIndex];
    btn.variables.splice(variableIndex, 1);

    if (removedVar.type === 'text' && btn.text) {
      btn.text = btn.text.replace(new RegExp(`\\s*${this.escapeRegExp(removedVar.placeholder)}\\s*`, 'g'), ' ').trim();
    } else if (removedVar.type === 'url' && btn.url) {
      btn.url = btn.url.replace(new RegExp(`/*${this.escapeRegExp(removedVar.placeholder)}/*`, 'g'), '').trim();
    } else if (removedVar.type === 'phone_number' && btn.phone_number) {
      btn.phone_number = '';
    }

    this.reindexButtonVariables(btn);
  }

  onButtonTypeChange(index: number) {
    const buttonsComp = this.template.components.find(c => c.type === 'BUTTONS');
    if (!buttonsComp || !buttonsComp.buttons) return;

    const btn = buttonsComp.buttons[index];
    btn.text = '';
    btn.url = '';
    btn.phone_number = '';
    btn.example = '';
    btn.variables = [];

    if (btn.type === 'URL') {
      btn.url = 'https://example.com/{{1}}';
      btn.variables = [{ placeholder: '{{1}}', example: 'https://example.com/product', type: 'url' }];
    }
  }

  updateUrlVariable(index: number) {
    const buttonsComp = this.template.components.find(c => c.type === 'BUTTONS');
    if (!buttonsComp || !buttonsComp.buttons) return;

    const btn = buttonsComp.buttons[index];
    if (btn.type === 'URL' && btn.url && btn.variables) {
      const urlVars = btn.variables.filter(v => v.type === 'url');
      if (urlVars.length === 0 || !btn.url.includes(urlVars[0].placeholder)) {
        btn.variables = btn.variables.filter(v => v.type !== 'url');
      }
    }
  }

  private reindexVariables(comp: TemplateComponent) {
    if (!comp.variables) return;
    comp.variables.forEach((v, i) => {
      const oldPlaceholder = v.placeholder;
      const newPlaceholder = `{{${i + 1}}}`;
      v.placeholder = newPlaceholder;
      if (comp.format === 'TEXT' && comp.text) {
        comp.text = comp.text.replace(new RegExp(this.escapeRegExp(oldPlaceholder), 'g'), newPlaceholder);
      } else if (comp.useVariable && comp.mediaUrl) {
        comp.mediaUrl = newPlaceholder;
      }
    });
  }

  private reindexButtonVariables(btn: Button) {
    if (!btn.variables) return;
    btn.variables.forEach((v, i) => {
      const oldPlaceholder = v.placeholder;
      const newPlaceholder = `{{${i + 1}}}`;
      v.placeholder = newPlaceholder;
      if (v.type === 'text' && btn.text) {
        btn.text = btn.text.replace(new RegExp(this.escapeRegExp(oldPlaceholder), 'g'), newPlaceholder);
      } else if (v.type === 'url' && btn.url) {
        btn.url = btn.url.replace(new RegExp(this.escapeRegExp(oldPlaceholder), 'g'), newPlaceholder);
      } else if (v.type === 'phone_number' && btn.phone_number) {
        btn.phone_number = btn.phone_number.replace(new RegExp(this.escapeRegExp(oldPlaceholder), 'g'), newPlaceholder);
      }
    });
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  syncVariables(componentType: ComponentType) {
    const comp = this.template.components.find(c => c.type === componentType);
    if (!comp) return;

    if (!comp.text || comp.text.trim() === '') {
      comp.variables = [];
      return;
    }

    const placeholders = comp.text.match(/\{\{\d+\}\}/g) || [];
    const numbers = placeholders.map(p => parseInt(p.replace(/\{/g, '').replace(/\}/g, ''))).sort((a, b) => a - b);

    comp.variables = comp.variables?.filter(v => {
      const varNumber = parseInt(v.placeholder.replace(/\{/g, '').replace(/\}/g, ''));
      return numbers.includes(varNumber);
    }) || [];

    comp.variables.forEach((v, i) => {
      const oldPlaceholder = v.placeholder;
      const newPlaceholder = `{{${i + 1}}}`;
      v.placeholder = newPlaceholder;
      comp.text = comp.text?.replace(new RegExp(this.escapeRegExp(oldPlaceholder), 'g'), newPlaceholder) || '';
    });
  }

  onHeaderTextChange(newText: string) {
    const headerComp = this.template.components[0];
    headerComp.text = newText;
    this.syncVariables('HEADER');
  }

  onBodyTextChange(newText: string) {
    const bodyComp = this.template.components[1];
    bodyComp.text = newText;
    this.syncVariables('BODY');
  }

  onHeaderKeydown(event: KeyboardEvent) {
    const textarea = this.headerText?.nativeElement;
    if (!textarea) return;

    if (event.key === 'Backspace' || event.key === 'Delete') {
      const cursor = textarea.selectionStart;
      const text = textarea.value;
      const isBackspace = event.key === 'Backspace';

      const placeholders = text.match(/\{\{\d+\}\}/g) || [];
      const placeholderAtCursor = placeholders.find(p => {
        const start = text.indexOf(p);
        const end = start + p.length;
        return (isBackspace && cursor >= start && cursor <= end) || (!isBackspace && cursor >= start && cursor < end);
      });

      if (placeholderAtCursor) {
        event.preventDefault();
        const start = text.indexOf(placeholderAtCursor);
        const end = start + placeholderAtCursor.length;
        textarea.value = text.substring(0, start) + text.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start;
        this.onHeaderTextChange(textarea.value);
        return;
      }

      for (let len = 4; len <= 6; len++) {
        const start = isBackspace ? cursor - len : cursor;
        const end = isBackspace ? cursor : cursor + len;
        const potential = text.substring(start, end);

        if (potential.match(/\{\{\d+\}\}/)) {
          event.preventDefault();
          textarea.value = text.substring(0, start) + text.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start;
          this.onHeaderTextChange(textarea.value);
          return;
        }
      }
    }
  }

  onBodyKeydown(event: KeyboardEvent) {
    const textarea = this.bodyText?.nativeElement;
    if (!textarea) return;

    if (event.key === 'Backspace' || event.key === 'Delete') {
      const cursor = textarea.selectionStart;
      const text = textarea.value;
      const isBackspace = event.key === 'Backspace';

      const placeholders = text.match(/\{\{\d+\}\}/g) || [];
      const placeholderAtCursor = placeholders.find(p => {
        const start = text.indexOf(p);
        const end = start + p.length;
        return (isBackspace && cursor >= start && cursor <= end) || (!isBackspace && cursor >= start && cursor < end);
      });

      if (placeholderAtCursor) {
        event.preventDefault();
        const start = text.indexOf(placeholderAtCursor);
        const end = start + placeholderAtCursor.length;
        textarea.value = text.substring(0, start) + text.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start;
        this.onBodyTextChange(textarea.value);
        return;
      }

      for (let len = 4; len <= 6; len++) {
        const start = isBackspace ? cursor - len : cursor;
        const end = isBackspace ? cursor : cursor + len;
        const potential = text.substring(start, end);

        if (potential.match(/\{\{\d+\}\}/)) {
          event.preventDefault();
          textarea.value = text.substring(0, start) + text.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start;
          this.onBodyTextChange(textarea.value);
          return;
        }
      }
    }
  }

  isValidMediaUrl(url: string): boolean {
    // Simple validation to check if the URL is a valid format (starts with http or https)
    return /^https?:\/\//i.test(url);
  }

  getMediaPreviewUrl(componentType: ComponentType): string {
    const comp = this.template.components.find(c => c.type === componentType);
    if (!comp) return '';

    if (comp.useVariable && comp.variables && comp.variables.length > 0) {
      const v = comp.variables[0];
      // Only return example if it's a valid URL
      return v.example && this.isValidMediaUrl(v.example) ? v.example : '';
    }
    // Only return mediaUrl if it's a valid URL
    return comp.mediaUrl && this.isValidMediaUrl(comp.mediaUrl) ? comp.mediaUrl : '';
  }

  handleMediaError(event: Event, componentType: ComponentType) {
    const element = event.target as HTMLImageElement | HTMLVideoElement;
    const comp = this.template.components.find(c => c.type === componentType);
    if (comp) {
      comp.mediaError = true;
      element.style.display = 'none';
    }
  }

  renderPreview(componentType: ComponentType): string {
    const comp = this.template.components.find(c => c.type === componentType);
    if (!comp) return '';

    if (componentType === 'HEADER' && comp.format !== 'TEXT') {
      return this.getMediaPreviewUrl(componentType);
    }

    let text = comp.text || '';
    (comp.variables || []).forEach((v) => {
      const replacement = v.example && v.example.trim() !== '' ? v.example : v.placeholder;
      text = text.replace(new RegExp(this.escapeRegExp(v.placeholder), 'g'), replacement);
    });
    return text;
  }

  renderButtonText(btn: Button): string {
    if (btn.type === 'COPY_CODE') {
      return 'Copy Code';
    }
    let text = btn.text || 'Button';
    (btn.variables || []).filter(v => v.type === 'text').forEach((v) => {
      const replacement = v.example && v.example.trim() !== '' ? v.example : v.placeholder;
      text = text.replace(new RegExp(this.escapeRegExp(v.placeholder), 'g'), replacement);
    });
    return text;
  }

  getMediaFileName(url: string): string {
    return url.split('/').pop() || '';
  }

  renderBodyPreviewLines(): string[] {
    const preview = this.renderPreview('BODY');
    if (!preview) return [];
    return preview.split('\n').map(s => s.trim()).filter(Boolean);
  }

  hasPreviewContent(): boolean {
    const header = this.template.components[0];
    const body = this.template.components[1];
    const footer = this.template.components[2];
    const buttons = this.template.components[3];
    return !!(
      (header.format === 'TEXT' && header.text && this.template.category !== 'AUTHENTICATION') ||
      (header.format !== 'TEXT' && (header.mediaUrl || (header.useVariable && header.variables && header.variables.length > 0)) && this.template.category !== 'AUTHENTICATION') ||
      body.text ||
      footer.text ||
      (buttons.buttons && buttons.buttons.length > 0)
    );
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  isFormValid(): boolean {
    const bodyComp = this.template.components[1];
    const buttonsComp = this.template.components[3];
    const headerComp = this.template.components[0];

    if (this.template.category === 'AUTHENTICATION') {
      return !!(
        this.template.name &&
        bodyComp.text &&
        bodyComp.variables && bodyComp.variables.length > 0 &&
        (!buttonsComp.buttons || buttonsComp.buttons.length === 0 ||
         (buttonsComp.buttons.length === 1 && buttonsComp.buttons[0].type === 'COPY_CODE' && buttonsComp.buttons[0].example))
      );
    }

    return !!(
      this.template.name &&
      bodyComp.text &&
      (!headerComp.useVariable || (headerComp.variables && headerComp.variables.every(v => v.example))) &&
      (!buttonsComp.buttons || buttonsComp.buttons.every(btn =>
        (btn.type === 'QUICK_REPLY' && btn.text && (!btn.variables?.some(v => v.type === 'text') || btn.variables.every(v => v.type === 'text' && v.example))) ||
        (btn.type === 'URL' && btn.text && btn.url &&
         (!btn.variables?.some(v => v.type === 'text' || v.type === 'url') ||
          btn.variables.every(v => (v.type === 'text' || v.type === 'url') && v.example))) ||
        (btn.type === 'PHONE_NUMBER' && btn.text && btn.phone_number &&
         (!btn.variables?.some(v => v.type === 'text' || v.type === 'phone_number') ||
          btn.variables.every(v => (v.type === 'text' || v.type === 'phone_number') && v.example)))
      ))
    );
  }

 onSubmit() {
  this.successMessage = '';
  this.errorMessage = '';

  // sanitize template name to satisfy Meta's requirement: lowercase + underscores only
  const safeName = (this.template.name || '').trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

  const payload = {
    name: safeName,
    category: this.template.category,
    language: this.template.language,
    components: this.template.components.map(c => {
      const base: any = { type: c.type };
      const example: TemplateExample = {};

      // BUTTONS handling
      if (c.type === 'BUTTONS' && c.buttons && c.buttons.length > 0) {
        base.buttons = c.buttons.map(btn => {
          const button: any = { type: btn.type };
          if (btn.type === 'QUICK_REPLY') {
            button.text = btn.text || '';
            if (btn.variables && btn.variables.some(v => v.type === 'text')) {
              example.buttons = example.buttons || [];
              example.buttons.push({
                type: 'QUICK_REPLY',
                example: btn.variables.filter(v => v.type === 'text').map(v => v.example || '')
              });
            }
          } else if (btn.type === 'URL') {
            button.text = btn.text || '';
            button.url = btn.url || '';
            if (btn.variables && btn.variables.length > 0) {
              example.buttons = example.buttons || [];
              example.buttons.push({
                type: 'URL',
                example: btn.variables.map(v => v.example || '')
              });
            }
          } else if (btn.type === 'PHONE_NUMBER') {
            button.text = btn.text || '';
            button.phone_number = btn.phone_number || '';
            if (btn.variables && btn.variables.some(v => v.type === 'text' || v.type === 'phone_number')) {
              example.buttons = example.buttons || [];
              example.buttons.push({
                type: 'PHONE_NUMBER',
                example: btn.variables.map(v => v.example || '')
              });
            }
          } else if (btn.type === 'COPY_CODE') {
            button.example = btn.example || '';
          }
          return button;
        });

        if (example.buttons && example.buttons.length > 0) {
          base.example = example;
        }
        return base;
      }

      // TEXT format handling (HEADER text as TEXT included here)
      if (c.format === 'TEXT') {
        base.text = c.text || '';
        // header text variables -> header_text
        if (c.variables && c.variables.length > 0) {
          if (c.type === 'HEADER') {
            example.header_text = c.variables.map(v => v.example || '');
          } else if (c.type === 'BODY') {
            const lines = (c.text || '').split('\n').map(line => {
              const varsInLine: string[] = [];
              (c.variables || []).forEach(v => {
                if (line.includes(v.placeholder)) {
                  varsInLine.push(v.example || '');
                }
              });
              return varsInLine;
            }).filter(line => line.length > 0);
            example.body_text = lines.length > 0 ? lines : undefined;
          }
        }
      } else if (c.type === 'HEADER') {
        // Non-text header (IMAGE, VIDEO, DOCUMENT) or header using variable
        // Always include format if present
        if (c.format) {
          base.format = c.format;
        }

        if (c.useVariable && c.variables && c.variables.length > 0) {
          // header is a variable placeholder like {{1}}
          base.text = c.variables[0].placeholder;
          example.header_handle = [c.variables[0].example || ''];
        } else if (c.mediaUrl) {
          // header is a direct media URL
          base.text = c.mediaUrl;
          example.header_handle = [c.mediaUrl];
        }
      }

      // attach example if any
      if (Object.keys(example).length > 0) {
        base.example = example;
      }

      return base;
    })
    // filter out empty components and handle AUTHENTICATION header rule
    .filter(c =>
      (c.type !== 'HEADER' || this.template.category !== 'AUTHENTICATION') &&
      (c.text || (c.example && Object.keys(c.example).length > 0) || (c.buttons && c.buttons.length > 0))
    )
  };

  console.log('Payload:', JSON.stringify(payload, null, 2));

  this.templateService.createTemplate(payload).subscribe({
    next: () => {
      this.successMessage = '✅ Template created successfully!';
      this.errorMessage = '';
    },
    error: (err) => {
      console.error('Error:', err);
      // Show more detailed message if available from server response
      const serverMsg = err?.error?.message || err?.message;
      this.errorMessage = '❌ Failed to create template: ' + (serverMsg || 'Unknown error');
    }
  });
}
}