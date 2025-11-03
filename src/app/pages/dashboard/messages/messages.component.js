"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesComponent = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
const forms_1 = require("@angular/forms");
const router_1 = require("@angular/router");
const rxjs_1 = require("rxjs"); // ✨ 1. استيراد forkJoin و map
// ✨ 2. استيراد الخدمات والنماذج اللازمة
const message_service_1 = require("./message.service");
const MediaService_1 = require("../../../services/MediaService");
const contact_service_1 = require("../../../services/contact.service"); // تأكد من صحة المسار
const dashboard_stats_component_1 = require("./dashboard-stats.component");
let MessagesComponent = class MessagesComponent {
    constructor() {
        this.messages = [];
        this.allMessages = [];
        this.currentPage = 0;
        this.totalPages = 0;
        this.pageSize = 6;
        this.loading = true;
        this.error = '';
        this.searchTerm = '';
        this.activeView = 'messages';
        this.messageService = (0, core_1.inject)(message_service_1.MessageService);
        this.mediaService = (0, core_1.inject)(MediaService_1.MediaService);
        this.router = (0, core_1.inject)(router_1.Router);
        this.platformId = (0, core_1.inject)(core_1.PLATFORM_ID);
        this.contactService = (0, core_1.inject)(contact_service_1.ContactService); // ✨ 4. حقن خدمة جهات الاتصال
    }
    ngOnInit() {
        if ((0, common_1.isPlatformBrowser)(this.platformId)) {
            this.loadMessages();
        }
        else {
            this.error = 'Messages cannot be loaded on this platform';
            this.loading = false;
        }
    }
    ngOnDestroy() {
        this.messages.forEach(msg => {
            if (msg.mediaUrl && msg.mediaUrl.startsWith('blob:')) {
                URL.revokeObjectURL(msg.mediaUrl);
            }
        });
    }
    // ✨ 5. تعديل دالة `loadMessages` بالكامل
    loadMessages() {
        this.loading = true;
        this.error = '';
        // إعداد الطلبات التي سيتم تنفيذها بالتوازي
        const messagesRequest$ = this.messageService.getMessages(this.currentPage, this.pageSize);
        const contactsRequest$ = this.contactService.getAllContacts(0, 200); // جلب عدد كبير من جهات الاتصال
        (0, rxjs_1.forkJoin)({
            messagesResponse: messagesRequest$,
            contacts: contactsRequest$
        }).pipe((0, rxjs_1.map)(({ messagesResponse, contacts }) => {
            // إنشاء خريطة للبحث السريع باستخدام رقم الهاتف
            const contactMap = new Map();
            contacts.forEach(contact => {
                // قم بإزالة أي رموز غير رقمية لتوحيد الصيغة
                const cleanPhoneNumber = contact.phoneNumber.replace(/\D/g, '');
                contactMap.set(cleanPhoneNumber, contact.name);
            });
            // معالجة كل رسالة لإضافة اسم المستلم
            const processedMessages = messagesResponse.content.map((msg) => {
                const cleanToNumber = msg.to.replace(/\D/g, '');
                const recipientName = contactMap.get(cleanToNumber);
                const mediaUrl = msg.mediaUrl || msg.mediaURL;
                return Object.assign(Object.assign({}, msg), { recipientName: recipientName || `+${msg.to}`, mediaUrl: mediaUrl, hasMedia: !!(mediaUrl || msg.mediaId), hasButtons: msg.buttons && msg.buttons.length > 0, mediaLoaded: false, mediaError: false, isLoadingMedia: false });
            });
            return { messages: processedMessages, totalPages: messagesResponse.totalPages };
        })).subscribe({
            next: ({ messages, totalPages }) => {
                this.allMessages = messages;
                this.messages = [...this.allMessages];
                this.totalPages = totalPages;
                this.loading = false;
                this.messages.forEach(msg => {
                    if (msg.mediaId && !msg.mediaUrl && msg.hasMedia) {
                        this.loadMediaUrl(msg);
                    }
                });
            },
            error: (err) => {
                console.error('API Error:', err);
                this.error = 'Failed to load messages or contacts. Please try again.';
                this.loading = false;
            }
        });
    }
    loadMediaUrl(message) {
        if (!message.mediaId || message.mediaUrl)
            return;
        message.isLoadingMedia = true;
        this.mediaService.downloadMediaAsBlob(message.mediaId).subscribe({
            next: (blobUrl) => {
                message.mediaUrl = blobUrl;
                message.isLoadingMedia = false;
                message.mediaLoaded = false;
            },
            error: (err) => {
                console.error('Error downloading media for mediaId:', message.mediaId, err);
                message.mediaError = true;
                message.isLoadingMedia = false;
            }
        });
    }
    onMediaLoad(message) {
        message.mediaLoaded = true;
        message.mediaError = false;
        message.isLoadingMedia = false;
    }
    onMediaError(message) {
        console.error('Failed to load media for message:', message);
        message.mediaError = true;
        message.mediaLoaded = false;
        message.isLoadingMedia = false;
    }
    onPageChange(page) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.loadMessages();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    isRTL(text) {
        if (!text)
            return false;
        const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
        return rtlRegex.test(text);
    }
    // ✨ 6. تعديل دالة `getInitials` لتكون أكثر ذكاءً
    getInitials(nameOrPhone) {
        if (!nameOrPhone)
            return '?';
        // التحقق إذا كان الإدخال يحتوي على حروف (مما يعني أنه اسم)
        if (/[a-zA-Z]/.test(nameOrPhone)) {
            const words = nameOrPhone.trim().split(' ').filter(w => w);
            if (words.length > 1) {
                return (words[0][0] + words[words.length - 1][0]).toUpperCase();
            }
            return nameOrPhone.substring(0, 2).toUpperCase();
        }
        // إذا كان رقمًا، استخدم آخر رقمين
        const digits = nameOrPhone.replace(/\D/g, '');
        return digits.slice(-2) || '??';
    }
    getStatusIcon(status) {
        const icons = {
            'sent': '✓',
            'delivered': '✓✓',
            'read': '👁️',
            'failed': '✗',
            'pending': '⏱'
        };
        return icons[status === null || status === void 0 ? void 0 : status.toLowerCase()] || '•';
    }
    getTotalMessages() {
        return this.allMessages.length;
    }
    getMessagesByStatus(status) {
        return this.allMessages.filter(m => { var _a; return ((_a = m.status) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === status.toLowerCase(); }).length;
    }
    onSearch() {
        if (!this.searchTerm.trim()) {
            this.messages = [...this.allMessages];
            return;
        }
        const term = this.searchTerm.toLowerCase().trim();
        // البحث بالاسم أو الرقم
        this.messages = this.allMessages.filter(msg => { var _a, _b; return ((_a = msg.recipientName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(term)) || ((_b = msg.to) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(term)); });
    }
    setView(view) {
        this.activeView = view;
    }
};
MessagesComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-messages',
        standalone: true,
        imports: [common_1.CommonModule, forms_1.FormsModule, dashboard_stats_component_1.DashboardStatsComponent],
        templateUrl: './messages.component.html',
        styleUrls: ['./messages.component.css']
    })
], MessagesComponent);
exports.MessagesComponent = MessagesComponent;
