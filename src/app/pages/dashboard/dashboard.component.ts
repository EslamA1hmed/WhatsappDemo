import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SendMessageComponent } from '../send-message/send-message.component';
import { TemplateListComponent } from '../templates/template-list.component';
import { CreateTemplateComponent } from '../templates/create-template/create-template.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SendMessageComponent, TemplateListComponent, CreateTemplateComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  activeTab: 'dashboard' | 'send-message' | 'template-list' | 'create-template' = 'dashboard';
  router = inject(Router);

  constructor(private titleService: Title) {
    this.checkAuth();
    this.titleService.setTitle('Vodafone WhatsApp Dashboard');
  }

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
  }

  checkAuth() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/login']);
      }
    }
  }
}