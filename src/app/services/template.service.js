"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
// src/app/services/template.service.ts
const core_1 = require("@angular/core");
const http_1 = require("@angular/common/http");
let TemplateService = class TemplateService {
    constructor(http, authService) {
        this.http = http;
        this.authService = authService;
        this.baseUrl = 'http://localhost:8080/template';
    }
    getAllTemplates() {
        const headers = new http_1.HttpHeaders({
            'Authorization': `Bearer ${this.authService.getToken()}`,
            'Content-Type': 'application/json'
        });
        return this.http.get(`${this.baseUrl}/get-all`, { headers });
    }
    createTemplate(templateData) {
        const headers = new http_1.HttpHeaders({
            'Authorization': `Bearer ${this.authService.getToken()}`,
            'Content-Type': 'application/json'
        });
        return this.http.post(`${this.baseUrl}/create`, templateData, { headers });
    }
    uploadMedia(formData) {
        const headers = new http_1.HttpHeaders({
            'Authorization': `Bearer ${this.authService.getToken()}`,
        });
        return this.http.post(`${this.baseUrl}/upload-media`, formData, { headers });
    }
};
TemplateService = __decorate([
    (0, core_1.Injectable)({
        providedIn: 'root'
    })
], TemplateService);
exports.TemplateService = TemplateService;
