import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { PayrollService } from '../../services/payroll.service';
import { Period } from '../../interfaces/payroll.interface';
import { PaymentConfirmationComponent } from '../payment-confirmation/payment-confirmation.component';

@Component({
  selector: 'app-periods-list',
  standalone: true,
  imports: [
    CommonModule, ButtonModule, TableModule, TagModule, CardModule, 
    ToastModule, TooltipModule, PaymentConfirmationComponent
  ],
  providers: [MessageService],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-color);">📋 Períodos de Nómina</h1>
          <p style="color: var(--text-color-secondary);">Gestión simple de períodos de pago</p>
        </div>
        <button pButton label="Actualizar" icon="pi pi-refresh" 
                class="p-button-outlined" (click)="loadPeriods()" [loading]="loading()"></button>
      </div>

      <!-- Tabla de períodos -->
      <p-card>
        <p-table [value]="periods()" [loading]="loading()" responsiveLayout="scroll">
          <ng-template pTemplate="header">
            <tr>
              <th>Empleado</th>
              <th>Período</th>
              <th>Estado</th>
              <th>Total Bruto</th>
              <th>Descuentos</th>
              <th>Total Neto</th>
              <th>Acción</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-period>
            <tr>
              <td>{{ period.employee_name }}</td>
              <td>{{ period.period_display }}</td>
              <td>
                <p-tag [value]="getStatusLabel(period.status)" 
                       [severity]="getStatusSeverity(period.status)"></p-tag>
              </td>
              <td>{{ formatCurrency(period.gross_amount) }}</td>
              <td>{{ formatCurrency(period.deductions_total) }}</td>
              <td class="font-bold">{{ formatCurrency(period.net_amount) }}</td>
              <td>
                <span *ngIf="period.status === 'open'" 
                      class="font-medium" style="color: var(--text-color-secondary);">
                  <i class="pi pi-clock mr-1"></i>Pendiente
                </span>
                
                <div *ngIf="period.status === 'ready'">
                  <button pButton label="Registrar Pago" icon="pi pi-credit-card"
                          class="p-button-sm p-button-success"
                          [disabled]="!period.can_pay"
                          [pTooltip]="period.pay_block_reason || 'Listo para pagar'"
                          tooltipPosition="top"
                          (click)="openPaymentDialog(period)"></button>
                </div>
                
                <span *ngIf="period.status === 'paid'" 
                      class="font-medium"
                      style="color: var(--success-color-text);">
                  <i class="pi pi-check-circle mr-1"></i>Pagado
                </span>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center py-8">
                <i class="pi pi-inbox text-4xl mb-4" style="color: var(--text-color-secondary);"></i>
                <p style="color: var(--text-color-secondary);">No hay períodos disponibles</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- Componente de confirmación de pago -->
      <app-payment-confirmation
        [visible]="showPaymentDialog"
        [period]="selectedPeriod()"
        (confirmed)="onPaymentConfirmed($event)"
        (cancelled)="closePaymentDialog()">
      </app-payment-confirmation>
    </div>

    <p-toast></p-toast>
  `
})
export class PeriodsListComponent implements OnInit {
  private payrollService = inject(PayrollService);
  private messageService = inject(MessageService);

  loading = signal(false);
  periods = signal<Period[]>([]);
  selectedPeriod = signal<Period | null>(null);
  showPaymentDialog = false;

  ngOnInit() {
    this.loadPeriods();
  }

  loadPeriods() {
    this.loading.set(true);
    this.payrollService.getPeriods().subscribe({
      next: (response) => {
        this.periods.set(response.periods);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading periods:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los períodos'
        });
        this.loading.set(false);
      }
    });
  }



  openPaymentDialog(period: Period) {
    this.selectedPeriod.set(period);
    this.showPaymentDialog = true;
  }

  closePaymentDialog() {
    this.showPaymentDialog = false;
    this.selectedPeriod.set(null);
  }

  onPaymentConfirmed(response: any) {
    this.messageService.add({
      severity: 'success',
      summary: 'Pago Registrado',
      detail: `Pago de ${this.formatCurrency(response.amount_paid)} registrado exitosamente`
    });
    this.closePaymentDialog();
    this.loadPeriods();
    
    // Mostrar recibo automáticamente
    setTimeout(() => {
      this.verReciboDirecto(response.payment_id);
    }, 500);
  }

  getStatusLabel(status: string): string {
    const labels = {
      'open': 'Abierto',
      'ready': 'Listo',
      'paid': 'Pagado'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getStatusSeverity(status: string): 'info' | 'success' | 'warn' {
    const severities = {
      'open': 'info' as const,
      'ready': 'warn' as const,
      'paid': 'success' as const
    };
    return severities[status as keyof typeof severities] || 'info';
  }

  formatCurrency(amount: number): string {
    return `$${amount?.toFixed(2) || '0.00'}`;
  }

  async verReciboDirecto(paymentId: string) {
    try {
      const response = await this.payrollService.getPaymentReceipt(paymentId).toPromise();
      // Abrir recibo en nueva ventana para imprimir
      this.abrirReciboEnVentana(response);
    } catch (error) {
      console.error('Error cargando recibo:', error);
    }
  }

  abrirReciboEnVentana(recibo: any) {
    const reciboHtml = this.generarHtmlRecibo(recibo);
    const ventana = window.open('', '_blank', 'width=800,height=600');
    if (ventana) {
      ventana.document.write(reciboHtml);
      ventana.document.close();
      ventana.focus();
    }
  }

  generarHtmlRecibo(recibo: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo de Pago</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .section { margin: 20px 0; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .amount { font-size: 18px; font-weight: bold; color: #059669; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${recibo.company.name}</h1>
          <p>${recibo.company.address}</p>
          <h2>RECIBO DE PAGO</h2>
        </div>
        
        <div class="section grid">
          <div>
            <h3>Empleado:</h3>
            <p><strong>${recibo.employee.name}</strong></p>
            <p>${recibo.employee.email}</p>
          </div>
          <div>
            <h3>Período:</h3>
            <p><strong>${recibo.period.display}</strong></p>
            <p>${new Date(recibo.period.start_date).toLocaleDateString()} - ${new Date(recibo.period.end_date).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div class="section">
          <h3>Detalle de Pago:</h3>
          <p>Monto Bruto: $${recibo.amounts.gross_amount.toFixed(2)}</p>
          <p>Total Descuentos: -$${recibo.amounts.deductions.total.toFixed(2)}</p>
          <p class="amount">Monto Neto: $${recibo.amounts.net_amount.toFixed(2)}</p>
        </div>
        
        <div class="section grid">
          <div>
            <h3>Información del Pago:</h3>
            <p>Método: ${recibo.payment_info.method}</p>
            <p>Referencia: ${recibo.payment_info.reference}</p>
          </div>
          <div>
            <h3>Fecha:</h3>
            <p>${new Date(recibo.payment_info.paid_at).toLocaleString()}</p>
            <p>Pagado por: ${recibo.payment_info.paid_by}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #666;">
          <p>Recibo ID: ${recibo.payment_id}</p>
        </div>
      </body>
      </html>
    `;
  }
}