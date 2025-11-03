"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppComponent = void 0;
// src/app/app.component.ts
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
const common_1 = require("@angular/common");
const rxjs_1 = require("rxjs");
let AppComponent = class AppComponent {
    constructor(authService, websocketService, router) {
        this.authService = authService;
        this.websocketService = websocketService;
        this.router = router;
        this.title = 'WhatsApp Manager';
    }
    ngOnInit() {
        // ✅ لو المستخدم داخل فعلاً، افتح WebSocket
        if (this.authService.isLoggedIn()) {
            this.initializeWebSocket();
        }
        // ✅ راقب تغيّر الصفحات لتوصيل أو فصل WebSocket
        this.routerSubscription = this.router.events
            .pipe((0, rxjs_1.filter)(event => event instanceof router_1.NavigationEnd))
            .subscribe((event) => {
            const url = event.urlAfterRedirects || event.url;
            // افتح WebSocket فقط في الصفحات المهمة
            if (this.authService.isLoggedIn() &&
                (url.includes('/dashboard') || url.includes('/send-message'))) {
                this.initializeWebSocket();
            }
            // افصل WebSocket عند صفحات الدخول أو التسجيل
            if (url.includes('/login') || url.includes('/signup')) {
                this.websocketService.disconnect();
            }
        });
        // ✅ راقب حالة الاتصال
        this.wsConnectionSubscription = this.websocketService
            .getConnectedStatus()
            .subscribe((connected) => {
            if (connected) {
                console.log('✅ WebSocket connected successfully');
            }
            else {
                console.log('❌ WebSocket disconnected');
            }
        });
    }
    ngOnDestroy() {
        var _a, _b;
        (_a = this.routerSubscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
        (_b = this.wsConnectionSubscription) === null || _b === void 0 ? void 0 : _b.unsubscribe();
        this.websocketService.disconnect();
    }
    initializeWebSocket() {
        var _a, _b;
        // 📌 هنا تأكدنا إن connect مابتاخدش token في الكود الجديد
        if (!((_a = this.websocketService['client']) === null || _a === void 0 ? void 0 : _a.active)) {
            (_b = this.websocketService['client']) === null || _b === void 0 ? void 0 : _b.activate();
        }
    }
};
AppComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-root',
        standalone: true,
        imports: [router_1.RouterOutlet, common_1.CommonModule],
        template: `<router-outlet></router-outlet>`,
        styleUrls: ['./app.component.css']
    })
], AppComponent);
exports.AppComponent = AppComponent;
