"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const platform_browser_1 = require("@angular/platform-browser");
const app_component_1 = require("./app/app.component");
const http_1 = require("@angular/common/http");
const router_1 = require("@angular/router");
const login_component_1 = require("./app/pages/login/login.component");
const signup_component_1 = require("./app/pages/signup/signup.component");
const sidebar_component_1 = require("./app/pages/dashboard/sidebar.component");
const send_message_component_1 = require("./app/pages/send-message/send-message.component");
const template_list_component_1 = require("./app/pages/templates/template-list.component");
const create_template_component_1 = require("./app/pages/templates/create-template/create-template.component");
(0, platform_browser_1.bootstrapApplication)(app_component_1.AppComponent, {
    providers: [
        (0, http_1.provideHttpClient)((0, http_1.withFetch)()),
        (0, router_1.provideRouter)([
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'login', component: login_component_1.LoginComponent },
            { path: 'signup', component: signup_component_1.SignupComponent },
            { path: 'dashboard', component: sidebar_component_1.DashboardComponent },
            { path: 'send-message', component: send_message_component_1.SendMessageComponent },
            { path: 'templates', component: template_list_component_1.TemplateListComponent },
            { path: 'create-template', component: create_template_component_1.CreateTemplateComponent },
            { path: '**', redirectTo: 'login' }
        ])
    ]
});
