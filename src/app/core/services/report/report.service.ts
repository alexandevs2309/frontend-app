import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { API_CONFIG } from '../../config/api.config';

export interface ReportParams {
  start_date?: string;
  end_date?: string;
  employee_id?: number;
  service_id?: number;
  client_id?: number;
  format?: 'json' | 'csv' | 'pdf';
}

@Injectable({
  providedIn: 'root'
})
export class ReportService extends BaseApiService {

  // General reports
  getReports(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.REPORTS.BASE, params);
  }

  // Sales reports
  getSalesReport(params?: ReportParams): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.REPORTS.SALES, params);
  }

  getDailySalesReport(date: string): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS.SALES}daily/`, { date });
  }

  getMonthlySalesReport(year: number, month: number): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS.SALES}monthly/`, { year, month });
  }

  // Employee reports
  getEmployeeReport(params?: ReportParams): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.REPORTS.EMPLOYEES, params);
  }

  getEmployeeEarningsReport(employeeId: number, params: ReportParams): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS.EMPLOYEES}${employeeId}/earnings/`, params);
  }

  getEmployeePerformanceReport(employeeId: number, params: ReportParams): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS.EMPLOYEES}${employeeId}/performance/`, params);
  }

  // Appointment reports
  getAppointmentReport(params: ReportParams): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS}appointments/`, params);
  }

  getAppointmentStatusReport(params: ReportParams): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS}appointments/status/`, params);
  }

  // Client reports
  getClientReport(params: ReportParams): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS}clients/`, params);
  }

  getClientRetentionReport(params: ReportParams): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS}clients/retention/`, params);
  }

  // Service reports
  getServiceReport(params: ReportParams): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS}services/`, params);
  }

  getPopularServicesReport(params: ReportParams): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS}services/popular/`, params);
  }

  // Inventory reports
  getInventoryReport(params: ReportParams): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS}inventory/`, params);
  }

  getLowStockReport(): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS}inventory/low-stock/`);
  }

  // Financial reports
  getFinancialReport(params: ReportParams): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS}financial/`, params);
  }

  getProfitLossReport(params: ReportParams): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS}financial/profit-loss/`, params);
  }

  // Dashboard reports
  getDashboardStats(period?: string): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.REPORTS.DASHBOARD, { period });
  }

  getKPIReport(): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS.BASE}kpi/`);
  }

  // Export functions
  exportReport(reportType: string, params: ReportParams): Observable<Blob> {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS.BASE}${reportType}/export/`, params);
  }

  downloadReport(reportType: string, params: ReportParams): void {
    this.exportReport(reportType, params).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report.${params.format || 'pdf'}`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}