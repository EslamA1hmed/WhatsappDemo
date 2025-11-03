"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTemplateComponent = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
const forms_1 = require("@angular/forms");
const template_service_1 = require("../../../services/template.service");
let CreateTemplateComponent = class CreateTemplateComponent {
    constructor() {
        this.templateService = (0, core_1.inject)(template_service_1.TemplateService);
        this.template = {
            name: '',
            category: 'UTILITY',
            language: 'en_US',
            components: [
                { type: 'HEADER', text: '', format: 'TEXT', variables: [], mediaUrl: '', mediaError: false, previewMediaUrl: '' },
                { type: 'BODY', format: 'TEXT', variables: [], add_security_recommendation: false },
                { type: 'FOOTER', text: '', format: 'TEXT', code_expiration_minutes: undefined },
                { type: 'BUTTONS', buttons: [] }
            ]
        };
        this.successMessage = '';
        this.errorMessage = '';
    }
    isRTL(text) {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text);
    }
    isPreviewRTL() {
        var _a, _b;
        const header = this.template.components.find(c => c.type === 'HEADER');
        const body = this.template.components.find(c => c.type === 'BODY');
        const footer = this.template.components.find(c => c.type === 'FOOTER');
        const buttons = this.template.components.find(c => c.type === 'BUTTONS');
        const texts = [
            (header === null || header === void 0 ? void 0 : header.text) || '',
            ((_a = header === null || header === void 0 ? void 0 : header.variables) === null || _a === void 0 ? void 0 : _a.map(v => v.example).join('')) || '',
            (footer === null || footer === void 0 ? void 0 : footer.text) || '',
            ((_b = buttons === null || buttons === void 0 ? void 0 : buttons.buttons) === null || _b === void 0 ? void 0 : _b.map(b => b.text || '').join('')) || ''
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
            headerComp.mediaError = false;
            headerComp.previewMediaUrl = '';
            const buttonsComp = this.template.components[3];
            buttonsComp.buttons = [];
            const bodyComp = this.template.components[1];
            bodyComp.text = '';
            bodyComp.variables = [];
            bodyComp.add_security_recommendation = true;
            const footerComp = this.template.components[2];
            footerComp.text = '';
            footerComp.code_expiration_minutes = 10;
        }
        else {
            const bodyComp = this.template.components[1];
            bodyComp.add_security_recommendation = false;
            const footerComp = this.template.components[2];
            footerComp.code_expiration_minutes = undefined;
        }
    }
    onHeaderFormatChange() {
        const headerComp = this.template.components[0];
        headerComp.variables = [];
        headerComp.mediaUrl = '';
        headerComp.previewMediaUrl = '';
        headerComp.text = '';
        headerComp.mediaError = false;
    }
    addVariable(componentType) {
        if (this.template.category === 'AUTHENTICATION' && componentType === 'BODY') {
            return; // No variables can be added for authentication body
        }
        const comp = this.template.components.find(c => c.type === componentType);
        if (!comp)
            return;
        if (comp.type === 'HEADER' && comp.variables.length >= 1) {
            alert('Text headers support only one variable ({{1}}).');
            return;
        }
        const idx = comp.variables.length + 1;
        const placeholder = `{{${idx}}}`;
        comp.variables.push({ placeholder, example: '' });
        if (comp.type === 'HEADER' && comp.format === 'TEXT') {
            comp.text = (comp.text ? comp.text + ' ' : '') + placeholder;
        }
        else if (comp.type === 'BODY') {
            comp.text = (comp.text ? comp.text + ' ' : '') + placeholder;
        }
    }
    removeVariable(componentType, index) {
        var _a;
        if (this.template.category === 'AUTHENTICATION' && componentType === 'BODY') {
            return; // No variables to remove for authentication body
        }
        const comp = this.template.components.find(c => c.type === componentType);
        if (!comp || !comp.variables)
            return;
        const removedVar = comp.variables[index];
        comp.variables.splice(index, 1);
        if ((comp.type === 'HEADER' && comp.format === 'TEXT') || comp.type === 'BODY') {
            comp.text = (_a = comp.text) === null || _a === void 0 ? void 0 : _a.replace(new RegExp(`\\s*${this.escapeRegExp(removedVar.placeholder)}\\s*`, 'g'), ' ').trim();
            this.reindexVariables(comp);
        }
    }
    addButton() {
        const buttonsComp = this.template.components.find(c => c.type === 'BUTTONS');
        if (!buttonsComp)
            return;
        if (!buttonsComp.buttons) {
            buttonsComp.buttons = [];
        }
        if (buttonsComp.buttons.length >= (this.template.category === 'AUTHENTICATION' ? 1 : 2)) {
            alert(`Maximum of ${this.template.category === 'AUTHENTICATION' ? 1 : 2} button(s) allowed.`);
            return;
        }
        const newButton = {
            type: this.template.category === 'AUTHENTICATION' ? 'OTP' : 'QUICK_REPLY',
            text: this.template.category === 'AUTHENTICATION' ? 'Copy Code' : '',
            url: '',
            phone_number: '',
            variables: [],
            otp_type: this.template.category === 'AUTHENTICATION' ? 'COPY_CODE' : undefined
        };
        buttonsComp.buttons.push(newButton);
    }
    removeButton(index) {
        const buttonsComp = this.template.components.find(c => c.type === 'BUTTONS');
        if (!buttonsComp || !buttonsComp.buttons)
            return;
        buttonsComp.buttons.splice(index, 1);
    }
    addButtonVariable(buttonIndex) {
        const buttonsComp = this.template.components.find(c => c.type === 'BUTTONS');
        if (!buttonsComp || !buttonsComp.buttons)
            return;
        const btn = buttonsComp.buttons[buttonIndex];
        if (btn.type !== 'URL')
            return;
        if (!btn.variables) {
            btn.variables = [];
        }
        if (btn.variables.length >= 1) {
            alert('Only one URL variable is allowed per button.');
            return;
        }
        const idx = btn.variables.length + 1;
        const placeholder = `{{${idx}}}`;
        btn.variables.push({ placeholder, example: '' });
        btn.url = (btn.url ? btn.url + '/' : 'https://example.com/') + placeholder;
    }
    removeButtonVariable(buttonIndex, variableIndex) {
        const buttonsComp = this.template.components.find(c => c.type === 'BUTTONS');
        if (!buttonsComp || !buttonsComp.buttons || !buttonsComp.buttons[buttonIndex])
            return;
        const btn = buttonsComp.buttons[buttonIndex];
        if (!btn.variables)
            return;
        const removedVar = btn.variables[variableIndex];
        btn.variables.splice(variableIndex, 1);
        if (btn.url) {
            btn.url = btn.url.replace(new RegExp(`/*${this.escapeRegExp(removedVar.placeholder)}/*`, 'g'), '').trim();
        }
        this.reindexButtonVariables(btn);
    }
    onButtonTypeChange(index) {
        const buttonsComp = this.template.components.find(c => c.type === 'BUTTONS');
        if (!buttonsComp || !buttonsComp.buttons)
            return;
        const btn = buttonsComp.buttons[index];
        btn.text = '';
        btn.url = '';
        btn.phone_number = '';
        btn.variables = [];
        btn.otp_type = undefined;
        btn.autofill_text = undefined;
        btn.package_name = undefined;
        btn.signature_hash = undefined;
        if (btn.type === 'URL') {
            btn.url = 'https://example.com/{{1}}';
            btn.variables = [{ placeholder: '{{1}}', example: '' }];
        }
        else if (btn.type === 'OTP') {
            btn.text = 'Copy Code';
            btn.otp_type = 'COPY_CODE';
            btn.autofill_text = 'Autofill';
        }
    }
    reindexVariables(comp) {
        if (!comp.variables)
            return;
        comp.variables.forEach((v, i) => {
            var _a;
            const oldPlaceholder = v.placeholder;
            const newPlaceholder = `{{${i + 1}}}`;
            v.placeholder = newPlaceholder;
            if ((comp.type === 'HEADER' && comp.format === 'TEXT') || comp.type === 'BODY') {
                comp.text = ((_a = comp.text) === null || _a === void 0 ? void 0 : _a.replace(new RegExp(this.escapeRegExp(oldPlaceholder), 'g'), newPlaceholder)) || '';
            }
        });
    }
    reindexButtonVariables(btn) {
        if (!btn.variables)
            return;
        btn.variables.forEach((v, i) => {
            const oldPlaceholder = v.placeholder;
            const newPlaceholder = `{{${i + 1}}}`;
            v.placeholder = newPlaceholder;
            if (btn.url) {
                btn.url = btn.url.replace(new RegExp(this.escapeRegExp(oldPlaceholder), 'g'), newPlaceholder);
            }
        });
    }
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    syncVariables(componentType) {
        if (this.template.category === 'AUTHENTICATION' && componentType === 'BODY') {
            return; // No variables for authentication body
        }
        const comp = this.template.components.find(c => c.type === componentType);
        if (!comp)
            return;
        if (!comp.text || comp.text.trim() === '') {
            comp.variables = [];
            return;
        }
        const placeholders = comp.text.match(/\{\{\d+\}\}/g) || [];
        const numbers = placeholders.map(p => parseInt(p.replace(/\{/g, '').replace(/\}/g, ''))).sort((a, b) => a - b);
        comp.variables = comp.variables.filter(v => {
            const varNumber = parseInt(v.placeholder.replace(/\{/g, '').replace(/\}/g, ''));
            return numbers.includes(varNumber);
        });
        comp.variables.forEach((v, i) => {
            var _a;
            const oldPlaceholder = v.placeholder;
            const newPlaceholder = `{{${i + 1}}}`;
            v.placeholder = newPlaceholder;
            comp.text = ((_a = comp.text) === null || _a === void 0 ? void 0 : _a.replace(new RegExp(this.escapeRegExp(oldPlaceholder), 'g'), newPlaceholder)) || '';
        });
    }
    onHeaderTextChange(newText) {
        const headerComp = this.template.components[0];
        headerComp.text = newText;
        this.syncVariables('HEADER');
    }
    onBodyTextChange(newText) {
        if (this.template.category === 'AUTHENTICATION')
            return;
        const bodyComp = this.template.components[1];
        bodyComp.text = newText;
        this.syncVariables('BODY');
    }
    onHeaderKeydown(event) {
        var _a;
        const textarea = (_a = this.headerText) === null || _a === void 0 ? void 0 : _a.nativeElement;
        if (!textarea)
            return;
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
    onBodyKeydown(event) {
        var _a;
        if (this.template.category === 'AUTHENTICATION')
            return;
        const textarea = (_a = this.bodyText) === null || _a === void 0 ? void 0 : _a.nativeElement;
        if (!textarea)
            return;
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
    isValidMediaUrl(url) {
        return /^https?:\/\/|^blob:/.test(url); // Allow blob: URLs for local previews
    }
    getMediaPreviewUrl(componentType) {
        const comp = this.template.components.find(c => c.type === componentType);
        if (!comp)
            return '';
        if (comp.previewMediaUrl && this.isValidMediaUrl(comp.previewMediaUrl)) {
            return comp.previewMediaUrl;
        }
        return '';
    }
    handleMediaError(event, componentType) {
        const element = event.target;
        const comp = this.template.components.find(c => c.type === componentType);
        if (comp) {
            comp.mediaError = true;
            element.style.display = 'none';
        }
    }
    renderPreview(componentType) {
        var _a;
        const comp = this.template.components.find(c => c.type === componentType);
        if (!comp)
            return '';
        if (componentType === 'HEADER' && comp.format !== 'TEXT') {
            return this.getMediaPreviewUrl(componentType);
        }
        if (componentType === 'BODY' && this.template.category === 'AUTHENTICATION') {
            return '{{1}} is your verification code';
        }
        let text = comp.text || '';
        (_a = comp.variables) === null || _a === void 0 ? void 0 : _a.forEach((v) => {
            const replacement = v.example && v.example.trim() !== '' ? v.example : v.placeholder;
            text = text.replace(new RegExp(this.escapeRegExp(v.placeholder), 'g'), replacement);
        });
        return text;
    }
    renderButtonText(btn) {
        if (btn.type === 'OTP') {
            return btn.text || 'Copy Code';
        }
        return btn.text || 'Button';
    }
    getButtonVariables(btn) {
        return btn.type === 'URL' ? (btn.variables || []) : [];
    }
    getMediaFileName(url) {
        return url.split('/').pop() || '';
    }
    renderBodyPreviewLines() {
        const preview = this.renderPreview('BODY');
        if (!preview)
            return [];
        return preview.split('\n').map(s => s.trim()).filter(Boolean);
    }
    hasPreviewContent() {
        const header = this.template.components[0];
        const body = this.template.components[1];
        const footer = this.template.components[2];
        const buttons = this.template.components[3];
        const hasHeader = this.template.category !== 'AUTHENTICATION' &&
            header &&
            ((header.format === 'TEXT' && header.text) ||
                (header.format !== 'TEXT' && header.mediaUrl));
        const hasBody = this.template.category === 'AUTHENTICATION' || (body && body.text);
        const hasFooter = footer && (footer.text || (this.template.category === 'AUTHENTICATION' && footer.code_expiration_minutes));
        const hasButtons = buttons && buttons.buttons && buttons.buttons.length > 0;
        return !!(hasHeader || hasBody || hasFooter || hasButtons);
    }
    getCurrentTime() {
        return new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }
    isFormValid() {
        var _a;
        const bodyComp = this.template.components[1];
        const buttonsComp = this.template.components[3];
        const headerComp = this.template.components[0];
        if (this.template.category === 'AUTHENTICATION') {
            return !!(this.template.name &&
                this.template.name.match(/^[a-z0-9_]+$/) &&
                (!buttonsComp.buttons || buttonsComp.buttons.length <= 1) &&
                (!buttonsComp.buttons || buttonsComp.buttons.every(btn => btn.type === 'OTP' && btn.otp_type)));
        }
        return !!(this.template.name &&
            this.template.name.match(/^[a-z0-9_]+$/) &&
            bodyComp.text &&
            (!((_a = headerComp.variables) === null || _a === void 0 ? void 0 : _a.length) || headerComp.variables.every(v => v.example)) &&
            (!buttonsComp.buttons || buttonsComp.buttons.every(btn => (btn.type === 'QUICK_REPLY' && btn.text) ||
                (btn.type === 'URL' && btn.text && btn.url && (!btn.variables || btn.variables.every(v => v.example))) ||
                (btn.type === 'PHONE_NUMBER' && btn.text && btn.phone_number))));
    }
    getAcceptType(format) {
        switch (format) {
            case 'IMAGE':
                return 'image/jpeg,image/png';
            case 'VIDEO':
                return 'video/mp4,video/3gpp';
            case 'DOCUMENT':
                return 'application/pdf';
            default:
                return '*/*';
        }
    }
    onMediaFileChange(event) {
        const input = event.target;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            const headerComp = this.template.components[0];
            const mimeType = file.type;
            // Create local preview URL
            headerComp.previewMediaUrl = URL.createObjectURL(file);
            // Upload to backend
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', mimeType);
            this.templateService.uploadMedia(formData).subscribe({
                next: (response) => {
                    headerComp.mediaUrl = response.id;
                    console.log('Media uploaded, handle:', headerComp.mediaUrl);
                },
                error: (err) => {
                    console.error('Upload error:', err);
                    this.errorMessage = 'Failed to upload media.';
                    if (headerComp.previewMediaUrl) {
                        URL.revokeObjectURL(headerComp.previewMediaUrl);
                        headerComp.previewMediaUrl = '';
                    }
                }
            });
        }
    }
    onSubmit() {
        var _a;
        this.successMessage = '';
        this.errorMessage = '';
        // Sanitize template name
        const safeName = (this.template.name || '').trim()
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
        const payload = {
            name: safeName,
            category: this.template.category,
            language: this.template.language,
            components: this.template.components
                .map((c, index) => {
                if (this.isEmptyComponent(c, index)) {
                    return null;
                }
                const base = { type: c.type };
                // BUTTONS
                if (c.type === 'BUTTONS' && c.buttons && c.buttons.length > 0) {
                    base.buttons = c.buttons.map(btn => {
                        const button = { type: btn.type };
                        if (btn.type === 'QUICK_REPLY') {
                            button.text = btn.text || '';
                        }
                        else if (btn.type === 'URL') {
                            button.text = btn.text || '';
                            button.url = btn.url || '';
                            if (btn.variables && btn.variables.length > 0) {
                                button.example = btn.variables.map(v => v.example || 'example');
                            }
                        }
                        else if (btn.type === 'PHONE_NUMBER') {
                            button.text = btn.text || '';
                            button.phone_number = btn.phone_number || '';
                        }
                        else if (btn.type === 'OTP') {
                            button.otp_type = btn.otp_type || 'COPY_CODE';
                            button.text = btn.text || 'Copy Code';
                            if (btn.autofill_text)
                                button.autofill_text = btn.autofill_text;
                            if (btn.package_name)
                                button.package_name = btn.package_name;
                            if (btn.signature_hash)
                                button.signature_hash = btn.signature_hash;
                        }
                        return button;
                    });
                }
                // HEADER (TEXT)
                if (c.type === 'HEADER' && c.format === 'TEXT' && c.text) {
                    base.format = 'TEXT';
                    base.text = c.text;
                    if (c.variables && c.variables.length > 0) {
                        base.example = { header_text: c.variables.map(v => v.example || 'example') };
                    }
                }
                // HEADER (MEDIA: IMAGE, VIDEO, DOCUMENT)
                else if (c.type === 'HEADER' && c.format !== 'TEXT') {
                    base.format = c.format;
                    if (c.mediaUrl) {
                        base.example = { header_handle: [c.mediaUrl] };
                    }
                }
                // BODY
                if (c.type === 'BODY') {
                    if (this.template.category === 'AUTHENTICATION') {
                        if (c.add_security_recommendation) {
                            base.add_security_recommendation = c.add_security_recommendation;
                        }
                    }
                    else {
                        base.text = c.text;
                        if (c.variables && c.variables.length > 0) {
                            base.example = { body_text: [c.variables.map(v => v.example || 'example')] };
                        }
                    }
                }
                // FOOTER
                if (c.type === 'FOOTER' && (c.text || (this.template.category === 'AUTHENTICATION' && c.code_expiration_minutes))) {
                    base.text = c.text || '';
                    if (this.template.category === 'AUTHENTICATION' && c.code_expiration_minutes) {
                        base.code_expiration_minutes = c.code_expiration_minutes;
                    }
                }
                return base;
            })
                .filter(c => c !== null)
                .filter(c => !(c.type === 'HEADER' && this.template.category === 'AUTHENTICATION'))
        };
        // Additional validation for IMAGE, VIDEO, DOCUMENT headers
        const headerComp = payload.components.find((c) => c.type === 'HEADER');
        if (headerComp && headerComp.format !== 'TEXT' && !((_a = headerComp.example) === null || _a === void 0 ? void 0 : _a.header_handle)) {
            this.errorMessage = '❌ Media header requires a valid media handle.';
            return;
        }
        console.log('✅ Payload:', JSON.stringify(payload, null, 2));
        this.sendTemplateToAPI(payload);
    }
    isEmptyComponent(component, index) {
        if (component.type === 'BUTTONS') {
            return !component.buttons || component.buttons.length === 0;
        }
        if (component.type === 'HEADER') {
            if (this.template.category === 'AUTHENTICATION')
                return true;
            if (component.format === 'TEXT')
                return !component.text;
            return !component.mediaUrl;
        }
        if (component.type === 'BODY') {
            return this.template.category !== 'AUTHENTICATION' && !component.text;
        }
        if (component.type === 'FOOTER') {
            return !component.text && !(this.template.category === 'AUTHENTICATION' && component.code_expiration_minutes);
        }
        return true;
    }
    sendTemplateToAPI(payload) {
        this.templateService.createTemplate(payload).subscribe({
            next: () => {
                this.successMessage = '✅ Template created successfully!';
                this.errorMessage = '';
            },
            error: (err) => {
                var _a, _b, _c;
                console.error('Error:', err);
                const serverMsg = ((_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.message) || ((_c = err === null || err === void 0 ? void 0 : err.error) === null || _c === void 0 ? void 0 : _c.message) || (err === null || err === void 0 ? void 0 : err.message);
                this.errorMessage = '❌ Failed to create template: ' + (serverMsg || 'Unknown error');
            }
        });
    }
};
__decorate([
    (0, core_1.ViewChild)('headerText')
], CreateTemplateComponent.prototype, "headerText", void 0);
__decorate([
    (0, core_1.ViewChild)('bodyText')
], CreateTemplateComponent.prototype, "bodyText", void 0);
CreateTemplateComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-create-template',
        standalone: true,
        imports: [common_1.CommonModule, forms_1.FormsModule],
        templateUrl: './create-template.component.html',
        styleUrls: ['./create-template.component.css']
    })
], CreateTemplateComponent);
exports.CreateTemplateComponent = CreateTemplateComponent;
