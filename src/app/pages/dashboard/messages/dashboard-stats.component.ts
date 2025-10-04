import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MessageService } from './message.service';

interface StatisticsData {
  status: string;
  count: number;
}

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.css']
})
export class DashboardStatsComponent implements OnInit {
  statistics: StatisticsData[] = [];
  loading = true;
  error = '';
  totalMessages = 0;

  private messageService = inject(MessageService);
  private platformId = inject(PLATFORM_ID);
  private circumference = 2 * Math.PI * 80;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadStatistics();
    }
  }

  loadStatistics() {
    this.loading = true;
    this.error = '';
    this.messageService.getStatistics().subscribe({
      next: (data: StatisticsData[]) => {
        console.log('Statistics data received:', data);
        this.statistics = data;
        this.totalMessages = data.reduce((sum, stat) => sum + stat.count, 0);
        console.log('Total messages:', this.totalMessages);
        console.log('Statistics array:', this.statistics);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading statistics:', err);
        this.error = 'Failed to load statistics. Please try again.';
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'delivered': '#25D366',
      'read': '#34B7F1',
      'sent': '#9E9E9E',
      'failed': '#c62828',
      'pending': '#e65100'
    };
    return colors[status.toLowerCase()] || '#6b7280';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'delivered': '✓✓',
      'read': '👁️',
      'sent': '✓',
      'failed': '✗',
      'pending': '⏱'
    };
    return icons[status.toLowerCase()] || '•';
  }

  getPercentage(count: number): number {
    return this.totalMessages > 0 ? Math.round((count / this.totalMessages) * 100) : 0;
  }

  getChartHeight(count: number): string {
    const maxCount = Math.max(...this.statistics.map(s => s.count));
    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
    return `${percentage}%`;
  }

  getStrokeDashOffset(index: number): number {
    let cumulativeProportion = 0;
    for (let i = 0; i < index; i++) {
      cumulativeProportion += this.statistics[i].count / this.totalMessages;
    }
    return - (cumulativeProportion * this.circumference);
  }

  getStrokeDashArray(count: number): string {
    const proportion = count / this.totalMessages;
    const dash = proportion * this.circumference;
    return `${dash} ${this.circumference - dash}`;
  }
}