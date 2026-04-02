import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';
import { TenantService } from '../../../core/services/tenant/tenant.service';
import { SettingsService } from '../../../core/services/settings/settings.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-client-reports',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CardModule,
        ChartModule,
        DatePickerModule,
        SelectModule,
        ButtonModule,
        TableModule,
        TagModule,
        ProgressBarModule,
        ToastModule
    ],
    providers: [MessageService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<div class="w-full p-6 space-y-8 transition-colors">
  <section class="overflow-hidden rounded-[2rem] border border-white/50 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
    <div class="grid gap-8 px-6 py-8 xl:grid-cols-[1.45fr,0.8fr] xl:px-8">
      <div class="space-y-5">
        <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
          Reportes activos
        </div>

        <div>
          <h3 class="text-3xl font-black tracking-tight text-slate-950 dark:text-white xl:text-[2.6rem]">Centro de reportes</h3>
          <p class="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Revisa ingresos, tendencia mensual y el pulso comercial del negocio desde una sola vista.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
            <i class="pi pi-calendar text-xs"></i>
            {{ getActiveRangeLabel() }}
          </div>
          <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
            <i class="pi pi-chart-line text-xs"></i>
            {{ filteredRevenue().length }} meses visibles
          </div>
        </div>
      </div>

      <div class="rounded-[1.6rem] bg-slate-950 p-6 text-white shadow-xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Resumen ejecutivo</div>
            <div class="mt-2 text-2xl font-black">{{ branding().businessName }}</div>
          </div>
          <img *ngIf="branding().logoUrl" [src]="branding().logoUrl!" alt="Logo negocio" class="h-11 w-11 rounded-2xl bg-white/10 object-contain p-2" />
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div class="text-[11px] uppercase tracking-[0.22em] text-slate-400">Mejor mes</div>
            <div class="mt-1 text-lg font-bold">{{ getBestMonthLabel() }}</div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div class="text-[11px] uppercase tracking-[0.22em] text-slate-400">Pico de ingresos</div>
            <div class="mt-1 text-lg font-bold">{{ formatearMoneda(getMaxRevenue()) }}</div>
          </div>
        </div>

        <div class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
          {{ getReportNarrative() }}
        </div>
      </div>
    </div>

    <div class="border-t border-slate-200/80 px-6 py-6 dark:border-slate-800 lg:px-8">
      <form [formGroup]="filtrosForm" class="grid gap-3 xl:grid-cols-[1fr,1fr,auto,auto]">
        <p-datePicker formControlName="fechaInicio" placeholder="Fecha inicio" [showIcon]="true" dateFormat="dd/mm/yy"></p-datePicker>
        <p-datePicker formControlName="fechaFin" placeholder="Fecha fin" [showIcon]="true" dateFormat="dd/mm/yy"></p-datePicker>
        <button pButton type="button" label="Aplicar filtro" icon="pi pi-filter" (click)="aplicarFiltros()"></button>
        <button pButton type="button" label="Exportar PDF" icon="pi pi-file-pdf" class="p-button-danger" (click)="descargarReportePDF()"></button>
      </form>
    </div>
  </section>

  @if (loading()) {
    <div class="rounded-[1.75rem] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      Cargando reportes...
    </div>
  } @else if (loadError(); as errorMessage) {
    <div class="rounded-[1.75rem] border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="text-lg font-semibold text-red-600 mb-2">No se pudieron cargar los reportes</div>
      <p class="text-slate-600 dark:text-slate-300 mb-4">{{ errorMessage }}</p>
      <button pButton type="button" label="Reintentar" icon="pi pi-refresh" (click)="cargarDatos()"></button>
    </div>
  } @else {
    <section class="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
      <article *ngFor="let card of kpiCards" class="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900">
        <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{{ card.label }}</div>
        <div [ngClass]="card.color" class="mt-3 text-3xl font-black tracking-tight">{{ card.value }}</div>
        <div class="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>{{ card.trendText }}</span>
          <i class="pi pi-arrow-up-right text-xs text-slate-400"></i>
        </div>
      </article>
    </section>

    <section class="grid gap-6 2xl:grid-cols-[1.3fr,0.7fr]">
      <article class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <h5 class="text-xl font-bold text-slate-900 dark:text-white">Tendencia de ingresos</h5>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Vista de comportamiento mensual en el rango actual.</p>
          </div>
          <div class="rounded-2xl bg-slate-100 px-3 py-2 text-right text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <div class="font-semibold uppercase tracking-[0.2em]">Rango</div>
            <div class="mt-1 text-sm font-bold text-slate-800 dark:text-white">{{ getActiveRangeLabel() }}</div>
          </div>
        </div>

        @if (filteredRevenue().length > 0) {
          <div class="h-[22rem]">
            <p-chart type="line" [data]="chartIngresos" [options]="chartOptions"></p-chart>
          </div>
        } @else {
          <div class="flex h-[22rem] items-center justify-center rounded-2xl border border-dashed border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No hay datos en el rango seleccionado.
          </div>
        }
      </article>

      <article class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-5">
          <h5 class="text-xl font-bold text-slate-900 dark:text-white">Lectura rápida</h5>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Qué está pasando en el periodo que estás mirando.</p>
        </div>

        <div class="space-y-4">
          <div class="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
            <div class="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Mes líder</div>
            <div class="mt-2 text-lg font-bold text-slate-900 dark:text-white">{{ getBestMonthLabel() }}</div>
            <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ formatearMoneda(getMaxRevenue()) }}</div>
          </div>

          <div class="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
            <div class="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Promedio visible</div>
            <div class="mt-2 text-lg font-bold text-slate-900 dark:text-white">{{ formatearMoneda(getAverageRevenue()) }}</div>
            <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">Calculado sobre meses con ingresos.</div>
          </div>

          <div class="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <div class="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {{ getReportNarrative() }}
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="mb-5 flex items-center justify-between gap-4">
        <div>
          <h5 class="text-xl font-bold text-slate-900 dark:text-white">Detalle mensual</h5>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Comparativa de ingresos dentro del rango filtrado.</p>
        </div>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">{{ filteredRevenue().length }} meses</span>
      </div>

      @if (filteredRevenue().length > 0) {
        <p-table [value]="filteredRevenue()" responsiveLayout="scroll" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Mes</th>
              <th>Ingresos</th>
              <th>Participación</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-row>
            <tr>
              <td>
                <div class="font-semibold text-slate-900 dark:text-white">{{ row.month || 'Mes' }}</div>
              </td>
              <td>
                <div class="font-semibold text-slate-900 dark:text-white">{{ formatearMoneda(toRevenueValue(row.revenue)) }}</div>
              </td>
              <td class="min-w-[220px]">
                <div class="flex items-center gap-3">
                  <p-progressBar [value]="getRevenueShare(row.revenue)" [showValue]="false" styleClass="flex-1 h-2"></p-progressBar>
                  <span class="text-sm font-medium text-slate-500 dark:text-slate-300">{{ getRevenueShare(row.revenue) }}%</span>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      } @else {
        <div class="py-12 text-center text-slate-500 dark:text-slate-400">
          No hay ingresos para mostrar en este periodo.
        </div>
      }
    </section>
  }
