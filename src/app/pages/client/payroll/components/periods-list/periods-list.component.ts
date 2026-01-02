import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PayrollService } from '../../services/payroll.service';
import { Period } from '../../interfaces/payroll.interface';
import { PaymentConfirmationComponent } from '../payment-confirmation/payment-confirmation.component';

@Component({
  selector: 'app-periods-list',
  standalone: true,
  imports: [
    CommonModule, ButtonModule, TableModule, TagModule, CardModule, 
    ToastModule, PaymentConfirmationComponent
  ],
  providers: [MessageService],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">📋 Períodos de Nómina</h1>
          <p class="text-gray-600">Gestión simple de períodos de pago</p>
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
                <button *ngIf="period.status === 'open'" 
                        pButton label="Calcular" icon="pi pi-calculator"
                        class="p-button-sm p-button-info"
                        (click)="closePeriod(period)" [loading]="processing()"></button>
                
                <button *ngIf="period.status === 'ready'" 
                        pButton label="Registrar Pago" icon="pi pi-credit-card"
                        class="p-button-sm p-button-success"
                        (click)="openPaymentDialog(period)"></button>
                
                <span *ngIf="period.status === 'paid'" 
                      class="text-green-600 font-medium">
                  <i class="pi pi-check-circle mr-1"></i>Pagado
                </span>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center py-8">
                <i class="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-600">No hay períodos disponibles</p>
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
  processing = signal(false);
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

  closePeriod(period: Period) {
    this.processing.set(true);
    this.payrollService.closePeriod(period.id).subscribe({
      next: (updatedPeriod) => {
        // Actualizar período en la lista
        const periods = this.periods();
        const index = periods.findIndex(p => p.id === period.id);
        if (index !== -1) {
          periods[index] = { ...period, ...updatedPeriod };
          this.periods.set([...periods]);
        }
        
        this.messageService.add({
          severity: 'success',
          summary: 'Período Calculado',
          detail: `Total neto: ${this.formatCurrency(updatedPeriod.net_amount)}`
        });
        this.processing.set(false);
      },
      error: (error) => {
        console.error('Error closing period:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error || 'Error al calcular período'
        });
        this.processing.set(false);
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
    this.loadPeriods(); // Refrescar lista
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
}