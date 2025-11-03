"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateListComponent = void 0;
const core_1 = require("@angular/core");
const forms_1 = require("@angular/forms");
const common_1 = require("@angular/common");
let TemplateListComponent = class TemplateListComponent {
    constructor(templateService) {
        this.templateService = templateService;
        this.templates = [];
        this.errorMsg = '';
        this.loading = false;
    }
    ngOnInit() {
        this.loadTemplates();
    }
    loadTemplates() {
        this.loading = true;
        this.errorMsg = '';
        this.templateService.getAllTemplates().subscribe({
            next: (res) => {
                this.templates = (res === null || res === void 0 ? void 0 : res.data) || [];
                this.loading = false;
            },
            error: (err) => {
                var _a;
                console.error(err);
                this.errorMsg = `❌ Error ${err.status}: ${((_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || err.message || err.statusText}`;
                this.loading = false;
            }
        });
    }
    /**
     * عرض محتوى الـ component بناءً على النوع/الصيغة.
     * يدعم fallbacks لمفاتيح مختلفة (text, body, وغيرها).
     */
    getComponentContent(component) {
        if (!component)
            return '';
        const format = component.format || component.format_type || '';
        // لو header/body ونوعه وسائط
        if (component.type === 'BODY' || component.type === 'HEADER') {
            if (format === 'IMAGE')
                return '[Image]';
            if (format === 'VIDEO')
                return '[Video]';
            if (format === 'DOCUMENT')
                return '[Document]';
            // نص أساسي قد يكون في properties مختلفة
            return component.text || component.body || component.payload || '';
        }
        // Buttons/footer/others - ارجع نص إن وُجد
        if (component.text)
            return component.text;
        return '';
    }
    /* ---------- Helpers to safely read example fields (handle multiple naming styles) ---------- */
    getExampleHeaderTexts(example) {
        if (!example)
            return [];
        // possible names: headerTexts, header_text, header_texts
        return example.headerTexts || example['header_text'] || example['header_texts'] || [];
    }
    getExampleBodyTexts(example) {
        if (!example)
            return [];
        // possible names: bodyTexts, body_text, body_texts
        return example.bodyTexts || example['body_text'] || example['body_texts'] || [];
    }
    getExampleHeaderHandles(example) {
        if (!example)
            return [];
        return example.headerHandles || example['header_handle'] || example['header_handles'] || [];
    }
    /**
     * Normalize a body row for display:
     * - If it's an array => join with comma
     * - If it's string => return
     * - Otherwise stringify safely
     */
    formatBodyRow(row) {
        if (row == null)
            return '';
        if (Array.isArray(row))
            return row.join(', ');
        if (typeof row === 'string')
            return row;
        try {
            return JSON.stringify(row);
        }
        catch (_a) {
            return String(row);
        }
    }
    getStatusClass(status) {
        if (!status)
            return '';
        switch (status.toLowerCase()) {
            case 'approved': return 'approved';
            case 'rejected': return 'rejected';
            case 'pending': return 'pending';
            default: return '';
        }
    }
};
TemplateListComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-template-list',
        standalone: true,
        imports: [forms_1.FormsModule, common_1.CommonModule],
        templateUrl: './template-list.component.html',
        styleUrls: ['./template-list.component.css']
    })
], TemplateListComponent);
exports.TemplateListComponent = TemplateListComponent;
