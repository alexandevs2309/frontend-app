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
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';
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
        <p class="text-gray-600 dark:text-gray-300 mt-1">Visualiza el rendimiento de tu negocio</p>
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


</div>

    `
})
export class ClientReports implements OnInit {
    private dashboardService = inject(DashboardService);
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
            label: 'Ingresos Febrero',
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

    cargarDatos() {
        console.log('🔍 Iniciando carga de datos de reportes...');
        this.dashboardService.getDashboardStats().subscribe({
            next: (stats: any) => {
                console.log('📊 Reports Stats RAW:', JSON.stringify(stats, null, 2));
                
                const monthlyRevenue = stats.monthly_revenue || [];
                const currentMonthRevenue = monthlyRevenue.length > 0 ? 
                    monthlyRevenue[monthlyRevenue.length - 1].revenue : 0;
                
                // Calcular totales desde monthly_revenue ya que el backend no los calcula bien
                const totalRevenue = monthlyRevenue.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0);
                const activeMonths = monthlyRevenue.filter((item: any) => item.revenue > 0).length;
                const averageRevenue = activeMonths > 0 ? totalRevenue / activeMonths : 0;
                
                console.log('📆 Ingresos mes actual:', currentMonthRevenue);
                console.log('💰 Total 6 meses:', totalRevenue);
                console.log('📊 Promedio mensual:', averageRevenue);
                
                this.kpiCards[0].value = this.formatearMoneda(currentMonthRevenue);
                this.kpiCards[1].value = this.formatearMoneda(totalRevenue);
                this.kpiCards[2].value = this.formatearMoneda(averageRevenue);
                this.kpiCards[3].value = activeMonths.toString();
                
                console.log('✅ KPI Cards actualizados:', this.kpiCards);

                if (stats.monthly_revenue?.length > 0) {
                    this.actualizarGraficoIngresos(stats.monthly_revenue);
                }
            },
            error: (error) => {
                console.error('❌ Error cargando reportes:', error);
                if (!environment.production) {
                    console.error('Error completo:', error);
                }
            }
        });
    }

    actualizarGraficoIngresos(monthlyRevenue: any[]) {
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

