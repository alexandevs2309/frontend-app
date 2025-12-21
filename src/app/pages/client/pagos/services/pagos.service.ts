import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../../core/services/base-api.service';

export interface PagoEmpleado {
  id?: number;
  employee_id: number;
  year: number;
  fortnight: number;
  payment_method: string;
  payment_reference?: string;
  payment_notes?: string;
  amount_paid: number;
  paid_at?: string;
}

export interface HistorialPago {
  id: number;
  employee: any;
  period: string;
  amount_paid: number;
  payment_method: string;
  payment_reference?: string;
  paid_at: string;
  receipt_number?: string;
  is_advance_payment?: boolean;
}

export interface ConfiguracionPago {
  employee_id: number;
  salary_type?: 'fixed' | 'commission' | 'mixed';
  payment_type?: 'fixed' | 'commission' | 'mixed';
  contractual_monthly_salary?: number;
  commission_rate?: number;
  commission_percentage?: number;
  payment_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  commission_payment_mode?: 'PER_PERIOD' | 'ON_DEMAND';
  commission_on_demand_since?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagosService extends BaseApiService {

  // Pagos a empleados
  procesarPago(pagoData: PagoEmpleado): Observable<any> {
    // Validaciones del frontend
    this.validarDatosPago(pagoData);
    
    return this.post('/employees/payments/pay_employee/', pagoData);
  }

  private validarDatosPago(pagoData: PagoEmpleado): void {
    if (!pagoData.employee_id) {
      throw new Error('employee_id es requerido');
    }
    if (!pagoData.payment_method) {
      throw new Error('payment_method es requerido');
    }
    if (pagoData.amount_paid && pagoData.amount_paid <= 0) {
      throw new Error('amount_paid debe ser mayor a 0');
    }
    if (pagoData.amount_paid && pagoData.amount_paid > 1000000) {
      throw new Error('amount_paid excede el límite permitido');
    }
  }

  obtenerPagosPendientes(params?: any): Observable<any> {
    return this.get('/employees/payments/pending_payments/', params);
  }

  obtenerHistorialPagos(params?: any): Observable<any> {
    return this.get('/employees/payments/earnings_summary/', params);
  }

  obtenerVentasPendientesEmpleado(employeeId: number): Observable<any> {
    return this.get('/employees/payments/pending_payments/', { employee_id: employeeId });
  }

  // Configuración de pagos
  actualizarConfiguracionPago(employeeId: number, config: any): Observable<any> {
    const payload = { employee_id: employeeId, ...config };
    return this.post('/employees/payments/update_employee_config/', payload);
  }



  obtenerConfiguracionPago(employeeId: number): Observable<any> {
    return this.get(`/employees/${employeeId}/`);
  }

  // Recibos
  generarRecibo(pagoId: number): Observable<any> {
    return this.get(`/employees/earnings/receipt/${pagoId}/`);
  }

  imprimirRecibo(pagoId: number): Observable<any> {
    return this.get(`/employees/earnings/print_receipt/${pagoId}/`);
  }

  // Reportes de pagos - usar endpoint existente
  obtenerReportePagos(params?: any): Observable<any> {
    return this.get('/employees/earnings/my_earnings/', params);
  }

  // Método auxiliar para obtener datos de la quincena actual
  obtenerDatosQuincenaActual(): Observable<any> {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = hoy.getMonth() + 1;
    const day = hoy.getDate();
    const quincenaEnMes = day <= 15 ? 1 : 2;
    const fortnight = (month - 1) * 2 + quincenaEnMes;
    
    return this.obtenerHistorialPagos({ year, fortnight });
  }

  exportarHistorialPagos(params?: any): Observable<any> {
    return this.get('/employees/earnings/export_payments/', params);
  }

  // Empleados
  obtenerEmpleados(): Observable<any> {
    return this.get('/employees/employees/');
  }

  // ON_DEMAND - Saldo de comisiones (usar endpoint existente)
  obtenerSaldoComision(employeeId: number): Observable<any> {
    // Usar endpoint de earnings para obtener datos del empleado
    return this.get('/employees/payments/earnings_summary/', { employee_id: employeeId });
  }

  // ON_DEMAND - Retirar comisiones
  retirarComision(employeeId: number, amount: number): Observable<any> {
    const payload = {
      employee_id: employeeId,
      withdraw_amount: Number(amount),  // Backend espera withdraw_amount como number
      payment_method: 'cash',
      payment_reference: '',
      payment_notes: ''
    };
    
    console.log('WITHDRAW PAYLOAD FINAL:', payload);
    return this.post('/employees/payments/withdraw_commission/', payload);
  }

  // ON_DEMAND - Historial de retiros
  obtenerHistorialRetiros(params?: { employee_id?: number; start_date?: string; end_date?: string }): Observable<any> {
    return this.get('/employees/payments/commission_withdrawals/', params);
  }

  // ON_DEMAND - Retirar comisiones usando el flujo de pagos normal
  retirarComisionConAceptacion(payload: { employee_id: number; withdraw_amount: number; employee_acceptance: boolean; apply_loan_deduction?: boolean }): Observable<any> {
    // Usar el endpoint pay_employee con sale_ids vacíos para retiro ON_DEMAND
    const paymentPayload = {
      employee_id: payload.employee_id,
      sale_ids: [], // Vacío = usar todas las ventas pendientes
      payment_method: 'cash',
      payment_reference: `RETIRO_${Date.now()}`,
      apply_loan_deduction: payload.apply_loan_deduction || false
    };
    
    console.log('RETIRO USANDO PAY_EMPLOYEE:', paymentPayload);
    return this.post('/employees/payments/pay_employee/', paymentPayload);
  }

  // Pagos anticipados
  obtenerLimitesAnticipados(): Observable<any> {
    return this.get('/employees/payments/advance_payment_info/');
  }

  // NUEVO: Preview de pago para verificar préstamos
  obtenerPreviewPago(payload: { employee_id: number; sale_ids?: number[]; year?: number; fortnight?: number; apply_loan_deduction: boolean }): Observable<any> {
    return this.post('/employees/payments/preview_payment/', payload);
  }
}