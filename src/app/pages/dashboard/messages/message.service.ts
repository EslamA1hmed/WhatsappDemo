import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/message';

  getMessages(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}