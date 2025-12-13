// OPCIONAL: Servicio optimizado para aprovechar nuevos endpoints
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../../core/services/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class PagosServiceOptimized extends BaseApiService {

  // Nuevo endpoint unificado
  procesarPago(pagoData: any): Observable<any> {
    return this.post('/employees/payments/pay_employee/', pagoData);
  }

  // Pagos pendientes optimizado
  obtenerPagosPendientes(): Observable<any> {
    return this.get('/employees/payments/pending_payments/');
  }

  // Ventas pendientes por empleado
  obtenerVentasPendientes(employeeId: number): Observable<any> {
    return this.get(`/employees/${employeeId}/pending-sales/`);
  }

  // Resumen de ganancias
  obtenerResumenGanancias(params?: any): Observable<any> {
    return this.get('/employees/payments/earnings_summary/', params);
  }
}