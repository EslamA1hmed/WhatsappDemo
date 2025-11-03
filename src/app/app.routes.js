"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const login_component_1 = require("./pages/login/login.component");
const signup_component_1 = require("./pages/signup/signup.component");
const sidebar_component_1 = require("./pages/dashboard/sidebar.component");
exports.routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: login_component_1.LoginComponent },
    { path: 'signup', component: signup_component_1.SignupComponent },
    { path: 'dashboard', component: sidebar_component_1.DashboardComponent },
    { path: '**', redirectTo: '/login' }
];
