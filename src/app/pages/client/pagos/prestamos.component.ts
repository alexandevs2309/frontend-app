import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { Phase2Service } from './services/phase2.service';
import { PagosService } from './services/pagos.service';

@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, TableModule, DialogModule,
    InputTextModule,SelectModule, TextareaModule, ToastModule, TagModule, TooltipModule
  ],
  providers: [MessageService],
  template: `
    <div class="p-6">
      <!-- Bloque informativo -->
      <div class="bg-blue-50 p-4 rounded mb-6 border border-blue-200">
        <h4 class="text-sm font-medium text-blue-800 mb-2">💰 ¿Cuándo se descuentan los préstamos?</h4>
        <p class="text-sm text-blue-700 mb-2">
          Los préstamos se descuentan automáticamente al momento del pago.
        </p>
        <p class="text-xs text-blue-600">
          ⚠️ Importante: El balance mostrado NO incluye descuentos de préstamos hasta que se procese un retiro.
        </p>
      </div>
      
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Préstamos y Anticipos</h1>
        <div class="flex gap-2">
          <button pButton label="Nuevo Préstamo" icon="pi pi-plus"
                  class="p-button-success" (click)="mostrarDialogoNuevo = true"></button>
          <button pButton label="Volver" icon="pi pi-arrow-left"
                  class="p-button-outlined" (click)="volver()"></button>
        </div>
      </div>

      <!-- Tabla de préstamos -->
      <p-table [value]="prestamos()" [loading]="cargando()"
               [paginator]="true" [rows]="10" [showCurrentPageReport]="true"
               currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} préstamos">

        <ng-template pTemplate="header">
          <tr>
            <th>Empleado</th>
            <th>Tipo</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Cuotas</th>
            <th>Pago Mensual</th>
            <th>Saldo</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-prestamo>
          <tr>
            <td>{{ prestamo.employee_name }}</td>
            <td>{{ prestamo.loan_type }}</td>
            <td>{{ formatearMoneda(prestamo.amount) }}</td>
            <td>
              <p-tag [value]="prestamo.status"
                     [severity]="getStatusSeverity(prestamo.status)"></p-tag>
            </td>
            <td>{{ prestamo.installments }}</td>
            <td>{{ formatearMoneda(prestamo.monthly_payment) }}</td>
            <td>{{ formatearMoneda(prestamo.remaining_balance) }}</td>
            <td>{{ prestamo.request_date | date:'dd/MM/yyyy' }}</td>
            <td>
              <div class="flex gap-1">
                <button *ngIf="prestamo.status === 'Activo'"
                        pButton icon="pi pi-times"
                        class="p-button-warning p-button-sm"
                        (click)="solicitarCancelacion(prestamo)"
                        pTooltip="Solicitar Cancelación"></button>
                        
                <button *ngIf="prestamo.status === 'Cancelación Pendiente'"
                        pButton icon="pi pi-check"
                        class="p-button-success p-button-sm"
                        (click)="aprobarCancelacion(prestamo.id)"
                        pTooltip="Aprobar"></button>
                        
                <button *ngIf="prestamo.status === 'Cancelación Pendiente'"
                        pButton icon="pi pi-times"
                        class="p-button-danger p-button-sm"
                        (click)="rechazarCancelacion(prestamo.id)"
                        pTooltip="Rechazar"></button>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="9" class="text-center py-4">No hay préstamos registrados</td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Diálogo nuevo préstamo -->
      <p-dialog header="Nuevo Préstamo" [(visible)]="mostrarDialogoNuevo"
                [modal]="true" [style]="{width: '500px'}">

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Empleado</label>
            <p-select [options]="empleados()" [(ngModel)]="nuevoPrestamo.employee_id"
                        optionLabel="label" optionValue="value"
                        placeholder="Seleccionar empleado" class="w-full"></p-select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Tipo de Préstamo</label>
            <p-select [options]="tiposPrestamo" [(ngModel)]="nuevoPrestamo.loan_type"
                        optionLabel="label" optionValue="value"
                        placeholder="Seleccionar tipo" class="w-full"></p-select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Monto (RD$)</label>
            <input type="number" pInputText [(ngModel)]="nuevoPrestamo.amount"
                   class="w-full" placeholder="5000" min="100" max="100000" step="100">
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Número de Cuotas</label>
            <input type="number" pInputText [(ngModel)]="nuevoPrestamo.installments"
                   class="w-full" placeholder="6" min="1" max="24" step="1">
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Motivo</label>
            <textarea pInputTextarea [(ngModel)]="nuevoPrestamo.reason"
                      class="w-full" rows="3" placeholder="Descripción del préstamo" maxlength="500"></textarea>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <button pButton label="Cancelar" class="p-button-outlined"
                  (click)="cerrarDialogoNuevo()"></button>
          <button pButton label="Crear Solicitud" class="p-button-success"
                  [loading]="guardando()" (click)="crearPrestamo()"></button>
        </ng-template>
      </p-dialog>

      <!-- Diálogo solicitar cancelación -->
      <p-dialog header="Solicitar Cancelación" [(visible)]="mostrarDialogoCancelacion"
                [modal]="true" [style]="{width: '400px'}">
        <div class="space-y-4">
          <p>Empleado: <strong>{{ prestamoSeleccionado?.employee_name }}</strong></p>
          <p>Monto: <strong>{{ formatearMoneda(prestamoSeleccionado?.amount) }}</strong></p>
          
          <div>
            <label class="block text-sm font-medium mb-2">Motivo de cancelación</label>
            <textarea pInputTextarea [(ngModel)]="motivoCancelacion"
                      class="w-full" rows="3" placeholder="Explique por qué desea cancelar este préstamo" maxlength="500"></textarea>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <button pButton label="Cancelar" class="p-button-outlined"
                  (click)="cerrarDialogoCancelacion()"></button>
          <button pButton label="Solicitar Cancelación" class="p-button-warning"
                  [loading]="guardando()" (click)="confirmarSolicitudCancelacion()"></button>
        </ng-template>
      </p-dialog>

      <p-toast></p-toast>
    </div>
  `
})
export class PrestamosComponent implements OnInit {
  private phase2Service = inject(Phase2Service);
  private pagosService2 = inject(PagosService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  prestamos = signal<any[]>([]);
  empleados = signal<any[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  mostrarDialogoNuevo = false;
  mostrarDialogoCancelacion = false;
  prestamoSeleccionado: any = null;
  motivoCancelacion = '';

  nuevoPrestamo = {
    employee_id: null,
    loan_type: '',
    amount: 0,
    installments: 1,
    reason: ''
  };

  tiposPrestamo = [
    { label: 'Anticipo de Sueldo', value: 'advance' },
    { label: 'Préstamo Personal', value: 'personal_loan' },
    { label: 'Préstamo de Emergencia', value: 'emergency' }
  ];

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargarPrestamos();
    this.cargarEmpleados();
  }

  cargarPrestamos() {
    this.cargando.set(true);
    this.phase2Service.getLoans().subscribe({
      next: (response) => {
        this.prestamos.set(response.loans || []);
        this.cargando.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar préstamos'
        });
        this.cargando.set(false);
      }
    });
  }

  cargarEmpleados() {
    this.pagosService2.obtenerEmpleados().subscribe({
      next: (response) => {
        const empleados = response?.results || response || [];
        const opciones = empleados.map((emp: any) => ({
          label: emp.user?.full_name || emp.full_name || emp.email,
          value: emp.id
        }));
        this.empleados.set(opciones);
      },
      error: () => {
        console.error('Error cargando empleados');
      }
    });
  }

  crearPrestamo() {
    if (!this.validarPrestamo()) return;

    this.guardando.set(true);
    this.phase2Service.createLoan(this.nuevoPrestamo).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Préstamo Creado',
          detail: response.message || 'Solicitud creada correctamente'
        });
        this.cerrarDialogoNuevo();
        this.cargarPrestamos();
        this.guardando.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error || 'Error al crear préstamo'
        });
        this.guardando.set(false);
      }
    });
  }



  private validarPrestamo(): boolean {
    if (!this.nuevoPrestamo.employee_id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Selecciona un empleado'
      });
      return false;
    }

    if (!this.nuevoPrestamo.loan_type) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Selecciona el tipo de préstamo'
      });
      return false;
    }

    if (!this.nuevoPrestamo.amount || this.nuevoPrestamo.amount <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Ingresa un monto válido'
      });
      return false;
    }

    if (this.nuevoPrestamo.amount > 100000) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El monto no puede exceder RD$100,000'
      });
      return false;
    }

    if (this.nuevoPrestamo.installments < 1 || this.nuevoPrestamo.installments > 24) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Las cuotas deben estar entre 1 y 24'
      });
      return false;
    }

    return true;
  }

  cerrarDialogoNuevo() {
    this.mostrarDialogoNuevo = false;
    this.nuevoPrestamo = {
      employee_id: null,
      loan_type: '',
      amount: 0,
      installments: 1,
      reason: ''
    };
  }

  solicitarCancelacion(prestamo: any) {
    this.prestamoSeleccionado = prestamo;
    this.motivoCancelacion = '';
    this.mostrarDialogoCancelacion = true;
  }

  confirmarSolicitudCancelacion() {
    if (!this.motivoCancelacion.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debe especificar el motivo de cancelación'
      });
      return;
    }

    this.guardando.set(true);
    this.phase2Service.requestCancellation(this.prestamoSeleccionado.id, this.motivoCancelacion).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Solicitud Enviada',
          detail: response.message
        });
        this.cerrarDialogoCancelacion();
        this.cargarPrestamos();
        this.guardando.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error || 'Error al solicitar cancelación'
        });
        this.guardando.set(false);
      }
    });
  }

  aprobarCancelacion(prestamoId: number) {
    if (!confirm('¿Está seguro de aprobar esta cancelación? Esta acción no se puede deshacer.')) {
      return;
    }
    
    this.phase2Service.approveCancellation(prestamoId).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Cancelación Aprobada',
          detail: response.message
        });
        this.cargarPrestamos();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error || 'Error al aprobar cancelación'
        });
      }
    });
  }

  rechazarCancelacion(prestamoId: number) {
    if (!confirm('¿Está seguro de rechazar esta cancelación?')) {
      return;
    }
    
    this.phase2Service.rejectCancellation(prestamoId).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelación Rechazada',
          detail: response.message
        });
        this.cargarPrestamos();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error || 'Error al rechazar cancelación'
        });
      }
    });
  }

  cerrarDialogoCancelacion() {
    this.mostrarDialogoCancelacion = false;
    this.prestamoSeleccionado = null;
    this.motivoCancelacion = '';
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (status) {
      case 'Aprobado': return 'success';
      case 'Activo': return 'info';
      case 'Cancelación Pendiente': return 'warn';
      case 'Completado': return 'success';
      case 'Cancelado': return 'danger';
      default: return 'info';
    }
  }

  formatearMoneda(valor: any): string {
    const num = parseFloat(valor) || 0;
    return `$${num.toFixed(2)}`;
  }

  volver() {
    this.router.navigate(['/client/pagos']);
  }
}
