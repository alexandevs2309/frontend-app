import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EmployeeService, Employee } from '../../core/services/employee/employee.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router } from '@angular/router';

interface EmpleadoUI {
  id: number;
  nombre: string;
  full_name?: string;
  email: string;
  cargo: string;
  telefono: string;
  fechaContratacion: string;
  estado: 'Activo' | 'Inactivo';
  especialidad?: string;
}

interface Usuario {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
}

@Component({
  selector: 'app-employees-managements',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    DialogModule,
    InputTextModule,
    CardModule,
    TagModule,
    SelectModule,
    InputNumberModule,
    ToastModule,
    DatePickerModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="p-6">
      <p-card header="Gestión de Empleados" class="shadow-md">
        <p-toolbar class="mb-4">
          <div class="p-toolbar-group-left flex gap-2">
            <button
              pButton
              label="Nuevo"
              icon="pi pi-plus"
              class="p-button-success"
              (click)="abrirDialogo()"
            ></button>
          </div>
          <div class="p-toolbar-group-right">
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                [(ngModel)]="filtroGlobal"
                placeholder="Buscar empleado"
              />
            </span>
          </div>
        </p-toolbar>

        <p-table
          [value]="empleados()"
          [paginator]="true"
          [rows]="10"
          [loading]="cargando()"
          [globalFilterFields]="['nombre','email','cargo','telefono']"
          [filters]="{ global: { value: filtroGlobal, matchMode: 'contains' } }"
          class="shadow-sm rounded-lg"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="nombre">
                Nombre
                <p-sortIcon field="nombre"></p-sortIcon>
              </th>
              <th>Email</th>
              <th>Cargo/Especialidad</th>
              <th>Teléfono</th>
              <th>Fecha Contratación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-emp>
            <tr>
              <td>{{ emp.full_name }}</td>
              <td>{{ emp.email }}</td>
              <td>
                <div>{{ emp.cargo }}</div>
                <small class="text-gray-500" *ngIf="emp.especialidad">{{ emp.especialidad }}</small>
              </td>
              <td>{{ emp.telefono }}</td>
              <td>{{ emp.fechaContratacion | date:'dd/MM/yyyy' }}</td>
              <td>
                <p-tag
                  [value]="emp.estado"
                  [severity]="emp.estado === 'Activo' ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td class="flex gap-2">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-warning p-button-sm"
                  (click)="editarEmpleado(emp)"
                  pTooltip="Editar"
                ></button>
                <button
                  pButton
                  icon="pi pi-calendar"
                  class="p-button-rounded p-button-info p-button-sm"
                  (click)="gestionarHorarios(emp)"
                  pTooltip="Horarios"
                ></button>
                <button
                  pButton
                  icon="pi pi-cog"
                  class="p-button-rounded p-button-secondary p-button-sm"
                  (click)="gestionarServicios(emp)"
                  pTooltip="Servicios"
                ></button>
                <button
                  pButton
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger p-button-sm"
                  (click)="confirmarEliminar(emp)"
                  pTooltip="Eliminar"
                ></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- Diálogo de formulario -->
      <p-dialog
        [(visible)]="mostrarDialogo"
        [modal]="true"
        [style]="{ width: '500px' }"
        [draggable]="false"
        [resizable]="false"
        header="{{ empleadoSeleccionado ? 'Editar Empleado' : 'Nuevo Empleado' }}"
      >
        <form [formGroup]="formularioEmpleado" class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 font-medium text-sm">Nombre *</label>
              <input 
                pInputText 
                formControlName="nombre" 
                class="w-full"
                [class.ng-invalid]="formularioEmpleado.get('nombre')?.invalid && formularioEmpleado.get('nombre')?.touched"
              />
              <small class="text-red-500" *ngIf="formularioEmpleado.get('nombre')?.invalid && formularioEmpleado.get('nombre')?.touched">
                El nombre es requerido
              </small>
            </div>
            <div>
              <label class="block mb-1 font-medium text-sm">Apellido *</label>
              <input 
                pInputText 
                formControlName="apellido" 
                class="w-full"
                [class.ng-invalid]="formularioEmpleado.get('apellido')?.invalid && formularioEmpleado.get('apellido')?.touched"
              />
              <small class="text-red-500" *ngIf="formularioEmpleado.get('apellido')?.invalid && formularioEmpleado.get('apellido')?.touched">
                El apellido es requerido
              </small>
            </div>
          </div>
          
          <div>
            <label class="block mb-1 font-medium text-sm">Email *</label>
            <input 
              pInputText 
              formControlName="email" 
              type="email"
              class="w-full"
              [class.ng-invalid]="formularioEmpleado.get('email')?.invalid && formularioEmpleado.get('email')?.touched"
            />
            <small class="text-red-500" *ngIf="formularioEmpleado.get('email')?.invalid && formularioEmpleado.get('email')?.touched">
              <span *ngIf="formularioEmpleado.get('email')?.errors?.['required']">El email es requerido</span>
              <span *ngIf="formularioEmpleado.get('email')?.errors?.['email']">Formato de email inválido</span>
            </small>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 font-medium text-sm">Teléfono</label>
              <input 
                pInputText 
                formControlName="telefono" 
                class="w-full"
                placeholder="809-123-4567"
              />
            </div>
            <div>
              <label class="block mb-1 font-medium text-sm">Especialidad</label>
              <input 
                pInputText 
                formControlName="especialidad" 
                class="w-full"
                placeholder="Barbero, Estilista, etc."
              />
            </div>
          </div>

          <div>
            <label class="block mb-1 font-medium text-sm">Fecha de Contratación</label>
            <p-datepicker 
              formControlName="fechaContratacion"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              class="w-full"
            ></p-datepicker>
          </div>

          <div>
            <label class="block mb-1 font-medium text-sm">Estado</label>
            <p-select 
              formControlName="estado"
              [options]="estadosEmpleado"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            ></p-select>
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <button
              pButton
              label="Cancelar"
              type="button"
              class="p-button-text"
              (click)="cerrarDialogo()"
            ></button>
            <button
              pButton
              label="Guardar"
              type="button"
              icon="pi pi-check"
              [loading]="guardando()"
              [disabled]="formularioEmpleado.invalid"
              (click)="guardarEmpleado()"
            ></button>
          </div>
        </form>
      </p-dialog>

      <!-- Diálogo de horarios -->
      <p-dialog
        [(visible)]="mostrarDialogHorarios"
        [modal]="true"
        [style]="{ width: '600px' }"
        header="Gestionar Horarios - {{ empleadoSeleccionado?.nombre }}"
      >
        <div class="text-center py-4">
          <i class="pi pi-clock text-4xl text-blue-500 mb-2"></i>
          <p>Funcionalidad de horarios en desarrollo</p>
          <small class="text-gray-500">Próximamente podrás gestionar los horarios de trabajo</small>
        </div>
        <div class="flex justify-end mt-4">
          <button pButton label="Cerrar" (click)="mostrarDialogHorarios = false"></button>
        </div>
      </p-dialog>

      <!-- Diálogo de servicios -->
      <p-dialog
        [(visible)]="mostrarDialogServicios"
        [modal]="true"
        [style]="{ width: '600px' }"
        header="Gestionar Servicios - {{ empleadoSeleccionado?.nombre }}"
      >
        <div class="text-center py-4">
          <i class="pi pi-cog text-4xl text-green-500 mb-2"></i>
          <p>Funcionalidad de servicios en desarrollo</p>
          <small class="text-gray-500">Próximamente podrás asignar servicios a empleados</small>
        </div>
        <div class="flex justify-end mt-4">
          <button pButton label="Cerrar" (click)="mostrarDialogServicios = false"></button>
        </div>
      </p-dialog>
    </div>

    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `,
})
export class EmployeesManagement implements OnInit {
  private employeeService = inject(EmployeeService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  filtroGlobal = '';
  mostrarDialogo = false;
  mostrarDialogHorarios = false;
  mostrarDialogServicios = false;
  empleadoSeleccionado: EmpleadoUI | null = null;

  empleados = signal<EmpleadoUI[]>([]);
  cargando = signal(false);
  guardando = signal(false);

  estadosEmpleado = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  formularioEmpleado: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    especialidad: [''],
    fechaContratacion: [new Date()],
    estado: [true]
  });

  ngOnInit() {
    // Verificar autenticación antes de cargar
    if (!this.authService.getCurrentUser()) {
      this.messageService.add({
        severity: 'error',
        summary: 'No autenticado',
        detail: 'Redirigiendo al login...'
      });
      
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 1500);
      
      return;
    }
    
    this.cargarEmpleados();
  }

  async cargarEmpleados() {
    try {
      this.cargando.set(true);
      
      // Verificar autenticación antes de hacer la llamada
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Sesión requerida',
          detail: 'Debes iniciar sesión para ver los empleados'
        });
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
        
        return;
      }
      
      const userData = JSON.parse(user);
      console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
      console.log('👤 Usuario:', userData);
      console.log('🏢 Tenant ID:', userData.tenant_id);
      
      // Obtener tenant_id del tenant en localStorage si no está en user
      if (!userData.tenant_id) {
        const tenant = localStorage.getItem('tenant');
        if (tenant) {
          const tenantData = JSON.parse(tenant);
          userData.tenant_id = tenantData.id;
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ Tenant ID obtenido del tenant:', tenantData.id);
        } else {
          console.warn('⚠️ No se encontró tenant_id ni tenant en localStorage');
        }
      }
      
      console.log('📡 Haciendo llamada a API employees...');
      const response = await this.employeeService.getEmployees().toPromise();
      console.log('✅ Respuesta recibida:', response);
      
      if (response?.results) {
        const empleadosUI: EmpleadoUI[] = response.results.map((emp: Employee) => ({
          id: emp.id,
          nombre: `${emp.user?.first_name || ''} ${emp.user?.last_name || ''}`.trim(),
          full_name: `${emp.user?.first_name || ''} ${emp.user?.last_name || ''}`.trim(),
          email: emp.user?.email || '',
          cargo: emp.specialty || 'Empleado',
          telefono: emp.phone || '',
          fechaContratacion: emp.hire_date || '',
          estado: emp.is_active ? 'Activo' : 'Inactivo',
          especialidad: emp.specialty
        }));
        
        this.empleados.set(empleadosUI);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `${empleadosUI.length} empleados cargados`
        });
      } else {
        this.empleados.set([]);
        this.messageService.add({
          severity: 'info',
          summary: 'Sin datos',
          detail: 'No hay empleados registrados'
        });
      }
    } catch (error: any) {
      console.error('❌ Error cargando empleados:', error);
      console.error('📋 Detalles del error:');
      console.error('- Status:', error.status);
      console.error('- StatusText:', error.statusText);
      console.error('- URL:', error.url);
      console.error('- Error completo:', error.error);
      
      let errorMessage = 'Error desconocido';
      
      if (error.status === 403) {
        errorMessage = 'Sin permisos para acceder a empleados';
      } else if (error.status === 401) {
        errorMessage = 'Sesión expirada. Redirigiendo al login...';
        setTimeout(() => {
          this.authService.clearAuthData();
          this.router.navigate(['/auth/login']);
        }, 2000);
      } else if (error.status === 0) {
        errorMessage = 'Backend no disponible. ¿Está corriendo en localhost:8000?';
        
        this.messageService.add({
          severity: 'warn',
          summary: 'Servidor no disponible',
          detail: 'Verifica que el backend Django esté corriendo en puerto 8000'
        });
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage
      });
      
      this.empleados.set([]);
    } finally {
      this.cargando.set(false);
    }
  }

  abrirDialogo() {
    this.empleadoSeleccionado = null;
    this.formularioEmpleado.reset({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      especialidad: '',
      fechaContratacion: new Date(),
      estado: true
    });
    this.mostrarDialogo = true;
  }

  editarEmpleado(emp: EmpleadoUI) {
    this.empleadoSeleccionado = emp;
    const nombres = emp.nombre.split(' ');
    
    this.formularioEmpleado.patchValue({
      nombre: nombres[0] || '',
      apellido: nombres.slice(1).join(' ') || '',
      email: emp.email,
      telefono: emp.telefono,
      especialidad: emp.especialidad,
      fechaContratacion: emp.fechaContratacion ? new Date(emp.fechaContratacion) : new Date(),
      estado: emp.estado === 'Activo'
    });
    this.mostrarDialogo = true;
  }

  async guardarEmpleado() {
    if (this.formularioEmpleado.invalid) {
      this.formularioEmpleado.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formData = this.formularioEmpleado.value;
    
    try {
      if (this.empleadoSeleccionado) {
        // Actualizar empleado existente
        const empleadoData: any = {
          specialty: formData.especialidad,
          phone: formData.telefono || '',
          hire_date: formData.fechaContratacion ? 
            new Date(formData.fechaContratacion).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          is_active: formData.estado
        };
        
        await this.employeeService.updateEmployee(this.empleadoSeleccionado.id, empleadoData).toPromise();
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empleado actualizado correctamente'
        });
      } else {
        // Crear nuevo empleado: primero crear usuario, luego empleado
        console.log('👤 Paso 1: Creando usuario...');
        
        const userData = {
          first_name: formData.nombre,
          last_name: formData.apellido,
          full_name: `${formData.nombre} ${formData.apellido}`, // Campo requerido
          email: formData.email,
          username: formData.email,
          password: 'Temporal123!', // Password temporal
          role: 'ClientStaff' // Rol por defecto para empleados
        };
        
        const userResponse = await this.authService.createUser(userData).toPromise();
        console.log('✅ Usuario creado:', userResponse);
        
        console.log('👷 Paso 2: Creando empleado...');
        
        const empleadoData = {
          user_id: userResponse.id, // Usar el ID del usuario recién creado
          specialty: formData.especialidad,
          phone: formData.telefono || '',
          hire_date: formData.fechaContratacion ? 
            new Date(formData.fechaContratacion).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          is_active: formData.estado
        };
        
        console.log('📤 Datos del empleado a enviar:', empleadoData);
        
        await this.employeeService.createEmployee(empleadoData).toPromise();
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empleado creado correctamente'
        });
      }
      
      await this.cargarEmpleados();
      this.cerrarDialogo();
    } catch (error: any) {
      console.error('❌ Error guardando empleado:', error);
      console.error('📋 Error completo:', error.error);
      console.error('📝 Status:', error.status);
      console.error('📝 StatusText:', error.statusText);
      console.error('📝 Headers:', error.headers);
      console.error('📝 URL:', error.url);
      console.error('📝 Mensaje del servidor:', error.error?.message);
      console.error('📝 Detalles del error:', error.error?.detail);
      console.error('📝 Errores de validación:', error.error?.errors);
      
      // Intentar parsear la respuesta como texto si es posible
      if (error.error && typeof error.error === 'object') {
        console.error('📝 Respuesta del servidor (JSON):', JSON.stringify(error.error, null, 2));
      }
      
      // Si hay errores de validación específicos, mostrarlos
      if (error.error && typeof error.error === 'object') {
        Object.keys(error.error).forEach(key => {
          console.error(`📝 Campo ${key}:`, error.error[key]);
        });
      }
      
      let errorMessage = 'No se pudo guardar el empleado';
      
      if (error.status === 403) {
        errorMessage = 'Sin permisos para guardar empleados';
      } else if (error.status === 401) {
        errorMessage = 'Sesión expirada';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Datos inválidos';
      } else if (error.error?.message) {
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

  confirmarEliminar(emp: EmpleadoUI) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar al empleado ${emp.nombre}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.eliminarEmpleado(emp)
    });
  }

  async eliminarEmpleado(emp: EmpleadoUI) {
    try {
      await this.employeeService.deleteEmployee(emp.id).toPromise();
      this.empleados.update(lista => lista.filter(e => e.id !== emp.id));
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Empleado eliminado correctamente'
      });
    } catch (error: any) {
      console.error('❌ Error eliminando empleado:', error);
      
      let errorMessage = 'No se pudo eliminar el empleado';
      
      if (error.status === 403) {
        errorMessage = 'Sin permisos para eliminar empleados';
      } else if (error.status === 401) {
        errorMessage = 'Sesión expirada';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage
      });
    }
  }

  gestionarHorarios(emp: EmpleadoUI) {
    this.empleadoSeleccionado = emp;
    this.mostrarDialogHorarios = true;
  }

  gestionarServicios(emp: EmpleadoUI) {
    this.empleadoSeleccionado = emp;
    this.mostrarDialogServicios = true;
  }

  cerrarDialogo() {
    this.mostrarDialogo = false;
    this.formularioEmpleado.reset();
  }
}
