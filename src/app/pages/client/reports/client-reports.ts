import { Component, OnInit, inject, signal } from '@angular/core';
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
import { ReportService } from '../../../core/services/report/report.service';
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
        ProgressBarModule
    ],
    template: `

<div class="p-6 space-y-10 transition-colors">
  <!-- Header + Filtros -->
  <div class="rounded-2xl p-6 shadow-sm transition-colors bg-white dark:bg-gray-800">
    <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
      <div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Reportes y Análisis</h3>
        <p class="text-gray-600 dark:text-gray-300 mt-1">Dashboard con datos reales de tu barbería</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Filtros -->
        <form [formGroup]="filtrosForm" class="flex gap-3">
          <p-datePicker formControlName="fechaInicio" placeholder="Fecha inicio" [showIcon]="true" dateFormat="dd/mm/yy" class="w-40"></p-datePicker>
          <p-datePicker formControlName="fechaFin" placeholder="Fecha fin" [showIcon]="true" dateFormat="dd/mm/yy" class="w-40"></p-datePicker>
          <button pButton label="Filtrar" icon="pi pi-filter" (click)="aplicarFiltros()" class="p-button-primary"></button>
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
    <h5 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Ingresos por Día (Últimos 7 días)</h5>
    <div class="h-72">
      <p-chart type="line" [data]="chartIngresos" [options]="chartOptions"></p-chart>
    </div>
  </div>

  <!-- Mensaje de Saneamiento -->
  <div class="rounded-2xl p-6 shadow-sm bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
    <div class="flex items-center gap-3">
      <i class="pi pi-info-circle text-blue-600 dark:text-blue-400 text-xl"></i>
      <div>
        <h6 class="font-semibold text-blue-900 dark:text-blue-100">Reportes Saneados</h6>
        <p class="text-blue-700 dark:text-blue-200 text-sm mt-1">
          Este dashboard ahora muestra únicamente datos reales de tu base de datos. 
          Se han eliminado todas las simulaciones y estimaciones para garantizar la veracidad de la información.
        </p>
      </div>
    </div>
  </div>
</div>

    `
})
export class ClientReports implements OnInit {
    private reportService = inject(ReportService);
    private fb = inject(FormBuilder);

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
            color: 'text-blue-600',
            trendIcon: '',
            trendColor: '',
            trendText: 'Datos reales'
        },
        {
            label: 'Citas del Mes', 
            value: '0',
            color: 'text-orange-600',
            trendIcon: '',
            trendColor: '',
            trendText: 'Datos reales'
        },
        {
            label: 'Clientes Activos',
            value: '0',
            color: 'text-green-600',
            trendIcon: '',
            trendColor: '',
            trendText: 'Datos reales'
        },
        {
            label: 'Empleados Activos',
            value: '0',
            color: 'text-purple-600',
            trendIcon: '',
            trendColor: '',
            trendText: 'Datos reales'
        }
    ];

    filtrosForm: FormGroup = this.fb.group({
        fechaInicio: [new Date(new Date().getFullYear(), new Date().getMonth(), 1)],
        fechaFin: [new Date()]
    });

    chartIngresos: any;
    chartOptions: any;

    ngOnInit() {
        this.initCharts();
        this.cargarDatos();
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

    async cargarDatos() {
        try {
            // Cargar estadísticas del dashboard - SOLO DATOS REALES
            const stats = await this.reportService.getDashboardStats('month').toPromise();
            
            // Actualizar KPIs con datos reales
            this.kpis.set({
                ingresos: stats.monthly_revenue || 0,
                citas: stats.monthly_appointments || 0,
                clientesNuevos: 0, // No disponible - no simular
                ticketPromedio: stats.monthly_revenue && stats.monthly_appointments ?
                    stats.monthly_revenue / stats.monthly_appointments : 0
            });

            // Actualizar KPI Cards con valores reales
            this.kpiCards[0].value = this.formatearMoneda(stats.monthly_revenue || 0);
            this.kpiCards[1].value = (stats.monthly_appointments || 0).toString();
            this.kpiCards[2].value = (stats.total_clients || 0).toString();
            this.kpiCards[3].value = (stats.active_employees || 0).toString();

            // Cargar reporte de ventas para gráfico
            const salesReport = await this.reportService.getSalesReport().toPromise();
            if (salesReport.sales_by_day?.length > 0) {
                this.actualizarGraficoIngresos(salesReport.sales_by_day);
            }

        } catch (error) {
            if (!environment.production) {
                console.error('Error cargando reportes:', error);
            }
        }
    }

    actualizarGraficoIngresos(salesByDay: any[]) {
        const labels = salesByDay.map(day => {
            const date = new Date(day.date);
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        });
        const data = salesByDay.map(day => day.sales);

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

    aplicarFiltros() {
        const filtros = this.filtrosForm.value;
        this.cargarDatos();
    }

    formatearMoneda(valor: number): string {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(valor);
    }
}

