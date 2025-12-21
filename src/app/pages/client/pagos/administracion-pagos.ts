import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PagosService } from './services/pagos.service';

@Component({
  selector: 'app-administracion-pagos',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TableModule, ChartModule, ToastModule, TagModule],
  providers: [MessageService],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">🏦 Administración de Pagos</h1>
          <p class="text-gray-600">Panel general de pagos y conciliación</p>
        </div>
        <div class="flex gap-2">
          <button pButton label="Préstamos" icon="pi pi-money-bill" 
                  class="p-button-warning" (click)="irAPrestamos()"></button>
          <button pButton label="Reportes" icon="pi pi-chart-bar" 
                  class="p-button-info" (click)="irAReportes()"></button>
        </div>
      </div>

      <!-- Métricas principales -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <p-card>
          <div class="text-center">
            <div class="text-3xl font-bold text-orange-600">{{ metricas().pendientes }}</div>
            <div class="text-sm text-gray-600">Obligaciones por Comisiones</div>
            <div class="text-xs text-gray-500 mt-1">Dinero que se debe a empleados por comisiones generadas</div>
            <div class="text-xs text-orange-600 mt-1">{{ formatearMoneda(metricas().montoPendiente) }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ metricas().pagadosHoy }}</div>
            <div class="text-sm text-gray-600">Pagados Hoy</div>
            <div class="text-xs text-green-600 mt-1">{{ formatearMoneda(metricas().montoPagadoHoy) }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ metricas().totalMes }}</div>
            <div class="text-sm text-gray-600">Total del Mes</div>
            <div class="text-xs text-blue-600 mt-1">{{ formatearMoneda(metricas().montoTotalMes) }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">{{ metricas().empleadosActivos }}</div>
            <div class="text-sm text-gray-600">Empleados Activos</div>
            <div class="text-xs text-purple-600 mt-1">{{ formatearMoneda(metricas().promedioSalario) }} promedio</div>
          </div>
        </p-card>
      </div>

      <!-- Gráficos y análisis -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <p-card header="Pagos por Método">
          <p-chart type="doughnut" [data]="chartPagosPorMetodo" [options]="chartOptions"></p-chart>
        </p-card>
        <p-card header="Tendencia de Pagos (Últimos 6 meses)">
          <p-chart type="line" [data]="chartTendenciaPagos" [options]="chartOptions"></p-chart>
        </p-card>
      </div>

      <!-- Acciones rápidas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <p-card>
          <div class="text-center p-4">
            <i class="pi pi-users text-4xl text-blue-500 mb-3"></i>
            <h3 class="font-medium mb-2">Gestionar Empleados</h3>
            <p class="text-sm text-gray-600 mb-4">Procesar pagos pendientes de empleados</p>
            <button pButton label="Ir a Pagos" class="w-full" (click)="irAPagosEmpleados()"></button>
          </div>
        </p-card>
        <p-card>
          <div class="text-center p-4">
            <i class="pi pi-history text-4xl text-green-500 mb-3"></i>
            <h3 class="font-medium mb-2">Ver Historial</h3>
            <p class="text-sm text-gray-600 mb-4">Consultar todos los pagos realizados</p>
            <button pButton label="Ver Historial" class="w-full" (click)="irAHistorial()"></button>
          </div>
        </p-card>
        <p-card>
          <div class="text-center p-4">
            <i class="pi pi-cog text-4xl text-purple-500 mb-3"></i>
            <h3 class="font-medium mb-2">Configurar</h3>
            <p class="text-sm text-gray-600 mb-4">Ajustar tipos de pago y comisiones</p>
            <button pButton label="Configurar" class="w-full" (click)="irAConfiguracion()"></button>
          </div>
        </p-card>
      </div>



      <p-toast></p-toast>
    </div>
  `
})
export class AdministracionPagos implements OnInit {
  private pagosService = inject(PagosService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  metricas = signal({
    pendientes: 0,
    montoPendiente: 0,
    pagadosHoy: 0,
    montoPagadoHoy: 0,
    totalMes: 0,
    montoTotalMes: 0,
    empleadosActivos: 0,
    promedioSalario: 0
  });


  cargando = signal(false);

  chartPagosPorMetodo: any = {
    labels: ['Efectivo', 'Transferencia', 'Cheque', 'Otro'],
    datasets: [{
      data: [45, 30, 15, 10],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
    }]
  };

  chartTendenciaPagos: any = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Pagos Realizados',
      data: [65, 59, 80, 81, 56, 55],
      borderColor: '#36A2EB',
      backgroundColor: 'rgba(54, 162, 235, 0.1)'
    }]
  };

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando.set(true);
    
    // Calcular quincena actual para obtener datos relevantes
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = hoy.getMonth() + 1;
    const day = hoy.getDate();
    const quincenaEnMes = day <= 15 ? 1 : 2;
    const fortnight = (month - 1) * 2 + quincenaEnMes;
    
    this.pagosService.obtenerHistorialPagos({ year, fortnight }).subscribe({
      next: (response) => {

        this.procesarMetricas(response);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error cargando datos:', error);
        // Mostrar datos vacíos en lugar de error
        this.procesarDatosVacios();
        this.cargando.set(false);
      }
    });
  }

  private procesarDatosVacios() {
    this.metricas.set({
      pendientes: 0,
      montoPendiente: 0,
      pagadosHoy: 0,
      montoPagadoHoy: 0,
      totalMes: 0,
      montoTotalMes: 0,
      empleadosActivos: 0,
      promedioSalario: 0
    });

  }

  procesarMetricas(data: any) {
    const empleados = data?.employees || [];
    const empleadosArray = Array.isArray(empleados) ? empleados : [];
    const pendingSummary = data?.pending_summary || {};
    
    // Calcular empleados pagados hoy
    const hoy = new Date().toDateString();
    const pagadosHoy = empleadosArray.filter((e: any) => {
      if (!e.paid_at) return false;
      return new Date(e.paid_at).toDateString() === hoy;
    });
    
    // Calcular totales
    const empleadosPagados = empleadosArray.filter((e: any) => e.payment_status === 'paid');
    const montoTotalPagado = empleadosPagados.reduce((sum: number, e: any) => sum + (e.total_earned || 0), 0);
    
    this.metricas.set({
      pendientes: pendingSummary.total_employees || 0,
      montoPendiente: pendingSummary.total_amount || 0,
      pagadosHoy: pagadosHoy.length,
      montoPagadoHoy: pagadosHoy.reduce((sum: number, e: any) => sum + (e.total_earned || 0), 0),
      totalMes: empleadosPagados.length,
      montoTotalMes: montoTotalPagado,
      empleadosActivos: empleadosArray.length,
      promedioSalario: empleadosArray.length > 0 ? montoTotalPagado / empleadosArray.length : 0
    });
  }



  irAPagosEmpleados() {
    this.router.navigate(['/client/pagos/empleados']);
  }

  irAHistorial() {
    this.router.navigate(['/client/pagos/historial']);
  }

  irAConfiguracion() {
    this.router.navigate(['/client/pagos/configuracion']);
  }

  irAPrestamos() {
    this.router.navigate(['/client/pagos/prestamos']);
  }

  irAReportes() {
    this.router.navigate(['/client/pagos/reportes']);
  }



  formatearMoneda(valor: number): string {
    return `$${valor?.toFixed(2) || '0.00'}`;
  }
}