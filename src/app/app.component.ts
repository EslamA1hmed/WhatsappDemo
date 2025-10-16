// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { WebSocketService } from './services/websocket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'WhatsApp Manager';
  private routerSubscription?: Subscription;
  private wsConnectionSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private websocketService: WebSocketService,
    private router: Router
  ) {}

  ngOnInit() {
    // ✅ لو المستخدم داخل فعلاً، افتح WebSocket
    if (this.authService.isLoggedIn()) {
      this.initializeWebSocket();
    }

    // ✅ راقب تغيّر الصفحات لتوصيل أو فصل WebSocket
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;

        // افتح WebSocket فقط في الصفحات المهمة
        if (
          this.authService.isLoggedIn() &&
          (url.includes('/dashboard') || url.includes('/send-message'))
        ) {
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
        } else {
          console.log('❌ WebSocket disconnected');
        }
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
    this.wsConnectionSubscription?.unsubscribe();
    this.websocketService.disconnect();
  }

  private initializeWebSocket() {
    // 📌 هنا تأكدنا إن connect مابتاخدش token في الكود الجديد
    if (!this.websocketService['client']?.active) {
      this.websocketService['client']?.activate();
    }
  }
}
