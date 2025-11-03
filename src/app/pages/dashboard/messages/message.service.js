"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const core_1 = require("@angular/core");
const http_1 = require("@angular/common/http");
let MessageService = class MessageService {
    constructor() {
        this.http = (0, core_1.inject)(http_1.HttpClient);
        this.apiUrl = 'http://localhost:8080/message';
    }
    getMessages(page, size) {
        return this.http.get(`${this.apiUrl}?page=${page}&size=${size}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    }
    getStatistics() {
        return this.http.get(`${this.apiUrl}/statistics`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    }
};
MessageService = __decorate([
    (0, core_1.Injectable)({
        providedIn: 'root'
    })
], MessageService);
exports.MessageService = MessageService;
