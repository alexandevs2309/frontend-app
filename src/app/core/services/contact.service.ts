import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  businessType?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/api/contact`;

  constructor(private http: HttpClient) {}

  submitContactForm(data: ContactFormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/demo-request/`, data);
  }

  subscribeNewsletter(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/newsletter/`, { email });
  }
}