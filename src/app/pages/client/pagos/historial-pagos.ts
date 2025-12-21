import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PagosService, HistorialPago } from './services/pagos.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PayrollStatusUtil } from '../../../shared/utils/payroll-status.util';
import { PayrollStatusBadgeComponent } from '../../../shared/components/payroll-status-badge.component';
import { WithdrawalHistoryComponent } from '../../../shared/components/withdrawal-history.component';

@Component({
  selector: 'app-historial-pagos',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TableModule, DatePickerModule, SelectModule, ToastModule, TagModule, FormsModule, PayrollStatusBadgeComponent, WithdrawalHistoryComponent],
  providers: [MessageService],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">📋 Historial de Pagos</h1>
          <p class="text-gray-600">Consulta todos los pagos realizados a empleados</p>
        </div>
        <div class="flex gap-2">
          <button pButton label="Exportar" icon="pi pi-download" 
                  class="p-button-outlined" (click)="exportarHistorial()"></button>
          <button pButton label="Volver" icon="pi pi-arrow-left" 
                  class="p-button-outlined" (click)="volver()"></button>
        </div>
      </div>

      <!-- Filtros -->
      <p-card header="Filtros" class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Empleado</label>
            <p-select [(ngModel)]="filtroEmpleado" [options]="empleados()" 
                      optionLabel="full_name" optionValue="id" 
                      placeholder="Todos" class="w-full"></p-select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Método de Pago</label>
            <p-select [(ngModel)]="filtroMetodo" [options]="metodosPago" 
                      optionLabel="label" optionValue="value" 
                      placeholder="Todos" class="w-full"></p-select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Fecha Desde</label>
            <p-datepicker [(ngModel)]="fechaDesde" [showIcon]="true" class="w-full"></p-datepicker>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Fecha Hasta</label>
            <p-datepicker [(ngModel)]="fechaHasta" [showIcon]="true" class="w-full"></p-datepicker>
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <button pButton label="Aplicar Filtros" icon="pi pi-search" 
                  class="p-button-success" (click)="aplicarFiltros()"></button>
          <button pButton label="Limpiar" icon="pi pi-times" 
                  class="p-button-outlined" (click)="limpiarFiltros()"></button>
        </div>
      </p-card>

      <!-- Resumen -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <p-card>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ historialFiltrado().length }}</div>
            <div class="text-sm text-gray-600">Total Pagos</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ formatearMoneda(totalPagado()) }}</div>
            <div class="text-sm text-gray-600">Monto Total</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ empleadosUnicos() }}</div>
            <div class="text-sm text-gray-600">Empleados</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ formatearMoneda(promediosPago()) }}</div>
            <div class="text-sm text-gray-600">Promedio por Pago</div>
          </div>
        </p-card>
      </div>

      <!-- Historial de Retiros ON_DEMAND -->
      <app-withdrawal-history class="mb-6"></app-withdrawal-history>
      
      <!-- Tabla de historial -->
      <p-card header="Historial de Pagos">
        <p-table [value]="historialFiltrado()" [loading]="cargando()" 
                 [paginator]="true" [rows]="20" responsiveLayout="scroll">
          <ng-template pTemplate="header">
            <tr>
              <th>Fecha</th>
              <th>Empleado</th>
              <th>Período y Estado</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Referencia</th>
              <th>Recibo</th>
              <th>Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-pago>
            <tr>
              <td>{{ pago.paid_at | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <div>
                  <div class="font-medium">{{ pago.employee?.full_name }}</div>
                  <div class="text-sm text-gray-500">{{ pago.employee?.email }}</div>
                </div>
              </td>
              <td>
                <div class="font-medium">{{ pago.period }}</div>
                <app-payroll-status-badge
                  [status]="pago.period_status || (pago.is_advance_payment ? 'paid' : 'paid')"
                  [statusDisplay]="pago.period_status_display || (pago.is_advance_payment ? 'Pagado anticipadamente' : 'Pagado')"
                  [periodDisplay]="pago.period"
                  [showPeriodInfo]="false"
                  [compact]="true">
                </app-payroll-status-badge>
              </td>
              <td class="font-bold" [ngClass]="pago.is_advance_payment ? 'text-red-600' : 'text-green-600'">
                {{ formatearMoneda(pago.amount_paid) }}
                <div *ngIf="pago.is_advance_payment" class="flex items-center gap-1 mt-1">
                  <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold border border-red-300">⚠️ ANTICIPADO</span>
                  <i class="pi pi-info-circle text-red-500" 
                     pTooltip="Pago realizado antes del período regular" 
                     tooltipPosition="top"></i>
                </div>
              </td>
              <td>
                <p-tag [value]="getMetodoLabel(pago.payment_method)" 
                       [severity]="getMetodoSeverity(pago.payment_method)"></p-tag>
              </td>
              <td>{{ pago.payment_reference || '-' }}</td>
              <td>
                <span *ngIf="pago.receipt_number" class="text-sm font-mono">
                  {{ pago.receipt_number }}
                </span>
                <span *ngIf="!pago.receipt_number" class="text-gray-400">-</span>
              </td>
              <td>
                <div class="flex gap-1">
                  <button pButton icon="pi pi-print" class="p-button-text p-button-sm" 
                          pTooltip="Reimprimir recibo" (click)="reimprimirRecibo(pago)"></button>
                  <button pButton icon="pi pi-eye" class="p-button-text p-button-sm" 
                          pTooltip="Ver detalles" (click)="verDetalles(pago)"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center py-8">
                <div class="flex flex-col items-center gap-3">
                  <i class="pi pi-history text-4xl text-gray-400"></i>
                  <p class="text-gray-500">No hay pagos registrados aún</p>
                  <p class="text-sm text-gray-400">Los pagos procesados aparecerán aquí</p>
                  <button pButton label="Procesar Pagos" class="p-button-sm" (click)="volver()"></button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-toast></p-toast>
    </div>
  `
})
export class HistorialPagos implements OnInit {
  private pagosService = inject(PagosService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private http = inject(HttpClient);

  historial = signal<HistorialPago[]>([]);
  historialFiltrado = signal<HistorialPago[]>([]);
  empleados = signal<any[]>([]);
  cargando = signal(false);

  // Filtros
  filtroEmpleado: number | null = null;
  filtroMetodo = '';
  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;

  metodosPago = [
    { label: 'Efectivo', value: 'cash' },
    { label: 'Transferencia', value: 'transfer' },
    { label: 'Cheque', value: 'check' },
    { label: 'Otro', value: 'other' }
  ];

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.cargando.set(true);
    
    // Usar el mismo endpoint que la pantalla principal
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = hoy.getMonth() + 1;
    const day = hoy.getDate();
    const quincenaEnMes = day <= 15 ? 1 : 2;
    const fortnight = (month - 1) * 2 + quincenaEnMes;
    
    this.pagosService.obtenerHistorialPagos({ year, fortnight }).subscribe({
      next: (response: any) => {
        // Procesar datos reales del backend
        const historialReal = this.procesarHistorialReal(response);
        
        this.historial.set(historialReal);
        this.historialFiltrado.set(historialReal);
        
        // Extraer empleados únicos para filtro
        const empleadosUnicos = this.extraerEmpleadosUnicos(historialReal);
        this.empleados.set(empleadosUnicos);
        
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error cargando historial:', error);
        this.historial.set([]);
        this.historialFiltrado.set([]);
        this.empleados.set([]);
        this.messageService.add({
          severity: 'info',
          summary: 'Sin historial',
          detail: 'No hay pagos registrados aún'
        });
        this.cargando.set(false);
      }
    });
  }

  private procesarHistorialReal(response: any): HistorialPago[] {
    const empleados = response?.employees || [];
    const empleadosArray = Array.isArray(empleados) ? empleados : [];
    
    // Solo incluir empleados que tienen pagos realizados (total_earned > 0 Y payment_status = 'paid')
    const empleadosPagados = empleadosArray.filter((emp: any) => {
      const tienePago = emp.total_earned > 0 && emp.payment_status === 'paid';
      return tienePago;
    });
    
    return empleadosPagados.map((emp: any) => ({
      id: emp.employee_id || emp.id,
      employee: {
        id: emp.employee_id || emp.id,
        full_name: emp.employee_name || emp.full_name,
        email: emp.employee_email || emp.email || emp.employee_name
      },
      period: emp.period_display || `Período ${response.summary?.fortnight || 'N/A'}/${response.summary?.year || new Date().getFullYear()}`,
      amount_paid: emp.total_earned || 0,
      payment_method: emp.payment_method || 'cash',
      payment_reference: emp.payment_reference || '',
      paid_at: emp.paid_at || new Date().toISOString(),
      receipt_number: emp.receipt_number || `REC-${emp.employee_id}-${Date.now()}`,
      is_advance_payment: emp.is_advance_payment || false,
      period_status: emp.period_status || 'paid',
      period_status_display: emp.period_status_display || 'Pagado',
      period_dates: emp.period_dates
    }));
  }

  private extraerEmpleadosUnicos(historial: HistorialPago[]): any[] {
    const empleadosMap = new Map();
    historial.forEach(pago => {
      if (pago.employee && !empleadosMap.has(pago.employee.id)) {
        empleadosMap.set(pago.employee.id, {
          id: pago.employee.id,
          full_name: pago.employee.full_name
        });
      }
    });
    return Array.from(empleadosMap.values());
  }

  aplicarFiltros() {
    const historialArray = this.historial() || [];
    let filtrado = [...historialArray];

    if (this.filtroEmpleado) {
      filtrado = filtrado.filter(p => p.employee?.id === this.filtroEmpleado);
    }

    if (this.filtroMetodo) {
      filtrado = filtrado.filter(p => p.payment_method === this.filtroMetodo);
    }

    if (this.fechaDesde) {
      filtrado = filtrado.filter(p => new Date(p.paid_at) >= this.fechaDesde!);
    }

    if (this.fechaHasta) {
      filtrado = filtrado.filter(p => new Date(p.paid_at) <= this.fechaHasta!);
    }

    this.historialFiltrado.set(filtrado);
  }

  limpiarFiltros() {
    this.filtroEmpleado = null;
    this.filtroMetodo = '';
    this.fechaDesde = null;
    this.fechaHasta = null;
    this.historialFiltrado.set(this.historial() || []);
  }

  totalPagado() {
    const filtrado = this.historialFiltrado() || [];
    return filtrado.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  }

  empleadosUnicos() {
    const filtrado = this.historialFiltrado() || [];
    return new Set(filtrado.map(p => p.employee?.id)).size;
  }

  promediosPago() {
    const total = this.totalPagado();
    const filtrado = this.historialFiltrado() || [];
    const count = filtrado.length;
    return count > 0 ? total / count : 0;
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

  getMetodoSeverity(metodo: string): 'success' | 'info' | 'warn' {
    switch (metodo) {
      case 'cash': return 'success';
      case 'transfer': return 'info';
      default: return 'warn';
    }
  }

  reimprimirRecibo(pago: HistorialPago) {
    const fechaPago = new Date(pago.paid_at);
    const contenido = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #333; margin: 0;">RECIBO DE PAGO</h1>
          <p style="margin: 5px 0; color: #666;">#${pago.receipt_number}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">INFORMACIÓN DEL EMPLEADO</h3>
          <p><strong>Nombre:</strong> ${pago.employee?.full_name}</p>
          <p><strong>Email:</strong> ${pago.employee?.email}</p>
          <p><strong>Período:</strong> ${pago.period}</p>
          ${pago.is_advance_payment ? '<p style="color: #dc3545; font-weight: bold;">⚠️ PAGO ANTICIPADO</p>' : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">DETALLES DEL PAGO</h3>
          <p style="font-size: 18px; color: #28a745;"><strong>Monto Pagado:</strong> ${this.formatearMoneda(pago.amount_paid)}</p>
          <p><strong>Método:</strong> ${this.getMetodoLabel(pago.payment_method)}</p>
          <p><strong>Referencia:</strong> ${pago.payment_reference || 'N/A'}</p>
          <p><strong>Fecha:</strong> ${fechaPago.toLocaleDateString('es-ES')} ${fechaPago.toLocaleTimeString('es-ES')}</p>
          ${pago.is_advance_payment ? '<p style="color: #dc3545; font-size: 12px;"><strong>Nota:</strong> Este pago correspondía a una quincena futura</p>' : ''}
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">Recibo reimpreso el ${new Date().toLocaleString('es-ES')}</p>
        </div>
      </div>
    `;
    
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(`
        <html>
          <head>
            <title>Recibo de Pago - ${pago.employee?.full_name}</title>
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
    
    this.messageService.add({
      severity: 'success',
      summary: 'Recibo',
      detail: 'Recibo enviado a impresión'
    });
  }

  verDetalles(pago: HistorialPago) {
    this.messageService.add({
      severity: 'info',
      summary: 'Detalles',
      detail: `Ver detalles de ${pago.employee?.full_name}`,
      life: 3000
    });
  }

  exportarHistorial() {
    const historialArray = this.historialFiltrado() || [];
    if (historialArray.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin datos',
        detail: 'No hay datos para exportar'
      });
      return;
    }

    // Exportar como CSV localmente
    const headers = ['Fecha', 'Empleado', 'Email', 'Período', 'Monto', 'Método', 'Referencia', 'Recibo'];
    const rows = historialArray.map(p => [
      new Date(p.paid_at).toLocaleDateString('es-ES'),
      p.employee?.full_name || '',
      p.employee?.email || '',
      p.period,
      p.amount_paid.toFixed(2),
      this.getMetodoLabel(p.payment_method),
      p.payment_reference || '-',
      p.receipt_number || '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial_pagos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    this.messageService.add({
      severity: 'success',
      summary: 'Exportado',
      detail: 'Historial exportado correctamente'
    });
  }

  volver() {
    this.router.navigate(['/client/pagos']);
  }

  formatearMoneda(valor: number): string {
    return `$${valor?.toFixed(2) || '0.00'}`;
  }
}