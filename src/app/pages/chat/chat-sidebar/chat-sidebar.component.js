"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSidebarComponent = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
const forms_1 = require("@angular/forms");
const contact_service_1 = require("../../../services/contact.service");
const chat_message_service_1 = require("../../../services/chat-message.service");
const websocket_service_1 = require("../../../services/websocket.service");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let ChatSidebarComponent = class ChatSidebarComponent {
    constructor() {
        this.contactSelected = new core_1.EventEmitter();
        this.contactService = (0, core_1.inject)(contact_service_1.ContactService);
        this.messageService = (0, core_1.inject)(chat_message_service_1.ChatMessageService);
        this.websocketService = (0, core_1.inject)(websocket_service_1.WebSocketService);
        this.contacts = [];
        this.filteredContacts = [];
        this.selectedContactId = null;
        this.loading = false;
        this.searchTerm = '';
        this.showAddContact = false;
        this.newContact = {
            phoneNumber: '',
            name: '',
        };
        // WebSocket subscriptions
        this.contactSubscriptions = new Map();
    }
    ngOnInit() {
        this.loadContacts();
    }
    ngOnDestroy() {
        // Clean up all subscriptions
        this.contactSubscriptions.forEach((subs) => {
            subs.message.unsubscribe();
            subs.status.unsubscribe();
        });
        this.contactSubscriptions.clear();
    }
    loadContacts() {
        this.loading = true;
        this.contactService.getAllContacts(0, 100).subscribe({
            next: (contacts) => {
                this.contacts = contacts.map(c => (Object.assign(Object.assign({}, c), { unreadCount: c.unread || 0 })));
                this.loadLastMessagesForAllContacts();
                this.filteredContacts = [...this.contacts];
                this.loading = false;
                this.setupWebSocketForAllContacts();
            },
            error: (err) => {
                console.error('Error loading contacts:', err);
                this.loading = false;
                alert('Failed to load contacts');
            },
        });
    }
    setupWebSocketForAllContacts() {
        this.contacts.forEach((contact) => {
            if (!this.contactSubscriptions.has(contact.phoneNumber)) {
                this.subscribeToContact(contact.phoneNumber);
            }
        });
    }
    subscribeToContact(phoneNumber) {
        const messageSub = this.websocketService.subscribeToMessages(phoneNumber).subscribe((message) => {
            if (message) {
                console.log('Sidebar received message:', message);
                this.handleIncomingMessage(message, phoneNumber);
            }
        });
        const statusSub = this.websocketService.subscribeToStatus(phoneNumber).subscribe((status) => {
            if (status) {
                console.log('Sidebar received status:', status);
                this.handleStatusUpdate(status, phoneNumber);
            }
        });
        this.contactSubscriptions.set(phoneNumber, { message: messageSub, status: statusSub });
    }
    handleIncomingMessage(message, phoneNumber) {
        const contact = this.contacts.find((c) => c.phoneNumber === phoneNumber);
        if (contact) {
            contact.lastMessage = this.getMessagePreview(message);
            contact.lastMessageTime = message.createdAt;
            if (message.direction === 'RECEIVED' && this.selectedContactId !== contact.id) {
                contact.unreadCount = (contact.unreadCount || 0) + 1;
            }
            this.moveContactToTop(contact);
            this.filterContacts();
            if (this.selectedContactId !== contact.id) {
                this.playNotificationSound();
            }
        }
    }
    handleStatusUpdate(status, phoneNumber) {
        const contact = this.contacts.find((c) => c.phoneNumber === phoneNumber);
        if (contact && contact.lastMessage) {
            console.log(`Status updated for ${phoneNumber}: ${status.status}`);
        }
    }
    moveContactToTop(contact) {
        const index = this.contacts.indexOf(contact);
        if (index > -1) {
            this.contacts.splice(index, 1);
        }
        this.contacts.unshift(contact);
    }
    playNotificationSound() {
        try {
            const audio = new Audio('assets/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch((err) => console.log('Could not play sound:', err));
        }
        catch (error) {
            console.log('Notification sound not available');
        }
    }
    loadLastMessagesForAllContacts() {
        const requests = this.contacts.map((contact) => this.messageService.getLastMessageForContact(contact.phoneNumber).pipe((0, operators_1.map)((message) => (Object.assign(Object.assign({}, contact), { lastMessage: message ? this.getMessagePreview(message) : undefined, lastMessageTime: message ? message.createdAt : undefined })))));
        (0, rxjs_1.forkJoin)(requests).subscribe({
            next: (updatedContacts) => {
                this.contacts = updatedContacts;
                this.filteredContacts = [...this.contacts];
            },
            error: (err) => {
                console.error('Error loading last messages:', err);
            },
        });
    }
    getMessagePreview(message) {
        if (message.type === 'text' && message.textBody)
            return this.truncateText(message.textBody);
        if (message.type === 'template' && message.templateBody)
            return this.truncateText(message.templateBody);
        if (message.type === 'image')
            return message.caption ? this.truncateText(message.caption) : '📷 image';
        if (message.type === 'audio')
            return 'audio';
        return 'Message';
    }
    filterContacts() {
        if (!this.searchTerm.trim()) {
            this.filteredContacts = [...this.contacts];
            return;
        }
        const term = this.searchTerm.toLowerCase();
        this.filteredContacts = this.contacts.filter((c) => { var _a; return ((_a = c.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(term)) || c.phoneNumber.includes(term); });
    }
    selectContact(contact) {
        console.log('=== SELECTING CONTACT ===');
        console.log('Contact ID:', contact.id);
        console.log('Contact Phone:', contact.phoneNumber);
        console.log('Previous Selected ID:', this.selectedContactId);
        contact.unreadCount = 0;
        this.selectedContactId = contact.id;
        const freshContact = {
            id: contact.id,
            phoneNumber: contact.phoneNumber,
            name: contact.name,
            lastMessage: contact.lastMessage,
            lastMessageTime: contact.lastMessageTime,
            unread: 0,
            unreadCount: 0
        };
        console.log('Emitting fresh contact:', freshContact);
        this.contactSelected.emit(null);
        setTimeout(() => {
            this.contactSelected.emit(freshContact);
            console.log('Contact emitted successfully');
        }, 10);
        this.markContactAsRead(contact.phoneNumber);
    }
    markContactAsRead(phoneNumber) {
        this.messageService.markMessagesAsRead(phoneNumber).subscribe({
            next: () => console.log(`Messages marked as read for ${phoneNumber}`),
            error: (err) => console.error('Error marking messages as read:', err),
        });
    }
    addContact() {
        if (!this.newContact.phoneNumber) {
            alert('Please enter a phone number');
            return;
        }
        this.contactService.addContact(this.newContact.phoneNumber, this.newContact.name).subscribe({
            next: (contact) => {
                const extendedContact = contact;
                this.contacts.unshift(extendedContact);
                this.filteredContacts = [...this.contacts];
                this.subscribeToContact(contact.phoneNumber);
                this.cancelAddContact();
            },
            error: (err) => {
                var _a;
                alert(((_a = err.error) === null || _a === void 0 ? void 0 : _a.error) || 'Error adding contact');
                console.error(err);
            },
        });
    }
    cancelAddContact() {
        this.showAddContact = false;
        this.newContact = { phoneNumber: '', name: '' };
    }
    deleteContact(event, id) {
        event.stopPropagation();
        if (!confirm('Are you sure you want to delete this contact?'))
            return;
        const contact = this.contacts.find((c) => c.id === id);
        this.contactService.deleteContact(id).subscribe({
            next: () => {
                if (contact) {
                    const subs = this.contactSubscriptions.get(contact.phoneNumber);
                    if (subs) {
                        subs.message.unsubscribe();
                        subs.status.unsubscribe();
                        this.contactSubscriptions.delete(contact.phoneNumber);
                    }
                }
                this.contacts = this.contacts.filter((c) => c.id !== id);
                this.filteredContacts = [...this.contacts];
                if (this.selectedContactId === id) {
                    this.selectedContactId = null;
                    this.contactSelected.emit(null);
                }
            },
            error: (err) => {
                alert('Error deleting contact');
                console.error(err);
            },
        });
    }
    getInitials(name) {
        if (!name)
            return '?';
        const words = name.trim().split(' ');
        if (words.length >= 2)
            return (words[0][0] + words[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    }
    truncateText(message) {
        if (!message)
            return '';
        return message.length > 30 ? message.substring(0, 30) + '...' : message;
    }
    formatTime(dateString) {
        if (!dateString)
            return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return 'now';
        if (diffMins < 60)
            return `${diffMins}m`;
        if (diffHours < 24)
            return `${diffHours}h`;
        if (diffDays < 7)
            return `${diffDays}d`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
};
__decorate([
    (0, core_1.Output)()
], ChatSidebarComponent.prototype, "contactSelected", void 0);
ChatSidebarComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-chat-sidebar',
        standalone: true,
        imports: [common_1.CommonModule, forms_1.FormsModule],
        templateUrl: './chat-sidebar.component.html',
        styleUrls: ['./chat-sidebar.component.css'],
    })
], ChatSidebarComponent);
exports.ChatSidebarComponent = ChatSidebarComponent;
