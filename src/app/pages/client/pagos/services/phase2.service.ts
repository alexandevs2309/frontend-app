import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../../core/services/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class Phase2Service extends BaseApiService {

  // Préstamos y Anticipos
  getLoans(): Observable<any> {
    return this.get('/employees/loans/');
  }

  createLoan(loanData: any): Observable<any> {
    return this.post('/employees/loans/', loanData);
  }

  requestCancellation(loanId: number, reason: string): Observable<any> {
    return this.post(`/employees/loans/${loanId}/request_cancellation/`, { reason });
  }

  approveCancellation(loanId: number): Observable<any> {
    return this.post(`/employees/loans/${loanId}/approve_cancellation/`, {});
  }

  rejectCancellation(loanId: number): Observable<any> {
    return this.post(`/employees/loans/${loanId}/reject_cancellation/`, {});
  }

  // Reportes
  getMonthlyReport(year: number, month: number): Observable<any> {
    return this.get(`/employees/reports/monthly_summary/`, { year, month });
  }

  getEmployeeAnnualReport(employeeId: number, year: number): Observable<any> {
    return this.get('/employees/reports/employee_annual/', { employee_id: employeeId, year });
  }

  getTaxComplianceReport(year: number, month: number): Observable<any> {
    return this.get('/employees/reports/tax_compliance/', { year, month });
  }

  getLoansReport(status?: string): Observable<any> {
    const params = status ? { status } : {};
    return this.get('/employees/reports/loans_summary/', params);
  }

  // Contabilidad
  getAccountingEntries(): Observable<any> {
    return this.get('/employees/accounting/');
  }

  exportToQuickBooks(startDate: string, endDate: string): Observable<any> {
    return this.post('/employees/accounting/export_quickbooks/', {
      start_date: startDate,
      end_date: endDate
    });
  }

  getTrialBalance(date: string): Observable<any> {
    return this.get('/employees/accounting/trial_balance/', { date });
  }

  generateEmployerContributions(year: number, month: number): Observable<any> {
    return this.post('/employees/accounting/generate_employer_contributions/', {
      year,
      month
    });
  }
}