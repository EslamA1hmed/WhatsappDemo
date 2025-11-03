"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardStatsComponent = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
const forms_1 = require("@angular/forms");
const rxjs_1 = require("rxjs");
const statistics_service_1 = require("../../../services/statistics.service");
const contact_service_1 = require("../../../services/contact.service"); // تأكد من صحة المسار
let DashboardStatsComponent = class DashboardStatsComponent {
    constructor() {
        // ✨ 1. متغير جديد لتتبع التبويب النشط
        this.activeView = 'outgoing'; // القيمة الافتراضية هي الصادر
        this.outgoingStats = [];
        this.incomingStats = [];
        this.totalOutgoing = 0;
        this.totalIncoming = 0;
        this.contacts = [];
        this.selectedContact = 'all';
        this.loading = true;
        this.error = '';
        this.statisticsService = (0, core_1.inject)(statistics_service_1.StatisticsService);
        this.contactService = (0, core_1.inject)(contact_service_1.ContactService);
        this.platformId = (0, core_1.inject)(core_1.PLATFORM_ID);
        this.circumference = 2 * Math.PI * 80;
    }
    ngOnInit() {
        if ((0, common_1.isPlatformBrowser)(this.platformId)) {
            this.loadInitialData();
        }
    }
    loadInitialData() {
        this.loadContacts();
        this.loadStatistics();
    }
    loadContacts() {
        this.contactService.getAllContacts(0, 200).subscribe({
            next: (data) => { this.contacts = data; },
            error: (err) => { console.error('Failed to load contacts for filter', err); }
        });
    }
    // الدالة تظل تجلب كلا النوعين من البيانات لتجنب استدعاءات API متكررة عند التبديل بين التبويبات
    loadStatistics() {
        this.loading = true;
        this.error = '';
        const phoneNumber = this.selectedContact === 'all' ? undefined : this.selectedContact;
        (0, rxjs_1.forkJoin)({
            outgoing: this.statisticsService.getOutgoingStatistics(phoneNumber),
            incoming: this.statisticsService.getIncomingStatistics(phoneNumber)
        }).subscribe({
            next: ({ outgoing, incoming }) => {
                this.outgoingStats = outgoing;
                this.incomingStats = incoming;
                this.totalOutgoing = outgoing.reduce((sum, stat) => sum + stat.count, 0);
                this.totalIncoming = incoming.reduce((sum, stat) => sum + stat.count, 0);
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load statistics. Please try again.';
                this.loading = false;
            }
        });
    }
    // ✨ 2. دالة جديدة لتغيير التبويب النشط
    setView(view) {
        this.activeView = view;
    }
    // عند تغيير جهة الاتصال، يتم تحديث البيانات لكلا التبويبين
    onContactChange() {
        this.loadStatistics();
    }
    // --- دوال العرض المساعدة (تبقى كما هي) ---
    getStatusColor(status) {
        const colors = {
            'delivered': '#25D366', 'read': '#34B7F1', 'sent': '#9E9E9E',
            'failed': '#c62828', 'pending': '#e65100', 'text': '#4A90E2',
            'image': '#7ED321', 'video': '#BD10E0', 'document': '#F5A623',
            'template': '#9013FE', 'unknown': '#6b7280'
        };
        return colors[status.toLowerCase()] || '#6b7280';
    }
    getStatusIcon(status) {
        const icons = {
            'delivered': '✓✓', 'read': '👁️', 'sent': '✓', 'failed': '✗', 'pending': '⏱'
        };
        return icons[status.toLowerCase()] || '•';
    }
    getTypeIcon(type) {
        const icons = {
            'text': '📝', 'image': '🖼️', 'video': '🎥', 'document': '📄', 'template': '📋'
        };
        return icons[type.toLowerCase()] || '•';
    }
    getPercentage(count, total) {
        return total > 0 ? Math.round((count / total) * 100) : 0;
    }
    getStrokeDashArray(count, total) {
        if (total === 0)
            return `0 ${this.circumference}`;
        const proportion = count / total;
        const dash = proportion * this.circumference;
        return `${dash} ${this.circumference - dash}`;
    }
    getStrokeDashOffset(index, stats, total) {
        if (total === 0)
            return 0;
        let cumulativeProportion = 0;
        for (let i = 0; i < index; i++) {
            cumulativeProportion += stats[i].count / total;
        }
        return -(cumulativeProportion * this.circumference);
    }
};
DashboardStatsComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-dashboard-stats',
        standalone: true,
        imports: [common_1.CommonModule, forms_1.FormsModule],
        templateUrl: './dashboard-stats.component.html',
        styleUrls: ['./dashboard-stats.component.css']
    })
], DashboardStatsComponent);
exports.DashboardStatsComponent = DashboardStatsComponent;
