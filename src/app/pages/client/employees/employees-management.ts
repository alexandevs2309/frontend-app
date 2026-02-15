import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TabsModule } from 'primeng/tabs';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { EmployeeService, Employee, UpdateEmployeeRequest } from '../../../core/services/employee/employee.service';
import { AuthService, User } from '../../../core/services/auth/auth.service';
import { environment } from '../../../../environments/environment';
import { UserDto, CreateUserDto, UpdateUserDto } from '../../../core/dto/user.dto';
import { EmployeeDto, EmployeeWithUserDto, CreateEmployeeDto, UpdateEmployeeDto } from '../../../core/dto/employee.dto';
import { PayrollConfigDto, PaymentStatsDto, PaymentReceiptDto } from '../../../core/dto/payroll.dto';
import { LoanDto, LoanSummaryDto, CreateLoanDto } from '../../../core/dto/loan.dto';

// Interface temporal para PaymentDto hasta que se agregue al archivo payroll.dto
interface PaymentDto {
  id: number;
  employee_id: number;
  employee_name: string;
  period_display: string;
  gross_amount: number;
  net_amount: number;
  total_deductions: number;
  payment_method: string;
  payment_reference?: string;
  paid_at: string;
}



@Component({
  selector: 'app-employees-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    CheckboxModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    SkeletonModule,
    TabsModule,
    InputNumberModule,
    SelectModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <!-- Hero Header -->
      <div class="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white p-6 rounded-2xl mb-6 shadow-2xl">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div class="relative flex justify-between items-center">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-white/20 backdrop-blur-sm rounded-xl animate-pulse">
              <i class="pi pi-briefcase text-4xl"></i>
            </div>
            <div>
              <h2 class="text-3xl font-bold drop-shadow-lg">Gestión de Empleados</h2>
              <p class="text-orange-100 mt-1">Administra tu equipo de trabajo</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button pButton icon="pi pi-refresh" (click)="cargarDatos()"
                    [loading]="cargando()" class="bg-white/20 hover:bg-white/30 border-0 text-white"></button>
            <button pButton label="Nuevo Empleado" icon="pi pi-plus" (click)="abrirDialogo()"
                    class="bg-white text-orange-600 hover:bg-orange-50 border-0 shadow-lg transform hover:scale-105 transition-all"></button>
          </div>
        </div>
      </div>

      <p-table [value]="empleados()" [loading]="cargando()"
               [globalFilterFields]="['user.full_name', 'user.email', 'specialty']"
               #dt>
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">
              Total: {{empleados().length}} empleados
            </span>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input pInputText type="text" placeholder="Buscar empleados..."
                     (input)="dt.filterGlobal($any($event.target).value, 'contains')">
            </span>
          </div>
        </ng-template>

        <ng-template pTemplate="header">
          <tr>
            <th>Empleado</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Especialidad</th>
            <th>Teléfono</th>
            <th>Fecha Contrato</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-emp>
          <tr>
            <td>{{emp.user.full_name}}</td>
            <td>{{emp.user.email}}</td>
            <td>
              <p-tag [value]="getRoleDisplayName(emp.user.role)"
                     [severity]="getRoleSeverity(getRoleDisplayName(emp.user.role))"></p-tag>
            </td>
            <td>{{emp.specialty || '-'}}</td>
            <td>{{emp.phone || '-'}}</td>
            <td>{{emp.hire_date | date:'dd/MM/yyyy'}}</td>
            <td>
              <p-tag [value]="emp.is_active ? 'Activo' : 'Inactivo'"
                     [severity]="emp.is_active ? 'success' : 'danger'"></p-tag>
            </td>
            <td>
              <div class="flex gap-1">
                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                        (click)="editarEmpleado(emp)" pTooltip="Editar"></button>
                <button pButton icon="pi pi-wallet" class="p-button-text p-button-sm p-button-info"
                        (click)="verConfiguracionNomina(emp)" pTooltip="Configuración Nómina"></button>
                <button pButton icon="pi pi-credit-card" class="p-button-text p-button-sm p-button-warning"
                        (click)="verPrestamos(emp)" pTooltip="Préstamos"></button>
                <button pButton icon="pi pi-history" class="p-button-text p-button-sm p-button-success"
                        (click)="verHistorialPagos(emp)" pTooltip="Historial de Pagos"></button>
                <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger"
                        (click)="confirmarEliminar(emp)" pTooltip="Eliminar"></button>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr><td colspan="8" class="text-center py-4">No hay empleados registrados</td></tr>
        </ng-template>
      </p-table>

      <p-dialog header="{{empleadoSeleccionado ? 'Editar' : 'Nuevo'}} Empleado"
                [(visible)]="mostrarDialogo" [modal]="true" [style]="{width: '500px'}"
                [closable]="!guardando()" [closeOnEscape]="!guardando()">
        <form [formGroup]="formulario" class="grid gap-4">
          <div>
            <label class="block font-medium mb-1">Nombre Completo *</label>
            <input pInputText formControlName="full_name" class="w-full"
                   [class.ng-invalid]="formulario.get('full_name')?.invalid && formulario.get('full_name')?.touched">
          </div>

          <div>
            <label class="block font-medium mb-1">Email *</label>
            <input pInputText formControlName="email" type="email" class="w-full"
                   [class.ng-invalid]="formulario.get('email')?.invalid && formulario.get('email')?.touched">
          </div>

          <div *ngIf="!empleadoSeleccionado">
            <label class="block font-medium mb-1">Contraseña *</label>
            <input pInputText formControlName="password" type="password" class="w-full"
                   [class.ng-invalid]="formulario.get('password')?.invalid && formulario.get('password')?.touched">
          </div>

          <div>
            <label class="block font-medium mb-1">Rol *</label>
            <select formControlName="role" class="w-full p-2 border border-gray-300 rounded">
              <option *ngFor="let option of rolesOptions" [value]="option.value">{{option.label}}</option>
            </select>
          </div>

          <div>
            <label class="block font-medium mb-1">Especialidad</label>
            <input pInputText formControlName="specialty" class="w-full">
          </div>

          <div>
            <label class="block font-medium mb-1">Teléfono</label>
            <input pInputText formControlName="phone" class="w-full">
          </div>

          <div>
            <label class="block font-medium mb-1">Fecha de Contratación</label>
            <input type="date" formControlName="hire_date" class="w-full p-2 border border-gray-300 rounded">
          </div>

          <div class="flex items-center">
            <p-checkbox formControlName="is_active" [binary]="true" inputId="activo"></p-checkbox>
            <label for="activo" class="ml-2 font-medium">Empleado Activo</label>
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <button pButton label="Cancelar" type="button" class="p-button-text"
                    (click)="cerrarDialogo()" [disabled]="guardando()"></button>
            <button pButton [label]="empleadoSeleccionado ? 'Actualizar' : 'Crear'"
                    type="button" icon="pi pi-check" [loading]="guardando()"
                    [disabled]="formulario.invalid" (click)="guardarEmpleado()"></button>
          </div>
        </form>
      </p-dialog>

      <!-- Diálogo de Configuración de Nómina -->
      <p-dialog header="Configuración de Nómina - {{empleadoDetalle?.user?.full_name}}"
                [(visible)]="mostrarConfigNomina" [modal]="true" [style]="{width: '600px'}"
                [closable]="true">
        <div class="p-4" *ngIf="empleadoDetalle">
          <form [formGroup]="formularioNomina" class="grid gap-4">
            <div>
              <label class="block font-medium mb-1">Tipo de Pago</label>
              <select formControlName="salary_type" class="w-full p-2 border border-gray-300 rounded">
                <option value="fixed">Sueldo Fijo</option>
                <option value="commission">Comisión</option>
                <option value="mixed">Mixto</option>
              </select>
            </div>
            <div>
              <label class="block font-medium mb-1">Frecuencia de Pago</label>
              <select formControlName="payment_frequency" class="w-full p-2 border border-gray-300 rounded">
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>
            <div>
              <label class="block font-medium mb-1">Porcentaje Comisión (%)</label>
              <input type="number" formControlName="commission_percentage" min="0" max="100"
                     class="w-full p-2 border border-gray-300 rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Salario Mensual (RD$)</label>
              <input type="number" formControlName="contractual_monthly_salary" min="0"
                     class="w-full p-2 border border-gray-300 rounded">
            </div>
            <div>
              <label class="block font-medium mb-2">Descuentos Legales</label>
              <div class="flex gap-4">
                <div class="flex items-center">
                  <p-checkbox formControlName="apply_afp" [binary]="true" inputId="afp"></p-checkbox>
                  <label for="afp" class="ml-2">AFP (2.87%)</label>
                </div>
                <div class="flex items-center">
                  <p-checkbox formControlName="apply_sfs" [binary]="true" inputId="sfs"></p-checkbox>
                  <label for="sfs" class="ml-2">SFS (3.04%)</label>
                </div>
                <div class="flex items-center">
                  <p-checkbox formControlName="apply_isr" [binary]="true" inputId="isr"></p-checkbox>
                  <label for="isr" class="ml-2">ISR</label>
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-2 mt-4">
              <button pButton label="Cancelar" class="p-button-text"
                      (click)="cerrarConfigNomina()"></button>
              <button pButton label="Guardar Configuración" icon="pi pi-save"
                      [loading]="guardandoNomina()" (click)="guardarConfigNomina()"></button>
            </div>
          </form>
        </div>
      </p-dialog>

      <!-- Diálogo de Préstamos -->
      <p-dialog header="Préstamos - {{empleadoDetalle?.user?.full_name}}"
                [(visible)]="mostrarPrestamos" [modal]="true" [style]="{width: '90vw', maxWidth: '1000px'}"
                [closable]="true">
        <div class="p-4" *ngIf="empleadoDetalle">

          <!-- Resumen de Préstamos -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" *ngIf="!cargandoResumenPrestamos()">
            <p-card>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{resumenPrestamos()?.active_loans || 0}}</div>
                <div class="text-sm text-gray-600">Préstamos Activos</div>
              </div>
            </p-card>
            <p-card>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">
                  {{(resumenPrestamos()?.total_amount || 0) | currency:'DOP':'symbol':'1.2-2':'es-DO'}}
                </div>
                <div class="text-sm text-gray-600">Total Prestado</div>
              </div>
            </p-card>
            <p-card>
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-600">
                  {{(resumenPrestamos()?.remaining_balance || 0) | currency:'DOP':'symbol':'1.2-2':'es-DO'}}
                </div>
                <div class="text-sm text-gray-600">Saldo Pendiente</div>
              </div>
            </p-card>
            <p-card>
              <div class="text-center">
                <div class="text-2xl font-bold text-red-600">
                  {{(resumenPrestamos()?.next_deduction || 0) | currency:'DOP':'symbol':'1.2-2':'es-DO'}}
                </div>
                <div class="text-sm text-gray-600">Próxima Deducción</div>
              </div>
            </p-card>
          </div>

          <!-- Skeleton para resumen -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" *ngIf="cargandoResumenPrestamos()">
            <p-card><p-skeleton height="4rem"></p-skeleton></p-card>
            <p-card><p-skeleton height="4rem"></p-skeleton></p-card>
            <p-card><p-skeleton height="4rem"></p-skeleton></p-card>
            <p-card><p-skeleton height="4rem"></p-skeleton></p-card>
          </div>

          <!-- Botón Nuevo Préstamo -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Lista de Préstamos</h3>
            <button pButton label="Nuevo Préstamo" icon="pi pi-plus"
                    class="p-button-success" (click)="abrirNuevoPrestamo()"></button>
          </div>

          <!-- Tabla de Préstamos -->
          <p-table [value]="prestamos()" [loading]="cargandoPrestamos()"
                   [paginator]="true" [rows]="10" [showCurrentPageReport]="true"
                   currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} préstamos">
            <ng-template pTemplate="header">
              <tr>
                <th>Fecha Solicitud</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Cuotas</th>
                <th>Pago Mensual</th>
                <th>Saldo Restante</th>
                <th>Estado</th>
                <th>Motivo</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-loan>
              <tr>
                <td>{{loan.request_date | date:'dd/MM/yyyy'}}</td>
                <td>
                  <p-tag [value]="getLoanTypeLabel(loan.loan_type)" severity="info"></p-tag>
                </td>
                <td>
                  <span class="font-medium text-blue-600">
                    {{loan.amount | currency:'DOP':'symbol':'1.2-2':'es-DO'}}
                  </span>
                </td>
                <td>{{loan.installments}}</td>
                <td>
                  <span class="font-medium">
                    {{loan.monthly_payment | currency:'DOP':'symbol':'1.2-2':'es-DO'}}
                  </span>
                </td>
                <td>
                  <span class="font-bold" [class]="loan.remaining_balance > 0 ? 'text-orange-600' : 'text-green-600'">
                    {{loan.remaining_balance | currency:'DOP':'symbol':'1.2-2':'es-DO'}}
                  </span>
                </td>
                <td>
                  <p-tag [value]="getLoanStatusLabel(loan.status)"
                         [severity]="getLoanStatusSeverity(loan.status)"></p-tag>
                </td>
                <td>{{loan.reason || 'N/A'}}</td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="8" class="text-center py-8">
                  <div class="text-gray-500">
                    <i class="pi pi-info-circle text-3xl mb-2"></i>
                    <div>No hay préstamos registrados para este empleado</div>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </p-dialog>

      <!-- Diálogo Nuevo Préstamo -->
      <p-dialog header="Nuevo Préstamo - {{empleadoDetalle?.user?.full_name}}"
                [(visible)]="mostrarNuevoPrestamo" [modal]="true" [style]="{width: '500px'}"
                [closable]="!guardandoPrestamo()" [closeOnEscape]="!guardandoPrestamo()">
        <form [formGroup]="formularioPrestamo" class="grid gap-4">
          <div>
            <label class="block font-medium mb-1">Tipo de Préstamo *</label>
            <p-select formControlName="loan_type" [options]="loanTypeOptions"
                        optionLabel="label" optionValue="value" class="w-full"
                        placeholder="Seleccionar tipo"></p-select>
          </div>

          <div>
            <label class="block font-medium mb-1">Monto (RD$) *</label>
            <p-inputNumber formControlName="amount" mode="currency" currency="DOP"
                           locale="es-DO" class="w-full" [min]="100" [max]="50000"></p-inputNumber>
          </div>

          <div>
            <label class="block font-medium mb-1">Número de Cuotas *</label>
            <p-inputNumber formControlName="installments" class="w-full"
                           [min]="1" [max]="24" [showButtons]="true"></p-inputNumber>
          </div>

          <div>
            <label class="block font-medium mb-1">Motivo</label>
            <input pInputText formControlName="reason" class="w-full"
                   placeholder="Descripción del préstamo">
          </div>

          <!-- Resumen del préstamo -->
          <div class="bg-gray-50 p-3 rounded" *ngIf="formularioPrestamo.get('amount')?.value && formularioPrestamo.get('installments')?.value">
            <h4 class="font-medium mb-2">Resumen:</h4>
            <div class="text-sm space-y-1">
              <div class="flex justify-between">
                <span>Monto solicitado:</span>
                <span class="font-medium">{{formularioPrestamo.get('amount')?.value | currency:'DOP':'symbol':'1.2-2':'es-DO'}}</span>
              </div>
              <div class="flex justify-between">
                <span>Cuotas:</span>
                <span class="font-medium">{{formularioPrestamo.get('installments')?.value}}</span>
              </div>
              <div class="flex justify-between border-t pt-1">
                <span>Pago mensual:</span>
                <span class="font-bold text-green-600">
                  {{calcularPagoMensual() | currency:'DOP':'symbol':'1.2-2':'es-DO'}}
                </span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <button pButton label="Cancelar" type="button" class="p-button-text"
                    (click)="cerrarNuevoPrestamo()" [disabled]="guardandoPrestamo()"></button>
            <button pButton label="Crear Préstamo" type="button" icon="pi pi-check"
                    [loading]="guardandoPrestamo()" [disabled]="formularioPrestamo.invalid"
                    (click)="crearPrestamo()"></button>
          </div>
        </form>
      </p-dialog>

      <!-- Diálogo de Historial de Pagos -->
      <p-dialog header="Historial de Pagos - {{empleadoDetalle?.user?.full_name}}"
                [(visible)]="mostrarHistorial" [modal]="true" [style]="{width: '90vw', maxWidth: '1200px'}"
                [closable]="true">
        <div class="p-4" *ngIf="empleadoDetalle">

          <!-- Resumen de Estadísticas -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" *ngIf="!cargandoStats()">
            <p-card>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{paymentStats()?.all_time?.total_payments || 0}}</div>
                <div class="text-sm text-gray-600">Total Pagos</div>
              </div>
            </p-card>
            <p-card>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">
                  {{(paymentStats()?.all_time?.total_net || 0) | currency:'DOP':'symbol':'1.2-2':'es-DO'}}
                </div>
                <div class="text-sm text-gray-600">Total Pagado</div>
              </div>
            </p-card>
            <p-card>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">
                  {{(paymentStats()?.all_time?.average_payment || 0) | currency:'DOP':'symbol':'1.2-2':'es-DO'}}
                </div>
                <div class="text-sm text-gray-600">Promedio por Pago</div>
              </div>
            </p-card>
          </div>

          <!-- Skeleton para estadísticas -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" *ngIf="cargandoStats()">
            <p-card>
              <p-skeleton height="4rem"></p-skeleton>
            </p-card>
            <p-card>
              <p-skeleton height="4rem"></p-skeleton>
            </p-card>
            <p-card>
              <p-skeleton height="4rem"></p-skeleton>
            </p-card>
          </div>

          <!-- Último Pago -->
          <div class="mb-4" *ngIf="paymentStats()?.last_payment">
            <p-card>
              <div class="flex justify-between items-center">
                <div>
                  <div class="font-semibold text-gray-700">Último Pago</div>
                  <div class="text-sm text-gray-500">
                    {{paymentStats()?.last_payment?.date | date:'dd/MM/yyyy'}} -
                    {{paymentStats()?.last_payment?.method}}
                  </div>
                </div>
                <div class="text-xl font-bold text-green-600">
                  {{paymentStats()?.last_payment?.amount | currency:'DOP':'symbol':'1.2-2':'es-DO'}}
                </div>
              </div>
            </p-card>
          </div>

          <!-- Tabla de Historial -->
          <div class="mt-4">
            <h3 class="text-lg font-semibold mb-4">Historial Completo</h3>
            <p-table [value]="historialPagos()" [loading]="cargandoHistorial()"
                     [paginator]="true" [rows]="10" [showCurrentPageReport]="true"
                     currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pagos">
              <ng-template pTemplate="header">
                <tr>
                  <th>Fecha</th>
                  <th>Período</th>
                  <th>Monto Bruto</th>
                  <th>Descuentos</th>
                  <th>Monto Neto</th>
                  <th>Método</th>
                  <th>Referencia</th>
                  <th>Acciones</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-payment>
                <tr>
                  <td>{{payment.paid_at | date:'dd/MM/yyyy HH:mm'}}</td>
                  <td>
                    <span class="font-medium">{{payment.period_display}}</span>
                  </td>
                  <td>
                    <span class="font-medium text-blue-600">
                      {{payment.gross_amount | currency:'DOP':'symbol':'1.2-2':'es-DO'}}
                    </span>
                  </td>
                  <td>
                    <span class="text-red-600">
                      {{payment.total_deductions | currency:'DOP':'symbol':'1.2-2':'es-DO'}}
                    </span>
                  </td>
                  <td>
                    <span class="font-bold text-green-600">
                      {{payment.net_amount | currency:'DOP':'symbol':'1.2-2':'es-DO'}}
                    </span>
                  </td>
                  <td>
                    <p-tag [value]="payment.payment_method" severity="info"></p-tag>
                  </td>
                  <td>{{payment.payment_reference || 'N/A'}}</td>
                  <td>
                    <button pButton icon="pi pi-file-pdf" class="p-button-text p-button-sm"
                            (click)="verReciboPago(payment)" pTooltip="Ver Recibo"></button>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="8" class="text-center py-8">
                    <div class="text-gray-500">
                      <i class="pi pi-info-circle text-3xl mb-2"></i>
                      <div>No hay pagos registrados para este empleado</div>
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>
      </p-dialog>

      <!-- Diálogo de Recibo de Pago -->
      <p-dialog header="Recibo de Pago" [(visible)]="mostrarRecibo" [modal]="true"
                [style]="{width: '800px'}" [closable]="true">
        <div class="recibo-container" *ngIf="reciboActual()">
          <!-- Header del recibo -->
          <div class="text-center mb-6 border-b pb-4">
            <h2 class="text-2xl font-bold text-gray-800">{{reciboActual()?.company?.name}}</h2>
            <p class="text-gray-600">{{reciboActual()?.company?.address}}</p>
            <p class="text-gray-600">{{reciboActual()?.company?.phone}}</p>
            <h3 class="text-xl font-semibold mt-4 text-blue-600">RECIBO DE PAGO</h3>
          </div>

          <!-- Información del empleado y período -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 class="font-semibold text-gray-700 mb-2">Empleado:</h4>
              <p class="font-medium">{{reciboActual()?.employee?.name}}</p>
              <p class="text-sm text-gray-600">{{reciboActual()?.employee?.email}}</p>
            </div>
            <div>
              <h4 class="font-semibold text-gray-700 mb-2">Período:</h4>
              <p class="font-medium">{{reciboActual()?.period?.display}}</p>
              <p class="text-sm text-gray-600">
                {{reciboActual()?.period?.start_date | date:'dd/MM/yyyy'}} -
                {{reciboActual()?.period?.end_date | date:'dd/MM/yyyy'}}
              </p>
            </div>
          </div>

          <!-- Detalle de montos -->
          <div class="border rounded-lg p-4 mb-6">
            <h4 class="font-semibold text-gray-700 mb-4">Detalle de Pago:</h4>

            <div class="space-y-2">
              <div class="flex justify-between">
                <span>Monto Bruto:</span>
                <span class="font-medium">
                  {{reciboActual()?.amounts?.gross_amount | currency:'DOP':'symbol':'1.2-2':'es-DO'}}
                </span>
              </div>

              <div class="border-t pt-2">
                <p class="font-medium text-gray-700 mb-2">Descuentos:</p>
                <div class="ml-4 space-y-1 text-sm">
                  <div class="flex justify-between" *ngIf="reciboActual()?.amounts?.deductions?.afp && (reciboActual()?.amounts?.deductions?.afp ?? 0) > 0">
                    <span>AFP (2.87%):</span>
                    <span>-{{reciboActual()?.amounts?.deductions?.afp | currency:'DOP':'symbol':'1.2-2':'es-DO'}}</span>
                  </div>
                  <div class="flex justify-between" *ngIf="reciboActual()?.amounts?.deductions?.sfs && (reciboActual()?.amounts?.deductions?.sfs ?? 0) > 0">
                    <span>SFS (3.04%):</span>
                    <span>-{{reciboActual()?.amounts?.deductions?.sfs | currency:'DOP':'symbol':'1.2-2':'es-DO'}}</span>
                  </div>
                  <div class="flex justify-between" *ngIf="reciboActual()?.amounts?.deductions?.isr && (reciboActual()?.amounts?.deductions?.isr ?? 0) > 0">
                    <span>ISR:</span>
                    <span>-{{reciboActual()?.amounts?.deductions?.isr | currency:'DOP':'symbol':'1.2-2':'es-DO'}}</span>
                  </div>
                  <div class="flex justify-between" *ngIf="reciboActual()?.amounts?.deductions?.loans && (reciboActual()?.amounts?.deductions?.loans ?? 0) > 0">
                    <span>Préstamos:</span>
                    <span>-{{reciboActual()?.amounts?.deductions?.loans | currency:'DOP':'symbol':'1.2-2':'es-DO'}}</span>
                  </div>
                </div>
                <div class="flex justify-between font-medium border-t pt-1 mt-2">
                  <span>Total Descuentos:</span>
                  <span>-{{reciboActual()?.amounts?.deductions?.total | currency:'DOP':'symbol':'1.2-2':'es-DO'}}</span>
                </div>
              </div>

              <div class="border-t pt-2 flex justify-between text-lg font-bold text-green-600">
                <span>Monto Neto:</span>
                <span>{{reciboActual()?.amounts?.net_amount | currency:'DOP':'symbol':'1.2-2':'es-DO'}}</span>
              </div>
            </div>
          </div>

          <!-- Información del pago -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 class="font-semibold text-gray-700 mb-2">Información del Pago:</h4>
              <p><strong>Método:</strong> {{reciboActual()?.payment_info?.method}}</p>
              <p><strong>Referencia:</strong> {{reciboActual()?.payment_info?.reference}}</p>
            </div>
            <div>
              <h4 class="font-semibold text-gray-700 mb-2">Fecha y Responsable:</h4>
              <p><strong>Fecha:</strong> {{reciboActual()?.payment_info?.paid_at | date:'dd/MM/yyyy HH:mm'}}</p>
              <p><strong>Pagado por:</strong> {{reciboActual()?.payment_info?.paid_by}}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center text-sm text-gray-500 border-t pt-4">
            <p>Recibo ID: {{reciboActual()?.payment_id}}</p>
            <p>Este documento es un comprobante de pago de nómina</p>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button pButton label="Imprimir" icon="pi pi-print"
                  class="p-button-outlined" (click)="imprimirRecibo()"></button>
          <button pButton label="Cerrar" (click)="cerrarRecibo()"></button>
        </div>
      </p-dialog>
    </div>

    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class EmployeesManagement implements OnInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  empleados = signal<EmployeeWithUserDto[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  mostrarDialogo = false;
  empleadoSeleccionado: EmployeeWithUserDto | null = null;
  fechaMaxima = new Date();

  // Nuevas propiedades para configuración de nómina
  mostrarConfigNomina = false;
  empleadoDetalle: EmployeeWithUserDto | null = null;
  guardandoNomina = signal(false);

  // Propiedades para historial de pagos
  mostrarHistorial = false;
  cargandoHistorial = signal(false);
  cargandoStats = signal(false);
  historialPagos = signal<PaymentDto[]>([]);
  paymentStats = signal<PaymentStatsDto | null>(null);
  mostrarRecibo = false;
  reciboActual = signal<PaymentReceiptDto | null>(null);

  // Propiedades para préstamos
  mostrarPrestamos = false;
  cargandoPrestamos = signal(false);
  cargandoResumenPrestamos = signal(false);
  prestamos = signal<LoanDto[]>([]);
  resumenPrestamos = signal<LoanSummaryDto | null>(null);
  mostrarNuevoPrestamo = false;
  guardandoPrestamo = signal(false);

  rolesOptions = [
    { label: 'Estilista', value: 'Estilista' },
    { label: 'Cajera', value: 'Cajera' },
    { label: 'Manager', value: 'Manager' },
    { label: 'Utility', value: 'Utility' }
  ];

  salaryTypeOptions = [
    { label: 'Sueldo Fijo', value: 'fixed' },
    { label: 'Comisión', value: 'commission' },
    { label: 'Mixto', value: 'mixed' }
  ];

  frequencyOptions = [
    { label: 'Quincenal', value: 'biweekly' },
    { label: 'Mensual', value: 'monthly' },
    { label: 'Semanal', value: 'weekly' }
  ];

  loanTypeOptions = [
    { label: 'Anticipo de Sueldo', value: 'advance' },
    { label: 'Préstamo Personal', value: 'personal_loan' },
    { label: 'Préstamo de Emergencia', value: 'emergency' }
  ];

  formulario: FormGroup = this.fb.group({
    full_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['Client-Staff', [Validators.required]],
    specialty: [''],
    phone: [''],
    hire_date: [new Date()],
    is_active: [true]
  });

  formularioNomina: FormGroup = this.fb.group({
    salary_type: ['commission'],
    payment_frequency: ['biweekly'],
    commission_percentage: [40],
    commission_payment_mode: ['PER_PERIOD'],
    contractual_monthly_salary: [0],
    apply_afp: [false],
    apply_sfs: [false],
    apply_isr: [false]
  });

  formularioPrestamo: FormGroup = this.fb.group({
    loan_type: ['', [Validators.required]],
    amount: [null, [Validators.required, Validators.min(100)]],
    installments: [null, [Validators.required, Validators.min(1), Validators.max(24)]],
    reason: ['']
  });

  // Adaptador: Backend → Frontend DTO
  private mapBackendToEmployeeWithUser(empleadoBackend: any, usuarioBackend: any): EmployeeWithUserDto {
    return {
      id: empleadoBackend?.id || 0,
      user_id: usuarioBackend.id,
      user: {
        id: usuarioBackend.id,
        email: usuarioBackend.email,
        full_name: usuarioBackend.full_name,
        role: usuarioBackend.role,
        is_active: usuarioBackend.is_active,
        tenant: usuarioBackend.tenant,
        created_at: usuarioBackend.created_at,
        updated_at: usuarioBackend.updated_at
      },
      specialty: empleadoBackend?.specialty || '',
      phone: empleadoBackend?.phone || '',
      hire_date: empleadoBackend?.hire_date || '',
      is_active: empleadoBackend?.is_active ?? true,
      created_at: empleadoBackend?.created_at || '',
      display_name: `${usuarioBackend.full_name || usuarioBackend.email || 'Sin nombre'} (${usuarioBackend.role || 'Sin rol'})`
    };
  }

  ngOnInit() {
    this.cargarDatos();
    this.cargarConfiguracionDefecto();
  }

  async cargarConfiguracionDefecto() {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${environment.apiUrl}/settings/barbershop/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const config = await response.json();
        this.formularioNomina.patchValue({
          commission_percentage: config.default_commission_rate || 40,
          contractual_monthly_salary: config.default_fixed_salary || 0
        });
      }
    } catch {}
  }

  async cargarDatos() {
    this.cargando.set(true);
    try {
      // Usar solo el endpoint de empleados que ya incluye datos del usuario
      const empleadosRes = await this.employeeService.getEmployees().toPromise();
      const empleados = (empleadosRes as any)?.results || [];

      // Mapear directamente desde la respuesta de empleados
      const empleadosFusionados: EmployeeWithUserDto[] = empleados.map((emp: any) => {
        return {
          id: emp.id,
          user_id: emp.user.id,
          user: {
            id: emp.user.id,
            email: emp.user.email,
            full_name: emp.user.full_name,
            role: emp.user.role,
            is_active: emp.is_active,
            tenant: 0,
            created_at: emp.created_at,
            updated_at: emp.updated_at
          },
          specialty: emp.specialty || '',
          phone: emp.phone || '',
          hire_date: emp.hire_date || '',
          is_active: emp.is_active,
          created_at: emp.created_at,
          display_name: `${emp.user.full_name || emp.user.email || 'Sin nombre'} (${emp.user.role || 'Sin rol'})`
        };
      });

      this.empleados.set(empleadosFusionados);
    } catch (error) {
      if (!environment.production) {
        console.error('Error cargando datos:', error);
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los empleados'
      });
    } finally {
      this.cargando.set(false);
    }
  }

  abrirDialogo() {
    this.empleadoSeleccionado = null;
    this.formulario.reset({
      full_name: '',
      email: '',
      password: '',
      role: 'Client-Staff',
      specialty: '',
      phone: '',
      hire_date: new Date(),
      is_active: true
    });
    this.formulario.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.mostrarDialogo = true;
  }

  editarEmpleado(emp: EmployeeWithUserDto) {
    this.empleadoSeleccionado = emp;
    this.formulario.patchValue({
      full_name: emp.user.full_name,
      email: emp.user.email,
      role: emp.user.role,
      specialty: emp.specialty,
      phone: emp.phone,
      hire_date: emp.hire_date ? new Date(emp.hire_date) : new Date(),
      is_active: emp.is_active
    });
    this.formulario.get('password')?.clearValidators();
    this.formulario.get('password')?.updateValueAndValidity();
    this.mostrarDialogo = true;
  }

  async guardarEmpleado() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formData = this.formulario.value;

    try {
      if (this.empleadoSeleccionado) {
        // Actualizar usuario
        await this.authService.updateUser(this.empleadoSeleccionado.user_id, {
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active
        } as any).toPromise();

        // Si tiene registro Employee (id > 0), actualizar; si no, omitir creación
        if (this.empleadoSeleccionado.id > 0) {
          const updateData = {
            specialty: formData.specialty || undefined,
            phone: formData.phone || undefined,
            hire_date: formData.hire_date ? new Date(formData.hire_date).toISOString().split('T')[0] : undefined,
            is_active: formData.is_active
          };

          console.log('Updating employee with data:', updateData);
          // Usar PATCH en lugar de PUT para evitar problemas con campos no permitidos
          await this.employeeService.patchEmployee(this.empleadoSeleccionado.id, updateData).toPromise();
        }
        // NOTA: No se puede crear registro Employee vía POST /api/employees/ (endpoint deshabilitado)
        // Los datos de empleado se manejan solo a través del usuario

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empleado actualizado correctamente'
        });
      } else {
        // Crear usuario
        const newUser = await this.authService.createUser({
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password,
          role: formData.role,
          tenant: this.authService.getTenantId()
        } as any).toPromise();
        
        // Esperar un momento para que el signal cree el Employee
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Buscar el Employee recién creado y actualizarlo con los datos adicionales
        const empleadosRes = await this.employeeService.getEmployees().toPromise();
        const empleados = (empleadosRes as any)?.results || [];
        const nuevoEmpleado = empleados.find((e: any) => e.user.id === (newUser as any).id);
        
        if (nuevoEmpleado && nuevoEmpleado.id > 0) {
          const updateData = {
            specialty: formData.specialty || undefined,
            phone: formData.phone || undefined,
            hire_date: formData.hire_date ? new Date(formData.hire_date).toISOString().split('T')[0] : undefined,
            is_active: formData.is_active
          };
          await this.employeeService.patchEmployee(nuevoEmpleado.id, updateData).toPromise();
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empleado creado correctamente'
        });
      }

      this.cerrarDialogo();
      await this.cargarDatos();
    } catch (error: any) {
      if (!environment.production) {
        console.error('Error guardando empleado:', error);
        console.error('Error details:', error.error);
      }

      let errorMessage = 'No se pudo guardar el empleado';

      // Detectar límite de usuarios
      if (error?.error?.current !== undefined && error?.error?.limit !== undefined) {
        errorMessage = `Límite de usuarios alcanzado (${error.error.current}/${error.error.limit}). Actualiza tu plan para agregar más usuarios.`;
      } else if (error?.error?.error && error.error.error.includes('User limit reached')) {
        errorMessage = `Límite de usuarios alcanzado. Actualiza tu plan para agregar más usuarios.`;
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para crear usuarios. Verifica tu plan de suscripción.';
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      }

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage
      });
    } finally {
      this.guardando.set(false);
    }
  }

  confirmarEliminar(emp: EmployeeWithUserDto) {
    const nombreEmpleado = emp.user.full_name || emp.user.email || 'este empleado';
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al empleado ${nombreEmpleado}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.eliminarEmpleado(emp)
    });
  }

  async eliminarEmpleado(emp: EmployeeWithUserDto) {
    try {
      // Eliminar usuario (esto maneja automáticamente la relación con Employee)
      await this.authService.deleteUser(emp.user_id).toPromise();
      
      // NOTA: No se llama DELETE /api/employees/ porque:
      // 1. El endpoint puede no existir o estar deshabilitado
      // 2. La eliminación del usuario maneja la cascada automáticamente

      this.empleados.update(lista => lista.filter(e => e.user_id !== emp.user_id));
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Empleado eliminado correctamente'
      });
    } catch (error) {
      if (!environment.production) {
        console.error('Error eliminando empleado:', error);
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo eliminar el empleado'
      });
    }
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'ClientStaff': 'Estilista',
      'Client-Staff': 'Estilista',
      'ClientAdmin': 'Administrador',
      'Client-Admin': 'Administrador',
      'Cajera': 'Cajera',
      'Manager': 'Manager'
    };
    return roleNames[role] || role;
  }

  getRoleSeverity(role: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' {
    const severities: { [key: string]: 'success' | 'secondary' | 'info' | 'warn' | 'danger' } = {
      'Estilista': 'info',
      'Cajera': 'success',
      'Manager': 'warn',
      'Administrador': 'danger'
    };
    return severities[role] || 'secondary';
  }

  cerrarDialogo() {
    this.mostrarDialogo = false;
    this.empleadoSeleccionado = null;
    this.formulario.reset();
  }

  // Nuevos métodos para configuración de nómina
  async verConfiguracionNomina(emp: EmployeeWithUserDto) {
    this.empleadoDetalle = emp;
    this.mostrarConfigNomina = true;

    // Cargar configuración de nómina
    await this.cargarConfigNomina();
  }

  async cargarConfigNomina() {
    if (!this.empleadoDetalle?.id) return;

    try {
      const config = await this.employeeService.getPayrollConfig(this.empleadoDetalle.id).toPromise() as any;
      if (config) {
        this.formularioNomina.patchValue(config);
      }
    } catch (error) {
      if (!environment.production) {
        console.error('Error cargando configuración:', error);
      }
    }
  }

  async guardarConfigNomina() {
    if (!this.empleadoDetalle?.id || this.formularioNomina.invalid) return;

    this.guardandoNomina.set(true);
    try {
      await this.employeeService.updatePayrollConfig(this.empleadoDetalle.id, this.formularioNomina.value).toPromise();

      // Recargar datos de empleados para reflejar cambios inmediatamente
      await this.cargarDatos();

      // Cerrar diálogo automáticamente tras éxito
      this.cerrarConfigNomina();

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Configuración de nómina actualizada'
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar la configuración'
      });
    } finally {
      this.guardandoNomina.set(false);
    }
  }

  cerrarConfigNomina() {
    this.mostrarConfigNomina = false;
    this.empleadoDetalle = null;
  }

  // Métodos para historial de pagos
  async verHistorialPagos(emp: EmployeeWithUserDto) {
    this.empleadoDetalle = emp;
    this.mostrarHistorial = true;

    // Cargar datos solo cuando se abre el diálogo
    await Promise.all([
      this.cargarHistorialPagos(),
      this.cargarEstadisticasPagos()
    ]);
  }

  async cargarHistorialPagos() {
    if (!this.empleadoDetalle?.id) return;

    this.cargandoHistorial.set(true);
    try {
      const response = await this.employeeService.getPaymentHistory(this.empleadoDetalle.id).toPromise() as any;
      this.historialPagos.set(response.payments || []);
    } catch (error) {
      if (!environment.production) {
        console.error('Error cargando historial:', error);
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el historial de pagos'
      });
    } finally {
      this.cargandoHistorial.set(false);
    }
  }

  async cargarEstadisticasPagos() {
    if (!this.empleadoDetalle?.id) return;

    this.cargandoStats.set(true);
    try {
      const response = await this.employeeService.getPaymentStats(this.empleadoDetalle.id).toPromise() as any;
      this.paymentStats.set(response);
    } catch (error) {
      if (!environment.production) {
        console.error('Error cargando estadísticas:', error);
      }
    } finally {
      this.cargandoStats.set(false);
    }
  }

  cerrarHistorial() {
    this.mostrarHistorial = false;
    this.empleadoDetalle = null;
    this.historialPagos.set([]);
    this.paymentStats.set(null);
  }

  async verReciboPago(payment: PaymentDto) {
    if (!payment?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'ID de pago no válido'
      });
      return;
    }

    try {
      const response = await this.employeeService.getPaymentReceipt(payment.id.toString()).toPromise() as PaymentReceiptDto;
      this.reciboActual.set(response);
      this.mostrarRecibo = true;
    } catch (error) {
      if (!environment.production) {
        console.error('Error cargando recibo:', error);
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el recibo'
      });
    }
  }

  cerrarRecibo() {
    this.mostrarRecibo = false;
    this.reciboActual.set(null);
  }

  imprimirRecibo() {
    window.print();
  }

  // Métodos para préstamos
  async verPrestamos(emp: EmployeeWithUserDto) {
    this.empleadoDetalle = emp;
    this.mostrarPrestamos = true;

    // Cargar datos de préstamos
    await Promise.all([
      this.cargarPrestamos(),
      this.cargarResumenPrestamos()
    ]);
  }

  async cargarPrestamos() {
    if (!this.empleadoDetalle?.id) return;

    this.cargandoPrestamos.set(true);
    try {
      const response = await this.employeeService.getLoans(this.empleadoDetalle.id).toPromise() as any;
      this.prestamos.set(response.loans || []);
    } catch (error) {
      if (!environment.production) {
        console.error('Error cargando préstamos:', error);
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los préstamos'
      });
    } finally {
      this.cargandoPrestamos.set(false);
    }
  }

  async cargarResumenPrestamos() {
    if (!this.empleadoDetalle?.id) return;

    this.cargandoResumenPrestamos.set(true);
    try {
      const response = await this.employeeService.getLoansSummary(this.empleadoDetalle.id).toPromise() as any;
      this.resumenPrestamos.set(response);
    } catch (error) {
      if (!environment.production) {
        console.error('Error cargando resumen de préstamos:', error);
      }
    } finally {
      this.cargandoResumenPrestamos.set(false);
    }
  }

  cerrarPrestamos() {
    this.mostrarPrestamos = false;
    this.empleadoDetalle = null;
    this.prestamos.set([]);
    this.resumenPrestamos.set(null);
  }

  abrirNuevoPrestamo() {
    this.formularioPrestamo.reset({
      loan_type: '',
      amount: null,
      installments: null,
      reason: ''
    });
    this.mostrarNuevoPrestamo = true;
  }

  cerrarNuevoPrestamo() {
    this.mostrarNuevoPrestamo = false;
    this.formularioPrestamo.reset();
  }

  calcularPagoMensual(): number {
    const amount = this.formularioPrestamo.get('amount')?.value;
    const installments = this.formularioPrestamo.get('installments')?.value;

    if (!amount || !installments || amount <= 0 || installments <= 0) {
      return 0;
    }

    return amount / installments;
  }

  async crearPrestamo() {
    if (this.formularioPrestamo.invalid || !this.empleadoDetalle?.id) {
      this.formularioPrestamo.markAllAsTouched();
      return;
    }

    this.guardandoPrestamo.set(true);
    try {
      const loanData: CreateLoanDto = {
        loan_type: this.formularioPrestamo.get('loan_type')?.value,
        amount: this.formularioPrestamo.get('amount')?.value,
        installments: this.formularioPrestamo.get('installments')?.value,
        reason: this.formularioPrestamo.get('reason')?.value || ''
      };

      await this.employeeService.createLoan(this.empleadoDetalle.id, loanData).toPromise();

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Préstamo creado exitosamente'
      });

      this.cerrarNuevoPrestamo();

      // Recargar datos de préstamos
      await Promise.all([
        this.cargarPrestamos(),
        this.cargarResumenPrestamos()
      ]);
    } catch (error: any) {
      if (!environment.production) {
        console.error('Error creando préstamo:', error);
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error?.error?.message || 'No se pudo crear el préstamo'
      });
    } finally {
      this.guardandoPrestamo.set(false);
    }
  }

  getLoanTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'advance': 'Anticipo',
      'personal_loan': 'Personal',
      'emergency': 'Emergencia'
    };
    return labels[type] || type;
  }

  getLoanStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Activo',
      'paid': 'Pagado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  getLoanStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    const severities: { [key: string]: 'success' | 'info' | 'warn' | 'danger' } = {
      'active': 'info',
      'paid': 'success',
      'cancelled': 'danger'
    };
    return severities[status] || 'info';
  }
}
