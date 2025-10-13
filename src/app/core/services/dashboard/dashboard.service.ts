import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {BaseApiService} from '../base-api.service'
import { API_CONFIG } from '../../config/api.config';

export interface DashboardStats {
  total_appointments_today: number;
  total_sales_today: number;
  total_clients: number;
  total_employees: number;
  revenue_today: number;
  revenue_this_month: number;
  appointments_this_week: number;
  top_services: Array<{
    service_name: string;
    count: number;
    revenue: number;
  }>;
  recent_sales: Array<{
    id: number;
    client_name: string;
    total: number;
    created_at: string;
    services: string[];
  }>;
  monthly_revenue: Array<{
    month: string;
    revenue: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseApiService {

  constructor() {
    super();
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.get<DashboardStats>(API_CONFIG.ENDPOINTS.POS.DASHBOARD_STATS);
  }

  getRecentSales(limit: number = 10): Observable<any> {
    return this.get<any>(`${API_CONFIG.ENDPOINTS.POS.SALES}?limit=${limit}&ordering=-date_time`);
  }

  getTopServices(limit: number = 5): Observable<any> {
    return this.get<any>(`${API_CONFIG.ENDPOINTS.SERVICES}`);
  }

  getMonthlyRevenue(): Observable<any> {
    return this.get<any>(`${API_CONFIG.ENDPOINTS.POS.SALES}`);
  }
}