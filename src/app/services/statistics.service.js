"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsService = void 0;
const core_1 = require("@angular/core");
const http_1 = require("@angular/common/http");
let StatisticsService = class StatisticsService {
    constructor() {
        this.http = (0, core_1.inject)(http_1.HttpClient);
        // المسار الأساسي لوحدة التحكم الجديدة
        this.apiUrl = 'http://localhost:8080/statistics';
    }
    /**
     * جلب إحصائيات الرسائل المستلمة (الواردة).
     * @param phoneNumber - رقم هاتف اختياري لفلترة النتائج.
     */
    getIncomingStatistics(phoneNumber) {
        const url = phoneNumber ? `${this.apiUrl}/income/${phoneNumber}` : `${this.apiUrl}/income/`;
        return this.http.get(url);
    }
    /**
     * جلب إحصائيات الرسائل المرسلة (الصادرة).
     * @param phoneNumber - رقم هاتف اختياري لفلترة النتائج.
     */
    getOutgoingStatistics(phoneNumber) {
        const url = phoneNumber ? `${this.apiUrl}/outgoing/${phoneNumber}` : `${this.apiUrl}/outgoing/`;
        return this.http.get(url);
    }
};
StatisticsService = __decorate([
    (0, core_1.Injectable)({
        providedIn: 'root'
    })
], StatisticsService);
exports.StatisticsService = StatisticsService;
