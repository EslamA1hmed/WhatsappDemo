// src/app/services/template.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { WhatsAppTemplatesResponseDTO } from '../dto/whatsapp-templates.dto';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  private baseUrl = 'http://localhost:8080/template';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAllTemplates(): Observable<WhatsAppTemplatesResponseDTO> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<WhatsAppTemplatesResponseDTO>(`${this.baseUrl}/get-all`, { headers });
  }

  createTemplate(templateData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.baseUrl}/create`, templateData, { headers });
  }

  uploadMedia(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
    });
    return this.http.post(`${this.baseUrl}/upload-media`, formData, { headers });
  }
}