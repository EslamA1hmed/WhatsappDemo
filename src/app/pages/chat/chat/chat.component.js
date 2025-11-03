"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatComponent = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
const chat_sidebar_component_1 = require("../chat-sidebar/chat-sidebar.component");
const chat_window_component_1 = require("../chat-window/chat-window.component");
let ChatComponent = class ChatComponent {
    constructor() {
        this.selectedContact = null;
    }
    onContactSelected(contact) {
        this.selectedContact = contact;
    }
    onBackToSidebar() {
        this.selectedContact = null;
    }
    isMobile() {
        return window.innerWidth <= 480;
    }
};
ChatComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-chat',
        standalone: true,
        imports: [common_1.CommonModule, chat_sidebar_component_1.ChatSidebarComponent, chat_window_component_1.ChatWindowComponent],
        templateUrl: './chat.component.html',
        styleUrls: ['./chat.component.css']
    })
], ChatComponent);
exports.ChatComponent = ChatComponent;
