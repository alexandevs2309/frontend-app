import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { Period, PaymentRequest, PaymentResponse } from '../interfaces/payroll.interface';

@Injectable({
  providedIn: 'root'
})
export class PayrollService extends BaseApiService {

  /**
   * Obtener períodos de nómina
   */
  getPeriods(): Observable<{ periods: Period[] }> {
    return this.get('/employees/payroll/client/payroll/');
  }

  /**
   * Registrar pago de período
   */
  registerPayment(payment: PaymentRequest): Observable<PaymentResponse> {
    return this.post('/employees/payroll/client/payroll/register_payment/', payment);
  }

  /**
   * Enviar período para aprobación
   */
  submitForApproval(periodId: number): Observable<any> {
    return this.post(`/employees/payroll/client/payroll/${periodId}/submit/`, {});
  }

  /**
   * Aprobar período
   */
  approvePeriod(periodId: number): Observable<any> {
    return this.post(`/employees/payroll/client/payroll/${periodId}/approve/`, {});
  }

  /**
   * Rechazar período
   */
  rejectPeriod(periodId: number, reason: string): Observable<any> {
    return this.post(`/employees/payroll/client/payroll/${periodId}/reject/`, { reason });
  }

  getPaymentReceipt(paymentId: string): Observable<any> {
    return this.get(`/employees/payroll/payments/${paymentId}/receipt/`);
  }
}
