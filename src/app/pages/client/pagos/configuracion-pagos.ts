import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PagosService, ConfiguracionPago } from './services/pagos.service';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-configuracion-pagos',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TableModule, DialogModule, SelectModule, InputTextModule, ToastModule, TagModule, FormsModule],
  providers: [MessageService],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">⚙️ Configuración de Pagos</h1>
          <p class="text-gray-600">Configura tipos de pago, comisiones y frecuencias</p>
        </div>
        <button pButton label="Volver" icon="pi pi-arrow-left" 
                class="p-button-outlined" (click)="volver()"></button>
      </div>

      <!-- Configuraciones globales -->
      <p-card header="Configuraciones Globales" class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium mb-3">Descuentos Legales (República Dominicana)</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <input type="checkbox" [(ngModel)]="configuracionGlobal.aplicarAFP" class="rounded">
                  <span class="text-sm">AFP (2.87%)</span>
                </div>
                <span class="text-xs text-gray-500">Solo fin de mes</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <input type="checkbox" [(ngModel)]="configuracionGlobal.aplicarSFS" class="rounded">
                  <span class="text-sm">SFS (3.04%)</span>
                </div>
                <span class="text-xs text-gray-500">Solo fin de mes</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <input type="checkbox" [(ngModel)]="configuracionGlobal.aplicarISR" class="rounded">
                  <span class="text-sm">ISR (Según escala)</span>
                </div>
                <span class="text-xs text-gray-500">Solo fin de mes</span>
              </div>
              <div class="bg-yellow-50 p-2 rounded text-xs text-yellow-700">
                ⚠️ Los descuentos legales se aplicarán solo en pagos de fin de mes para evitar descuentos excesivos.
              </div>
            </div>
          </div>
          <div>
            <h4 class="font-medium mb-3">Frecuencias de Pago Disponibles</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Diario:</span>
                <span class="font-medium">Cada día</span>
              </div>
              <div class="flex justify-between">
                <span>Semanal:</span>
                <span class="font-medium">Cada semana</span>
              </div>
              <div class="flex justify-between">
                <span>Quincenal:</span>
                <span class="font-medium">Cada 15 días</span>
              </div>
              <div class="flex justify-between">
                <span>Mensual:</span>
                <span class="font-medium">Cada mes</span>
              </div>
            </div>
          </div>
        </div>
      </p-card>

      <!-- Configuración por empleado -->
      <p-card header="Configuración por Empleado">
        <p-table [value]="empleados()" [loading]="cargando()" responsiveLayout="scroll">
          <ng-template pTemplate="header">
            <tr>
              <th>Empleado</th>
              <th>Tipo de Pago</th>
              <th>Salario/Comisión</th>
              <th>Frecuencia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-empleado>
            <tr>
              <td>
                <div>
                  <div class="font-medium">{{ empleado.user?.full_name }}</div>
                  <div class="text-sm text-gray-500">{{ empleado.user?.email }}</div>
                </div>
              </td>
              <td>
                <p-tag [value]="getTipoLabel(empleado.salary_type)" 
                       [severity]="getTipoSeverity(empleado.salary_type)"></p-tag>
              </td>
              <td>
                <div *ngIf="empleado.salary_type === 'commission'">
                  <span class="font-medium">{{ empleado.commission_percentage }}%</span>
                  <div class="text-xs text-gray-500">de comisión</div>
                </div>
                <div *ngIf="empleado.salary_type === 'fixed'">
                  <span class="font-medium">{{ formatearMoneda(empleado.contractual_monthly_salary || 0) }}</span>
                  <div class="text-xs text-gray-500">mensual</div>
                </div>
                <div *ngIf="empleado.salary_type === 'mixed'">
                  <span class="font-medium">{{ formatearMoneda(empleado.contractual_monthly_salary || 0) }}</span>
                  <div class="text-xs text-gray-500">+ {{ empleado.commission_percentage }}%</div>
                </div>
              </td>
              <td>{{ getFrecuenciaLabel(empleado.payment_frequency) }}</td>
              <td>
                <p-tag [value]="empleado.is_active ? 'Activo' : 'Inactivo'" 
                       [severity]="empleado.is_active ? 'success' : 'danger'"></p-tag>
              </td>
              <td>
                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" 
                        pTooltip="Editar configuración" (click)="editarConfiguracion(empleado)"></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- Diálogo de configuración -->
      <p-dialog [(visible)]="mostrarDialogoConfig" header="Configurar Pago de Empleado" 
                [modal]="true" [style]="{width: '600px'}">
        <div *ngIf="empleadoSeleccionado" class="space-y-4">
          <!-- Info del empleado -->
          <div class="bg-gray-50 p-4 rounded">
            <h4 class="font-medium">{{ empleadoSeleccionado.user?.full_name }}</h4>
            <p class="text-sm text-gray-600">{{ empleadoSeleccionado.user?.email }}</p>
          </div>

          <!-- Descuentos Legales -->
          <div class="bg-yellow-50 p-4 rounded mb-4">
            <h4 class="font-medium mb-3">Descuentos Legales (Solo fin de mes)</h4>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="configuracionGlobal.aplicarAFP" class="rounded">
                <span class="text-sm">AFP (2.87%)</span>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="configuracionGlobal.aplicarSFS" class="rounded">
                <span class="text-sm">SFS (3.04%)</span>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="configuracionGlobal.aplicarISR" class="rounded">
                <span class="text-sm">ISR (Según escala)</span>
              </div>
            </div>
            <p class="text-xs text-yellow-700 mt-2">
              ⚠️ Los descuentos se aplicarán solo en pagos de fin de mes (quincenas pares: 2, 4, 6, etc.)
            </p>
          </div>

          <!-- Configuración -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Tipo de Pago *</label>
              <p-select [(ngModel)]="configuracion.payment_type" [options]="tiposPago" 
                        optionLabel="label" optionValue="value" class="w-full" 
                        placeholder="Seleccionar tipo"></p-select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Frecuencia de Pago</label>
              <p-select [(ngModel)]="configuracion.payment_frequency" [options]="frecuenciasPago" 
                        optionLabel="label" optionValue="value" class="w-full"></p-select>
              <p class="text-xs text-gray-500 mt-1">Actualmente solo se soporta quincenal</p>
            </div>
          </div>

          <div *ngIf="configuracion.payment_type === 'fixed' || configuracion.payment_type === 'mixed'">
            <label class="block text-sm font-medium mb-2">Salario Mensual Contractual (RD$)</label>
            <input type="number" pInputText [(ngModel)]="configuracion.contractual_monthly_salary" 
                   class="w-full" placeholder="30000" min="0">
            <p class="text-xs text-gray-500 mt-1">
              Salario base mensual. El pago por período se calculará automáticamente.
            </p>
          </div>

          <div *ngIf="configuracion.payment_type === 'commission' || configuracion.payment_type === 'mixed'">
            <label class="block text-sm font-medium mb-2">Porcentaje de Comisión (%)</label>
            <input type="number" pInputText [(ngModel)]="configuracion.commission_rate" 
                   class="w-full" placeholder="40" min="0" max="100" step="0.01">
          </div>

          <!-- Cálculo automático -->
          <div *ngIf="configuracion.contractual_monthly_salary && (configuracion.payment_type === 'fixed' || configuracion.payment_type === 'mixed')" 
               class="bg-blue-50 p-3 rounded">
            <p class="text-sm text-blue-700">
              <i class="pi pi-calculator mr-2"></i>
              <strong>Pago por período:</strong> {{ formatearMoneda(calcularPagoPorPeriodo()) }}
              <span class="text-xs"> ({{ getFrecuenciaLabel(configuracion.payment_frequency) }})</span>
            </p>
          </div>


        </div>

        <ng-template pTemplate="footer">
          <button pButton label="Cancelar" class="p-button-outlined" (click)="cerrarDialogoConfig()"></button>
          <button pButton label="Guardar" class="p-button-success" 
                  [loading]="guardando()" (click)="guardarConfiguracion()"></button>
        </ng-template>
      </p-dialog>

      <p-toast></p-toast>
    </div>
  `
})
export class ConfiguracionPagos implements OnInit {
  private pagosService = inject(PagosService);
  private employeeService = inject(EmployeeService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  empleados = signal<any[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  mostrarDialogoConfig = false;
  empleadoSeleccionado: any = null;

  configuracion: ConfiguracionPago = {
    employee_id: 0,
    payment_type: 'commission',
    payment_frequency: 'biweekly'
  };

  configuracionGlobal: any = {};

  tiposPago = [
    { label: 'Sueldo Fijo', value: 'fixed' },
    { label: 'Comisión', value: 'commission' },
    { label: 'Mixto (Sueldo + Comisión)', value: 'mixed' }
  ];

  frecuenciasPago = [
    { label: 'Diario', value: 'daily' },
    { label: 'Semanal', value: 'weekly' },
    { label: 'Quincenal', value: 'biweekly' },
    { label: 'Mensual', value: 'monthly' }
  ];

  ngOnInit() {
    this.cargarEmpleados();
  }

  cargarEmpleados() {
    this.cargando.set(true);
    this.employeeService.getEmployees().subscribe({
      next: (response) => {
        const empleados = response?.results || response || [];
        // Mapear campos del backend a la estructura esperada
        const empleadosMapeados = empleados.map((emp: any) => ({
          ...emp,
          user: emp.user || { full_name: emp.full_name, email: emp.email },
          // Mapear campos de configuración de pago
          salary_type: emp.salary_type || emp.payment_type || 'commission',
          commission_percentage: emp.commission_percentage || emp.commission_rate || 0,
          contractual_monthly_salary: emp.contractual_monthly_salary || emp.salary_amount || 0,
          payment_frequency: emp.payment_frequency || 'biweekly'
        }));
        this.empleados.set(empleadosMapeados);
        this.cargando.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar empleados'
        });
        this.cargando.set(false);
      }
    });
  }

  editarConfiguracion(empleado: any) {
    this.empleadoSeleccionado = empleado;
    this.configuracion = {
      employee_id: empleado.id,
      payment_type: empleado.salary_type || 'commission',
      contractual_monthly_salary: empleado.contractual_monthly_salary || 0,
      commission_rate: empleado.commission_percentage || 0,
      payment_frequency: empleado.payment_frequency || 'biweekly'
    };
    this.configuracionGlobal = {
      aplicarAFP: empleado.apply_afp || false,
      aplicarSFS: empleado.apply_sfs || false,
      aplicarISR: empleado.apply_isr || false
    };
    this.mostrarDialogoConfig = true;
  }

  cerrarDialogoConfig() {
    this.mostrarDialogoConfig = false;
    this.empleadoSeleccionado = null;
  }

  guardarConfiguracion() {
    if (!this.validarConfiguracion()) {
      return;
    }
    
    this.guardando.set(true);
    
    // Usar endpoint específico para configuración de pagos
    const payload = {
      salary_type: this.configuracion.payment_type,
      commission_percentage: this.configuracion.commission_rate || 0,
      contractual_monthly_salary: this.configuracion.contractual_monthly_salary || 0,
      payment_frequency: this.configuracion.payment_frequency,
      apply_afp: this.configuracionGlobal.aplicarAFP || false,
      apply_sfs: this.configuracionGlobal.aplicarSFS || false,
      apply_isr: this.configuracionGlobal.aplicarISR || false
    };
    
    this.pagosService.actualizarConfiguracionPago(this.configuracion.employee_id, payload).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Configuración Guardada',
          detail: response.message || 'Configuración actualizada correctamente'
        });
        this.cerrarDialogoConfig();
        this.cargarEmpleados();
        this.guardando.set(false);
      },
      error: (error) => {
        console.error('Error guardando configuración:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error || 'Error al actualizar configuración'
        });
        this.guardando.set(false);
      }
    });
  }

  private validarConfiguracion(): boolean {
    if (!this.configuracion.payment_type) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Selecciona un tipo de pago'
      });
      return false;
    }
    
    if ((this.configuracion.payment_type === 'fixed' || this.configuracion.payment_type === 'mixed') 
        && !this.configuracion.contractual_monthly_salary) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El salario mensual es requerido para tipo fijo o mixto'
      });
      return false;
    }
    
    if ((this.configuracion.payment_type === 'commission' || this.configuracion.payment_type === 'mixed') 
        && !this.configuracion.commission_rate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El porcentaje de comisión es requerido'
      });
      return false;
    }
    
    return true;
  }

  calcularPagoPorPeriodo(): number {
    if (!this.configuracion.contractual_monthly_salary) return 0;
    
    const monthly = this.configuracion.contractual_monthly_salary;
    switch (this.configuracion.payment_frequency) {
      case 'monthly': return monthly;
      case 'biweekly': return monthly / 2;
      case 'weekly': return monthly / 4.333;
      case 'daily': return monthly / 23.83;
      default: return monthly / 2;
    }
  }

  getTipoLabel(tipo: string): string {
    const labels: any = {
      'fixed': 'Fijo',
      'commission': 'Comisión',
      'mixed': 'Mixto'
    };
    return labels[tipo] || tipo;
  }

  getTipoSeverity(tipo: string): 'success' | 'info' | 'warn' {
    switch (tipo) {
      case 'commission': return 'success';
      case 'fixed': return 'info';
      case 'mixed': return 'warn';
      default: return 'info';
    }
  }

  getFrecuenciaLabel(frecuencia: string): string {
    const labels: any = {
      'daily': 'Diario',
      'weekly': 'Semanal',
      'biweekly': 'Quincenal',
      'monthly': 'Mensual'
    };
    return labels[frecuencia] || frecuencia;
  }

  guardarConfiguracionGlobal() {
    // Aquí se guardaría la configuración global de descuentos
    this.messageService.add({
      severity: 'success',
      summary: 'Configuración Global',
      detail: 'Configuración de descuentos actualizada'
    });
  }

  volver() {
    this.router.navigate(['/client/pagos']);
  }

  irAEmpleados() {
    this.cerrarDialogoConfig();
    this.router.navigate(['/client/employees']);
  }

  formatearMoneda(valor: any): string {
    const num = parseFloat(valor) || 0;
    return `$${num.toFixed(2)}`;
  }
}