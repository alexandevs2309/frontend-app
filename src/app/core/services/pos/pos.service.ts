import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { API_CONFIG } from '../../config/api.config';

export interface Sale {
  id: number;
  client: any;
  employee: any;
  services: any[];
  products: any[];
  total: number;
  payment_method: string;
  date_time: string;
  status: string;
}

export interface CashRegister {
  id: number;
  user: any;
  opened_at: string;
  closed_at?: string;
  initial_amount: number;
  final_amount?: number;
  is_open: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PosService extends BaseApiService {

  // Sales
  getSales(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.POS.SALES, params);
  }

  getSale(id: number): Observable<Sale> {
    return this.get(`${API_CONFIG.ENDPOINTS.POS.SALES}${id}/`);
  }

  createSale(sale: Partial<Sale>): Observable<Sale> {
    return this.post(API_CONFIG.ENDPOINTS.POS.SALES, sale);
  }

  updateSale(id: number, sale: Partial<Sale>): Observable<Sale> {
    return this.put(`${API_CONFIG.ENDPOINTS.POS.SALES}${id}/`, sale);
  }

  deleteSale(id: number): Observable<any> {
    return this.delete(`${API_CONFIG.ENDPOINTS.POS.SALES}${id}/`);
  }

  // Cash Registers
  getCashRegisters(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.POS.CASH_REGISTERS, params);
  }

  getCashRegister(id: number): Observable<CashRegister> {
    return this.get(`${API_CONFIG.ENDPOINTS.POS.CASH_REGISTERS}${id}/`);
  }

  openCashRegister(data: { initial_amount: number }): Observable<CashRegister> {
    return this.post(API_CONFIG.ENDPOINTS.POS.CASH_REGISTERS, data);
  }

  closeCashRegister(id: number, data: { final_amount: number }): Observable<CashRegister> {
    return this.patch(`${API_CONFIG.ENDPOINTS.POS.CASH_REGISTERS}${id}/`, data);
  }

  // Dashboard & Stats
  getDashboardStats(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.POS.DASHBOARD_STATS);
  }

  getDailySummary(date?: string): Observable<any> {
    const params = date ? { date } : {};
    return this.get(API_CONFIG.ENDPOINTS.POS.DAILY_SUMMARY, params);
  }

  // Promotions
  getActivePromotions(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.POS.ACTIVE_PROMOTIONS);
  }

  // Categories
  getCategories(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.POS.CATEGORIES);
  }

  // Config
  getPosConfig(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.POS.CONFIG);
  }

  // Earnings ⭐ Feature estrella (POS side)
  getMyEarnings(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.POS.MY_EARNINGS);
  }

  getCurrentFortnight(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.POS.CURRENT_FORTNIGHT);
  }

  // Sale specific actions
  processPayment(saleId: number, paymentData: any): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.POS.SALES}${saleId}/process_payment/`, paymentData);
  }

  refundSale(saleId: number, refundData: any): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.POS.SALES}${saleId}/refund/`, refundData);
  }

  printReceipt(saleId: number): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.POS.SALES}${saleId}/print_receipt/`);
  }
}