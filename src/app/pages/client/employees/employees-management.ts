import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { EmployeeService, Employee, UpdateEmployeeRequest } from '../../../core/services/employee/employee.service';
import { ServiceService } from '../../../core/services/service/service.service';
import { AuthService, User } from '../../../core/services/auth/auth.service';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { UserDto, CreateUserDto, UpdateUserDto } from '../../../core/dto/user.dto';
import { EmployeeDto, EmployeeWithUserDto, CreateEmployeeDto, UpdateEmployeeDto } from '../../../core/dto/employee.dto';
import { PayrollConfigDto, PaymentStatsDto, PaymentReceiptDto } from '../../../core/dto/payroll.dto';
import { LoanDto, LoanSummaryDto, CreateLoanDto } from '../../../core/dto/loan.dto';
import { SettingsService } from '../../../core/services/settings/settings.service';
import { PlanAccessService } from '../../../core/services/plan-access.service';
import { AppCurrencyPipe } from '../../../core/pipes/app-currency.pipe';

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
    SelectModule,
    MultiSelectModule,
    AppCurrencyPipe
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="space-y-6">
      <section class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="grid gap-6 px-6 py-7 xl:grid-cols-[1.35fr,0.85fr] xl:px-8">
          <div class="space-y-5">
            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
              Equipo activo
            </div>

            <div>
              <h2 class="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Gestión de empleados</h2>
              <p class="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                Administra tu equipo, revisa roles operativos y mantén visible quién está activo, asignado y listo para atender.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                <i class="pi pi-users text-xs"></i>
                {{ empleados().length }} empleados registrados
              </div>
              <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                <i class="pi pi-check-circle text-xs"></i>
                {{ getActiveEmployeesCount() }} activos
              </div>
              <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                <i class="pi pi-briefcase text-xs"></i>
                {{ getServiceAssignableCount() }} atienden servicios
              </div>
            </div>
          </div>

          <div class="rounded-[1.6rem] bg-slate-950 p-5 text-white shadow-xl">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Resumen operativo</div>
                <div class="mt-2 text-2xl font-black">Equipo de trabajo</div>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <i class="pi pi-briefcase text-lg"></i>
              </div>
            </div>

            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div class="text-[11px] uppercase tracking-[0.22em] text-slate-400">Roles con agenda</div>
                <div class="mt-1 text-lg font-bold">{{ getServiceAssignableCount() }}</div>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div class="text-[11px] uppercase tracking-[0.22em] text-slate-400">Inactivos</div>
                <div class="mt-1 text-lg font-bold">{{ getInactiveEmployeesCount() }}</div>
              </div>
            </div>

            <div class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
              {{ getEmployeesNarrative() }}
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200/80 px-6 py-5 dark:border-slate-800 xl:px-8">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap gap-2">
              <button pButton icon="pi pi-refresh" (click)="cargarDatos()"
                      [loading]="cargando()" class="p-button-outlined"></button>
              <button pButton label="Nuevo empleado" icon="pi pi-plus" (click)="abrirDialogo()"></button>
            </div>
            <div class="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              Mantén al día roles, especialidades y disponibilidad del equipo.
            </div>
          </div>
        </div>
      </section>

      <section class="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p-table [value]="empleados()" [loading]="cargando()"
               [globalFilterFields]="['user.full_name', 'user.email', 'specialty']"
               #dt>
        <ng-template pTemplate="caption">
          <div class="flex flex-col gap-3 p-2 lg:flex-row lg:items-center lg:justify-between">
            <span class="text-sm text-slate-600 dark:text-slate-300">
              Total: {{empleados().length}} empleados
            </span>
            <span class="p-input-icon-left w-full lg:w-80">
              <i class="pi pi-search"></i>
              <input pInputText type="text" placeholder="Buscar empleados..."
                     class="w-full"
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
            <th>Servicios</th>
            <th>Teléfono</th>
            <th>Fecha Contrato</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-emp>
          <tr>
            <td>
              <div class="flex flex-col">
                <span class="font-semibold text-slate-900 dark:text-white">{{emp.user.full_name}}</span>
                <span class="text-xs text-slate-500 dark:text-slate-400">ID {{ emp.id }}</span>
              </div>
            </td>
            <td>
              <span class="text-slate-700 dark:text-slate-300">{{emp.user.email}}</span>
            </td>
            <td>
              <p-tag [value]="getRoleDisplayName(emp.user.role)"
                     [severity]="getRoleSeverity(getRoleDisplayName(emp.user.role))"></p-tag>
            </td>
            <td>{{emp.specialty || '-'}}</td>
            <td>
              <div *ngIf="isServiceAssignableRole(emp.user.role); else noServiceRole">
                <p-tag
                  [value]="(emp.services_count || 0) + ' servicio' + ((emp.services_count || 0) === 1 ? '' : 's')"
                  [severity]="(emp.services_count || 0) > 0 ? 'info' : 'warn'">
                </p-tag>
                <div class="text-xs text-slate-500 dark:text-slate-400 mt-1" *ngIf="getAssignedServicesPreview(emp) as preview">
                  {{ preview }}
                </div>
              </div>
              <ng-template #noServiceRole>
                <span class="text-slate-400">No aplica</span>
              </ng-template>
            </td>
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
          <tr><td colspan="9" class="text-center py-4">No hay empleados registrados</td></tr>
        </ng-template>
      </p-table>
      </section>

      <p-dialog header="{{empleadoSeleccionado ? 'Editar' : 'Nuevo'}} empleado"
                [(visible)]="mostrarDialogo" [modal]="true" [style]="{width: '620px'}"
                styleClass="shadow-2xl"
                [closable]="!guardando()" [closeOnEscape]="!guardando()">
        <div [formGroup]="formulario" class="grid gap-5 p-1">
          <div class="rounded-2xl bg-slate-950 p-4 text-white">
            <div class="text-[11px] uppercase tracking-[0.24em] text-slate-400">Perfil del equipo</div>
            <div class="mt-2 text-xl font-black">{{ empleadoSeleccionado ? 'Actualizar colaborador' : 'Registrar nuevo colaborador' }}</div>
            <div class="mt-2 text-sm text-slate-300">Configura rol, contacto y disponibilidad del miembro del equipo desde una sola vista.</div>
          </div>

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
            <select formControlName="role" class="w-full p-2 border border-gray-300 rounded bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600">
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
            <input type="date" formControlName="hire_date" class="w-full p-2 border border-gray-300 rounded bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600">
          </div>

          <div *ngIf="isServiceAssignableRole(formulario.get('role')?.value)">
            <label class="block font-medium mb-1">Servicios que puede realizar</label>
            <p-multiSelect
              formControlName="service_ids"
              [options]="servicesOptions"
              appendTo="body"
              optionLabel="label"
              optionValue="value"
              defaultLabel="Seleccionar servicios"
              class="w-full"
              display="chip"
              [filter]="true"
            ></p-multiSelect>
            <small class="block mt-1 text-slate-500 dark:text-slate-400">
              Estos servicios determinan si el empleado aparecerá disponible en el módulo de citas.
            </small>
          </div>

          <div *ngIf="!isServiceAssignableRole(formulario.get('role')?.value)" class="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-500 dark:text-slate-400">
            Este rol no atiende citas, por lo que no necesita servicios asignados.
          </div>

          <div class="flex items-center">
            <p-checkbox formControlName="is_active" [binary]="true" inputId="activo"></p-checkbox>
            <label for="activo" class="ml-2 font-medium">Empleado Activo</label>
          </div>

          <div class="flex justify-end gap-2 mt-2">
            <button pButton label="Cancelar" type="button" class="p-button-text"
                    (click)="cerrarDialogo()" [disabled]="guardando()"></button>
            <button pButton [label]="empleadoSeleccionado ? 'Actualizar' : 'Crear'"
                    type="button" icon="pi pi-check" [loading]="guardando()"
                    [disabled]="formulario.invalid" (click)="guardarEmpleado()"></button>
          </div>
        </div>
      </p-dialog>

      <p-dialog
        header="Límite del plan alcanzado"
        [(visible)]="mostrarDialogoLimitePlan"
        [modal]="true"
        [style]="{width: '32rem'}"
        [draggable]="false"
        [resizable]="false">
        <div class="flex items-start gap-3">
          <i class="pi pi-lock text-amber-500 text-xl mt-1"></i>
          <div>
            <div class="font-semibold text-slate-900 dark:text-white">{{ tituloDialogoLimitePlan }}</div>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ mensajeDialogoLimitePlan }}</p>
            <div *ngIf="recomendacionUpgradePlan" class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
              <div class="font-semibold">Plan recomendado: {{ recomendacionUpgradePlan.nextPlanName }}</div>
              <p class="mt-1 mb-0">{{ recomendacionUpgradePlan.reason }}</p>
              <p class="mt-1 mb-0 opacity-90">{{ recomendacionUpgradePlan.detail }}</p>
            </div>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <button pButton label="Entendido" icon="pi pi-check" (click)="mostrarDialogoLimitePlan = false"></button>
        </ng-template>
      </p-dialog>

      <!-- Diálogo de Configuración de Nómina -->
      <p-dialog header="Configuración de nómina"
                [(visible)]="mostrarConfigNomina" [modal]="true" [style]="{width: '680px'}"
                styleClass="shadow-2xl"
                [closable]="true">
        <div class="p-4" *ngIf="empleadoDetalle">
          <div [formGroup]="formularioNomina" class="grid gap-4">
            <div class="rounded-2xl bg-slate-950 p-4 text-white">
              <div class="text-[11px] uppercase tracking-[0.24em] text-slate-400">Compensación</div>
              <div class="mt-2 text-xl font-black">{{ getSelectedEmployeeDisplayName() }}</div>
              <div class="mt-2 text-sm text-slate-300">Define modalidad de pago, frecuencia y descuentos legales del colaborador.</div>
            </div>
            <div>
              <label class="block font-medium mb-1">Tipo de Pago</label>
              <select formControlName="salary_type" class="w-full p-2 border border-gray-300 rounded bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600">
                <option value="fixed">Sueldo Fijo</option>
                <option value="commission">Comisión</option>
                <option value="mixed">Mixto</option>
              </select>
            </div>
            <div>
              <label class="block font-medium mb-1">Frecuencia de Pago</label>
              <select formControlName="payment_frequency" class="w-full p-2 border border-gray-300 rounded bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600">
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>
            <div>
              <label class="block font-medium mb-1">Porcentaje Comisión (%)</label>
              <input type="number" formControlName="commission_percentage" min="0" max="100"
                     class="w-full p-2 border border-gray-300 rounded bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600">
            </div>
            <div>
              <label class="block font-medium mb-1">Salario Mensual ({{ currencySymbol() }})</label>
              <input type="number" formControlName="contractual_monthly_salary" min="0"
                     class="w-full p-2 border border-gray-300 rounded bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600">
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
          </div>
        </div>
      </p-dialog>

      <!-- Diálogo de Préstamos -->
      <p-dialog header="Préstamos - {{empleadoDetalle?.user?.full_name}}"
                [(visible)]="mostrarPrestamos" [modal]="true" [style]="{width: '90vw', maxWidth: '1000px'}"
                styleClass="shadow-2xl"
                [closable]="true">
        <div class="p-4" *ngIf="empleadoDetalle">

          <!-- Resumen de Préstamos -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" *ngIf="!cargandoResumenPrestamos()">
            <p-card>
              <div class="text-center">
                <div class="text-2xl font-bold text-slate-700 dark:text-slate-300">{{resumenPrestamos()?.active_loans || 0}}</div>
                <div class="text-sm text-slate-600 dark:text-slate-400">Préstamos Activos</div>
              </div>
            </p-card>
            <p-card>
              <div class="text-center">
                <div class="text-2xl font-bold text-indigo-600">
                  {{ (resumenPrestamos()?.total_amount || 0) | appCurrency:'1.2-2' }}
                </div>
                <div class="text-sm text-slate-600 dark:text-slate-400">Total Prestado</div>
              </div>
            </p-card>
            <p-card>
              <div class="text-center">
                <div class="text-2xl font-bold text-indigo-600">
                  {{ (resumenPrestamos()?.remaining_balance || 0) | appCurrency:'1.2-2' }}
                </div>
                <div class="text-sm text-slate-600 dark:text-slate-400">Saldo Pendiente</div>
              </div>
            </p-card>
            <p-card>
              <div class="text-center">
                <div class="text-2xl font-bold text-indigo-600">
                  {{ (resumenPrestamos()?.next_deduction || 0) | appCurrency:'1.2-2' }}
                </div>
                <div class="text-sm text-slate-600 dark:text-slate-400">Próxima Deducción</div>
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
                    {{ loan.amount | appCurrency:'1.2-2' }}
                  </span>
                </td>
                <td>{{loan.installments}}</td>
                <td>
                  <span class="font-medium">
                    {{ loan.monthly_payment | appCurrency:'1.2-2' }}
                  </span>
                </td>
                <td>
                  <span class="font-bold" [class]="loan.remaining_balance > 0 ? 'text-orange-600' : 'text-green-600'">
                    {{ loan.remaining_balance | appCurrency:'1.2-2' }}
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
      <p-dialog header="Nuevo préstamo - {{empleadoDetalle?.user?.full_name}}"
                [(visible)]="mostrarNuevoPrestamo" [modal]="true" [style]="{width: '560px'}"
                styleClass="shadow-2xl"
                [closable]="!guardandoPrestamo()" [closeOnEscape]="!guardandoPrestamo()">
        <div [formGroup]="formularioPrestamo" class="grid gap-4">
          <div class="rounded-2xl bg-slate-950 p-4 text-white">
            <div class="text-[11px] uppercase tracking-[0.24em] text-slate-400">Financiamiento interno</div>
            <div class="mt-2 text-xl font-black">Crear préstamo</div>
            <div class="mt-2 text-sm text-slate-300">Registra monto, cuotas y motivo para mantener el descuento mensual bajo control.</div>
          </div>
          <div>
            <label class="block font-medium mb-1">Tipo de Préstamo *</label>
            <p-select formControlName="loan_type" [options]="loanTypeOptions" appendTo="body"
                        optionLabel="label" optionValue="value" class="w-full"
                        placeholder="Seleccionar tipo"></p-select>
          </div>

          <div>
            <label class="block font-medium mb-1">Monto ({{ currencySymbol() }}) *</label>
            <p-inputNumber formControlName="amount" mode="currency" [currency]="currencyCode()"
                           [locale]="currencyLocale()" class="w-full" [min]="100" [max]="50000"></p-inputNumber>
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
                <span class="font-medium">{{ formularioPrestamo.get('amount')?.value | appCurrency:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between">
                <span>Cuotas:</span>
                <span class="font-medium">{{formularioPrestamo.get('installments')?.value}}</span>
              </div>
              <div class="flex justify-between border-t pt-1">
                <span>Pago mensual:</span>
                <span class="font-bold text-green-600">
                  {{ calcularPagoMensual() | appCurrency:'1.2-2' }}
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
        </div>
      </p-dialog>

      <!-- Diálogo de Historial de Pagos -->
      <p-dialog header="Historial de pagos - {{empleadoDetalle?.user?.full_name}}"
                [(visible)]="mostrarHistorial" [modal]="true" [style]="{width: '90vw', maxWidth: '1200px'}"
                styleClass="shadow-2xl"
                [closable]="true">
        <div class="p-4" *ngIf="empleadoDetalle">

          <!-- Resumen de Estadísticas -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" *ngIf="!cargandoStats()">
            <p-card>
              <div class="text-center">
                <div class="text-2xl font-bold text-slate-700 dark:text-slate-300">{{paymentStats()?.all_time?.total_payments || 0}}</div>
                <div class="text-sm text-slate-600 dark:text-slate-400">Total Pagos</div>
              </div>
            </p-card>
            <p-card>
              <div class="text-center">
                <div class="text-2xl font-bold text-indigo-600">
                  {{ (paymentStats()?.all_time?.total_net || 0) | appCurrency:'1.2-2' }}
                </div>
                <div class="text-sm text-slate-600 dark:text-slate-400">Total Pagado</div>
              </div>
            </p-card>
            <p-card>
              <div class="text-center">
                <div class="text-2xl font-bold text-indigo-600">
                  {{ (paymentStats()?.all_time?.average_payment || 0) | appCurrency:'1.2-2' }}
                </div>
                <div class="text-sm text-slate-600 dark:text-slate-400">Promedio por Pago</div>
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
                  {{ paymentStats()?.last_payment?.amount | appCurrency:'1.2-2' }}
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
                      {{ payment.gross_amount | appCurrency:'1.2-2' }}
                    </span>
                  </td>
                  <td>
                    <span class="text-red-600">
                      {{ payment.total_deductions | appCurrency:'1.2-2' }}
                    </span>
                  </td>
                  <td>
                    <span class="font-bold text-green-600">
                      {{ payment.net_amount | appCurrency:'1.2-2' }}
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
      <p-dialog header="Recibo de pago" [(visible)]="mostrarRecibo" [modal]="true"
                [style]="{width: '860px'}" [closable]="true" styleClass="shadow-2xl">
        <div class="recibo-container rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4" *ngIf="reciboActual()">
          <!-- Header del recibo -->
          <div class="text-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{reciboActual()?.company?.name}}</h2>
            <p class="text-slate-600 dark:text-slate-300">{{reciboActual()?.company?.address}}</p>
            <p class="text-slate-600 dark:text-slate-300">{{reciboActual()?.company?.phone}}</p>
            <h3 class="text-xl font-semibold mt-4 text-sky-600 dark:text-sky-400">RECIBO DE PAGO</h3>
          </div>

          <!-- Información del empleado y período -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 class="font-semibold text-slate-800 dark:text-slate-200 mb-2">Empleado:</h4>
              <p class="font-medium">{{reciboActual()?.employee?.name}}</p>
              <p class="text-sm text-slate-600 dark:text-slate-300">{{reciboActual()?.employee?.email}}</p>
            </div>
            <div>
              <h4 class="font-semibold text-slate-800 dark:text-slate-200 mb-2">Período:</h4>
              <p class="font-medium">{{reciboActual()?.period?.display}}</p>
              <p class="text-sm text-slate-600 dark:text-slate-300">
                {{reciboActual()?.period?.start_date | date:'dd/MM/yyyy'}} -
                {{reciboActual()?.period?.end_date | date:'dd/MM/yyyy'}}
              </p>
            </div>
          </div>

          <!-- Detalle de montos -->
          <div class="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
            <h4 class="font-semibold text-slate-800 dark:text-slate-200 mb-4">Detalle de Pago:</h4>

            <div class="space-y-2">
              <div class="flex justify-between">
                <span>Monto Bruto:</span>
                <span class="font-medium">
                  {{ reciboActual()?.amounts?.gross_amount | appCurrency:'1.2-2' }}
                </span>
              </div>

              <div class="border-t pt-2">
                <p class="font-medium text-slate-700 dark:text-slate-200 mb-2">Descuentos:</p>
                <div class="ml-4 space-y-1 text-sm">
                  <div class="flex justify-between" *ngIf="reciboActual()?.amounts?.deductions?.afp && (reciboActual()?.amounts?.deductions?.afp ?? 0) > 0">
                    <span>AFP (2.87%):</span>
                    <span>-{{ reciboActual()?.amounts?.deductions?.afp | appCurrency:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between" *ngIf="reciboActual()?.amounts?.deductions?.sfs && (reciboActual()?.amounts?.deductions?.sfs ?? 0) > 0">
                    <span>SFS (3.04%):</span>
                    <span>-{{ reciboActual()?.amounts?.deductions?.sfs | appCurrency:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between" *ngIf="reciboActual()?.amounts?.deductions?.isr && (reciboActual()?.amounts?.deductions?.isr ?? 0) > 0">
                    <span>ISR:</span>
                    <span>-{{ reciboActual()?.amounts?.deductions?.isr | appCurrency:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between" *ngIf="reciboActual()?.amounts?.deductions?.loans && (reciboActual()?.amounts?.deductions?.loans ?? 0) > 0">
                    <span>Préstamos:</span>
                    <span>-{{ reciboActual()?.amounts?.deductions?.loans | appCurrency:'1.2-2' }}</span>
                  </div>
                </div>
                <div class="flex justify-between font-medium border-t pt-1 mt-2">
                  <span>Total Descuentos:</span>
                  <span>-{{ reciboActual()?.amounts?.deductions?.total | appCurrency:'1.2-2' }}</span>
                </div>
              </div>

              <div class="border-t pt-2 flex justify-between text-lg font-bold text-green-700 dark:text-emerald-400">
                <span>Monto Neto:</span>
                <span>{{ reciboActual()?.amounts?.net_amount | appCurrency:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <!-- Información del pago -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 class="font-semibold text-slate-800 dark:text-slate-200 mb-2">Información del Pago:</h4>
              <p><strong>Método:</strong> {{reciboActual()?.payment_info?.method}}</p>
              <p><strong>Referencia:</strong> {{reciboActual()?.payment_info?.reference}}</p>
            </div>
            <div>
              <h4 class="font-semibold text-slate-800 dark:text-slate-200 mb-2">Fecha y Responsable:</h4>
              <p><strong>Fecha:</strong> {{reciboActual()?.payment_info?.paid_at | date:'dd/MM/yyyy HH:mm'}}</p>
              <p><strong>Pagado por:</strong> {{reciboActual()?.payment_info?.paid_by}}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center text-sm text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 pt-4">
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
  private settingsService = inject(SettingsService);
  private employeeService = inject(EmployeeService);
  private serviceService = inject(ServiceService);
  private authService = inject(AuthService);
  private planAccessService = inject(PlanAccessService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  empleados = signal<EmployeeWithUserDto[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  mostrarDialogo = false;
  mostrarDialogoLimitePlan = false;
  tituloDialogoLimitePlan = 'Límite del plan alcanzado';
  mensajeDialogoLimitePlan = '';
  recomendacionUpgradePlan: ReturnType<PlanAccessService['getUpgradeRecommendation']> = null;
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
  currencyCode = computed(() => this.settingsService.settings().currency || 'DOP');
  currencyLocale = computed(() => this.settingsService.getCurrencyLocale());
  currencySymbol = computed(() => this.settingsService.getCurrencySymbol() || 'RD$');

  getActiveEmployeesCount(): number {
    return this.empleados().filter((emp) => emp.is_active).length;
  }

  getInactiveEmployeesCount(): number {
    return this.empleados().filter((emp) => !emp.is_active).length;
  }

  getServiceAssignableCount(): number {
    return this.empleados().filter((emp) => this.isServiceAssignableRole(emp.user.role)).length;
  }

  getEmployeesNarrative(): string {
    const total = this.empleados().length;
    const active = this.getActiveEmployeesCount();
    const assignable = this.getServiceAssignableCount();

    if (!total) {
      return 'Aun no hay miembros registrados en el equipo. Agrega tu primer empleado para comenzar a organizar operaciones y servicios.';
    }

    return `${active} de ${total} colaboradores estan activos y ${assignable} pueden atender servicios o citas. Usa esta vista para mantener roles, especialidades y disponibilidad bajo control.`;
  }

  getSelectedEmployeeDisplayName(): string {
    return this.empleadoDetalle?.user?.full_name || 'Colaborador';
  }

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
    service_ids: [[]],
    is_active: [true]
  });

  servicesOptions: Array<{ label: string; value: number }> = [];

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
      service_ids: empleadoBackend?.service_ids || [],
      services_count: empleadoBackend?.services_count || 0,
      created_at: empleadoBackend?.created_at || '',
      display_name: `${usuarioBackend.full_name || usuarioBackend.email || 'Sin nombre'} (${usuarioBackend.role || 'Sin rol'})`
    };
  }

  ngOnInit() {
    this.cargarDatos();
    this.cargarServicios();
    this.cargarConfiguracionDefecto();
    this.formularioNomina.get('salary_type')?.valueChanges.subscribe((salaryType) => {
      this.syncPayrollFieldsByType(salaryType);
    });
    this.syncPayrollFieldsByType(this.formularioNomina.get('salary_type')?.value);
  }

  async cargarServicios() {
    try {
      const response = await this.serviceService.getActiveServices().toPromise();
      const services = (response as any)?.results || response || [];
      this.servicesOptions = services.map((service: any) => ({
        label: `${service.name} - ${this.formatearMoneda(service.price)}`,
        value: service.id
      }));
    } catch {
      this.servicesOptions = [];
    }
  }

  formatearMoneda(valor: number | string | null | undefined): string {
    const amount = Number(valor) || 0;
    return new Intl.NumberFormat(this.currencyLocale(), {
      style: 'currency',
      currency: this.currencyCode()
    }).format(amount);
  }

  async cargarConfiguracionDefecto() {
    try {
      const config = await this.settingsService.getBarbershopSettings().toPromise();
      this.formularioNomina.patchValue({
        commission_percentage: (config as any)?.default_commission_rate || 40,
        contractual_monthly_salary: (config as any)?.default_fixed_salary || 0
      });
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
          service_ids: emp.service_ids || [],
          services_count: emp.services_count || 0,
          created_at: emp.created_at,
          display_name: `${emp.user.full_name || emp.user.email || 'Sin nombre'} (${emp.user.role || 'Sin rol'})`
        };
      });

      this.empleados.set(empleadosFusionados);
    } catch (error) {
      if (!environment.production) {
        
      }
      let detail = 'No se pudieron cargar los empleados';
      const backendError = (error as any)?.error;
      if (typeof backendError?.detail === 'string' && backendError.detail.trim()) {
        detail = backendError.detail;
      } else if (typeof backendError?.error === 'string' && backendError.error.trim()) {
        detail = backendError.error;
      } else if ((error as any)?.status === 403) {
        detail = 'No tienes permisos para consultar los empleados de este tenant.';
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail
      });
    } finally {
      this.cargando.set(false);
    }
  }

  async abrirDialogo() {
    await this.sincronizarEmpleadosAntesDeCrear();

    const limitStatus = this.planAccessService.getEmployeeLimitStatus(this.getActiveEmployeesCount());
    if (limitStatus.reached) {
      this.abrirDialogoLimitePlan(
        'No se puede crear el empleado',
        this.planAccessService.getEmployeeLimitMessage(limitStatus)
      );
      return;
    }

    this.empleadoSeleccionado = null;
    this.formulario.reset({
      full_name: '',
      email: '',
      password: '',
      role: 'Client-Staff',
      specialty: '',
      phone: '',
      hire_date: new Date(),
      service_ids: [],
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
      service_ids: emp.service_ids || [],
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

    if (!this.empleadoSeleccionado) {
      const employeeLimitStatus = this.planAccessService.getEmployeeLimitStatus(this.getActiveEmployeesCount());
      if (employeeLimitStatus.reached) {
        const message = this.planAccessService.getEmployeeLimitMessage(employeeLimitStatus);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: message
        });
        this.abrirDialogoLimitePlan('No se puede crear el empleado', message);
        return;
      }
    }

    this.guardando.set(true);
    const formData = this.formulario.value;
    const serviceIds = this.isServiceAssignableRole(formData.role) ? (formData.service_ids || []) : [];

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

          
          // Usar PATCH en lugar de PUT para evitar problemas con campos no permitidos
          await this.employeeService.patchEmployee(this.empleadoSeleccionado.id, updateData).toPromise();
          await this.employeeService.assignServices(this.empleadoSeleccionado.id, serviceIds).toPromise();
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
        
        const nuevoEmpleado = await this.esperarEmpleadoPorUsuario((newUser as any).id);
        
        if (nuevoEmpleado && nuevoEmpleado.id > 0) {
          const updateData = {
            specialty: formData.specialty || undefined,
            phone: formData.phone || undefined,
            hire_date: formData.hire_date ? new Date(formData.hire_date).toISOString().split('T')[0] : undefined,
            is_active: formData.is_active
          };
          await this.employeeService.patchEmployee(nuevoEmpleado.id, updateData).toPromise();
          await this.employeeService.assignServices(nuevoEmpleado.id, serviceIds).toPromise();
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
        
        
      }

      const isUpdate = !!this.empleadoSeleccionado;
      let errorMessage = isUpdate
        ? 'No se pudo actualizar el empleado'
        : 'No se pudo crear el empleado';
      const planLimitMessage = this.buildPlanLimitErrorMessage(error);

      // Detectar límite de usuarios
      if (planLimitMessage) {
        errorMessage = planLimitMessage;
      } else if (error?.error?.current !== undefined && error?.error?.limit !== undefined) {
        errorMessage = `Límite de usuarios alcanzado (${error.error.current}/${error.error.limit}). Actualiza tu plan para agregar más usuarios.`;
      } else if (error?.error?.error && error.error.error.includes('User limit reached')) {
        errorMessage = `Límite de usuarios alcanzado. Actualiza tu plan para agregar más usuarios.`;
      } else if (error?.error?.error && String(error.error.error).toLowerCase().includes('employee limit')) {
        const limitStatus = this.planAccessService.getEmployeeLimitStatus(this.getActiveEmployeesCount());
        errorMessage = limitStatus.reached
          ? this.planAccessService.getEmployeeLimitMessage(limitStatus)
          : 'Has alcanzado un límite operativo de tu plan. Actualiza tu plan para seguir agregando personal.';
      } else if (error?.error?.detail) {
        errorMessage = error.error.detail;
      } else if (error?.error?.error) {
        errorMessage = error.error.error;
      } else if (error.status === 403) {
        errorMessage = isUpdate
          ? 'No tienes permisos para actualizar este empleado.'
          : 'No tienes permisos para crear usuarios. Verifica tu plan de suscripción.';
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      }

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage
      });

      if (!isUpdate && this.isPlanLimitMessage(errorMessage)) {
        this.abrirDialogoLimitePlan('No se puede crear el empleado', errorMessage);
      }
    } finally {
      this.guardando.set(false);
    }
  }

  private abrirDialogoLimitePlan(titulo: string, mensaje: string) {
    this.tituloDialogoLimitePlan = titulo;
    this.mensajeDialogoLimitePlan = mensaje;
    this.recomendacionUpgradePlan = this.planAccessService.getUpgradeRecommendation('employees');
    this.mostrarDialogoLimitePlan = true;
  }

  private async sincronizarEmpleadosAntesDeCrear(): Promise<void> {
    try {
      const data = await firstValueFrom(this.employeeService.getEmployees());
      const responseEmployees = (Array.isArray((data as any)?.results) ? (data as any).results : (Array.isArray(data) ? data : [])) as EmployeeWithUserDto[];
      this.empleados.set(responseEmployees);
    } catch {
      // Si falla el refresh, usamos el estado local como fallback.
    }
  }

  private buildPlanLimitErrorMessage(error: any): string | null {
    const payload = error?.error;
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const rawError = this.normalizeBackendErrorValue(payload.error);
    const rawMessage = this.normalizeBackendErrorValue(payload.message);
    const rawCurrent = this.normalizeBackendErrorValue(payload.current);
    const rawLimit = this.normalizeBackendErrorValue(payload.limit);

    if (rawError.includes('Límite de empleados alcanzado')) {
      if (rawCurrent && rawLimit) {
        return `Límite de empleados alcanzado (${rawCurrent}/${rawLimit}). Actualiza tu plan para agregar más personal.`;
      }
      return rawMessage || 'Límite de empleados alcanzado. Actualiza tu plan para agregar más personal.';
    }

    if (rawError.includes('User limit reached')) {
      if (rawCurrent && rawLimit) {
        return `Límite de usuarios alcanzado (${rawCurrent}/${rawLimit}). Actualiza tu plan para agregar más usuarios.`;
      }
      return rawMessage || 'Límite de usuarios alcanzado. Actualiza tu plan para agregar más usuarios.';
    }

    return null;
  }

  private normalizeBackendErrorValue(value: unknown): string {
    if (Array.isArray(value)) {
      return value.map((item) => this.normalizeBackendErrorValue(item)).filter(Boolean).join(' ');
    }

    if (value && typeof value === 'object') {
      const maybeString = (value as { string?: unknown }).string;
      if (typeof maybeString === 'string') {
        return maybeString;
      }
    }

    return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  }

  private isPlanLimitMessage(message: string): boolean {
    const normalized = String(message || '').toLowerCase();
    return normalized.includes('límite de usuarios alcanzado')
      || normalized.includes('límite de empleados alcanzado')
      || normalized.includes('actualiza tu plan');
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
    } catch (error: any) {
      if (!environment.production) {
        
      }

      // Si ya no existe en backend, considerar operación idempotente exitosa.
      if (error?.status === 404) {
        this.empleados.update(lista => lista.filter(e => e.user_id !== emp.user_id));
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'El empleado ya había sido eliminado'
        });
        return;
      }

      // Fallback: si el backend bloquea borrado físico por integridad/relaciones,
      // desactivar el usuario para no romper la operación.
      if (error?.status === 400 || error?.status === 409) {
        try {
          await this.authService.updateUser(emp.user_id, { is_active: false } as any).toPromise();

          if (emp.id > 0) {
            await this.employeeService.patchEmployee(emp.id, { is_active: false } as any).toPromise();
          }

          this.empleados.update(lista =>
            lista.map(e =>
              e.user_id === emp.user_id
                ? { ...e, is_active: false, user: { ...e.user, is_active: false } }
                : e
            )
          );

          this.messageService.add({
            severity: 'warn',
            summary: 'Empleado desactivado',
            detail: 'No se pudo eliminar por historial relacionado. Se desactivó el usuario.'
          });
          return;
        } catch {
          // Si también falla desactivar, mostrar error original
        }
      }

      const backendMessage =
        error?.error?.error ||
        error?.error?.detail ||
        error?.error?.message ||
        'No se pudo eliminar el empleado';

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: backendMessage
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

  getAssignedServicesPreview(emp: EmployeeWithUserDto): string {
    const ids = emp.service_ids || [];
    if (!ids.length) {
      return 'Sin servicios asignados';
    }

    const names = ids
      .map(id => this.servicesOptions.find(service => service.value === id)?.label?.split(' - $')[0])
      .filter((name): name is string => !!name);

    if (!names.length) {
      return `${ids.length} servicio(s) asignado(s)`;
    }

    const preview = names.slice(0, 2).join(', ');
    return names.length > 2 ? `${preview} y ${names.length - 2} más` : preview;
  }

  cerrarDialogo() {
    this.mostrarDialogo = false;
    this.empleadoSeleccionado = null;
    this.formulario.reset();
  }

  isServiceAssignableRole(role: string | null | undefined): boolean {
    return role === 'Estilista' || role === 'Utility';
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
        // Mapear nombres del backend a nombres del formulario
        this.formularioNomina.patchValue({
          salary_type: config.payment_type || 'commission',
          contractual_monthly_salary: config.fixed_salary || 0,
          commission_percentage: config.commission_rate || 40
        });
        this.syncPayrollFieldsByType(config.payment_type || 'commission');
      }
    } catch (error) {
      if (!environment.production) {
        
      }
    }
  }

  async guardarConfigNomina() {
    if (!this.empleadoDetalle?.id || this.formularioNomina.invalid) return;

    this.guardandoNomina.set(true);
    try {
      // Mapear nombres del formulario a nombres del backend
      const backendData = {
        payment_type: this.formularioNomina.get('salary_type')?.value,
        fixed_salary: this.formularioNomina.get('contractual_monthly_salary')?.value || 0,
        commission_rate: this.formularioNomina.get('commission_percentage')?.value || 0
      };

      await this.employeeService.updatePayrollConfig(this.empleadoDetalle.id, backendData).toPromise();

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

  private syncPayrollFieldsByType(salaryType: string | null | undefined) {
    const commissionControl = this.formularioNomina.get('commission_percentage');
    const salaryControl = this.formularioNomina.get('contractual_monthly_salary');

    if (!commissionControl || !salaryControl) {
      return;
    }

    if (salaryType === 'fixed') {
      commissionControl.disable({ emitEvent: false });
      salaryControl.enable({ emitEvent: false });
      return;
    }

    if (salaryType === 'commission') {
      salaryControl.disable({ emitEvent: false });
      commissionControl.enable({ emitEvent: false });
      return;
    }

    commissionControl.enable({ emitEvent: false });
    salaryControl.enable({ emitEvent: false });
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

  private async esperarEmpleadoPorUsuario(userId: number, maxAttempts = 6, delayMs = 250): Promise<EmployeeWithUserDto | null> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const employee = await firstValueFrom(this.employeeService.getEmployeeByUserId(userId)) as any;
        if (employee?.id) {
          return employee as EmployeeWithUserDto;
        }
      } catch (error: any) {
        if (error?.status !== 404) {
          throw error;
        }
      }

      if (attempt < maxAttempts - 1) {
        await this.delay(delayMs);
      }
    }

    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
