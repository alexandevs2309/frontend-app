import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodsListComponent } from './components/periods-list/periods-list.component';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, PeriodsListComponent],
  template: `
    <div class="min-h-screen surface-ground p-4 md:p-6 space-y-6">
      <section id="onb-earnings-header" class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="grid gap-6 px-6 py-7 xl:grid-cols-[1.35fr,0.85fr] xl:px-8">
          <div class="space-y-5">
            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
              Finanzas del equipo
            </div>
            <div>
              <h1 class="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Nómina</h1>
              <p class="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">Gestiona períodos, pagos y control de compensación del equipo desde una vista más clara y ejecutiva.</p>
            </div>
          </div>
          <div class="rounded-[1.6rem] bg-slate-950 p-5 text-white shadow-xl">
            <div class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Centro de pagos</div>
            <div class="mt-2 text-2xl font-black">Períodos y liquidaciones</div>
            <div class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
              Revisa períodos, aprueba pagos y mantén trazabilidad financiera del equipo en un solo flujo.
            </div>
          </div>
        </div>
      </section>

      <div class="flex-1 rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
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
