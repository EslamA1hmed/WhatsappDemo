"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginComponent = void 0;
const core_1 = require("@angular/core");
const forms_1 = require("@angular/forms");
const router_1 = require("@angular/router");
const common_1 = require("@angular/common");
let LoginComponent = class LoginComponent {
    constructor(authService, titleService) {
        this.authService = authService;
        this.titleService = titleService;
        this.email = '';
        this.password = '';
        this.errorMsg = '';
        this.router = (0, core_1.inject)(router_1.Router);
        this.checkAuth();
        this.titleService.setTitle('Login - Vodafone WhatsApp');
    }
    onLogin() {
        const payload = { email: this.email, password: this.password };
        console.log('Login payload', payload);
        this.authService.login(payload).subscribe({
            next: (res) => {
                console.log('Login success:', res);
                this.authService.setToken(res.token); // نخزن التوكن في localStorage
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                console.error('Login error:', err);
                if (err.status === 0) {
                    this.errorMsg = 'Cannot reach backend. Check server connection.';
                }
                else if (err.status === 403) {
                    this.errorMsg = 'Invalid email or password';
                }
                else {
                    this.errorMsg = `Error ${err.status}: ${err.message || err.statusText}`;
                }
            }
        });
    }
    checkAuth() {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/dashboard']);
        }
    }
};
LoginComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-login',
        standalone: true,
        imports: [forms_1.FormsModule, router_1.RouterModule, router_1.RouterLink, common_1.CommonModule],
        templateUrl: './login.component.html',
        styleUrls: ['./login.component.css']
    })
], LoginComponent);
exports.LoginComponent = LoginComponent;
