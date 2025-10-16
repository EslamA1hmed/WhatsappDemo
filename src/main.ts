import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { LoginComponent } from './app/pages/login/login.component';
import { SignupComponent } from './app/pages/signup/signup.component';
import { DashboardComponent } from './app/pages/dashboard/sidebar.component';
import { SendMessageComponent } from './app/pages/send-message/send-message.component';
import { TemplateListComponent } from './app/pages/templates/template-list.component';
import { CreateTemplateComponent } from './app/pages/templates/create-template/create-template.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()), // لدعم SSR
    provideRouter([
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'send-message', component: SendMessageComponent },
      { path: 'templates', component: TemplateListComponent },
      { path: 'create-template', component: CreateTemplateComponent },
      { path: '**', redirectTo: 'login' }
    ])
  ]
});
