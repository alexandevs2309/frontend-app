import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { AppointmentService, AppointmentWithDetails } from '../../../core/services/appointment/appointment.service';
import { ServiceService, Service } from '../../../core/services/service/service.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ClientService } from '../../../core/services/client/client.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-appointments-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, TextareaModule, SelectModule, DatePickerModule, TagModule, ToastModule, ConfirmDialogModule, TooltipModule, CardModule],
    providers: [MessageService, ConfirmationService],
    template: `
        <div class="p-4 md:p-6">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
                <div>
                    <h2 class="text-2xl font-semibold">Gestión de Citas</h2>
                    <p class="text-gray-600 text-sm mt-1">Administra las citas de tu barbería</p>
                </div>
                <button pButton label="Nueva Cita" icon="pi pi-plus" (click)="abrirDialogo()" class="p-button-primary w-full md:w-auto"></button>
            </div>

            <!-- Filtros -->
           <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 w-full">
  <div class="flex flex-wrap gap-3 flex-1">
    <div class="w-full sm:w-1/2 md:w-auto">
      <label class="block font-medium mb-1">Fecha</label>
      <p-datepicker [(ngModel)]="fechaFiltro" dateFormat="dd/mm/yy"
                  (onSelect)="filtrarPorFecha()" class="w-full" [showClear]="true">
      </p-datepicker>
    </div>
    <div class="w-full sm:w-1/2 md:w-auto">
      <label class="block font-medium mb-1">Estado</label>
      <p-select [(ngModel)]="estadoFiltro" [options]="estadosOptions"
                optionLabel="label" optionValue="value" (onChange)="filtrarPorEstado()"
                class="w-full" [showClear]="true"></p-select>
    </div>
    <div class="w-full sm:w-1/2 md:w-auto">
      <label class="block font-medium mb-1">Empleado</label>
      <p-select [(ngModel)]="empleadoFiltro" [options]="empleadosOptions"
                optionLabel="label" optionValue="value" (onChange)="filtrarPorEmpleado()"
                class="w-full" [showClear]="true"></p-select>
    </div>
  </div>

  <button pButton label="Limpiar Filtros" icon="pi pi-filter-slash"
          (click)="limpiarFiltros()" class="p-button-outlined w-full md:w-auto"></button>
</div>


            <!-- Tabla / Grid -->
            <div class="block md:hidden space-y-4">
                <!-- Móvil: tarjetas -->
                <ng-container *ngFor="let cita of citasFiltradas()">
                    <div class="surface-card border-round shadow-md p-4">
                        <div class="flex justify-between items-center mb-2">
                            <div>
                                <div class="text-sm text-gray-500">{{ cita.date_time | date: 'dd/MM/yyyy HH:mm' }}</div>
                                <div class="font-medium">{{ cita.client_name || 'Cliente #' + cita.client }}</div>
                                <div class="text-gray-600 text-sm">{{ cita.stylist_name || 'Empleado #' + cita.stylist }}</div>
                            </div>
                            <p-tag [value]="getEstadoLabel(cita.status)" [severity]="getEstadoSeverity(cita.status)"></p-tag>
                        </div>
                        <div class="text-gray-700 mb-2">{{ cita.service_name || 'Sin servicio' }}</div>
                        <div class="flex gap-2 flex-wrap">
                            <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editarCita(cita)" pTooltip="Editar" [disabled]="cita.status === 'completed'"></button>
                            <button pButton icon="pi pi-check" class="p-button-text p-button-sm p-button-success" (click)="completarCita(cita)" pTooltip="Completar" *ngIf="cita.status === 'scheduled'"></button>
                            <button pButton icon="pi pi-times" class="p-button-text p-button-sm p-button-warning" (click)="cancelarCita(cita)" pTooltip="Cancelar" *ngIf="cita.status === 'scheduled'"></button>
                            <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="confirmarEliminar(cita)" pTooltip="Eliminar"></button>
                        </div>
                    </div>
                </ng-container>
            </div>

            <p-table class="w-full hidden md:block" [value]="citasFiltradas()" [responsiveLayout]="'scroll'" [loading]="cargando()" [globalFilterFields]="['client_name', 'stylist_name', 'service_name']" #dt>
                <ng-template pTemplate="caption">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Total: {{ citasFiltradas().length }} citas</span>
                        <span class="p-input-icon-left">
                            <i class="pi pi-search"></i>
                            <input pInputText type="text" placeholder="Buscar citas..." (input)="dt.filterGlobal($any($event.target).value, 'contains')" />
                        </span>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th>Fecha y Hora</th>
                        <th>Cliente</th>
                        <th>Empleado</th>
                        <th>Servicio</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-cita>
                    <tr>
                        <td>{{ cita.date_time | date: 'dd/MM/yyyy HH:mm' }}</td>
                        <td>{{ cita.client_name || 'Cliente #' + cita.client }}</td>
                        <td>{{ cita.stylist_name || 'Empleado #' + cita.stylist }}</td>
                        <td>{{ cita.service_name || 'Sin servicio' }}</td>
                        <td><p-tag [value]="getEstadoLabel(cita.status)" [severity]="getEstadoSeverity(cita.status)"></p-tag></td>
                        <td class="flex gap-1">
                            <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editarCita(cita)" pTooltip="Editar" [disabled]="cita.status === 'completed'"></button>
                            <button pButton icon="pi pi-check" class="p-button-text p-button-sm p-button-success" (click)="completarCita(cita)" pTooltip="Completar" *ngIf="cita.status === 'scheduled'"></button>
                            <button pButton icon="pi pi-times" class="p-button-text p-button-sm p-button-warning" (click)="cancelarCita(cita)" pTooltip="Cancelar" *ngIf="cita.status === 'scheduled'"></button>
                            <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="confirmarEliminar(cita)" pTooltip="Eliminar"></button>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="6" class="text-center py-4">No hay citas registradas</td>
                    </tr>
                </ng-template>
            </p-table>

            <!-- Dialogo de Cita -->
            <p-dialog [header]="citaSeleccionada ? 'Editar Cita' : 'Nueva Cita'" [(visible)]="mostrarDialogo" [modal]="true" [style]="{ width: '95%', maxWidth: '600px' }" [closable]="!guardando()" [closeOnEscape]="!guardando()">
                <form [formGroup]="formulario" class="grid gap-4">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block font-medium mb-1">Cliente *</label>
                            <p-select formControlName="client" [options]="clientesOptions" optionLabel="label" optionValue="value" placeholder="Seleccionar cliente" class="w-full"> </p-select>
                        </div>
                        <div>
                            <label class="block font-medium mb-1">Empleado *</label>
                            <p-select formControlName="stylist" [options]="empleadosOptions" optionLabel="label" optionValue="value" placeholder="Seleccionar empleado" class="w-full"> </p-select>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block font-medium mb-1">Fecha *</label>
                            <p-datepicker formControlName="date" dateFormat="dd/mm/yy" class="w-full"></p-datepicker>
                        </div>
                        <div>
                            <label class="block font-medium mb-1">Hora *</label>
                            <p-datepicker formControlName="time" hourFormat="24" [showTime]="true" [timeOnly]="true" class="w-full"></p-datepicker>
                        </div>
                    </div>

                    <div>
                        <label class="block font-medium mb-1">Servicio</label>
                        <p-select formControlName="service" [options]="serviciosOptions" optionLabel="label" optionValue="value" placeholder="Seleccionar servicio" class="w-full" [showClear]="true"> </p-select>
                    </div>

                    <div>
                        <label class="block font-medium mb-1">Notas</label>
                        <textarea pInputTextarea formControlName="description" class="w-full" rows="3" placeholder="Notas adicionales sobre la cita..."></textarea>
                    </div>

                    <div class="flex justify-end gap-2 mt-4">
                        <button pButton label="Cancelar" type="button" class="p-button-text" (click)="cerrarDialogo()" [disabled]="guardando()"></button>
                        <button pButton [label]="citaSeleccionada ? 'Actualizar' : 'Crear'" type="button" icon="pi pi-check" [loading]="guardando()" [disabled]="formulario.invalid" (click)="guardarCita()"></button>
                    </div>
                </form>
            </p-dialog>

            <p-confirmDialog></p-confirmDialog>
            <p-toast></p-toast>
        </div>
    `
})
export class AppointmentsManagement implements OnInit {
    private appointmentService = inject(AppointmentService);
    private serviceService = inject(ServiceService);
    private authService = inject(AuthService);
    private clientService = inject(ClientService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private fb = inject(FormBuilder);

    citas = signal<AppointmentWithDetails[]>([]);
    citasFiltradas = signal<AppointmentWithDetails[]>([]);
    cargando = signal(false);
    guardando = signal(false);
    mostrarDialogo = false;
    citaSeleccionada: AppointmentWithDetails | null = null;
    fechaMinima = new Date();

    // Filtros
    fechaFiltro: Date | null = null;
    estadoFiltro: string | null = null;
    empleadoFiltro: number | null = null;

    // Options
    clientesOptions: any[] = [];
    empleadosOptions: any[] = [];
    serviciosOptions: any[] = [];

    estadosOptions = [
        { label: 'Programada', value: 'scheduled' },
        { label: 'Completada', value: 'completed' },
        { label: 'Cancelada', value: 'cancelled' }
    ];

    // Utility function to normalize API responses
    private normalizeArray<T>(response: any): T[] {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (response.results && Array.isArray(response.results)) return response.results;
        return [];
    }

    // Validador personalizado para fecha futura
    fechaFuturaValidator = (control: any) => {
        if (!control.value) return null;
        const fechaSeleccionada = new Date(control.value);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return fechaSeleccionada >= hoy ? null : { fechaPasada: true };
    };

    formulario: FormGroup = this.fb.group({
        client: [null, [Validators.required]],
        stylist: [null, [Validators.required]],
        service: [null],
        date: [null, [Validators.required, this.fechaFuturaValidator]],
        time: [null, [Validators.required]],
        description: ['']
    });

    ngOnInit() {
        this.cargarDatos();
    }

    async cargarDatos() {
        if (this.cargando()) return; // ✅ Prevenir llamadas concurrentes
        this.cargando.set(true);
        try {
            const [citasRes, serviciosRes, usuariosRes, clientesRes] = await Promise.all([
                this.appointmentService.getAppointments().toPromise(),
                this.serviceService.getActiveServices().toPromise(),
                this.authService.getUsers().toPromise(),
                this.clientService.getClients().toPromise()
            ]);

            // Procesar citas
            const citas = this.normalizeArray<any>(citasRes);
            const servicios = this.normalizeArray<any>(serviciosRes);
            const usuarios = this.normalizeArray<any>(usuariosRes);
            const clientes = this.normalizeArray<any>(clientesRes);

            // Enriquecer citas con información adicional
            const citasEnriquecidas: AppointmentWithDetails[] = citas.map((cita: any) => {
                const servicio = servicios.find((s: Service) => s.id === cita.service);
                const empleado = usuarios.find((u: any) => u.id === cita.stylist);
                const cliente = clientes.find((c: any) => c.id === cita.client);

                return {
                    ...cita,
                    client_name: cliente?.name || cliente?.full_name,
                    stylist_name: empleado?.full_name,
                    service_name: servicio?.name,
                    service_price: servicio?.price,
                    service_duration: servicio?.duration
                };
            });

            this.citas.set(citasEnriquecidas);
            this.citasFiltradas.set(citasEnriquecidas);

            // Configurar opciones para formularios
            this.clientesOptions = clientes.map((c: any) => ({
                label: c.name || c.full_name || `Cliente #${c.id}`,
                value: c.id
            }));

            this.empleadosOptions = usuarios
                .filter((u: any) => ['Estilista', 'Manager', 'Client-Staff', 'Cajera'].includes(u.role))
                .map((u: any) => ({
                    label: u.full_name || u.email,
                    value: u.id
                }));

            this.serviciosOptions = servicios.map((s: Service) => ({
                label: `${s.name} - $${s.price} (${s.duration || 30}min)`,
                value: s.id
            }));
        } catch (error) {
            if (!environment.production) {
                console.error('Error cargando datos:', error);
            }
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar los datos'
            });
        } finally {
            this.cargando.set(false);
        }
    }

    abrirDialogo() {
        this.citaSeleccionada = null;
        this.formulario.reset({
            client: null,
            stylist: null,
            service: null,
            date: null,
            time: null,
            description: ''
        });
        this.mostrarDialogo = true;
    }

    editarCita(cita: AppointmentWithDetails) {
        this.citaSeleccionada = cita;
        const fechaCita = new Date(cita.date_time);

        this.formulario.patchValue({
            client: cita.client,
            stylist: cita.stylist,
            service: cita.service,
            date: fechaCita,
            time: fechaCita,
            description: cita.description || ''
        });
        this.mostrarDialogo = true;
    }

    async guardarCita() {
        if (this.formulario.invalid) return;

        this.guardando.set(true);
        try {
            const formData = this.formulario.value;

            // Combinar fecha y hora
            const fecha = new Date(formData.date);
            const hora = new Date(formData.time);
            fecha.setHours(hora.getHours(), hora.getMinutes(), 0, 0);

            const citaData = {
                client: formData.client,
                stylist: formData.stylist,
                service: formData.service,
                date_time: fecha.toISOString(),
                description: formData.description,
                status: 'scheduled' as const
            };

            if (this.citaSeleccionada) {
                await this.appointmentService.updateAppointment(this.citaSeleccionada.id, citaData).toPromise();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Cita actualizada correctamente'
                });
            } else {
                await this.appointmentService.createAppointment(citaData).toPromise();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Cita creada correctamente'
                });
            }

            this.cerrarDialogo();
            this.cargarDatos();
        } catch (error: any) {
            if (!environment.production) {
                console.error('Error guardando cita:', error);
            }
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al guardar la cita'
            });
        } finally {
            this.guardando.set(false);
        }
    }

    async completarCita(cita: AppointmentWithDetails) {
        try {
            await this.appointmentService.completeAppointment(cita.id).toPromise();
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Cita completada correctamente'
            });
            this.cargarDatos();
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al completar la cita'
            });
        }
    }

    async cancelarCita(cita: AppointmentWithDetails) {
        try {
            await this.appointmentService.cancelAppointment(cita.id).toPromise();
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Cita cancelada correctamente'
            });
            this.cargarDatos();
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al cancelar la cita'
            });
        }
    }

    confirmarEliminar(cita: AppointmentWithDetails) {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar la cita del ${new Date(cita.date_time).toLocaleDateString()}?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: () => this.eliminarCita(cita)
        });
    }

    async eliminarCita(cita: AppointmentWithDetails) {
        try {
            await this.appointmentService.deleteAppointment(cita.id).toPromise();
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Cita eliminada correctamente'
            });
            this.cargarDatos();
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al eliminar la cita'
            });
        }
    }

    // Filtros
    filtrarPorFecha() {
        this.aplicarFiltros();
    }

    filtrarPorEstado() {
        this.aplicarFiltros();
    }

    filtrarPorEmpleado() {
        this.aplicarFiltros();
    }

    limpiarFiltros() {
        this.fechaFiltro = null;
        this.estadoFiltro = null;
        this.empleadoFiltro = null;
        this.citasFiltradas.set(this.citas());
    }

    private aplicarFiltros() {
        let citasFiltradas = [...this.citas()];

        if (this.fechaFiltro) {
            const fechaStr = this.fechaFiltro.toISOString().split('T')[0];
            citasFiltradas = citasFiltradas.filter((cita) => cita.date_time.startsWith(fechaStr));
        }

        if (this.estadoFiltro) {
            citasFiltradas = citasFiltradas.filter((cita) => cita.status === this.estadoFiltro);
        }

        if (this.empleadoFiltro) {
            citasFiltradas = citasFiltradas.filter((cita) => cita.stylist === this.empleadoFiltro);
        }

        this.citasFiltradas.set(citasFiltradas);
    }

    // Helpers
    getEstadoLabel(status: string): string {
        const estado = this.estadosOptions.find((e) => e.value === status);
        return estado?.label || status;
    }

    getEstadoSeverity(status: string): 'success' | 'info' | 'danger' | 'secondary' {
        switch (status) {
            case 'scheduled':
                return 'info';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    cerrarDialogo() {
        this.mostrarDialogo = false;
        this.citaSeleccionada = null;
        this.formulario.reset();
    }
}
