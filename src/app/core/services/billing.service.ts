import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class BillingService extends BaseApiService {
  
  getInvoices(params?: any): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.BILLING}invoices/`, params).pipe(
      map(data => structuredClone(data)), // ✅ CLONA para OnPush
      shareReplay(1)
    );
  }
  
  markInvoiceAsPaid(invoiceId: number): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.BILLING}invoices/${invoiceId}/pay/`, {});
  }

  getAdminStats(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.BILLING_ADMIN_STATS);
  }
}
