import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodsListComponent } from './components/periods-list/periods-list.component';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, PeriodsListComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header Principal -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">💰 Nómina Simple</h1>
            <p class="text-gray-600">Gestión de períodos de pago por empleado</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">Sistema simplificado</span>
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- Contenido -->
      <div class="flex-1">
        <app-periods-list></app-periods-list>
      </div>

      <!-- Footer informativo -->
      <div class="bg-green-50 border-t border-green-200 px-6 py-3">
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-4 text-green-700">
            <span>✅ Solo pagos por período</span>
            <span>✅ Cálculos automáticos</span>
            <span>✅ Sin configuraciones complejas</span>
          </div>
          <div class="text-green-600">
            Nómina Simple - Flujo: Período → Cálculo → Pago
          </div>
        </div>
      </div>
    </div>
  `
})
export class PayrollComponent {}