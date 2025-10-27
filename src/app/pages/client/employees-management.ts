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
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { EmployeeService, Employee, UpdateEmployeeRequest } from '../../core/services/employee/employee.service';
import { AuthService, User } from '../../core/services/auth/auth.service';

interface EmployeeWithUser {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  specialty: string;
  phone: string;
  hire_date: string;
  is_active: boolean;
  created_at: string;
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
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Gestión de Empleados</h2>
        <div class="flex gap-2">
          <button pButton icon="pi pi-refresh" (click)="cargarDatos()"
                  [loading]="cargando()" class="p-button-outlined"></button>
          <button pButton label="Nuevo Empleado" icon="pi pi-plus"
                  (click)="abrirDialogo()"></button>
        </div>
      </div>

      <p-table [value]="empleados()" [loading]="cargando()"
               [globalFilterFields]="['full_name', 'email', 'specialty']"
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
            <td>{{emp.full_name}}</td>
            <td>{{emp.email}}</td>
            <td>
              <p-tag [value]="getRoleDisplayName(emp.role)"
                     [severity]="getRoleSeverity(getRoleDisplayName(emp.role))"></p-tag>
            </td>
            <td>{{emp.specialty || 'N/A'}}</td>
            <td>{{emp.phone || 'N/A'}}</td>
            <td>{{emp.hire_date | date:'dd/MM/yyyy'}}</td>
            <td>
              <p-tag [value]="emp.is_active ? 'Activo' : 'Inactivo'"
                     [severity]="emp.is_active ? 'success' : 'danger'"></p-tag>
            </td>
            <td>
              <div class="flex gap-1">
                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                        (click)="editarEmpleado(emp)" pTooltip="Editar"></button>
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

  empleados = signal<EmployeeWithUser[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  mostrarDialogo = false;
  empleadoSeleccionado: EmployeeWithUser | null = null;
  fechaMaxima = new Date();

  rolesOptions = [
    { label: 'Estilista', value: 'Estilista' },
    { label: 'Cajera', value: 'Cajera' },
    { label: 'Manager', value: 'Manager' },
    { label: 'Utility', value: 'Utility' }
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

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando.set(true);
    try {
      const [empleadosRes, usuariosRes] = await Promise.all([
        this.employeeService.getEmployees().toPromise(),
        this.authService.getUsers().toPromise()
      ]);

      const empleados = (empleadosRes as any)?.results || [];
      const usuarios = (usuariosRes as any)?.results || usuariosRes || [];

      // Filtrar solo usuarios que son empleados (excluir Client-Admin)
      const usuariosEmpleados = usuarios.filter((u: any) => 
        u.role && ['Estilista', 'Cajera', 'Manager', 'Utility'].includes(u.role)
      );

      // Crear lista basada en usuarios empleados
      const empleadosFusionados: EmployeeWithUser[] = usuariosEmpleados.map((usuario: any) => {
        const emp = empleados.find((e: Employee) => e.user_id_read === usuario.id);
        return {
          id: emp?.id || 0,
          user_id: usuario.id,
          full_name: usuario.full_name || 'N/A',
          email: usuario.email || 'N/A',
          role: usuario.role || 'N/A',
          specialty: emp?.specialty || '',
          phone: emp?.phone || '',
          hire_date: emp?.hire_date || '',
          is_active: emp?.is_active ?? true,
          created_at: emp?.created_at || ''
        };
      });

      this.empleados.set(empleadosFusionados);
    } catch (error) {
      console.error('Error cargando datos:', error);
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

  editarEmpleado(emp: EmployeeWithUser) {
    this.empleadoSeleccionado = emp;
    this.formulario.patchValue({
      full_name: emp.full_name,
      email: emp.email,
      role: emp.role,
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

        // Si tiene registro Employee (id > 0), actualizar; si no, crear
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
        } else {
          // Crear registro Employee para usuario existente
          const createData: any = {
            user_id: this.empleadoSeleccionado.user_id,
            specialty: formData.specialty || '',
            phone: formData.phone || '',
            is_active: formData.is_active
          };
          
          if (formData.hire_date) {
            createData.hire_date = new Date(formData.hire_date).toISOString().split('T')[0];
          }
          
          await this.employeeService.createEmployee(createData).toPromise();
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empleado actualizado correctamente'
        });
      } else {
        try {
          // Crear usuario
          const nuevoUsuario = await this.authService.createUser({
            email: formData.email,
            full_name: formData.full_name,
            password: formData.password,
            role: formData.role,
            tenant: this.authService.getTenantId()
          } as any).toPromise();

          // Crear empleado
          await this.employeeService.createEmployee({
            user_id: (nuevoUsuario as any).id,
            specialty: formData.specialty,
            phone: formData.phone,
            hire_date: formData.hire_date ?
              new Date(formData.hire_date).toISOString().split('T')[0] : undefined,
            is_active: formData.is_active
          } as any).toPromise();
        } catch (userError: any) {
          // Si el usuario se creó pero devolvió 403, intentar crear empleado
          if (userError.status === 403) {
            // Recargar usuarios para obtener el recién creado
            const usuariosRes = await this.authService.getUsers().toPromise();
            const usuarios = (usuariosRes as any)?.results || usuariosRes || [];
            const usuarioCreado = usuarios.find((u: any) => u.email === formData.email);
            
            if (usuarioCreado) {
              // Crear empleado con el usuario encontrado
              await this.employeeService.createEmployee({
                user_id: usuarioCreado.id,
                specialty: formData.specialty,
                phone: formData.phone,
                hire_date: formData.hire_date ?
                  new Date(formData.hire_date).toISOString().split('T')[0] : undefined,
                is_active: formData.is_active
              } as any).toPromise();
            } else {
              throw userError;
            }
          } else {
            throw userError;
          }
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
      console.error('Error guardando empleado:', error);
      console.error('Error details:', error.error);
      
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

  confirmarEliminar(emp: EmployeeWithUser) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al empleado ${emp.full_name}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.eliminarEmpleado(emp)
    });
  }

  async eliminarEmpleado(emp: EmployeeWithUser) {
    try {
      // Solo eliminar registro Employee si existe (id > 0)
      if (emp.id > 0) {
        await this.employeeService.deleteEmployee(emp.id).toPromise();
      }
      
      // Eliminar usuario
      await this.authService.deleteUser(emp.user_id).toPromise();
      
      this.empleados.update(lista => lista.filter(e => e.user_id !== emp.user_id));
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Empleado eliminado correctamente'
      });
    } catch (error) {
      console.error('Error eliminando empleado:', error);
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
}
