"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardComponent = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
const router_1 = require("@angular/router");
const send_message_component_1 = require("../send-message/send-message.component");
const template_list_component_1 = require("../templates/template-list.component");
const create_template_component_1 = require("../templates/create-template/create-template.component");
const messages_component_1 = require("./messages/messages.component");
const chat_component_1 = require("../chat/chat/chat.component");
let DashboardComponent = class DashboardComponent {
    constructor(titleService) {
        this.titleService = titleService;
        this.activeTab = 'dashboard';
        this.router = (0, core_1.inject)(router_1.Router);
        this.checkAuth();
        this.titleService.setTitle('Vodafone WhatsApp Dashboard');
    }
    setTab(tab) {
        this.activeTab = tab;
    }
    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
        }
    }
    checkAuth() {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (!token) {
                this.router.navigate(['/login']);
            }
        }
    }
};
DashboardComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-dashboard',
        standalone: true,
        imports: [
            common_1.CommonModule,
            send_message_component_1.SendMessageComponent,
            template_list_component_1.TemplateListComponent,
            create_template_component_1.CreateTemplateComponent,
            messages_component_1.MessagesComponent,
            chat_component_1.ChatComponent
        ],
        templateUrl: './sidebar.component.html',
        styleUrls: ['./sidebar.component.css']
    })
], DashboardComponent);
exports.DashboardComponent = DashboardComponent;
