import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { PagosService } from '../../pages/client/pagos/services/pagos.service';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-withdrawal-history',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, InputTextModule, FormsModule, CardModule],
  template: `
    <p-card *ngIf="shouldShowHistory()" [header]="getHeaderTitle()" class="mt-4">
      <div class="flex justify-end mb-3">
        <button pButton icon="pi pi-refresh"
                class="p-button-outlined p-button-sm p-button-text"
                (click)="cargarHistorial()"
                [loading]="cargando()"
                pTooltip="Actualizar"></button>
      </div>

      <!-- Tabla compacta -->
      <p-table [value]="retiros()" [loading]="cargando()"
               [paginator]="true" [rows]="5" [showCurrentPageReport]="false"
               styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>Fecha</th>
            <th *ngIf="!employeeId">Empleado</th>
            <th>Monto</th>
            <th>Método</th>
            <th>Procesado por</th>
            <th>Acciones</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-retiro>
          <tr>
            <td>{{ formatearFecha(retiro.created_at) }}</td>
            <td *ngIf="!employeeId">
              <div class="font-medium">{{ retiro.employee?.name || retiro.employee_name }}</div>
              <div class="text-xs text-gray-500">ID: {{ retiro.employee?.id || retiro.employee_id }}</div>
            </td>
            <td>
              <span class="font-semibold text-green-600">
                {{ formatearMoneda(retiro.amount) }}
              </span>
              <div class="text-xs text-gray-500">
                Neto: {{ formatearMoneda(retiro.net_amount) }}
              </div>
            </td>
            <td>
              <p-tag [value]="getMetodoLabel(retiro.payment_method)"
                     severity="info" class="text-xs"></p-tag>
              <div *ngIf="retiro.payment_reference" class="text-xs text-gray-500 mt-1">
                Ref: {{ retiro.payment_reference }}
              </div>
            </td>
            <td class="text-sm">{{ retiro.processed_by }}</td>
            <td>
              <button pButton icon="pi pi-print"
                      class="p-button-outlined p-button-sm"
                      pTooltip="Reimprimir recibo"
                      (click)="reimprimirRecibo(retiro)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="employeeId ? 5 : 6" class="text-center text-gray-500 py-4">
              No hay retiros registrados
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Resumen mínimo -->
      <div *ngIf="resumen() && resumen()?.total_withdrawals > 0" class="mt-3 text-xs text-gray-500 text-center">
        {{ resumen()?.total_withdrawals }} retiros • {{ formatearMoneda(resumen()?.total_amount || 0) }}
      </div>
    </p-card>
  `
})
export class WithdrawalHistoryComponent implements OnInit {
  @Input() employeeId!: number;
  @Input() commissionPaymentMode?: string;

  private pagosService = inject(PagosService);

  retiros = signal<any[]>([]);
  resumen = signal<any>(null);
  cargando = signal(false);

  fechaInicio: string = '';
  fechaFin: string = '';

  ngOnInit() {
    if (this.shouldShowHistory()) {
      this.cargarHistorial();
    }
  }

  shouldShowHistory(): boolean {
    // Si no hay employeeId, mostrar historial general de todos los empleados
    if (!this.employeeId) {
      return true; // Siempre mostrar en historial general
    }
    // Si hay employeeId, solo mostrar para empleados ON_DEMAND
    return this.commissionPaymentMode === 'ON_DEMAND' && this.employeeId > 0;
  }

  cargarHistorial() {
    this.cargando.set(true);

    const params: any = {};
    
    // Solo agregar employee_id si está definido (para historial específico)
    if (this.employeeId) {
      params.employee_id = this.employeeId;
    }
    
    if (this.fechaInicio) {
      params.start_date = this.fechaInicio;
    }
    if (this.fechaFin) {
      params.end_date = this.fechaFin;
    }

    this.pagosService.obtenerHistorialRetiros(params).subscribe({
      next: (response) => {
        this.retiros.set(response.withdrawals || []);
        this.resumen.set(response.summary);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error cargando historial:', error);
        this.retiros.set([]);
        this.cargando.set(false);
      }
    });
  }

  aplicarFiltros() {
    this.cargarHistorial();
  }

  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.cargarHistorial();
  }

  reimprimirRecibo(retiro: any) {
    // Reutilizar función de impresión existente
    this.imprimirReciboOnDemand(retiro);
  }

  formatearMoneda(valor: number): string {
    return `$${valor?.toFixed(2) || '0.00'}`;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  getHeaderTitle(): string {
    return this.employeeId ? 'Historial de Retiros' : 'Historial de Retiros ON_DEMAND';
  }

  imprimirReciboOnDemand(data: any) {
    const fechaRetiro = new Date(data.created_at || new Date());
    const contenido = `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 15px;">
          <h2 style="color: #333; margin: 0; font-size: 18px;">RECIBO DE RETIRO DE COMISIÓN</h2>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">(ON_DEMAND)</p>
          <p style="margin: 5px 0; color: #666; font-size: 12px;">#${data.withdraw_id || 'RET-' + Date.now()}</p>
        </div>

        <div style="margin-bottom: 15px;">
          <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-size: 14px;">DETALLE</h3>
          <p style="margin: 5px 0; font-size: 12px;"><strong>Empleado:</strong> ${data.employee?.name || 'N/A'}</p>
          <p style="margin: 5px 0; font-size: 12px;"><strong>Fecha y hora:</strong> ${fechaRetiro.toLocaleDateString('es-ES')} ${fechaRetiro.toLocaleTimeString('es-ES')}</p>
          <p style="margin: 5px 0; font-size: 12px;"><strong>Monto retirado:</strong> $${data.amount?.toFixed(2) || '0.00'}</p>
          <p style="margin: 5px 0; font-size: 12px;"><strong>Método de pago:</strong> ${this.getMetodoLabel(data.payment_method || 'cash')}</p>
          ${data.payment_reference ? `<p style="margin: 5px 0; font-size: 12px;"><strong>Referencia:</strong> ${data.payment_reference}</p>` : ''}
        </div>

        <div style="margin-bottom: 15px;">
          <p style="margin: 5px 0; font-size: 12px;"><strong>Procesado por:</strong> ${data.processed_by || 'Sistema'}</p>
        </div>

        <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 15px;">
          <p style="font-size: 10px; color: #666; text-align: center; margin: 5px 0;">
            Este retiro corresponde a comisiones ya generadas por ventas realizadas.
          </p>
          <div style="margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px;">
            <p style="font-size: 10px; color: #666; margin: 0;">Firma del empleado:</p>
            <div style="height: 30px; border-bottom: 1px solid #ccc; margin-top: 5px;"></div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 10px;">Recibo generado automáticamente</p>
        </div>
      </div>
    `;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(`
        <html>
          <head>
            <title>Recibo Retiro ON_DEMAND - ${data.employee?.name || 'Empleado'}</title>
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
}
