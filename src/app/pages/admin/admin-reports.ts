import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SaasMetricsService, SaasMetrics } from '../../core/services/saas-metrics.service';
import { ReportService, AdminReportResponse } from '../../core/services/report/report.service';
import { SettingsService } from '../../core/services/settings.service';
import { forkJoin } from 'rxjs';
import { AdminMrrTrendChartComponent } from './components/admin-mrr-trend-chart.component';
import { AdminPlanRevenueChartComponent } from './components/admin-plan-revenue-chart.component';

@Component({
    selector: 'app-admin-reports',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, DatePickerModule,
        SelectModule, TableModule, ToastModule, TagModule, AdminMrrTrendChartComponent, AdminPlanRevenueChartComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12">
                <section class="overflow-hidden rounded-[2rem] border border-surface-200/70 bg-surface-0 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.45)] dark:border-surface-800 dark:bg-surface-900">
                    <div class="relative overflow-hidden px-8 py-8 lg:px-10">
                        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.15),_transparent_36%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.14),_transparent_34%),linear-gradient(135deg,_rgba(15,23,42,0.92),_rgba(30,41,59,0.86))]"></div>
                        <div class="relative grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)] lg:items-start">
                            <div>
                                <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-surface-200 bg-surface-50/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-surface-600 dark:border-surface-700 dark:bg-surface-800/80 dark:text-surface-300">
                                    <i class="pi pi-chart-line text-primary"></i>
                                    SaaS analytics
                                </div>
                                <h1 class="text-3xl font-semibold tracking-tight text-surface-950 dark:text-surface-0 lg:text-4xl">
                                    Reportes financieros y crecimiento del negocio
                                </h1>
                                <p class="mt-3 max-w-2xl text-base leading-7 text-surface-600 dark:text-surface-300">
                                    MRR, churn, cobranza y distribución por planes en una vista más ejecutiva y menos administrativa.
                                </p>
                            </div>
                            <div class="rounded-3xl border border-surface-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-surface-700 dark:bg-surface-800/80">
                                <div class="text-xs font-semibold uppercase tracking-[0.24em] text-surface-500 dark:text-surface-400">Snapshot</div>
                                <div class="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                                    <div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-900/10">
                                        <div class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">MRR</div>
                                        <div class="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-100">{{(metrics()?.mrr || 0) | currency:currencyCode():'symbol':'1.0-0'}}</div>
                                    </div>
                                    <div class="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-900/60 dark:bg-sky-900/10">
                                        <div class="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Activos</div>
                                        <div class="mt-2 text-2xl font-semibold text-sky-900 dark:text-sky-100">{{metrics()?.active_tenants || 0}}</div>
                                    </div>
                                    <div class="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-900/60 dark:bg-violet-900/10">
                                        <div class="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">ARR</div>
                                        <div class="mt-2 text-2xl font-semibold text-violet-900 dark:text-violet-100">{{getARR() | currency:currencyCode():'symbol':'1.0-0'}}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div class="col-span-12">
                <div class="rounded-[1.5rem] border border-surface-200 bg-surface-0 p-6 shadow-sm dark:border-surface-800 dark:bg-surface-900">
                    <div class="mb-5">
                        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-surface-500 dark:text-surface-400">Filtros</div>
                        <h2 class="mt-2 text-xl font-semibold text-surface-950 dark:text-surface-0">Configura el período del reporte</h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="mb-2 block text-sm font-medium text-surface-700 dark:text-surface-300">Período</label>
                            <p-select [(ngModel)]="selectedPeriod" name="selectedPeriod" [options]="periodOptions"
                                     optionLabel="label" optionValue="value" placeholder="Seleccionar período" />
                        </div>
                        <div>
                            <label class="mb-2 block text-sm font-medium text-surface-700 dark:text-surface-300">Fecha Inicio</label>
                            <p-datepicker [(ngModel)]="startDate" name="startDate" dateFormat="dd/mm/yy" />
                        </div>
                        <div>
                            <label class="mb-2 block text-sm font-medium text-surface-700 dark:text-surface-300">Fecha Fin</label>
                            <p-datepicker [(ngModel)]="endDate" name="endDate" dateFormat="dd/mm/yy" />
                        </div>
                        <div class="flex items-end">
                            <p-button label="Generar Reporte" icon="pi pi-chart-line"
                                     (onClick)="generateReport()" [loading]="loading()" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="col-span-12 md:col-span-3">
                <p-card>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-green-600">{{(metrics()?.mrr || 0) | currency:currencyCode():'symbol':'1.0-0'}}</div>
                        <div class="text-sm text-gray-600">MRR (Monthly Recurring Revenue)</div>
                        <div class="text-xs text-green-500 mt-1">+{{metrics()?.growth_rate || 0}}% vs mes anterior</div>
                    </div>
                </p-card>
            </div>

            <div class="col-span-12 md:col-span-3">
                <p-card>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-blue-600">{{metrics()?.active_tenants || 0}}</div>
                        <div class="text-sm text-gray-600">Tenants Activos</div>
                        <div class="text-xs text-gray-500 mt-1">de {{metrics()?.total_tenants || 0}} total</div>
                        <div class="text-xs text-amber-600 mt-1">Trials activos: {{metrics()?.trial_tenants || 0}}</div>
                        <div class="text-xs text-rose-600">Trials expiran (7d): {{metrics()?.expiring_trials_7d || 0}}</div>
                    </div>
                </p-card>
            </div>

            <div class="col-span-12 md:col-span-3">
                <p-card>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-orange-600">{{(metrics()?.churn_rate || 0).toFixed(1)}}%</div>
                        <div class="text-sm text-gray-600">Churn Rate</div>
                        <div class="text-xs text-orange-500 mt-1">Tasa de cancelación mensual</div>
                    </div>
                </p-card>
            </div>

            <div class="col-span-12 md:col-span-3">
                <p-card>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-purple-600">{{getARR() | currency:currencyCode():'symbol':'1.0-0'}}</div>
                        <div class="text-sm text-gray-600">ARR (Annual Recurring Revenue)</div>
                        <div class="text-xs text-purple-500 mt-1">MRR × 12</div>
                    </div>
                </p-card>
            </div>

            <div class="col-span-12 md:col-span-4">
                <p-card>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-emerald-600">{{ (adminReport()?.total_revenue || 0) | currency:currencyCode():'symbol':'1.0-0' }}</div>
                        <div class="text-sm text-gray-600">Revenue Bruto</div>
                        <div class="text-xs text-emerald-500 mt-1">Facturas pagadas del período</div>
                    </div>
                </p-card>
            </div>

            <div class="col-span-12 md:col-span-4">
                <p-card>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-amber-600">{{ (adminReport()?.platform_commission_amount || 0) | currency:currencyCode():'symbol':'1.0-0' }}</div>
                        <div class="text-sm text-gray-600">Comisión Plataforma</div>
                        <div class="text-xs text-amber-500 mt-1">{{ (adminReport()?.commission_rate || 0) | number:'1.0-2' }}% aplicado al revenue cobrado</div>
                    </div>
                </p-card>
            </div>

            <div class="col-span-12 md:col-span-4">
                <p-card>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-teal-600">{{ (adminReport()?.net_revenue || 0) | currency:currencyCode():'symbol':'1.0-0' }}</div>
                        <div class="text-sm text-gray-600">Revenue Neto Plataforma</div>
                        <div class="text-xs text-teal-500 mt-1">Revenue bruto menos comisión</div>
                    </div>
                </p-card>
            </div>

            <div class="col-span-12 md:col-span-4">
                <p-card>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-orange-600">{{ (adminReport()?.pending_payments || 0) | currency:currencyCode():'symbol':'1.0-0' }}</div>
                        <div class="text-sm text-gray-600">Pagos Pendientes</div>
                        <div class="text-xs text-orange-500 mt-1">Riesgo de cobranza</div>
                    </div>
                </p-card>
            </div>

            <div class="col-span-12 md:col-span-4">
                <p-card>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-red-600">{{ adminReport()?.overdue_invoices || 0 }}</div>
                        <div class="text-sm text-gray-600">Facturas Vencidas</div>
                        <div class="text-xs text-red-500 mt-1">Clientes con mora activa</div>
                    </div>
                </p-card>
            </div>

            <div class="col-span-12 md:col-span-4">
                <p-card>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-indigo-600">{{ getCollectionRate() | number:'1.0-1' }}%</div>
                        <div class="text-sm text-gray-600">Tasa de Cobro</div>
                        <div class="text-xs text-indigo-500 mt-1">Facturas pagadas / total</div>
                    </div>
                </p-card>
            </div>

            <!-- MRR Trend Chart -->
            <div class="col-span-12 md:col-span-8">
                <p-card header="Tendencia de MRR">
                    @defer (on viewport) {
                        <app-admin-mrr-trend-chart [data]="mrrChartData" [options]="chartOptions"></app-admin-mrr-trend-chart>
                    } @placeholder {
                        <div class="h-[22rem] animate-pulse rounded-2xl bg-surface-100 dark:bg-surface-800"></div>
                    }
                </p-card>
            </div>

            <!-- Revenue by Plan -->
            <div class="col-span-12 md:col-span-4">
                <p-card header="Revenue por Plan">
                    @defer (on viewport) {
                        <app-admin-plan-revenue-chart [data]="planChartData" [options]="doughnutOptions"></app-admin-plan-revenue-chart>
                    } @placeholder {
                        <div class="h-[22rem] animate-pulse rounded-2xl bg-surface-100 dark:bg-surface-800"></div>
                    }
                </p-card>
            </div>

            <!-- Revenue by Plan Table -->
            <div class="col-span-12 md:col-span-6">
                <p-card header="Detalle por Plan">
                    <p-table [value]="metrics()?.revenue_by_plan || []" [tableStyle]="{'min-width': '100%'}">
                        <ng-template #header>
                            <tr>
                                <th>Plan</th>
                                <th>Tenants</th>
                                <th>Bruto</th>
                                <th>Comisión</th>
                                <th>Neto</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-plan>
                            <tr>
                                <td>{{plan.plan_name}}</td>
                                <td>
                                    <p-tag [value]="plan.tenant_count.toString()" severity="info" />
                                </td>
                                <td>{{plan.revenue | currency:currencyCode()}}</td>
                                <td>{{(plan.commission_amount || 0) | currency:currencyCode()}}</td>
                                <td>{{getNetRevenue(plan) | currency:currencyCode()}}</td>
                            </tr>
                        </ng-template>
                    </p-table>
                </p-card>
            </div>

            <!-- Recent Signups -->
            <div class="col-span-12 md:col-span-6">
                <p-card header="Registros Recientes">
                    <p-table [value]="metrics()?.recent_signups || []" [tableStyle]="{'min-width': '100%'}">
                        <ng-template #header>
                            <tr>
                                <th>Tenant</th>
                                <th>Plan</th>
                                <th>Fecha</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-signup>
                            <tr>
                                <td>{{signup.tenant_name}}</td>
                                <td>
                                    <p-tag [value]="signup.plan" [severity]="getPlanSeverity(signup.plan)" />
                                </td>
                                <td>{{signup.created_at | date:'dd/MM/yyyy'}}</td>
                            </tr>
                        </ng-template>
                    </p-table>
                </p-card>
            </div>

            <!-- Export Actions -->
            <div class="col-span-12">
                <p-card>
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">Exportar Reportes</h3>
                        <div class="flex gap-2">
                            <p-button label="Exportar CSV" icon="pi pi-file-excel"
                                     severity="success" (onClick)="exportCSV()" />
                            <p-button label="Exportar PDF" icon="pi pi-file-pdf"
                                     severity="danger" (onClick)="exportPDF()" />
                        </div>
                    </div>
                </p-card>
            </div>
        </div>

        <p-toast />
    `,
    providers: [MessageService]
})
export class AdminReports implements OnInit {
    metrics = signal<SaasMetrics | null>(null);
    adminReport = signal<AdminReportResponse | null>(null);
    loading = signal(false);
    currencyCode = signal('USD');

    selectedPeriod = 'last_30_days';
    startDate: Date | null = null;
    endDate: Date | null = null;

    periodOptions = [
        { label: 'Últimos 7 días', value: 'last_7_days' },
        { label: 'Últimos 30 días', value: 'last_30_days' },
        { label: 'Últimos 3 meses', value: 'last_3_months' },
        { label: 'Último año', value: 'last_year' },
        { label: 'Personalizado', value: 'custom' }
    ];

    mrrChartData: any = { labels: [], datasets: [] };
    planChartData: any = { labels: [], datasets: [] };
    chartOptions: any = {};
    doughnutOptions: any = {};

    constructor(
        private saasMetricsService: SaasMetricsService,
        private reportService: ReportService,
        private settingsService: SettingsService,
        private messageService: MessageService
    ) {
        this.initChartOptions();
    }

    ngOnInit() {
        this.loadCurrency();
        this.generateReport(false);
    }

    loadCurrency() {
        this.settingsService.getSettings().subscribe({
            next: (settings) => {
                if (settings?.default_currency) {
                    this.currencyCode.set(settings.default_currency);
                    this.initChartOptions();
                }
            },
            error: () => {}
        });
    }

    generateReport(showToast = true) {
        if (this.selectedPeriod === 'custom' && (!this.startDate || !this.endDate)) {
            this.showErrorMessage('Selecciona fecha inicio y fin para período personalizado');
            return;
        }

        const params = this.buildAdminReportParams();
        this.loading.set(true);

        forkJoin({
            metrics: this.saasMetricsService.getSaasMetrics(),
            adminReport: this.reportService.getAdminReport(params)
        }).subscribe({
            next: ({ metrics, adminReport }) => {
                this.metrics.set(metrics);
                this.adminReport.set(adminReport);
                this.updateCharts(metrics, adminReport);
                this.loading.set(false);
                if (showToast) {
                    this.showSuccessMessage('Reporte Generado', 'Reporte actualizado correctamente');
                }
            },
            error: (error) => this.handleLoadError(error)
        });
    }

    updateCharts(metrics: SaasMetrics, adminReport: AdminReportResponse) {
        const trend = adminReport?.revenue_trend || [];
        const labels = trend.map((item) => item.label || item.month || '');
        const grossValues = trend.map((item) => item.revenue || 0);
        const netValues = trend.map((item) => item.net_revenue || 0);

        // Revenue trend chart from real backend data
        this.mrrChartData = {
            labels,
            datasets: [
                {
                    label: 'Revenue bruto',
                    data: grossValues,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Revenue neto plataforma',
                    data: netValues,
                    borderColor: '#0F766E',
                    backgroundColor: 'rgba(15, 118, 110, 0.08)',
                    tension: 0.35
                }
            ]
        };

        // Revenue by Plan Chart
        this.planChartData = {
            labels: metrics.revenue_by_plan.map(p => p.plan_name),
            datasets: [{
                data: metrics.revenue_by_plan.map(p => p.revenue),
                backgroundColor: ['#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981']
            }]
        };
    }

    private buildAdminReportParams(): { period: string; start_date?: string; end_date?: string } {
        const params: { period: string; start_date?: string; end_date?: string } = {
            period: this.selectedPeriod
        };

        if (this.selectedPeriod === 'custom' && this.startDate && this.endDate) {
            params.start_date = this.formatDateYmd(this.startDate);
            params.end_date = this.formatDateYmd(this.endDate);
        }

        return params;
    }

    private formatDateYmd(date: Date): string {
        const y = date.getFullYear();
        const m = `${date.getMonth() + 1}`.padStart(2, '0');
        const d = `${date.getDate()}`.padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    initChartOptions() {
        this.chartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value: any) => this.formatMoney(Number(value), '1.0-0')
                    }
                }
            }
        };

        this.doughnutOptions = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };
    }

    getARR(): number {
        return (this.metrics()?.mrr || 0) * 12;
    }

    getAverageRevenue(plan: any): number {
        return plan.tenant_count > 0 ? plan.revenue / plan.tenant_count : 0;
    }

    getNetRevenue(plan: any): number {
        if (typeof plan?.net_revenue === 'number') {
            return plan.net_revenue;
        }
        return (plan?.revenue || 0) - (plan?.commission_amount || 0);
    }

    getCollectionRate(): number {
        const summary = this.adminReport()?.summary;
        if (!summary?.total_invoices) return 0;
        return (summary.paid_invoices / summary.total_invoices) * 100;
    }

    getPlanSeverity(plan: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const severityMap: { [key: string]: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' } = {
            'FREE': 'secondary',
            'Basic': 'info',
            'Professional': 'success',
            'Enterprise': 'warn'
        };
        return severityMap[plan] || 'info';
    }

    exportCSV() {
        const metrics = this.metrics();
        if (!metrics) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin Datos',
                detail: 'No hay datos para exportar'
            });
            return;
        }

        // Crear contenido CSV
        let csvContent = 'Reporte Financiero SaaS\n\n';
        
        // Métricas principales
        csvContent += 'Métricas Principales\n';
        csvContent += 'Métrica,Valor\n';
        csvContent += `MRR,"${this.formatMoney(metrics.mrr, '1.0-0')}"\n`;
        csvContent += `ARR,"${this.formatMoney(this.getARR(), '1.0-0')}"\n`;
        csvContent += `Total Tenants,${metrics.total_tenants}\n`;
        csvContent += `Tenants Activos,${metrics.active_tenants}\n`;
        csvContent += `Trials Activos,${metrics.trial_tenants || 0}\n`;
        csvContent += `Trials por Vencer (7d),${metrics.expiring_trials_7d || 0}\n`;
        csvContent += `Churn Rate,${metrics.churn_rate.toFixed(1)}%\n`;
        csvContent += `Growth Rate,${metrics.growth_rate}%\n\n`;

        const adminReport = this.adminReport();
        if (adminReport) {
        csvContent += 'Cobranza\n';
        csvContent += 'Métrica,Valor\n';
        csvContent += `Revenue Bruto,"${this.formatMoney(Number(adminReport.total_revenue || 0), '1.0-0')}"\n`;
        csvContent += `Comisión Plataforma,"${this.formatMoney(Number(adminReport.platform_commission_amount || 0), '1.0-0')}"\n`;
        csvContent += `Revenue Neto,"${this.formatMoney(Number(adminReport.net_revenue || 0), '1.0-0')}"\n`;
        csvContent += `Pagos Pendientes,"${this.formatMoney(Number(adminReport.pending_payments || 0), '1.0-0')}"\n`;
        csvContent += `Facturas Vencidas,${adminReport.overdue_invoices || 0}\n`;
        csvContent += `Facturas Pagadas,${adminReport.summary?.paid_invoices || 0}\n`;
        csvContent += `Facturas Totales,${adminReport.summary?.total_invoices || 0}\n`;
        csvContent += `Tasa de Cobro,${this.getCollectionRate().toFixed(1)}%\n\n`;
        }
        
        // Revenue por plan
        csvContent += 'Revenue por Plan\n';
        csvContent += 'Plan,Revenue Bruto,Comisión,Revenue Neto,Tenants\n';
        metrics.revenue_by_plan.forEach((plan: any) => {
            csvContent += `${plan.plan_name},"${this.formatMoney(plan.revenue, '1.0-0')}","${this.formatMoney(Number(plan.commission_amount || 0), '1.0-0')}","${this.formatMoney(this.getNetRevenue(plan), '1.0-0')}",${plan.tenant_count}\n`;
        });
        
        csvContent += '\n';
        
        // Registros recientes
        csvContent += 'Registros Recientes\n';
        csvContent += 'Tenant,Plan,Fecha\n';
        metrics.recent_signups.forEach(signup => {
            const date = new Date(signup.created_at).toLocaleDateString();
            csvContent += `"${signup.tenant_name}",${signup.plan},${date}\n`;
        });
        
        // Descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte-saas-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.messageService.add({
            severity: 'success',
            summary: 'CSV Exportado',
            detail: 'Reporte descargado exitosamente'
        });
    }

    exportPDF() {
        const metrics = this.metrics();
        if (!metrics) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin Datos',
                detail: 'No hay datos para exportar'
            });
            return;
        }

        const htmlContent = this.generatePDFContent(metrics);
        
        this.openPrintWindow(htmlContent);
    }

    private generatePDFContent(metrics: any): string {
        const currentDate = new Date().toLocaleDateString();
        const arr = this.getARR();
        
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte Financiero SaaS</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
        .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .metric-label { font-size: 14px; color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .section-title { font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte Financiero SaaS</h1>
        <p>Generado el ${currentDate}</p>
    </div>
    ${this.generateMetricsSection(metrics, arr)}
    ${this.generateRevenueTable(metrics)}
    ${this.generateSignupsTable(metrics)}
</body>
</html>`;
    }

    private generateMetricsSection(metrics: any, arr: number): string {
        return `<div class="metrics">
        <div class="metric-card">
            <div class="metric-value">${this.formatMoney(metrics.mrr, '1.0-0')}</div>
            <div class="metric-label">MRR Bruto</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${this.formatMoney(arr, '1.0-0')}</div>
            <div class="metric-label">ARR</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${this.formatMoney(Number(metrics.platform_commission_mrr || 0), '1.0-0')}</div>
            <div class="metric-label">Comisión MRR</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${this.formatMoney(Number(metrics.net_mrr || 0), '1.0-0')}</div>
            <div class="metric-label">MRR Neto</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${metrics.active_tenants}</div>
            <div class="metric-label">Tenants Activos</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${metrics.trial_tenants || 0}</div>
            <div class="metric-label">Trials Activos</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${metrics.churn_rate.toFixed(1)}%</div>
            <div class="metric-label">Churn Rate</div>
        </div>
    </div>`;
    }

    private generateRevenueTable(metrics: any): string {
        const rows = metrics.revenue_by_plan.map((plan: any) => 
            `<tr>
                <td>${this.escapeHtml(plan.plan_name)}</td>
                <td>${this.formatMoney(plan.revenue, '1.0-0')}</td>
                <td>${this.formatMoney(Number(plan.commission_amount || 0), '1.0-0')}</td>
                <td>${this.formatMoney(this.getNetRevenue(plan), '1.0-0')}</td>
                <td>${plan.tenant_count}</td>
            </tr>`
        ).join('');
        
        return `<div class="section-title">Revenue por Plan</div>
        <table>
            <thead>
                <tr><th>Plan</th><th>Revenue Bruto</th><th>Comisión</th><th>Revenue Neto</th><th>Tenants</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
    }

    private generateSignupsTable(metrics: any): string {
        const rows = metrics.recent_signups.map((signup: any) => 
            `<tr>
                <td>${this.escapeHtml(signup.tenant_name)}</td>
                <td>${this.escapeHtml(signup.plan)}</td>
                <td>${new Date(signup.created_at).toLocaleDateString()}</td>
            </tr>`
        ).join('');
        
        return `<div class="section-title">Registros Recientes</div>
        <table>
            <thead>
                <tr><th>Tenant</th><th>Plan</th><th>Fecha</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private formatMoney(value: number, digitsInfo = '1.2-2'): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.currencyCode(),
            minimumFractionDigits: digitsInfo === '1.0-0' ? 0 : 2,
            maximumFractionDigits: digitsInfo === '1.0-0' ? 0 : 2
        }).format(Number(value || 0));
    }

    private openPrintWindow(htmlContent: string): void {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('Popup blocked or failed to open');
            }
            
            const sanitizedContent = this.sanitizeHtmlContent(htmlContent);
            printWindow.document.write(sanitizedContent);
            printWindow.document.close();
            printWindow.focus();
            
            this.schedulePrint(printWindow);
            this.showSuccessMessage('PDF Generado', 'Use Ctrl+P para guardar como PDF');
        } catch (error) {
            this.logError('PDF generation failed', error);
            this.showErrorMessage('No se pudo abrir la ventana de impresión');
        }
    }

    private sanitizeHtmlContent(content: string): string {
        // Basic HTML sanitization - remove script tags and dangerous attributes
        return content
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '');
    }

    private schedulePrint(printWindow: Window): void {
        setTimeout(() => {
            try {
                printWindow.print();
                printWindow.close();
            } catch (error) {
                this.logError('Print scheduling failed', error);
            }
        }, 500);
    }

    private handleLoadError(error: any): void {
        this.loading.set(false);
        this.logError('Metrics loading failed', error);
        this.showErrorMessage('Error al cargar las métricas');
    }

    private showSuccessMessage(summary: string, detail: string): void {
        this.messageService.add({ severity: 'success', summary, detail });
    }

    private showErrorMessage(detail: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail });
    }

    private logError(context: string, error: any): void {
        const errorInfo = {
            context,
            timestamp: new Date().toISOString(),
            error: error?.message || 'Unknown error',
            component: 'AdminReports'
        };
        
    }
}
