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
        <p class="text-gray-600 dark:text-gray-300 mt-1">Analiza el rendimiento de tu barbería</p>
      </div>

      <form [formGroup]="filtrosForm"
            class="flex flex-col sm:flex-row flex-wrap gap-3 justify-end w-full lg:w-auto">
        <p-datePicker formControlName="fechaInicio"
                      placeholder="Fecha inicio"
                      [showIcon]="true"
                      dateFormat="dd/mm/yy"
                      class="flex-1 sm:w-40 md:w-48"></p-datePicker>

        <p-datePicker formControlName="fechaFin"
                      placeholder="Fecha fin"
                      [showIcon]="true"
                      dateFormat="dd/mm/yy"
                      class="flex-1 sm:w-40 md:w-48"></p-datePicker>

        <button pButton label="Filtrar"
                icon="pi pi-filter"
                (click)="aplicarFiltros()"
                class="p-button-primary w-full sm:w-auto"></button>
      </form>
    </div>
  </div>

  <!-- KPIs -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <div *ngFor="let card of kpiCards" class="rounded-2xl p-6 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md bg-white dark:bg-gray-800">
      <div class="text-gray-700 dark:text-gray-300 font-medium text-lg mb-2">{{ card.label }}</div>
      <div [ngClass]="card.color" class="font-bold text-3xl mb-2">{{ card.value }}</div>
      <div [ngClass]="card.trendColor" class="text-sm font-medium flex justify-center items-center gap-2">
        <i [class]="card.trendIcon"></i>
        <span class="dark:text-gray-300">{{ card.trendText }}</span>
      </div>
    </div>
  </div>

  <!-- Gráficos -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 rounded-2xl p-6 shadow-sm bg-white dark:bg-gray-800 transition-colors">
      <h5 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Ingresos por Día</h5>
      <div class="h-72">
        <p-chart type="line" [data]="chartIngresos" [options]="chartOptions"></p-chart>
      </div>
    </div>

    <div class="rounded-2xl p-6 shadow-sm bg-white dark:bg-gray-800 transition-colors">
      <h5 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Servicios Más Populares</h5>
      <div class="h-72">
        <p-chart type="doughnut" [data]="chartServicios" [options]="doughnutOptions"></p-chart>
      </div>
    </div>
  </div>

  <!-- Sección de Análisis -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Empleados Top -->
    <div class="rounded-2xl p-6 shadow-sm bg-white dark:bg-gray-800 transition-colors">
      <h5 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Empleados Top del Mes</h5>
      <p-table [value]="empleadosTop()" responsiveLayout="scroll" class="w-full">
        <ng-template pTemplate="header">
          <tr>
            <th>Empleado</th>
            <th>Citas</th>
            <th>Ingresos</th>
            <th>Rating</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-empleado>
          <tr>
            <td>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-user text-blue-600 dark:text-blue-300"></i>
                </div>
                <span class="font-medium text-gray-800 dark:text-gray-100">{{ empleado.nombre }}</span>
              </div>
            </td>
            <td class="text-gray-800 dark:text-gray-100">{{ empleado.citas }}</td>
            <td class="font-medium text-gray-800 dark:text-gray-100">\${{ empleado.ingresos | number:'1.2-2' }}</td>
            <td>
              <div class="flex items-center gap-1 text-gray-800 dark:text-gray-100">
                <i class="pi pi-star-fill text-yellow-500"></i>
                <span>{{ empleado.rating }}</span>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Análisis de Clientes -->
    <div class="rounded-2xl p-6 shadow-sm bg-white dark:bg-gray-800 transition-colors">
      <h5 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Análisis de Clientes</h5>
      <div class="space-y-4">
        <div class="flex justify-between items-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10">
          <div>
            <div class="text-blue-900 dark:text-blue-100 font-medium">Clientes Frecuentes</div>
            <div class="text-blue-600 dark:text-blue-200 text-sm">Más de 3 visitas/mes</div>
          </div>
          <div class="text-blue-900 dark:text-blue-100 font-bold text-2xl">{{ analisisClientes().frecuentes }}</div>
        </div>

        <div class="flex justify-between items-center p-4 rounded-lg bg-green-50 dark:bg-green-900/10">
          <div>
            <div class="text-green-900 dark:text-green-100 font-medium">Tasa de Retención</div>
            <div class="text-green-600 dark:text-green-200 text-sm">Clientes que regresan</div>
          </div>
          <div class="text-green-900 dark:text-green-100 font-bold text-2xl">{{ analisisClientes().retencion }}%</div>
        </div>

        <div class="flex justify-between items-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10">
          <div>
            <div class="text-orange-900 dark:text-orange-100 font-medium">Clientes en Riesgo</div>
            <div class="text-orange-600 dark:text-orange-200 text-sm">Sin visitas en 60+ días</div>
          </div>
          <div class="text-orange-900 dark:text-orange-100 font-bold text-2xl">{{ analisisClientes().enRiesgo }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Horarios Pico -->
  <div class="rounded-2xl p-6 shadow-sm bg-white dark:bg-gray-800 transition-colors">
    <h5 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Análisis de Horarios Pico</h5>
    <div class="h-72">
      <p-chart type="bar" [data]="chartHorarios" [options]="barOptions"></p-chart>
    </div>
  </div>
</div>



    `
})
export class ClientReports implements OnInit {
    private reportService = inject(ReportService);
    private fb = inject(FormBuilder);

    kpis = signal({
        ingresos: 15420.50,
        citas: 156,
        clientesNuevos: 23,
        ticketPromedio: 98.85
    });

    empleadosTop = signal([
        { nombre: 'Carlos Martínez', citas: 45, ingresos: 2250.00, rating: 4.8 },
        { nombre: 'Ana García', citas: 38, ingresos: 1900.00, rating: 4.9 },
        { nombre: 'Luis Rodríguez', citas: 32, ingresos: 1600.00, rating: 4.7 },
        { nombre: 'María López', citas: 28, ingresos: 1400.00, rating: 4.6 }
    ]);

    analisisClientes = signal({
        frecuentes: 45,
        retencion: 78,
        enRiesgo: 12
    });

    kpiCards = [
        {
            label: 'Ingresos del Mes',
            value: '\$15,420.50',
            color: 'text-blue-600',
            trendIcon: 'pi pi-arrow-up',
            trendColor: 'text-green-600',
            trendText: '+12% vs mes anterior'
        },
        {
            label: 'Citas del Mes',
            value: '156',
            color: 'text-orange-600',
            trendIcon: 'pi pi-arrow-up',
            trendColor: 'text-green-600',
            trendText: '+8% vs mes anterior'
        },
        {
            label: 'Clientes Nuevos',
            value: '23',
            color: 'text-green-600',
            trendIcon: 'pi pi-arrow-up',
            trendColor: 'text-green-600',
            trendText: '+15% vs mes anterior'
        },
        {
            label: 'Ticket Promedio',
            value: '\$98.85',
            color: 'text-purple-600',
            trendIcon: 'pi pi-arrow-down',
            trendColor: 'text-red-600',
            trendText: '-3% vs mes anterior'
        }
    ];

    filtrosForm: FormGroup = this.fb.group({
        fechaInicio: [new Date(new Date().getFullYear(), new Date().getMonth(), 1)],
        fechaFin: [new Date()]
    });

    chartIngresos: any;
    chartServicios: any;
    chartHorarios: any;
    chartOptions: any;
    doughnutOptions: any;
    barOptions: any;

    ngOnInit() {
        this.initCharts();
        this.cargarDatos();
    }

    initCharts() {
        this.chartIngresos = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
                label: 'Ingresos',
                data: [12000, 13500, 11800, 15200, 14600, 15420],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };

        this.chartServicios = {
            labels: ['Corte Clásico', 'Barba', 'Corte + Barba', 'Afeitado', 'Otros'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
            }]
        };

        this.chartHorarios = {
            labels: ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
            datasets: [{
                label: 'Citas por Hora',
                data: [5, 8, 12, 15, 10, 18, 20, 16, 12, 8],
                backgroundColor: '#3B82F6'
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

        this.doughnutOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        };

        this.barOptions = {
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
            // Cargar estadísticas del dashboard
            const stats = await this.reportService.getDashboardStats('month').toPromise();
            this.kpis.set({
                ingresos: stats.monthly_revenue || 0,
                citas: stats.monthly_appointments || 0,
                clientesNuevos: Math.floor(stats.total_clients * 0.15), // Estimación
                ticketPromedio: stats.monthly_revenue && stats.monthly_appointments ?
                    stats.monthly_revenue / stats.monthly_appointments : 0
            });

            // Cargar reporte de empleados
            const employeeReport = await this.reportService.getEmployeeReport().toPromise();
            if (employeeReport.top_performers?.length > 0) {
                this.empleadosTop.set(
                    employeeReport.top_performers.map((emp: any) => ({
                        nombre: emp.employee_name,
                        citas: emp.appointments,
                        ingresos: emp.sales,
                        rating: 4.5 + Math.random() * 0.5 // Simulado por ahora
                    }))
                );
            }

            // Cargar reporte de ventas para gráficos
            const salesReport = await this.reportService.getSalesReport().toPromise();
            if (salesReport.sales_by_day?.length > 0) {
                this.actualizarGraficoIngresos(salesReport.sales_by_day);
            }

            if (salesReport.top_services?.length > 0) {
                this.actualizarGraficoServicios(salesReport.top_services);
            }

        } catch (error) {
            console.error('Error cargando reportes:', error);
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

    actualizarGraficoServicios(topServices: any[]) {
        const labels = topServices.map(service => service.service__name);
        const data = topServices.map(service => service.total_sold);
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

        this.chartServicios = {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.slice(0, data.length)
            }]
        };
    }

    aplicarFiltros() {
        const filtros = this.filtrosForm.value;
        console.log('Aplicando filtros:', filtros);
        // Implementar filtrado por fechas
        this.cargarDatos();
    }
}
