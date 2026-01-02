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
    return this.get('/payroll/client/payroll/');
  }

  /**
   * Cerrar período y calcular totales
   */
  closePeriod(periodId: number): Observable<Period> {
    return this.post(`/payroll/client/payroll/${periodId}/close_period/`, {});
  }

  /**
   * Registrar pago de período
   */
  registerPayment(payment: PaymentRequest): Observable<PaymentResponse> {
    return this.post('/payroll/client/payroll/register_payment/', payment);
  }
}