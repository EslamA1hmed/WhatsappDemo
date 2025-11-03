"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignupComponent = void 0;
const core_1 = require("@angular/core");
const forms_1 = require("@angular/forms");
const router_1 = require("@angular/router");
const common_1 = require("@angular/common");
let SignupComponent = class SignupComponent {
    constructor(authService, router, titleService) {
        this.authService = authService;
        this.router = router;
        this.titleService = titleService;
        this.email = '';
        this.phoneNumber = '';
        this.gender = '';
        this.password = '';
        this.errorMsg = '';
        this.successMsg = '';
        this.titleService.setTitle('Sign Up - Vodafone WhatsApp');
    }
    onSignup() {
        const payload = {
            email: this.email,
            phoneNumber: this.phoneNumber,
            gender: this.gender,
            password: this.password
        };
        console.log('Sending signup request payload:', payload); // log قبل الإرسال
        this.authService.register(payload).subscribe({
            next: (res) => {
                console.log('Signup success response:', res); // log الرد من الباك
                this.successMsg = 'Account created successfully! Redirecting to login...';
                setTimeout(() => this.router.navigate(['/login']), 1000);
            },
            error: (err) => {
                console.error('Signup error:', err); // لو فيه error
                this.errorMsg = 'Failed to create account. Please try again.';
                if (err.status === 0) {
                    this.errorMsg = 'Cannot reach backend. Check server connection.';
                }
                else if (err.status === 403) {
                    this.errorMsg = 'Email Or Phone already used';
                }
                else {
                    this.errorMsg = `Error ${err.status}: ${err.message || err.statusText}`;
                }
            }
        });
    }
};
SignupComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-signup',
        standalone: true,
        imports: [
            forms_1.FormsModule,
            router_1.RouterModule,
            router_1.RouterLink,
            common_1.CommonModule
        ],
        templateUrl: './signup.component.html',
        styleUrls: ['./signup.component.css']
    })
], SignupComponent);
exports.SignupComponent = SignupComponent;
