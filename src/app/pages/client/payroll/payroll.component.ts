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
            <h1 class="text-2xl font-bold text-color">Nómina</h1>
            <p class="text-color-secondary">Gestión de períodos y pagos de empleados</p>
          </div>
        </div>
      </div>

      <!-- Contenido -->
      <div class="flex-1">
        <app-periods-list></app-periods-list>
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
