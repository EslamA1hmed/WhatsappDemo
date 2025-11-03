"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMessageComponent = void 0;
const core_1 = require("@angular/core");
const forms_1 = require("@angular/forms");
const common_1 = require("@angular/common");
const http_1 = require("@angular/common/http");
const auth_service_1 = require("/home/islam/vodafone-auth/src/app/services/auth.service");
let SendMessageComponent = class SendMessageComponent {
    constructor() {
        this.http = (0, core_1.inject)(http_1.HttpClient);
        this.authService = (0, core_1.inject)(auth_service_1.AuthService);
        this.to = '';
        this.type = '';
        this.textBody = '';
        this.imageLink = '';
        this.imageCaption = '';
        this.videoLink = '';
        this.videoCaption = '';
        this.docLink = '';
        this.docFilename = '';
        // Template-related fields
        this.templateNames = [];
        this.selectedTemplateName = '';
        this.selectedTemplate = null;
        this.templateHeaderVariables = []; // For header text variables
        this.templateHeaderMedia = ''; // For header media (IMAGE/VIDEO/DOCUMENT)
        this.templateBodyVariables = []; // For body variables
        this.templateButtonValues = []; // For button parameters (URL/OTP)
        this.oneTapParams = []; // For ONE_TAP buttons
        this.headerComponent = null;
        this.headerFormat = null;
        this.footerText = null;
        this.addSecurityRecommendation = null;
        this.codeExpirationMinutes = null;
        this.errorMsg = '';
        this.successMsg = '';
        this.responseData = null;
        this.loadTemplateNames();
    }
    isRTL(text) {
        if (!text)
            return false;
        const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
        return rtlRegex.test(text);
    }
    isPreviewRTL() {
        if (this.type === 'text' && this.textBody) {
            return this.isRTL(this.textBody);
        }
        else if (this.type === 'template' && this.selectedTemplate) {
            const headerText = this.formatHeaderText();
            const bodyText = this.formatBodyText();
            const footerText = this.getFooterText();
            return this.isRTL(headerText) || this.isRTL(bodyText) || this.isRTL(footerText);
        }
        else if (this.type === 'image' && this.imageCaption) {
            return this.isRTL(this.imageCaption);
        }
        else if (this.type === 'video' && this.videoCaption) {
            return this.isRTL(this.videoCaption);
        }
        else if (this.type === 'document' && this.docFilename) {
            return this.isRTL(this.docFilename);
        }
        return false;
    }
    loadTemplateNames() {
        this.http.get('http://localhost:8080/template/names')
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
    onTypeChange(event) {
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
    onTemplateChange(event) {
        this.errorMsg = '';
        this.selectedTemplateName = event.target.value;
        if (this.selectedTemplateName) {
            this.http.get(`http://localhost:8080/template/${this.selectedTemplateName}`)
                .subscribe({
                next: (res) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                    this.selectedTemplate = res;
                    this.headerComponent = ((_b = (_a = this.selectedTemplate) === null || _a === void 0 ? void 0 : _a.components) === null || _b === void 0 ? void 0 : _b.find(c => c.type === 'HEADER')) || null;
                    this.headerFormat = ((_c = this.headerComponent) === null || _c === void 0 ? void 0 : _c.format) || null;
                    if ((_e = (_d = this.headerComponent) === null || _d === void 0 ? void 0 : _d.example) === null || _e === void 0 ? void 0 : _e.header_text) {
                        this.templateHeaderVariables = new Array(this.headerComponent.example.header_text.length).fill('');
                    }
                    else {
                        this.templateHeaderVariables = [];
                    }
                    const bodyComponent = (_g = (_f = this.selectedTemplate) === null || _f === void 0 ? void 0 : _f.components) === null || _g === void 0 ? void 0 : _g.find(c => c.type === 'BODY');
                    if ((_h = bodyComponent === null || bodyComponent === void 0 ? void 0 : bodyComponent.example) === null || _h === void 0 ? void 0 : _h.body_text) {
                        const variableCount = ((_j = bodyComponent.example.body_text[0]) === null || _j === void 0 ? void 0 : _j.length) || 0;
                        this.templateBodyVariables = new Array(variableCount).fill('');
                    }
                    else {
                        this.templateBodyVariables = [];
                    }
                    const buttonComponent = (_l = (_k = this.selectedTemplate) === null || _k === void 0 ? void 0 : _k.components) === null || _l === void 0 ? void 0 : _l.find(c => c.type === 'BUTTONS');
                    if (buttonComponent === null || buttonComponent === void 0 ? void 0 : buttonComponent.buttons) {
                        // Only URL buttons with variables and ONE_TAP OTP buttons need input
                        const dynamicButtons = buttonComponent.buttons.filter(b => (b.type === 'URL' && b.example && b.example.length > 0) ||
                            (b.type === 'OTP' && b.otp_type === 'ONE_TAP'));
                        this.templateButtonValues = new Array(dynamicButtons.length).fill('');
                        this.oneTapParams = buttonComponent.buttons.map(b => b.type === 'OTP' && b.otp_type === 'ONE_TAP'
                            ? {
                                autofillText: b.autofill_text || 'Autofill',
                                packageName: b.package_name || '',
                                signatureHash: b.signature_hash || ''
                            }
                            : { autofillText: '', packageName: '', signatureHash: '' });
                    }
                    else {
                        this.templateButtonValues = [];
                        this.oneTapParams = [];
                    }
                    const footerComponent = (_o = (_m = this.selectedTemplate) === null || _m === void 0 ? void 0 : _m.components) === null || _o === void 0 ? void 0 : _o.find(c => c.type === 'FOOTER');
                    this.footerText = (footerComponent === null || footerComponent === void 0 ? void 0 : footerComponent.text) || null;
                    this.addSecurityRecommendation = (bodyComponent === null || bodyComponent === void 0 ? void 0 : bodyComponent.add_security_recommendation) || null;
                    this.codeExpirationMinutes = (footerComponent === null || footerComponent === void 0 ? void 0 : footerComponent.code_expiration_minutes) || null;
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
        }
        else {
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
    hasButtonVariables(button) {
        return button.type === 'URL' && !!button.example && button.example.length > 0;
    }
    onSend() {
        var _a, _b;
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
        const payload = {
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
        }
        else if (this.type === 'image') {
            if (!this.imageLink) {
                this.errorMsg = '⚠️ Please enter the image link.';
                return;
            }
            payload.image = { link: this.imageLink };
            if (this.imageCaption) {
                payload.image.caption = this.imageCaption;
            }
        }
        else if (this.type === 'video') {
            if (!this.videoLink) {
                this.errorMsg = '⚠️ Please enter the video link.';
                return;
            }
            payload.video = { link: this.videoLink };
            if (this.videoCaption) {
                payload.video.caption = this.videoCaption;
            }
        }
        else if (this.type === 'document') {
            if (!this.docLink) {
                this.errorMsg = '⚠️ Please enter the document link.';
                return;
            }
            payload.document = { link: this.docLink };
            if (this.docFilename) {
                payload.document.filename = this.docFilename;
            }
        }
        else if (this.type === 'template') {
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
            const buttonComponent = (_a = this.selectedTemplate.components) === null || _a === void 0 ? void 0 : _a.find(c => c.type === 'BUTTONS');
            if (buttonComponent === null || buttonComponent === void 0 ? void 0 : buttonComponent.buttons) {
                const dynamicButtons = buttonComponent.buttons.filter(b => (b.type === 'URL' && b.example && b.example.length > 0) ||
                    (b.type === 'OTP' && b.otp_type === 'ONE_TAP'));
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
                const header = { type: 'header', parameters: [] };
                if (this.headerComponent.format === 'TEXT' && this.templateHeaderVariables.length) {
                    header.parameters = this.templateHeaderVariables.map(v => ({ type: 'text', text: v }));
                }
                else if (this.headerComponent.format && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(this.headerComponent.format) && this.templateHeaderMedia) {
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
            const bodyComponent = (_b = this.selectedTemplate.components) === null || _b === void 0 ? void 0 : _b.find(c => c.type === 'BODY');
            if (bodyComponent && this.templateBodyVariables.length) {
                payload.template.components.push({
                    type: 'body',
                    parameters: this.templateBodyVariables.map(v => ({ type: 'text', text: v }))
                });
            }
            // Buttons
            if (buttonComponent === null || buttonComponent === void 0 ? void 0 : buttonComponent.buttons) {
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
                    }
                    else if (button.type === 'OTP' && button.otp_type === 'ONE_TAP' && this.templateButtonValues[buttonIndex]) {
                        const params = [{
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
        const headers = new http_1.HttpHeaders({
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
                var _a;
                this.errorMsg = `❌ Error ${err.status}: ${((_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || err.message || err.statusText}`;
            }
        });
    }
    hasPreviewContent() {
        return !!((this.type === 'text' && this.textBody) ||
            (this.type === 'image' && this.imageLink) ||
            (this.type === 'video' && this.videoLink) ||
            (this.type === 'document' && this.docLink) ||
            (this.type === 'template' && this.selectedTemplate));
    }
    hasHeaderVariables() {
        var _a, _b;
        return !!this.headerComponent && this.headerComponent.format === 'TEXT' && !!((_b = (_a = this.headerComponent.example) === null || _a === void 0 ? void 0 : _a.header_text) === null || _b === void 0 ? void 0 : _b.length);
    }
    hasHeaderMedia() {
        return !!this.headerComponent && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(this.headerComponent.format || '');
    }
    getHeaderVariables() {
        var _a, _b;
        return ((_b = (_a = this.headerComponent) === null || _a === void 0 ? void 0 : _a.example) === null || _b === void 0 ? void 0 : _b.header_text) || [];
    }
    getBodyVariables() {
        var _a, _b, _c, _d;
        const bodyComponent = (_b = (_a = this.selectedTemplate) === null || _a === void 0 ? void 0 : _a.components) === null || _b === void 0 ? void 0 : _b.find(c => c.type === 'BODY');
        return ((_d = (_c = bodyComponent === null || bodyComponent === void 0 ? void 0 : bodyComponent.example) === null || _c === void 0 ? void 0 : _c.body_text) === null || _d === void 0 ? void 0 : _d[0]) || [];
    }
    getDynamicButtons() {
        var _a, _b;
        const buttonComponent = (_b = (_a = this.selectedTemplate) === null || _a === void 0 ? void 0 : _a.components) === null || _b === void 0 ? void 0 : _b.find(c => c.type === 'BUTTONS');
        return (buttonComponent === null || buttonComponent === void 0 ? void 0 : buttonComponent.buttons) || [];
    }
    formatHeaderText() {
        var _a, _b;
        if (!((_a = this.headerComponent) === null || _a === void 0 ? void 0 : _a.text) || !this.hasHeaderVariables())
            return ((_b = this.headerComponent) === null || _b === void 0 ? void 0 : _b.text) || 'Header Preview';
        let text = this.headerComponent.text;
        this.templateHeaderVariables.forEach((variable, index) => {
            text = text.replace(`{{${index + 1}}}`, variable || `{{${index + 1}}}`);
        });
        return text;
    }
    formatBodyText() {
        var _a, _b;
        const bodyComponent = (_b = (_a = this.selectedTemplate) === null || _a === void 0 ? void 0 : _a.components) === null || _b === void 0 ? void 0 : _b.find(c => c.type === 'BODY');
        if (!(bodyComponent === null || bodyComponent === void 0 ? void 0 : bodyComponent.text))
            return 'Body Preview';
        let text = bodyComponent.text;
        this.templateBodyVariables.forEach((variable, index) => {
            text = text.replace(`{{${index + 1}}}`, variable || `{{${index + 1}}}`);
        });
        return text;
    }
    getFooterText() {
        let footerText = this.footerText || '';
        if (this.codeExpirationMinutes) {
            footerText = `This code expires in ${this.codeExpirationMinutes} minutes.`;
        }
        return footerText;
    }
    getMediaFileName(url) {
        return url.split('/').pop() || 'Document';
    }
    getCurrentTime() {
        return new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }
    getButtonDisplayValue(button, index) {
        return button.text; // Show the actual text on the button for all types
    }
};
SendMessageComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-send-message',
        standalone: true,
        imports: [forms_1.FormsModule, common_1.CommonModule],
        templateUrl: './send-message.component.html',
        styleUrls: ['./send-message.component.css']
    })
], SendMessageComponent);
exports.SendMessageComponent = SendMessageComponent;
