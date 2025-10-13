import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SaasMetricsService, SaasMetrics } from '../../core/services/saas-metrics.service';
import { ReportService } from '../../core/services/report/report.service';

@Component({
    selector: 'app-admin-reports',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, DatePickerModule,
        SelectModule, ChartModule, TableModule, ToastModule, TagModule
    ],
    template: `
        <div class="grid grid-cols-12 gap-6">
            <!-- Header -->
            <div class="col-span-12">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        📊 Reportes Financieros SaaS
                    </h1>
                    <p class="text-gray-600 dark:text-gray-400">
                        Análisis completo de ingresos, crecimiento y métricas clave del negocio
                    </p>
                </div>
            </div>

            <!-- Filters -->
            <div class="col-span-12">
                <p-card header="Filtros de Reporte">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Período</label>
                            <p-select [(ngModel)]="selectedPeriod" name="selectedPeriod" [options]="periodOptions"
                                     optionLabel="label" optionValue="value" placeholder="Seleccionar período" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Fecha Inicio</label>
                            <p-datepicker [(ngModel)]="startDate" name="startDate" dateFormat="dd/mm/yy" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Fecha Fin</label>
                            <p-datepicker [(ngModel)]="endDate" name="endDate" dateFormat="dd/mm/yy" />
                        </div>
                        <div class="flex items-end">
                            <p-button label="Generar Reporte" icon="pi pi-chart-line"
                                     (onClick)="generateReport()" [loading]="loading()" />
                        </div>
                    </div>
                </p-card>
            </div>

            <!-- KPI Cards -->
            <div class="col-span-12 md:col-span-3">
                <p-card>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-green-600">{{(metrics()?.mrr || 0) | currency:'USD':'symbol':'1.0-0'}}</div>
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
                        <div class="text-3xl font-bold text-purple-600">{{getARR() | currency:'USD':'symbol':'1.0-0'}}</div>
                        <div class="text-sm text-gray-600">ARR (Annual Recurring Revenue)</div>
                        <div class="text-xs text-purple-500 mt-1">MRR × 12</div>
                    </div>
                </p-card>
            </div>

            <!-- MRR Trend Chart -->
            <div class="col-span-12 md:col-span-8">
                <p-card header="Tendencia de MRR">
                    <p-chart type="line" [data]="mrrChartData" [options]="chartOptions" />
                </p-card>
            </div>

            <!-- Revenue by Plan -->
            <div class="col-span-12 md:col-span-4">
                <p-card header="Revenue por Plan">
                    <p-chart type="doughnut" [data]="planChartData" [options]="doughnutOptions" />
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
                                <th>Revenue</th>
                                <th>Promedio</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-plan>
                            <tr>
                                <td>{{plan.plan_name}}</td>
                                <td>
                                    <p-tag [value]="plan.tenant_count.toString()" severity="info" />
                                </td>
                                <td>{{plan.revenue | currency:'USD'}}</td>
                                <td>{{getAverageRevenue(plan) | currency:'USD'}}</td>
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
    loading = signal(false);

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

    mrrChartData: any;
    planChartData: any;
    chartOptions: any;
    doughnutOptions: any;

    constructor(
        private saasMetricsService: SaasMetricsService,
        private reportService: ReportService,
        private messageService: MessageService
    ) {
        this.initChartOptions();
    }

    ngOnInit() {
        this.loadMetrics();
    }

    loadMetrics() {
        this.loading.set(true);
        this.saasMetricsService.getSaasMetrics().subscribe({
            next: (data) => {
                this.metrics.set(data);
                this.updateCharts();
                this.loading.set(false);
            },
            error: (error) => this.handleLoadError(error)
        });
    }

    generateReport() {
        this.loadMetrics();
        this.messageService.add({
            severity: 'success',
            summary: 'Reporte Generado',
            detail: 'Reporte actualizado correctamente'
        });
    }

    updateCharts() {
        const metrics = this.metrics();
        if (!metrics) return;

        // MRR Trend Chart (mock data for demo)
        this.mrrChartData = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
                label: 'MRR',
                data: [
                    metrics.mrr * 0.7,
                    metrics.mrr * 0.8,
                    metrics.mrr * 0.85,
                    metrics.mrr * 0.9,
                    metrics.mrr * 0.95,
                    metrics.mrr
                ],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }]
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
                        callback: (value: any) => '$' + value.toLocaleString()
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

    getPlanSeverity(plan: string): string {
        const severityMap: { [key: string]: string } = {
            'FREE': 'secondary',
            'Basic': 'info',
            'Professional': 'success',
            'Enterprise': 'warning'
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
        csvContent += `MRR,"$${metrics.mrr.toLocaleString()}"\n`;
        csvContent += `ARR,"$${this.getARR().toLocaleString()}"\n`;
        csvContent += `Total Tenants,${metrics.total_tenants}\n`;
        csvContent += `Tenants Activos,${metrics.active_tenants}\n`;
        csvContent += `Churn Rate,${metrics.churn_rate.toFixed(1)}%\n`;
        csvContent += `Growth Rate,${metrics.growth_rate}%\n\n`;
        
        // Revenue por plan
        csvContent += 'Revenue por Plan\n';
        csvContent += 'Plan,Revenue,Tenants,Promedio por Tenant\n';
        metrics.revenue_by_plan.forEach(plan => {
            const avg = this.getAverageRevenue(plan);
            csvContent += `${plan.plan_name},"$${plan.revenue.toLocaleString()}",${plan.tenant_count},"$${avg.toLocaleString()}"\n`;
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
            <div class="metric-value">$${metrics.mrr.toLocaleString()}</div>
            <div class="metric-label">MRR</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">$${arr.toLocaleString()}</div>
            <div class="metric-label">ARR</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${metrics.active_tenants}</div>
            <div class="metric-label">Tenants Activos</div>
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
                <td>$${plan.revenue.toLocaleString()}</td>
                <td>${plan.tenant_count}</td>
                <td>$${this.getAverageRevenue(plan).toLocaleString()}</td>
            </tr>`
        ).join('');
        
        return `<div class="section-title">Revenue por Plan</div>
        <table>
            <thead>
                <tr><th>Plan</th><th>Revenue</th><th>Tenants</th><th>Promedio</th></tr>
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
        console.warn('[AdminReports Error]', errorInfo);
    }
}
