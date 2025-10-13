import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contact {
  id: number;
  phoneNumber: string;
  name: string;
  createdAt?: string;
  lastMessageTime?: string;
}

export interface AddContactRequest {
  phoneNumber: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/contacts';

  getAllContacts(page: number = 0, size: number = 100): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  addContact(phoneNumber: string, name: string): Observable<Contact> {
    const request: AddContactRequest = { phoneNumber, name };
    return this.http.post<Contact>(this.apiUrl, request);
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getContactByPhoneNumber(phoneNumber: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/phone/${phoneNumber}`);
  }
}