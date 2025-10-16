import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// الواجهة التي تطابق DTO القادم من الـ Backend
export interface StatisticsData {
  status: string; // أو 'type' للرسائل المستلمة
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private http = inject(HttpClient);
  // المسار الأساسي لوحدة التحكم الجديدة
  private apiUrl = 'http://localhost:8080/statistics'; 

  /**
   * جلب إحصائيات الرسائل المستلمة (الواردة).
   * @param phoneNumber - رقم هاتف اختياري لفلترة النتائج.
   */
  getIncomingStatistics(phoneNumber?: string): Observable<StatisticsData[]> {
    const url = phoneNumber ? `${this.apiUrl}/income/${phoneNumber}` : `${this.apiUrl}/income/`;
    return this.http.get<StatisticsData[]>(url);
  }

  /**
   * جلب إحصائيات الرسائل المرسلة (الصادرة).
   * @param phoneNumber - رقم هاتف اختياري لفلترة النتائج.
   */
  getOutgoingStatistics(phoneNumber?: string): Observable<StatisticsData[]> {
    const url = phoneNumber ? `${this.apiUrl}/outgoing/${phoneNumber}` : `${this.apiUrl}/outgoing/`;
    return this.http.get<StatisticsData[]>(url);
  }
}
