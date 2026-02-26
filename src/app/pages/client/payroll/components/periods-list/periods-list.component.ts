import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PayrollService } from '../../services/payroll.service';
import { Period } from '../../interfaces/payroll.interface';
import { PaymentConfirmationComponent } from '../payment-confirmation/payment-confirmation.component';

@Component({
  selector: 'app-periods-list',
  standalone: true,
  imports: [
    CommonModule, ButtonModule, TableModule, TagModule, CardModule, 
    ToastModule, TooltipModule, PaymentConfirmationComponent, DialogModule,
    InputTextModule, FormsModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
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
                <!-- Abierto -->
                <button *ngIf="period.status === 'open'" pButton label="Enviar" 
                        icon="pi pi-send" class="p-button-sm p-button-info"
                        (click)="submitForApproval(period)"></button>
                
                <!-- Pendiente de Aprobación -->
                <div *ngIf="period.status === 'pending_approval'" class="flex gap-2">
                  <button pButton label="Aprobar" icon="pi pi-check"
                          class="p-button-sm p-button-success"
                          (click)="approvePeriod(period)"></button>
                  <button pButton label="Rechazar" icon="pi pi-times"
                          class="p-button-sm p-button-danger"
                          (click)="openRejectDialog(period)"></button>
                </div>
                
                <!-- Aprobado -->
                <button *ngIf="period.status === 'approved'" pButton label="Registrar Pago" 
                        icon="pi pi-credit-card" class="p-button-sm p-button-success"
                        [disabled]="!period.can_pay"
                        [pTooltip]="period.pay_block_reason || 'Listo para pagar'"
                        tooltipPosition="top"
                        (click)="openPaymentDialog(period)"></button>
                
                <!-- Pagado -->
                <span *ngIf="period.status === 'paid'" 
                      class="font-medium"
                      style="color: var(--success-color-text);">
                  <i class="pi pi-check-circle mr-1"></i>Pagado
                </span>
                
                <!-- Rechazado -->
                <span *ngIf="period.status === 'rejected'" 
                      class="font-medium"
                      style="color: var(--danger-color-text);">
                  <i class="pi pi-times-circle mr-1"></i>Rechazado
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

      <!-- Diálogo de Rechazo -->
      <p-dialog header="Rechazar Período" [(visible)]="showRejectDialog" [modal]="true" 
                [style]="{width: '450px'}">
        <div class="p-4">
          <label class="block font-medium mb-2">Motivo del Rechazo:</label>
          <textarea [(ngModel)]="rejectionReason" rows="4" 
                    class="w-full p-2 border border-gray-300 rounded" 
                    placeholder="Ingrese el motivo..."></textarea>
        </div>
        <ng-template pTemplate="footer">
          <button pButton label="Cancelar" class="p-button-text" 
                  (click)="closeRejectDialog()"></button>
          <button pButton label="Rechazar" icon="pi pi-times" 
                  class="p-button-danger" [disabled]="!rejectionReason"
                  (click)="confirmReject()"></button>
        </ng-template>
      </p-dialog>

      <!-- Componente de confirmación de pago -->
      <app-payment-confirmation
        [visible]="showPaymentDialog"
        [period]="selectedPeriod()"
        (confirmed)="onPaymentConfirmed($event)"
        (cancelled)="closePaymentDialog()">
      </app-payment-confirmation>
    </div>

    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class PeriodsListComponent implements OnInit {
  private payrollService = inject(PayrollService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(false);
  periods = signal<Period[]>([]);
  selectedPeriod = signal<Period | null>(null);
  showPaymentDialog = false;
  showRejectDialog = false;
  rejectionReason = '';

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
      'pending_approval': 'Pendiente',
      'approved': 'Aprobado',
      'paid': 'Pagado',
      'rejected': 'Rechazado'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getStatusSeverity(status: string): 'info' | 'success' | 'warn' | 'danger' {
    const severities = {
      'open': 'info' as const,
      'pending_approval': 'warn' as const,
      'approved': 'success' as const,
      'paid': 'success' as const,
      'rejected': 'danger' as const
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

  submitForApproval(period: Period) {
    this.confirmationService.confirm({
      message: `¿Enviar período de ${period.employee_name} para aprobación?`,
      header: 'Confirmar Envío',
      icon: 'pi pi-send',
      accept: () => {
        this.payrollService.submitForApproval(period.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Enviado',
              detail: 'Período enviado para aprobación'
            });
            this.loadPeriods();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.error || 'No se pudo enviar el período'
            });
          }
        });
      }
    });
  }

  approvePeriod(period: Period) {
    this.confirmationService.confirm({
      message: `¿Aprobar período de ${period.employee_name} por ${this.formatCurrency(period.net_amount)}?`,
      header: 'Confirmar Aprobación',
      icon: 'pi pi-check',
      accept: () => {
        this.payrollService.approvePeriod(period.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Aprobado',
              detail: 'Período aprobado exitosamente'
            });
            this.loadPeriods();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.error || 'No se pudo aprobar el período'
            });
          }
        });
      }
    });
  }

  openRejectDialog(period: Period) {
    this.selectedPeriod.set(period);
    this.rejectionReason = '';
    this.showRejectDialog = true;
  }

  closeRejectDialog() {
    this.showRejectDialog = false;
    this.selectedPeriod.set(null);
    this.rejectionReason = '';
  }

  confirmReject() {
    const period = this.selectedPeriod();
    if (!period || !this.rejectionReason) return;

    this.payrollService.rejectPeriod(period.id, this.rejectionReason).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Rechazado',
          detail: 'Período rechazado'
        });
        this.closeRejectDialog();
        this.loadPeriods();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error || 'No se pudo rechazar el período'
        });
      }
    });
  }
}
