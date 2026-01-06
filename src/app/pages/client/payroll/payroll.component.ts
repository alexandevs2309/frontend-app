import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodsListComponent } from './components/periods-list/periods-list.component';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, PeriodsListComponent],
  template: `
    <div class="min-h-screen surface-ground">
      <!-- Header Principal -->
      <div class="surface-card border-b surface-border px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-color">💰 Nómina Simple</h1>
            <p class="text-color-secondary">Gestión de períodos de pago por empleado</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-color-secondary">Sistema simplificado</span>
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- Contenido -->
      <div class="flex-1">
        <app-periods-list></app-periods-list>
      </div>

      <!-- Footer informativo -->
      <div class="success-background border-t success-border px-6 py-3">
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-4 success-text">
            <span>✅ Solo pagos por período</span>
            <span>✅ Cálculos automáticos</span>
            <span>✅ Sin configuraciones complejas</span>
          </div>
          <div class="success-text">
            Nómina Simple - Flujo: Período → Cálculo → Pago
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-background {
      background-color: color-mix(in srgb, var(--success-color) 10%, transparent);
    }
    .success-border {
      border-color: color-mix(in srgb, var(--success-color) 30%, transparent);
    }
    .success-text {
      color: var(--success-color-text);
    }
  `]
})
export class PayrollComponent {}