</div>
<p-toast></p-toast>
    `
})
export class ClientReports implements OnInit {
    private dashboardService = inject(DashboardService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private tenantService = inject(TenantService);
    private settingsService = inject(SettingsService);

    activeTab = 'dashboard';
    loading = signal(false);
    loadError = signal<string | null>(null);

    // SOLO datos reales del backend
    kpis = signal({
        ingresos: 0,
        citas: 0,
        clientesNuevos: 0,
        ticketPromedio: 0
    });

    // REMOVIDO: empleadosTop - era simulado
    // REMOVIDO: analisisClientes - era simulado  
    // REMOVIDO: finanzas - era simulado
    // REMOVIDO: serviciosRentabilidad - era simulado

    // KPI Cards solo con datos reales
    kpiCards = [
        {
            label: 'Ingresos del Mes',
            value: '$0.00',
            color: 'text-indigo-600 dark:text-indigo-300',
            trendIcon: '',
            trendColor: '',
            trendText: 'Mes actual'
        },
        {
            label: 'Ingresos Totales', 
            value: '0',
            color: 'text-sky-600 dark:text-sky-300',
            trendIcon: '',
            trendColor: '',
            trendText: 'Últimos 6 meses'
        },
        {
            label: 'Promedio Mensual',
            value: '0',
            color: 'text-violet-600 dark:text-violet-300',
            trendIcon: '',
            trendColor: '',
            trendText: 'Últimos 6 meses'
        },
        {
            label: 'Meses Activos',
            value: '0',
            color: 'text-slate-700 dark:text-slate-200',
            trendIcon: '',
            trendColor: '',
            trendText: 'Con ventas'
        }
    ];

    filtrosForm: FormGroup = this.fb.group({
        fechaInicio: [new Date(new Date().getFullYear(), new Date().getMonth(), 1)],
        fechaFin: [new Date()]
    });

    chartIngresos: any;
    chartOptions: any;
    monthlyRevenueRaw: any[] = [];
    filteredRevenue = signal<any[]>([]);
    currencyCode = signal('DOP');
    branding = signal<{ businessName: string; logoUrl: string | null }>({
        businessName: 'Mi Barbería',
        logoUrl: null
    });

    ngOnInit() {
        this.initCharts();
        this.cargarMoneda();
        this.cargarTenantActual();
        this.cargarDatos();
    }

    cargarTenantActual() {
        this.tenantService.getCurrentTenant().subscribe({
            next: (tenant) => {
                const tenantCreatedAt = tenant?.created_at ? new Date(tenant.created_at) : null;
                if (!tenantCreatedAt || Number.isNaN(tenantCreatedAt.getTime())) {
                    return;
                }

                const startOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                const defaultStartDate = tenantCreatedAt > startOfCurrentMonth ? tenantCreatedAt : startOfCurrentMonth;

                this.filtrosForm.patchValue({
                    fechaInicio: defaultStartDate,
                    fechaFin: new Date()
                });
            },
            error: () => {
                // Mantener rango por defecto actual si no se puede obtener el tenant
            }
        });
    }

    cargarMoneda() {
        this.settingsService.getBarbershopSettings().subscribe({
            next: (settings) => {
                const posConfigBusinessName = typeof settings?.pos_config?.['business_name'] === 'string'
                    ? settings.pos_config['business_name']
                    : null;
                if (settings?.currency) {
                    this.currencyCode.set(settings.currency);
                }
                this.branding.set({
                    businessName: settings?.name || posConfigBusinessName || 'Mi Barbería',
                    logoUrl: this.normalizeLogoUrl(settings?.logo || null)
                });
            },
            error: () => {
                // Usar fallback por defecto
            }
        });
    }

    initCharts() {
        // Gráfico vacío hasta cargar datos reales
        this.chartIngresos = {
            labels: [],
            datasets: [{
                label: 'Ingresos',
                data: [],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        };
    }

    cargarDatos() {
        this.loading.set(true);
        this.loadError.set(null);
        this.dashboardService.getDashboardStats().subscribe({
            next: (stats: any) => {
                const monthlyRevenue = stats.monthly_revenue || [];
                this.monthlyRevenueRaw = monthlyRevenue;
                this.actualizarKPIsYGrafico(monthlyRevenue);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('❌ Error cargando reportes:', error);
                if (!environment.production) {
                    console.error('Error completo:', error);
                }
                this.monthlyRevenueRaw = [];
                this.filteredRevenue.set([]);
                this.actualizarKPIsYGrafico([]);
                this.loadError.set('No fue posible obtener las metricas del dashboard en este momento.');
                this.loading.set(false);
            }
        });
    }

    actualizarGraficoIngresosMensuales(monthlyRevenue: any[]) {
        this.filteredRevenue.set(monthlyRevenue);
        const labels = monthlyRevenue.map(item => item.month || 'Mes');
        const data = monthlyRevenue.map(item => item.revenue || 0);

        this.chartIngresos = {
            labels,
            datasets: [{
                label: 'Ingresos',
                data,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
    }

    actualizarKPIsYGrafico(monthlyRevenue: any[]) {
        const currentMonthRevenue = monthlyRevenue.length > 0 ?
            monthlyRevenue[monthlyRevenue.length - 1].revenue : 0;

        const totalRevenue = monthlyRevenue.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0);
        const activeMonths = monthlyRevenue.filter((item: any) => item.revenue > 0).length;
        const averageRevenue = activeMonths > 0 ? totalRevenue / activeMonths : 0;

        const monthLabel = new Intl.DateTimeFormat('es-DO', { month: 'long' }).format(new Date());
        const currentMonthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

        this.kpiCards[0].label = `Ingresos ${currentMonthLabel}`;
        this.kpiCards[0].value = this.formatearMoneda(currentMonthRevenue);
        this.kpiCards[1].label = 'Ingresos Totales';
        this.kpiCards[1].value = this.formatearMoneda(totalRevenue);
        this.kpiCards[2].label = 'Promedio Mensual';
        this.kpiCards[2].value = this.formatearMoneda(averageRevenue);
        this.kpiCards[3].label = 'Meses Activos';
        this.kpiCards[3].value = activeMonths.toString();

        this.actualizarGraficoIngresosMensuales(monthlyRevenue);
    }

    aplicarFiltros() {
        const filtros = this.filtrosForm.value;
        const fechaInicio: Date | null = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
        const fechaFin: Date | null = filtros.fechaFin ? new Date(filtros.fechaFin) : null;

        if (!fechaInicio || !fechaFin || this.monthlyRevenueRaw.length === 0) {
            this.actualizarKPIsYGrafico(this.monthlyRevenueRaw);
            return;
        }

        const fechaInicioMes = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
        const fechaFinMes = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), 1);

        const monthsCount = this.monthlyRevenueRaw.length;
        const baseMonth = new Date(new Date().getFullYear(), new Date().getMonth() - (monthsCount - 1), 1);

        const filtrado = this.monthlyRevenueRaw.filter((_: any, index: number) => {
            const monthDate = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + index, 1);
            return monthDate >= fechaInicioMes && monthDate <= fechaFinMes;
        });

        this.actualizarKPIsYGrafico(filtrado);
    }

    formatearMoneda(valor: number): string {
        const currency = this.currencyCode();
        const localeMap: Record<string, string> = {
            DOP: 'es-DO',
            COP: 'es-CO',
            USD: 'en-US',
            EUR: 'es-ES'
        };
        const locale = localeMap[currency] || 'es-DO';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            currencyDisplay: 'symbol'
        }).format(valor);
    }

    toRevenueValue(valor: unknown): number {
        return Number(valor || 0);
    }

    getActiveRangeLabel(): string {
        const { fechaInicio, fechaFin } = this.filtrosForm.value;
        if (!fechaInicio || !fechaFin) {
            return 'Periodo actual';
        }

        const start = new Date(fechaInicio);
        const end = new Date(fechaFin);

        return `${start.toLocaleDateString('es-DO', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }

    getMaxRevenue(): number {
        return this.filteredRevenue().reduce((max, item) => Math.max(max, this.toRevenueValue(item.revenue)), 0);
    }

    getAverageRevenue(): number {
        const values = this.filteredRevenue()
            .map((item) => this.toRevenueValue(item.revenue))
            .filter((value) => value > 0);

        if (!values.length) return 0;
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    getBestMonthLabel(): string {
        const rows = this.filteredRevenue();
        if (!rows.length) {
            return 'Sin datos';
        }

        const bestRow = rows.reduce((best, current) =>
            this.toRevenueValue(current.revenue) > this.toRevenueValue(best.revenue) ? current : best
        );

        return bestRow.month || 'Mes actual';
    }

    getRevenueShare(revenue: unknown): number {
        const maxRevenue = this.getMaxRevenue();
        if (!maxRevenue) {
            return 0;
        }

        return Math.round((this.toRevenueValue(revenue) / maxRevenue) * 100);
    }

    getReportNarrative(): string {
        const totalMonths = this.filteredRevenue().length;
        const bestMonth = this.getBestMonthLabel();
        const peak = this.getMaxRevenue();

        if (!totalMonths || peak === 0) {
            return 'Aun no hay suficiente actividad para generar una lectura comercial del periodo seleccionado.';
        }

        return `${bestMonth} marca el mejor rendimiento visible con ${this.formatearMoneda(peak)}. Usa este corte para comparar crecimiento, detectar caidas y ajustar promociones o capacidad operativa.`;
    }

    descargarReportePDF() {
        if (!this.filteredRevenue().length) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin datos',
                detail: 'No hay datos suficientes para generar el reporte'
            });
            return;
        }

        const html = this.generarHtmlReporteCliente();
        const ventana = window.open('', '_blank');
        if (!ventana) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Popup bloqueado',
                detail: 'Permite popups para descargar el reporte'
            });
            return;
        }

        ventana.document.write(html);
        ventana.document.close();
        ventana.focus();
        setTimeout(() => ventana.print(), 400);
    }

    private generarHtmlReporteCliente(): string {
        const branding = this.branding();
        const logo = branding.logoUrl
            ? `<img src="${branding.logoUrl}" alt="Logo" style="max-height:56px;max-width:180px;object-fit:contain;margin-bottom:8px;" />`
            : '';
        const fecha = new Date().toLocaleDateString();
        const rows = this.filteredRevenue().map((r: any) => `
            <tr>
                <td>${this.escapeHtml(r.month || 'Mes')}</td>
                <td>${this.formatearMoneda(Number(r.revenue || 0))}</td>
            </tr>
        `).join('');

        return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Reporte de Ingresos</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
    .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 20px; text-align: center; }
    .kpis { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 18px; }
    .kpi { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
    .kpi-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
    .kpi-value { font-size: 18px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
    th { background: #f9fafb; }
    @media print { @page { margin: 1cm; } }
  </style>
</head>
<body>
  <div class="header">
    ${logo}
    <h2 style="margin:0;">${this.escapeHtml(branding.businessName)}</h2>
    <h3 style="margin:8px 0 4px 0;">Reporte de Ingresos</h3>
    <div style="color:#6b7280;">Generado el ${fecha}</div>
  </div>
  <div class="kpis">
    ${this.kpiCards.map(card => `
      <div class="kpi">
        <div class="kpi-label">${this.escapeHtml(card.label)}</div>
        <div class="kpi-value">${this.escapeHtml(card.value)}</div>
      </div>
    `).join('')}
  </div>
  <table>
    <thead>
      <tr>
        <th>Mes</th>
        <th>Ingresos</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;
    }

    private normalizeLogoUrl(rawUrl: string | null): string | null {
        if (!rawUrl) return null;
        if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
        const apiOrigin = new URL(environment.apiUrl).origin;
        return rawUrl.startsWith('/') ? `${apiOrigin}${rawUrl}` : `${apiOrigin}/${rawUrl}`;
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
