import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { PayrollService } from '../../services/payroll.service';
import { Period, PaymentRequest } from '../../interfaces/payroll.interface';

@Component({
  selector: 'app-payment-confirmation',
  standalone: true,
  imports: [
    CommonModule, DialogModule, ButtonModule, SelectModule, 
    InputTextModule, FormsModule
  ],
  template: `
    <p-dialog [(visible)]="visible" header="💳 Confirmar Pago de Nómina" 
              [modal]="true" [style]="{width: '500px'}" [closable]="false">
      
      <div *ngIf="period" class="space-y-4">
        <!-- Información del período -->
        <div class="p-4 rounded" style="background-color: var(--surface-100);">
          <h4 class="font-medium" style="color: var(--text-color);">{{ period.employee_name }}</h4>
          <p class="text-sm" style="color: var(--text-color-secondary);">{{ period.period_display }}</p>
        </div>

        <!-- Desglose de montos -->
        <div class="p-4 rounded border" style="background-color: color-mix(in srgb, var(--primary-color) 10%, transparent); border-color: color-mix(in srgb, var(--primary-color) 30%, transparent);">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span style="color: var(--text-color-secondary);">Total bruto:</span>
              <span class="font-medium">{{ formatCurrency(period.gross_amount) }}</span>
            </div>
            <div class="flex justify-between" style="color: var(--danger-color-text);">
              <span>Descuentos:</span>
              <span>-{{ formatCurrency(period.deductions_total) }}</span>
            </div>
            <hr style="border-color: color-mix(in srgb, var(--primary-color) 30%, transparent);">
            <div class="flex justify-between text-lg font-bold" style="color: var(--primary-color-text);">
              <span>Total neto:</span>
              <span>{{ formatCurrency(period.net_amount) }}</span>
            </div>
          </div>
        </div>

        <!-- Método de pago -->
        <div>
          <label class="block text-sm font-medium mb-2">Método de Pago</label>
          <p-select [(ngModel)]="paymentMethod" [options]="paymentMethods" 
                    optionLabel="label" optionValue="value" 
                    placeholder="Seleccionar método..." class="w-full"></p-select>
        </div>

        <!-- Referencia -->
        <div>
          <label class="block text-sm font-medium mb-2">Referencia (opcional)</label>
          <input pInputText [(ngModel)]="paymentReference" 
                 placeholder="Ej: Transferencia #123, Efectivo caja 1" class="w-full">
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-outlined" 
                (click)="cancel()" [disabled]="processing()"></button>
        <button pButton label="Confirmar Pago" class="p-button-success" 
                [loading]="processing()" (click)="confirmPayment()"
                [disabled]="!paymentMethod || processing()"></button>
      </ng-template>
    </p-dialog>
  `
})
export class PaymentConfirmationComponent {
  @Input() visible = false;
  @Input() period: Period | null = null;
  @Output() confirmed = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  private payrollService = inject(PayrollService);
  
  processing = signal(false);
  paymentMethod = 'cash';
  paymentReference = '';

  paymentMethods = [
    { label: 'Efectivo', value: 'cash' },
    { label: 'Transferencia', value: 'transfer' }
  ];

  confirmPayment() {
    if (!this.period || !this.paymentMethod) return;

    this.processing.set(true);

    const paymentData: PaymentRequest = {
      period_id: this.period.id,
      payment_method: this.paymentMethod as 'cash' | 'transfer',
      payment_reference: this.paymentReference || undefined
    };

    this.payrollService.registerPayment(paymentData).subscribe({
      next: (response) => {
        this.confirmed.emit(response);
        this.resetForm();
        this.processing.set(false);
      },
      error: (error) => {
        console.error('Payment error:', error);
        // El error se maneja en el componente padre
        this.processing.set(false);
      }
    });
  }

  cancel() {
    this.cancelled.emit();
    this.resetForm();
  }

  private resetForm() {
    this.paymentMethod = 'cash';
    this.paymentReference = '';
  }

  formatCurrency(amount: number): string {
    return `$${amount?.toFixed(2) || '0.00'}`;
  }
}