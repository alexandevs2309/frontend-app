import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class BillingService extends BaseApiService {
  
  getInvoices(): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.BILLING}invoices/`);
  }
  
  markInvoiceAsPaid(invoiceId: number): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.BILLING}invoices/${invoiceId}/pay/`, {});
  }
}