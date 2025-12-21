import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PagosService, PagoEmpleado } from './services/pagos.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PayrollStatusUtil } from '../../../shared/utils/payroll-status.util';
import { PayrollStatusBadgeComponent } from '../../../shared/components/payroll-status-badge.component';
import { CommissionBalanceComponent } from '../../../shared/components/commission-balance.component';

@Component({
  selector: 'app-pagos-empleados',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TableModule, DialogModule, SelectModule, InputTextModule, ToastModule, TagModule, FormsModule, PayrollStatusBadgeComponent, CommissionBalanceComponent],
  providers: [MessageService],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">💳 Obligaciones a Empleados</h1>
          <p class="text-gray-600">Procesar obligaciones pendientes de empleados</p>
        </div>
        <div class="flex gap-2">
          <button pButton label="Préstamos" icon="pi pi-money-bill" 
                  class="p-button-warning" (click)="irAPrestamos()"></button>
          <button pButton label="Reportes" icon="pi pi-chart-bar" 
                  class="p-button-secondary" (click)="irAReportes()"></button>
        </div>
      </div>



      <!-- Barra de búsqueda global -->
      <div class="mb-6">
        <input type="text" pInputText [(ngModel)]="filtroGlobal" 
               placeholder="Buscar empleado por nombre, email o ID..." 
               class="w-full" 
               (ngModelChange)="filtrarTodos()">
      </div>
      
      <!-- Tabla de empleados -->
      <p-card header="Empleados con Obligaciones Pendientes" *ngIf="tieneEmpleadosPeriodoFiltrados()">
        <p-table [value]="empleadosFiltrados()" [loading]="cargando()" responsiveLayout="scroll">
          <ng-template pTemplate="header">
            <tr>
              <th>Empleado</th>
              <th *ngIf="tieneEmpleadosPeriodo()">Período</th>
              <th *ngIf="tieneEmpleadosPeriodo()">Balance del Período</th>
              <th *ngIf="tieneEmpleadosPeriodo()">Tipo</th>
              <th *ngIf="tieneEmpleadosPeriodo()">Estado</th>
              <th>Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-empleado>
            <tr *ngIf="empleado.commission_payment_mode !== 'ON_DEMAND'">
              <td>
                <div class="font-medium">{{ empleado.full_name }}</div>
                <div class="text-sm text-gray-500">ID: {{ empleado.id }} • {{ empleado.email }}</div>
              </td>
              <td>
                <div class="font-medium">{{ empleado.period_display || 'Quincena ' + empleado.fortnight_number + '/' + empleado.fortnight_year }}</div>
                <div class="text-xs" [style.color]="getStatusColor(empleado.period_status)">
                  <i [class]="getStatusIcon(empleado.period_status)"></i>
                  {{ empleado.period_status_display || getStatusLabel(empleado.period_status) }}
                </div>
              </td>
              <td class="font-bold" [ngClass]="empleado.net_balance < 0 ? 'text-red-600' : empleado.pending_amount > 0 ? 'text-orange-600' : 'text-gray-400'">
                <span *ngIf="empleado.pending_amount > 0">{{ formatearMoneda(empleado.pending_amount) }}</span>
                <span *ngIf="empleado.pending_amount === 0" class="text-gray-500 italic">
                  {{ getUnifiedStatusMessage(empleado) }}
                </span>
                <div *ngIf="empleado.pending_amount > 0" class="text-xs text-gray-500" pTooltip="Comisiones generadas por ventas realizadas en este período">del período</div>
                
                <div *ngIf="empleado.total_earned > 0 && empleado.payment_status === 'paid'" class="text-xs text-green-600">
                  Ya pagado: {{ formatearMoneda(empleado.total_earned) }}
                </div>
                <div *ngIf="empleado.total_loans > 0" class="text-xs text-blue-600">
                  Préstamos: {{ formatearMoneda(empleado.total_loans) }}
                </div>
                <div *ngIf="empleado.net_balance < 0" class="text-xs font-bold text-red-600">
                  Saldo: {{ formatearMoneda(empleado.net_balance) }} (DEBE)
                </div>
              </td>
              <td>
                <p-tag [value]="empleado.payment_type === 'commission' ? 'Comisión' : empleado.payment_type === 'fixed' ? 'Fijo' : 'Mixto'" 
                       [severity]="empleado.payment_type === 'commission' ? 'success' : 'info'"></p-tag>
              </td>
              <td>
                <app-payroll-status-badge
                  [status]="empleado.period_status || empleado.payment_status"
                  [statusDisplay]="empleado.period_status_display"
                  [periodDisplay]="empleado.period_display"
                  [periodDates]="empleado.period_dates"
                  [showPeriodInfo]="false"
                  [compact]="true">
                </app-payroll-status-badge>
              </td>
              <td>
                <button pButton 
                        [label]="getBotonLabel(empleado)" 
                        [icon]="empleado.pending_amount > 0 ? 'pi pi-credit-card' : 'pi pi-check'" 
                        [class]="empleado.pending_amount > 0 ? 'p-button-sm p-button-success' : 'p-button-sm p-button-outlined'"
                        (click)="abrirDialogoPago(empleado)"
                        [disabled]="empleado.pending_amount === 0"></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
      
      <!-- Panel separado para empleados ON_DEMAND -->
      <div *ngIf="tieneEmpleadosOnDemandFiltrados()" class="mt-8">
        <p-card header="Empleados con Retiro Inmediato">
          <div class="space-y-6">
            <div *ngFor="let empleado of empleadosOnDemandFiltrados()" class="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="font-semibold text-lg text-gray-800">{{ empleado.full_name }}</h3>
                  <p class="text-sm text-gray-500">ID: {{ empleado.id }} • {{ empleado.email }}</p>
                </div>
                <p-tag value="Retiro Inmediato" severity="success" class="text-sm"></p-tag>
              </div>
              
              <!-- Tarjeta ON_DEMAND con ancho completo -->
              <app-commission-balance 
                [employeeId]="empleado.id"
                [commissionPaymentMode]="empleado.commission_payment_mode">
              </app-commission-balance>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Diálogo de pago -->
      <p-dialog [(visible)]="mostrarDialogoPago" header="Procesar Pago" [modal]="true" [style]="{width: '500px'}">
        <div *ngIf="empleadoSeleccionado" class="space-y-4">
          <div class="bg-gray-50 p-4 rounded">
            <h4 class="font-medium">{{ empleadoSeleccionado.full_name }}</h4>
            <p class="text-sm text-gray-600">{{ empleadoSeleccionado.period_display || 'Período ' + empleadoSeleccionado.fortnight_number + '/' + empleadoSeleccionado.fortnight_year }}</p>
            <div class="mt-2">
              <p class="text-sm text-gray-600">Tipo: {{ empleadoSeleccionado.payment_type === 'commission' ? 'Comisión' : empleadoSeleccionado.payment_type === 'fixed' ? 'Sueldo Fijo' : 'Mixto' }}</p>
              
              <!-- Mostrar información según el modo -->
              <div *ngIf="empleadoSeleccionado.commission_payment_mode === 'PER_PERIOD'">
                <p class="text-lg font-bold text-orange-600">Monto del período: {{ formatearMoneda(montoCalculado) }}</p>
                <p *ngIf="empleadoSeleccionado.total_earned > 0" class="text-sm text-green-600">Ya pagado en este período: {{ formatearMoneda(empleadoSeleccionado.total_earned) }}</p>
              </div>
              
              <div *ngIf="empleadoSeleccionado.commission_payment_mode === 'ON_DEMAND'" class="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p class="text-sm text-yellow-800 font-medium mb-2">
                  <i class="pi pi-info-circle mr-1"></i>
                  Este empleado usa modo Retiro Inmediato
                </p>
                <p class="text-xs text-yellow-700">
                  Las comisiones se retiran individualmente. Este pago es para períodos anteriores al modo Retiro Inmediato.
                </p>
              </div>
            </div>
          </div>

          <!-- Información de préstamos -->
          <div class="bg-blue-50 p-3 rounded" *ngIf="empleadoSeleccionado.total_loans > 0">
            <h4 class="text-sm font-medium text-blue-800 mb-2">💰 Préstamos Activos</h4>
            <p class="text-sm text-blue-700 mb-1">
              Saldo pendiente: {{ formatearMoneda(empleadoSeleccionado.total_loans) }}
            </p>
            <p class="text-xs text-blue-600">
              Los préstamos se descuentan automáticamente al momento del pago
            </p>
            
            <div class="mt-3">
              <label class="flex items-center gap-2 mb-2">
                <input type="checkbox" [(ngModel)]="aplicarDescuentoPrestamo" class="rounded">
                <span class="text-sm font-medium">Descontar de préstamos</span>
              </label>
              
              <div *ngIf="aplicarDescuentoPrestamo" class="space-y-2">
                <div>
                  <label class="block text-xs font-medium mb-1">Monto a descontar</label>
                  <input type="number" pInputText [(ngModel)]="montoDescuentoPrestamo" 
                         class="w-full text-sm" [max]="maxDescuentoPrestamo" min="0" step="0.01"
                         (ngModelChange)="calcularMontoFinalConPrestamos()">
                  <p class="text-xs text-blue-600 mt-1">
                    Máximo: {{ formatearMoneda(maxDescuentoPrestamo) }} (50% del pago)
                  </p>
                </div>
                
                <div class="bg-green-50 p-2 rounded">
                  <p class="text-xs text-green-700">
                    Saldo después del descuento: {{ formatearMoneda(empleadoSeleccionado.total_loans - montoDescuentoPrestamo) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Monto final -->
          <div class="bg-green-50 p-3 rounded">
            <p class="text-sm text-gray-600">
              <span *ngIf="empleadoSeleccionado.commission_payment_mode === 'PER_PERIOD'">Monto a pagar:</span>
              <span *ngIf="empleadoSeleccionado.commission_payment_mode === 'ON_DEMAND'">Monto del período anterior:</span>
            </p>
            <p class="text-2xl font-bold text-green-600">{{ formatearMoneda(montoFinal) }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Método de Pago</label>
            <p-select [(ngModel)]="metodoPago" [options]="metodosPago" 
                      optionLabel="label" optionValue="value" class="w-full"></p-select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Referencia (opcional)</label>
            <input pInputText [(ngModel)]="referenciaPago" class="w-full" 
                   placeholder="Ej: Transferencia #123">
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Notas (opcional)</label>
            <textarea pInputText [(ngModel)]="notasPago" rows="3" class="w-full"></textarea>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <button pButton label="Cancelar" class="p-button-outlined" (click)="cerrarDialogoPago()"></button>
          <button pButton label="Confirmar Pago" class="p-button-success" 
                  [loading]="procesandoPago()" (click)="confirmarPago()"
                  [disabled]="!metodoPago"></button>
        </ng-template>
      </p-dialog>

      <p-toast></p-toast>
    </div>
  `
})
export class PagosEmpleados implements OnInit {
  private pagosService = inject(PagosService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private http = inject(HttpClient);

  empleados = signal<any[]>([]);
  cargando = signal(false);
  procesandoPago = signal(false);
  mostrarDialogoPago = false;
  empleadoSeleccionado: any = null;
  metodoPago = '';
  referenciaPago = '';
  notasPago = '';
  montoCalculado = 0;
  montoFinal = 0;
  ventasPendientes: any[] = [];
  saleIds: number[] = [];
  aplicarDescuentoPrestamo = true;
  montoDescuentoPrestamo = 0;
  maxDescuentoPrestamo = 0;

  metodosPago = [
    { label: 'Efectivo', value: 'cash' },
    { label: 'Transferencia', value: 'transfer' },
    { label: 'Cheque', value: 'check' },
    { label: 'Otro', value: 'other' }
  ];


  
  // Filtro de búsqueda global
  filtroGlobal = '';
  empleadosFiltrados = signal<any[]>([]);
  empleadosOnDemandFiltrados = signal<any[]>([]);

  ngOnInit() {
    this.cargarEmpleados();
  }

  cargarEmpleados() {
    this.cargando.set(true);
    
    // Calcular quincena actual
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = hoy.getMonth() + 1;
    const day = hoy.getDate();
    const quincenaEnMes = day <= 15 ? 1 : 2;
    const fortnight = (month - 1) * 2 + quincenaEnMes;
    
    // OPCIÓN A: Cruzar earnings_summary con /employees/
    Promise.all([
      this.pagosService.obtenerHistorialPagos({ year, fortnight }).toPromise(),
      this.pagosService.obtenerEmpleados().toPromise()
    ]).then(([earningsResponse, employeesResponse]) => {
      const empleados = earningsResponse?.employees || [];
      const employeesData = employeesResponse?.results || employeesResponse || [];
      
      // Crear mapa de empleados por ID para merge eficiente
      const employeesMap = new Map();
      employeesData.forEach((emp: any) => {
        employeesMap.set(emp.id, emp);
      });
      
      console.log('🔍 EMPLOYEES MAP:', employeesMap);
      
      // Agregar información de período a cada empleado
      const empleadosConPeriodo = empleados.map((emp: any) => {
        console.log('EMPLOYEE FULL:', emp);
        
        // MERGE: Combinar datos de earnings_summary con /employees/
        const employeeDetails = employeesMap.get(emp.employee_id) || {};
        console.log('EMPLOYEE DETAILS:', employeeDetails);
        
        // USAR SOLO LOS DATOS DIRECTOS DEL BACKEND
        const pendingAmount = emp.pending_amount || 0;
        const realPendingSaleIds = emp.pending_sale_ids || [];
          
          console.log(`👤 EMPLEADO ${emp.employee_name}:`, {
            pending_amount: emp.pending_amount,
            pending_sale_ids: emp.pending_sale_ids,
            final_amount: pendingAmount,
            final_sale_ids: realPendingSaleIds
          });
          
          // Determinar estado correcto
          let paymentStatus = 'no_earnings';
          
          if (emp.payment_status === 'paid') {
            paymentStatus = 'paid';
          } else if (pendingAmount > 0 || emp.total_earned > 0) {
            paymentStatus = 'pending';
          }
          
          return {
            ...emp,
            id: emp.employee_id,
            full_name: emp.employee_name,
            email: emp.employee_name,
            total_earned: emp.total_earned || 0,
            pending_amount: pendingAmount,
            payment_type: emp.salary_type || 'commission',
            commission_percentage: emp.commission_percentage || 0,
            payment_status: paymentStatus,
            fortnight_year: year,
            fortnight_number: fortnight,
            period_display: emp.period_display || `Período ${fortnight}/${year}`,
            pending_sale_ids: realPendingSaleIds,

            // Campos ON_DEMAND - MERGE desde /employees/
            commission_payment_mode: employeeDetails.commission_payment_mode || 'PER_PERIOD',
            commission_on_demand_since: employeeDetails.commission_on_demand_since,
            // Nuevos campos de estado del período
            period_status: emp.period_status || paymentStatus,
            period_status_display: emp.period_status_display,
            period_dates: emp.period_dates
          };
        });
        
        // Ordenar por prioridad de pago
        const empleadosOrdenados = PayrollStatusUtil.sortByPaymentPriority(empleadosConPeriodo);
        
        this.empleados.set(empleadosOrdenados);

        
        // Inicializar filtro global
        this.filtrarTodos();
        
        this.cargando.set(false);
      
    }).catch((error) => {
      console.error('Error cargando datos:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar empleados'
      });
      this.cargando.set(false);
    });
  }



  abrirDialogoPago(empleado: any) {
    this.empleadoSeleccionado = empleado;
    this.metodoPago = '';
    this.referenciaPago = '';
    this.notasPago = '';

    
    // USAR DATOS DIRECTOS del backend
    this.saleIds = empleado.pending_sale_ids || [];
    this.montoCalculado = empleado.pending_amount || 0;
    
    console.log('🔍 DEBUG DATOS DIRECTOS:', {
      empleado: empleado.employee_name || empleado.full_name,
      pending_amount: empleado.pending_amount,
      pending_sale_ids: empleado.pending_sale_ids,
      sale_ids_count: this.saleIds.length
    });
    
    // Si no hay pendientes, usar monto total para pago de quincena
    if (this.montoCalculado === 0) {
      this.montoCalculado = empleado.total_earned || 0;
    }
    
    this.montoFinal = this.montoCalculado;
    
    // Configurar descuentos de préstamos
    if (empleado.total_loans > 0) {
      this.aplicarDescuentoPrestamo = true;
      this.maxDescuentoPrestamo = this.montoCalculado * 0.5; // Máx 50%
      this.montoDescuentoPrestamo = Math.min(this.maxDescuentoPrestamo, empleado.total_loans);
      this.calcularMontoFinalConPrestamos();
    } else {
      this.aplicarDescuentoPrestamo = false;
      this.montoDescuentoPrestamo = 0;
    }
    
    this.mostrarDialogoPago = true;
  }

  calcularMontoFinalConPrestamos() {
    if (this.aplicarDescuentoPrestamo && this.montoDescuentoPrestamo > 0) {
      // Validar límites
      if (this.montoDescuentoPrestamo > this.maxDescuentoPrestamo) {
        this.montoDescuentoPrestamo = this.maxDescuentoPrestamo;
      }
      if (this.montoDescuentoPrestamo > this.empleadoSeleccionado.total_loans) {
        this.montoDescuentoPrestamo = this.empleadoSeleccionado.total_loans;
      }
    }
    
    // El monto final no cambia, el descuento se maneja en el backend
    this.montoFinal = this.montoCalculado;
  }

  cerrarDialogoPago() {
    this.mostrarDialogoPago = false;
    this.empleadoSeleccionado = null;
    this.aplicarDescuentoPrestamo = true;
    this.montoDescuentoPrestamo = 0;
  }



  confirmarPago() {
    if (!this.empleadoSeleccionado || !this.metodoPago) return;

    this.procesandoPago.set(true);
    
    let notas = this.notasPago;
    
    // Generar idempotency key único
    const idempotencyKey = `pay-${Date.now()}-emp${this.empleadoSeleccionado.id}-${Math.random().toString(36).substr(2, 9)}`;
    
    const pagoData: any = {
      employee_id: this.empleadoSeleccionado.id,
      payment_method: this.metodoPago,
      payment_reference: this.referenciaPago,
      payment_notes: notas,
      amount_paid: this.montoFinal,
      idempotency_key: idempotencyKey
    };
    
    // VALIDACIÓN CRÍTICA: Solo pago por ventas pendientes REALES
    if (this.saleIds && this.saleIds.length > 0) {
      pagoData.sale_ids = this.saleIds;
      console.log('✅ ENVIANDO PAGO:', {
        employee_id: pagoData.employee_id,
        sale_ids: pagoData.sale_ids,
        amount: this.montoFinal
      });
    } else {
      console.error('❌ ERROR DATOS DIRECTOS:', {
        empleado: this.empleadoSeleccionado.employee_name || this.empleadoSeleccionado.full_name,
        pending_amount: this.empleadoSeleccionado.pending_amount,
        sale_ids: this.saleIds,
        mensaje: 'Backend indica monto pendiente pero no hay sale_ids'
      });
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Datos',
        detail: 'Monto pendiente sin ventas identificadas. Contacte al administrador.'
      });
      this.procesandoPago.set(false);
      return;
    }

    this.pagosService.procesarPago(pagoData).subscribe({
      next: (response) => {
        // MANEJAR RESPUESTA 200 (success o already_paid)
        if (response.status === 'already_paid') {
          this.messageService.add({
            severity: 'info',
            summary: 'Ya Pagado',
            detail: `Este pago ya fue procesado anteriormente (Lote #${response.batch_id})`,
            life: 5000
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Pago Procesado',
            detail: `Pago realizado a ${this.empleadoSeleccionado.full_name}`,
            life: 3000
          });
          
          // Generar e imprimir recibo automáticamente
          if (response?.summary) {
            this.generarRecibo(response.summary);
          }
        }
        
        this.cerrarDialogoPago();
        // Auto-refresh para mostrar datos actualizados
        setTimeout(() => {
          this.cargarEmpleados();
        }, 1000);
        this.procesandoPago.set(false);
      },
      error: (error) => {
        console.error('Error en pago:', error);
        
        let errorMessage = 'Error al procesar pago';
        let severity: 'error' | 'warn' = 'error';
        
        // Manejar diferentes tipos de errores
        if (error.status === 409) {
          severity = 'warn';
          errorMessage = `La quincena ya fue pagada. Ver historial para detalles.`;
        } else if (error.status === 400) {
          errorMessage = error.error?.error || error.error?.message || 'Datos inválidos';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para realizar este pago';
        } else if (error.status === 404) {
          errorMessage = 'Empleado no encontrado';
        } else if (error.status >= 500) {
          errorMessage = 'Error interno del servidor. Intenta nuevamente.';
        } else {
          errorMessage = error.error?.error || error.error?.message || errorMessage;
        }
        
        this.messageService.add({
          severity: severity,
          summary: severity === 'warn' ? 'Advertencia' : 'Error',
          detail: errorMessage,
          life: 5000
        });
        
        this.procesandoPago.set(false);
      }
    });
  }

  verHistorial() {
    this.router.navigate(['/client/pagos/historial']);
  }

  verConfiguracion() {
    this.router.navigate(['/client/pagos/configuracion']);
  }

  irAPrestamos() {
    this.router.navigate(['/client/pagos/prestamos']);
  }

  irAReportes() {
    this.router.navigate(['/client/pagos/reportes']);
  }

  generarRecibo(datosPago: any) {
    const fechaPago = new Date(datosPago.paid_at || new Date());
    const contenido = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #333; margin: 0;">RECIBO DE PAGO</h1>
          <p style="margin: 5px 0; color: #666;">#${datosPago.receipt_number || 'REC-' + Date.now()}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">INFORMACIÓN DEL EMPLEADO</h3>
          <p><strong>Nombre:</strong> ${datosPago.employee_name || this.empleadoSeleccionado.full_name}</p>
          <p><strong>Período:</strong> ${this.empleadoSeleccionado.period_display}</p>
          ${datosPago.is_advance_payment ? '<p style="color: #dc3545; font-weight: bold;">⚠️ PAGO ANTICIPADO</p>' : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">DETALLES DEL PAGO</h3>
          <p><strong>Monto Bruto:</strong> $${(datosPago.gross_amount || datosPago.amount_paid || 0).toFixed(2)}</p>
          ${datosPago.deductions && (datosPago.deductions.afp > 0 || datosPago.deductions.sfs > 0 || datosPago.deductions.isr > 0 || datosPago.deductions.loans > 0) ? `
            <p><strong>Descuentos:</strong></p>
            <ul style="margin-left: 20px;">
              ${datosPago.deductions.afp > 0 ? `<li>AFP (2.87%): $${datosPago.deductions.afp.toFixed(2)}</li>` : ''}
              ${datosPago.deductions.sfs > 0 ? `<li>SFS (3.04%): $${datosPago.deductions.sfs.toFixed(2)}</li>` : ''}
              ${datosPago.deductions.isr > 0 ? `<li>ISR: $${datosPago.deductions.isr.toFixed(2)}</li>` : ''}
              ${datosPago.deductions.loans > 0 ? `<li style="color: #007bff;">Préstamos: $${datosPago.deductions.loans.toFixed(2)}</li>` : ''}
            </ul>
            ${datosPago.loan_details && datosPago.loan_details.length > 0 ? `
              <p><strong>Detalle de Préstamos:</strong></p>
              <ul style="margin-left: 20px; font-size: 12px;">
                ${datosPago.loan_details.map((loan: any) => `<li>Préstamo #${loan.loan_id}: $${loan.amount.toFixed(2)} (Saldo: $${loan.remaining_balance.toFixed(2)})</li>`).join('')}
              </ul>
            ` : ''}
            <p><strong>Total Descuentos:</strong> $${datosPago.deductions.total.toFixed(2)}</p>
            <p style="font-size: 18px; color: #28a745;"><strong>Monto Neto:</strong> $${(datosPago.net_amount || datosPago.amount_paid || 0).toFixed(2)}</p>
          ` : `
            <p style="font-size: 18px; color: #28a745;"><strong>Monto a Pagar:</strong> $${(datosPago.net_amount || datosPago.amount_paid || 0).toFixed(2)}</p>
            <p style="font-size: 12px; color: #666;">Sin descuentos aplicados</p>
          `}
          <p><strong>Método:</strong> ${this.getMetodoLabel(this.metodoPago)}</p>
          <p><strong>Referencia:</strong> ${this.referenciaPago || 'N/A'}</p>
          <p><strong>Fecha:</strong> ${fechaPago.toLocaleDateString('es-ES')} ${fechaPago.toLocaleTimeString('es-ES')}</p>
          ${datosPago.is_advance_payment ? '<p style="color: #dc3545; font-size: 12px;"><strong>Nota:</strong> Este pago corresponde a una quincena futura</p>' : ''}
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">Recibo generado automáticamente</p>
        </div>
      </div>
    `;
    
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(`
        <html>
          <head>
            <title>Recibo de Pago - ${this.empleadoSeleccionado.full_name}</title>
            <meta charset="UTF-8">
          </head>
          <body>
            ${contenido}
            <script>
              window.onload = function() {
                setTimeout(() => {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      ventana.document.close();
    }
  }

  getMetodoLabel(metodo: string): string {
    const labels: any = {
      'cash': 'Efectivo',
      'transfer': 'Transferencia',
      'check': 'Cheque',
      'other': 'Otro'
    };
    return labels[metodo] || metodo;
  }

  formatearMoneda(valor: number): string {
    return `$${valor?.toFixed(2) || '0.00'}`;
  }

  getBotonLabel(empleado: any): string {
    if (empleado.pending_amount > 0) {
      return `Pagar Período`;
    } else if (empleado.payment_status === 'paid') {
      return 'Pagado';
    } else {
      return 'Sin Actividad';
    }
  }
  
  getNoActivityMessage(empleado: any): string {
    if (empleado.payment_status === 'paid' && empleado.total_earned > 0) {
      return 'Período ya pagado';
    } else if (empleado.salary_type === 'commission') {
      return 'Sin ventas en este período';
    } else if (empleado.salary_type === 'fixed') {
      return 'Período sin configurar';
    }
    return 'Sin actividad';
  }
  
  getUnifiedStatusMessage(empleado: any): string {
    if (empleado.payment_status === 'paid' && empleado.total_earned > 0) {
      return 'Período completado';
    } else if (empleado.salary_type === 'commission') {
      return 'Período en curso (sin ventas aún)';
    } else if (empleado.salary_type === 'fixed') {
      return 'Período en curso (monto pendiente de configurar)';
    }
    return 'Período en curso';
  }
  
  filtrarTodos() {
    const filtro = this.filtroGlobal.toLowerCase().trim();
    
    // Filtrar empleados PER_PERIOD
    const empleadosPeriodo = this.empleados().filter(emp => emp.commission_payment_mode !== 'ON_DEMAND');
    if (!filtro) {
      this.empleadosFiltrados.set(empleadosPeriodo);
    } else {
      const filtradosPeriodo = empleadosPeriodo.filter(emp => 
        emp.full_name?.toLowerCase().includes(filtro) ||
        emp.email?.toLowerCase().includes(filtro) ||
        emp.id?.toString().includes(filtro)
      );
      this.empleadosFiltrados.set(filtradosPeriodo);
    }
    
    // Filtrar empleados ON_DEMAND
    const empleadosOnDemand = this.getEmpleadosOnDemand();
    if (!filtro) {
      this.empleadosOnDemandFiltrados.set(empleadosOnDemand);
    } else {
      const filtradosOnDemand = empleadosOnDemand.filter(emp => 
        emp.full_name?.toLowerCase().includes(filtro) ||
        emp.email?.toLowerCase().includes(filtro) ||
        emp.id?.toString().includes(filtro)
      );
      this.empleadosOnDemandFiltrados.set(filtradosOnDemand);
    }
  }
  
  tieneEmpleadosPeriodoFiltrados(): boolean {
    return this.empleadosFiltrados().length > 0;
  }
  
  tieneEmpleadosOnDemandFiltrados(): boolean {
    return this.empleadosOnDemandFiltrados().length > 0;
  }
  
  getPeriodTooltip(empleado: any): string {
    switch(empleado.salary_type) {
      case 'commission':
        if (empleado.pending_amount > 0) {
          return `Las ventas de este período (${empleado.services_count}) ya están contabilizadas. El monto mostrado es la comisión por pagar.`;
        } else {
          return `No hubo ventas en el período ${empleado.period_display}. Las ventas se contabilizan automáticamente cuando se realizan.`;
        }
      
      case 'fixed':
        return `Sueldo fijo del período ${empleado.period_display}. Las ventas no afectan este monto.`;
      
      default:
        return `Monto calculado para el período ${empleado.period_display}.`;
    }
  }

  // Métodos para estados usando la utilidad
  getStatusColor(status: string): string {
    return PayrollStatusUtil.getStatusColor(status);
  }

  getStatusIcon(status: string): string {
    return PayrollStatusUtil.getStatusIcon(status);
  }

  getStatusLabel(status: string): string {
    return PayrollStatusUtil.getStatusLabel(status);
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return PayrollStatusUtil.getStatusSeverity(status);
  }

  // Métodos legacy para compatibilidad
  getEstadoLabel(status: string): string {
    return this.getStatusLabel(status);
  }

  getEstadoSeverity(status: string): 'success' | 'warn' | 'info' {
    const severity = this.getStatusSeverity(status);
    return severity === 'danger' ? 'warn' : severity === 'secondary' ? 'info' : severity as 'success' | 'warn' | 'info';
  }
  
  debugPendingSales() {
    this.http.get(`${environment.apiUrl}/employees/payments/debug_pending_sales/`).subscribe({
      next: (response: any) => {
        console.log('🐛 DEBUG PENDING SALES:', response);
        this.messageService.add({
          severity: 'info',
          summary: 'Debug Info',
          detail: `Encontrados ${response.total_employees_with_pending} empleados con pendientes. Ver consola.`,
          life: 5000
        });
      },
      error: (error) => {
        console.error('Error en debug:', error);
      }
    });
  }
  
  esElegibleParaOnDemand(empleado: any): boolean {
    const esElegible = empleado.salary_type === 'commission' && 
                      empleado.commission_payment_mode === 'ON_DEMAND' && 
                      empleado.commission_on_demand_since != null;
    
    console.log('ELEGIBILIDAD ON_DEMAND:', {
      empleado: empleado.full_name,
      salary_type: empleado.salary_type,
      commission_payment_mode: empleado.commission_payment_mode,
      commission_on_demand_since: empleado.commission_on_demand_since,
      esElegible
    });
    
    return esElegible;
  }
  
  tieneEmpleadosOnDemand(): boolean {
    return this.empleados().some(emp => this.esElegibleParaOnDemand(emp));
  }
  
  tieneEmpleadosPeriodo(): boolean {
    return this.empleados().some(emp => emp.commission_payment_mode !== 'ON_DEMAND');
  }
  
  getEmpleadosOnDemand(): any[] {
    return this.empleados().filter(emp => this.esElegibleParaOnDemand(emp));
  }
}