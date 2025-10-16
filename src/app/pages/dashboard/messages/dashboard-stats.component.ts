import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { StatisticsService, StatisticsData } from '../../../services/statistics.service';
import { ContactService, Contact } from '../../../services/contact.service'; // تأكد من صحة المسار

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.css']
})
export class DashboardStatsComponent implements OnInit {
  // ✨ 1. متغير جديد لتتبع التبويب النشط
  activeView: 'outgoing' | 'incoming' = 'outgoing'; // القيمة الافتراضية هي الصادر

  outgoingStats: StatisticsData[] = [];
  incomingStats: StatisticsData[] = [];
  totalOutgoing = 0;
  totalIncoming = 0;
  
  contacts: Contact[] = [];
  selectedContact: string = 'all'; 

  loading = true;
  error = '';
  
  private statisticsService = inject(StatisticsService);
  private contactService = inject(ContactService);
  private platformId = inject(PLATFORM_ID);
  private circumference = 2 * Math.PI * 80;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
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

    forkJoin({
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
      error: (err: any) => {
        this.error = 'Failed to load statistics. Please try again.';
        this.loading = false;
      }
    });
  }

  // ✨ 2. دالة جديدة لتغيير التبويب النشط
  setView(view: 'outgoing' | 'incoming') {
    this.activeView = view;
  }

  // عند تغيير جهة الاتصال، يتم تحديث البيانات لكلا التبويبين
  onContactChange() {
    this.loadStatistics();
  }

  // --- دوال العرض المساعدة (تبقى كما هي) ---
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'delivered': '#25D366', 'read': '#34B7F1', 'sent': '#9E9E9E',
      'failed': '#c62828', 'pending': '#e65100', 'text': '#4A90E2',
      'image': '#7ED321', 'video': '#BD10E0', 'document': '#F5A623',
      'template': '#9013FE', 'unknown': '#6b7280'
    };
    return colors[status.toLowerCase()] || '#6b7280';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'delivered': '✓✓', 'read': '👁️', 'sent': '✓', 'failed': '✗', 'pending': '⏱'
    };
    return icons[status.toLowerCase()] || '•';
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'text': '📝', 'image': '🖼️', 'video': '🎥', 'document': '📄', 'template': '📋'
    };
    return icons[type.toLowerCase()] || '•';
  }
  
  getPercentage(count: number, total: number): number {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  getStrokeDashArray(count: number, total: number): string {
    if (total === 0) return `0 ${this.circumference}`;
    const proportion = count / total;
    const dash = proportion * this.circumference;
    return `${dash} ${this.circumference - dash}`;
  }
  
  getStrokeDashOffset(index: number, stats: StatisticsData[], total: number): number {
    if (total === 0) return 0;
    let cumulativeProportion = 0;
    for (let i = 0; i < index; i++) {
      cumulativeProportion += stats[i].count / total;
    }
    return - (cumulativeProportion * this.circumference);
  }
}

