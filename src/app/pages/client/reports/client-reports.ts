import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
    template: `

<div class="p-6 space-y-10 transition-colors">
  <!-- Header + Filtros -->
  <div class="rounded-2xl p-6 shadow-sm transition-colors bg-white dark:bg-gray-800">
    <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
      <div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Reportes y Análisis</h3>
        <p class="text-gray-600 dark:text-gray-300 mt-1">Visualiza el rendimiento de tu negocio</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Filtros -->
        <form [formGroup]="filtrosForm" class="flex gap-3">
          <p-datePicker formControlName="fechaInicio" placeholder="Fecha inicio" [showIcon]="true" dateFormat="dd/mm/yy" class="w-40"></p-datePicker>
          <p-datePicker formControlName="fechaFin" placeholder="Fecha fin" [showIcon]="true" dateFormat="dd/mm/yy" class="w-40"></p-datePicker>
          <button pButton type="button" label="Filtrar" icon="pi pi-filter" (click)="aplicarFiltros()" class="p-button-primary"></button>
          <button pButton type="button" label="Descargar PDF" icon="pi pi-file-pdf" class="p-button-danger" (click)="descargarReportePDF()"></button>
        </form>
      </div>
    </div>
  </div>

  <!-- KPIs REALES -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <div *ngFor="let card of kpiCards" class="rounded-2xl p-6 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md bg-white dark:bg-gray-800">
      <div class="text-gray-700 dark:text-gray-300 font-medium text-lg mb-2">{{ card.label }}</div>
      <div [ngClass]="card.color" class="font-bold text-3xl mb-2">{{ card.value }}</div>
      <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
        <span>{{ card.trendText }}</span>
      </div>
    </div>
  </div>

  <!-- Gráfico de Ingresos REALES -->
  <div class="rounded-2xl p-6 shadow-sm bg-white dark:bg-gray-800 transition-colors">
    <h5 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Ingresos por Mes (Últimos 6 meses)</h5>
    <div class="h-72">
      <p-chart type="line" [data]="chartIngresos" [options]="chartOptions"></p-chart>
    </div>
  </div>


</div>
<p-toast></p-toast>

    `
})
export class ClientReports implements OnInit {
    private dashboardService = inject(DashboardService);
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private messageService = inject(MessageService);
    private tenantService = inject(TenantService);

    activeTab = 'dashboard';

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
            color: 'text-indigo-600',
            trendIcon: '',
            trendColor: '',
            trendText: 'Mes actual'
        },
        {
            label: 'Ingresos Totales', 
            value: '0',
            color: 'text-indigo-600',
            trendIcon: '',
            trendColor: '',
            trendText: 'Últimos 6 meses'
        },
        {
            label: 'Promedio Mensual',
            value: '0',
            color: 'text-indigo-600',
            trendIcon: '',
            trendColor: '',
            trendText: 'Últimos 6 meses'
        },
        {
            label: 'Meses Activos',
            value: '0',
            color: 'text-slate-700 dark:text-slate-300',
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
        this.http.get<any>(`${environment.apiUrl}/settings/barbershop/`).subscribe({
            next: (settings) => {
                if (settings?.currency) {
                    this.currencyCode.set(settings.currency);
                }
                this.branding.set({
                    businessName: settings?.name || settings?.pos_config?.business_name || 'Mi Barbería',
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
        this.dashboardService.getDashboardStats().subscribe({
            next: (stats: any) => {
                const monthlyRevenue = stats.monthly_revenue || [];
                this.monthlyRevenueRaw = monthlyRevenue;
                this.actualizarKPIsYGrafico(monthlyRevenue);
            },
            error: (error) => {
                console.error('❌ Error cargando reportes:', error);
                if (!environment.production) {
                    console.error('Error completo:', error);
                }
            }
        });
    }

    actualizarGraficoIngresosMensuales(monthlyRevenue: any[]) {
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

    descargarReportePDF() {
        if (!this.monthlyRevenueRaw.length) {
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
        const rows = this.monthlyRevenueRaw.map((r: any) => `
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
