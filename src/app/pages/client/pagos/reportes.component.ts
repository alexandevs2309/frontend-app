import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Phase2Service } from './services/phase2.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, CardModule, SelectModule,
    DatePickerModule, TableModule, ChartModule, ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Reportes de Nómina</h1>
        <button pButton label="Volver" icon="pi pi-arrow-left"
                class="p-button-outlined" (click)="volver()"></button>
      </div>

      <!-- Filtros -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium mb-2">Año</label>
          <p-select [options]="anios" [(ngModel)]="filtros.year"
                      placeholder="Seleccionar año" class="w-full"></p-select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Mes</label>
          <p-select [options]="meses" [(ngModel)]="filtros.month"
                      optionLabel="label" optionValue="value"
                      placeholder="Seleccionar mes" class="w-full"></p-select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Tipo de Reporte</label>
          <p-select [options]="tiposReporte" [(ngModel)]="tipoSeleccionado"
                      optionLabel="label" optionValue="value"
                      placeholder="Seleccionar tipo" class="w-full"></p-select>
        </div>
        <div class="flex items-end">
          <button pButton label="Generar" icon="pi pi-chart-bar"
                  class="p-button-success w-full"
                  [loading]="cargando()" (click)="generarReporte()"></button>
        </div>
      </div>

      <!-- Resumen Mensual -->
      <div *ngIf="tipoSeleccionado === 'monthly'" class="space-y-6">
        <p-card header="Resumen Mensual de Nómina">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ resumenMensual?.total_employees || 0 }}</div>
              <div class="text-sm text-gray-600">Empleados</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ formatearMoneda(resumenMensual?.gross_total) }}</div>
              <div class="text-sm text-gray-600">Total Bruto</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ formatearMoneda(resumenMensual?.deductions_total) }}</div>
              <div class="text-sm text-gray-600">Deducciones</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ formatearMoneda(resumenMensual?.net_total) }}</div>
              <div class="text-sm text-gray-600">Total Neto</div>
            </div>
          </div>
        </p-card>

        <p-card header="Distribución por Tipo de Empleado">
          <p-chart type="doughnut" [data]="chartData" [options]="chartOptions"></p-chart>
        </p-card>
      </div>

      <!-- Reporte Fiscal -->
      <div *ngIf="tipoSeleccionado === 'tax'" class="space-y-6">
        <p-card header="Cumplimiento Fiscal">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ formatearMoneda(reporteFiscal?.afp_total) }}</div>
              <div class="text-sm text-gray-600">AFP Total</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ formatearMoneda(reporteFiscal?.sfs_total) }}</div>
              <div class="text-sm text-gray-600">SFS Total</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ formatearMoneda(reporteFiscal?.isr_total) }}</div>
              <div class="text-sm text-gray-600">ISR Total</div>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded">
            <h4 class="font-semibold mb-2">Contribuciones Patronales</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span class="text-sm text-gray-600">AFP Empleador:</span>
                <span class="font-semibold ml-2">{{ formatearMoneda(reporteFiscal?.employer_contributions?.afp_employer) }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-600">SFS Empleador:</span>
                <span class="font-semibold ml-2">{{ formatearMoneda(reporteFiscal?.employer_contributions?.sfs_employer) }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-600">SRL:</span>
                <span class="font-semibold ml-2">{{ formatearMoneda(reporteFiscal?.employer_contributions?.srl_employer) }}</span>
              </div>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Reporte de Préstamos -->
      <div *ngIf="tipoSeleccionado === 'loans'" class="space-y-6">
        <p-card header="Resumen de Préstamos">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ reportePrestamos?.total_loans || 0 }}</div>
              <div class="text-sm text-gray-600">Total Préstamos</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ formatearMoneda(reportePrestamos?.total_amount) }}</div>
              <div class="text-sm text-gray-600">Monto Total</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ formatearMoneda(reportePrestamos?.total_outstanding) }}</div>
              <div class="text-sm text-gray-600">Saldo Pendiente</div>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Acciones de Exportación -->
      <div *ngIf="tipoSeleccionado" class="mt-6">
        <p-card header="Exportar Datos">
          <div class="flex gap-2">
            <button pButton label="Exportar PDF" icon="pi pi-file-pdf"
                    class="p-button-danger" (click)="exportarPDF()"></button>
            <button pButton label="Exportar Excel" icon="pi pi-file-excel"
                    class="p-button-success" (click)="exportarExcel()"></button>
            <button *ngIf="tipoSeleccionado === 'tax'"
                    pButton label="Generar Contribuciones" icon="pi pi-cog"
                    class="p-button-info" (click)="generarContribuciones()"></button>
          </div>
        </p-card>
      </div>

      <p-toast></p-toast>
    </div>
  `
})
export class ReportesComponent implements OnInit {
  private phase2Service = inject(Phase2Service);
  private messageService = inject(MessageService);
  private router = inject(Router);

  cargando = signal(false);
  tipoSeleccionado = '';

  filtros = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  };

  resumenMensual: any = null;
  reporteFiscal: any = null;
  reportePrestamos: any = null;

  chartData: any = {};
  chartOptions: any = {};

  anios = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);

  meses = [
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 }
  ];

  tiposReporte = [
    { label: 'Resumen Mensual', value: 'monthly' },
    { label: 'Cumplimiento Fiscal', value: 'tax' },
    { label: 'Préstamos y Anticipos', value: 'loans' }
  ];

  ngOnInit() {
    this.configurarGraficos();
  }

  generarReporte() {
    if (!this.tipoSeleccionado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Selecciona un tipo de reporte'
      });
      return;
    }

    this.cargando.set(true);

    switch (this.tipoSeleccionado) {
      case 'monthly':
        this.generarResumenMensual();
        break;
      case 'tax':
        this.generarReporteFiscal();
        break;
      case 'loans':
        this.generarReportePrestamos();
        break;
    }
  }

  generarResumenMensual() {
    this.phase2Service.getMonthlyReport(this.filtros.year, this.filtros.month).subscribe({
      next: (response) => {
        this.resumenMensual = response;
        this.actualizarGrafico();
        this.cargando.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al generar reporte mensual'
        });
        this.cargando.set(false);
      }
    });
  }

  generarReporteFiscal() {
    this.phase2Service.getTaxComplianceReport(this.filtros.year, this.filtros.month).subscribe({
      next: (response) => {
        this.reporteFiscal = response;
        this.cargando.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al generar reporte fiscal'
        });
        this.cargando.set(false);
      }
    });
  }

  generarReportePrestamos() {
    this.phase2Service.getLoansReport().subscribe({
      next: (response) => {
        this.reportePrestamos = response;
        this.cargando.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al generar reporte de préstamos'
        });
        this.cargando.set(false);
      }
    });
  }

  generarContribuciones() {
    this.phase2Service.generateEmployerContributions(this.filtros.year, this.filtros.month).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Contribuciones Generadas',
          detail: response.message || 'Contribuciones patronales generadas'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al generar contribuciones'
        });
      }
    });
  }

  private configurarGraficos() {
    this.chartOptions = {
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }

  private actualizarGrafico() {
    if (!this.resumenMensual?.by_type) return;

    const tipos = this.resumenMensual.by_type;
    this.chartData = {
      labels: ['Sueldo Fijo', 'Comisión', 'Mixto'],
      datasets: [{
        data: [
          tipos.fixed?.total || 0,
          tipos.commission?.total || 0,
          tipos.mixed?.total || 0
        ],
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']
      }]
    };
  }

  exportarPDF() {
    this.messageService.add({
      severity: 'info',
      summary: 'Exportación',
      detail: 'Funcionalidad de PDF en desarrollo'
    });
  }

  exportarExcel() {
    this.messageService.add({
      severity: 'info',
      summary: 'Exportación',
      detail: 'Funcionalidad de Excel en desarrollo'
    });
  }

  formatearMoneda(valor: any): string {
    const num = parseFloat(valor) || 0;
    return `$${num.toFixed(2)}`;
  }

  volver() {
    this.router.navigate(['/client/pagos']);
  }
}
