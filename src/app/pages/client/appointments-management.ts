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
import { AppointmentService, AppointmentWithDetails } from '../../core/services/appointment/appointment.service';
import { ServiceService, Service } from '../../core/services/service/service.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { ClientService } from '../../core/services/client/client.service';

@Component({
    selector: 'app-appointments-management',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        DatePickerModule,
        TagModule,
        ToastModule,
        ConfirmDialogModule,
        TooltipModule,
        CardModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <h5 class="m-0">Gestión de Citas</h5>
                            <p class="text-gray-600 mt-1">Administra las citas de tu barbería</p>
                        </div>
                        <button pButton label="Nueva Cita" icon="pi pi-plus"
                                (click)="abrirDialogo()" class="p-button-primary"></button>
                    </div>

                    <!-- Filtros -->
                    <div class="grid mb-4">
                        <div class="col-12 md:col-3">
                            <label class="block font-medium mb-1">Fecha</label>
                            <p-datepicker [(ngModel)]="fechaFiltro" dateFormat="dd/mm/yy"
                                        (onSelect)="filtrarPorFecha()" class="w-full"
                                        [showClear]="true" placeholder="Todas las fechas">
                            </p-datepicker>
                        </div>
                        <div class="col-12 md:col-3">
                            <label class="block font-medium mb-1">Estado</label>
                            <p-select [(ngModel)]="estadoFiltro" [options]="estadosOptions"
                                      optionLabel="label" optionValue="value"
                                      (onChange)="filtrarPorEstado()" class="w-full"
                                      [showClear]="true" placeholder="Todos los estados">
                            </p-select>
                        </div>
                        <div class="col-12 md:col-3">
                            <label class="block font-medium mb-1">Empleado</label>
                            <p-select [(ngModel)]="empleadoFiltro" [options]="empleadosOptions"
                                      optionLabel="label" optionValue="value"
                                      (onChange)="filtrarPorEmpleado()" class="w-full"
                                      [showClear]="true" placeholder="Todos los empleados">
                            </p-select>
                        </div>
                        <div class="col-12 md:col-3 flex items-end">
                            <button pButton label="Limpiar Filtros" icon="pi pi-filter-slash"
                                    (click)="limpiarFiltros()" class="p-button-outlined w-full"></button>
                        </div>
                    </div>

                    <p-table [value]="citasFiltradas()" [loading]="cargando()"
                             [globalFilterFields]="['client_name', 'stylist_name', 'service_name']"
                             #dt>
                        <ng-template pTemplate="caption">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">
                                    Total: {{citasFiltradas().length}} citas
                                </span>
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search"></i>
                                    <input pInputText type="text" placeholder="Buscar citas..."
                                           (input)="dt.filterGlobal($any($event.target).value, 'contains')">
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
                                <td>
                                    <div>
                                        <div class="font-medium">{{cita.date_time | date:'dd/MM/yyyy'}}</div>
                                        <div class="text-sm text-gray-500">{{cita.date_time | date:'HH:mm'}}</div>
                                    </div>
                                </td>
                                <td>{{cita.client_name || 'Cliente #' + cita.client}}</td>
                                <td>{{cita.stylist_name || 'Empleado #' + cita.stylist}}</td>
                                <td>
                                    <div>
                                        <div>{{cita.service_name || 'Sin servicio'}}</div>
                                        <div class="text-sm text-gray-500" *ngIf="cita.service_price">
                                            \${{cita.service_price}} - {{cita.service_duration}}min
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <p-tag [value]="getEstadoLabel(cita.status)"
                                           [severity]="getEstadoSeverity(cita.status)">
                                    </p-tag>
                                </td>
                                <td>
                                    <div class="flex gap-1">
                                        <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                                                (click)="editarCita(cita)" pTooltip="Editar"
                                                [disabled]="cita.status === 'completed'"></button>
                                        <button pButton icon="pi pi-check" class="p-button-text p-button-sm p-button-success"
                                                (click)="completarCita(cita)" pTooltip="Completar"
                                                *ngIf="cita.status === 'scheduled'"></button>
                                        <button pButton icon="pi pi-times" class="p-button-text p-button-sm p-button-warning"
                                                (click)="cancelarCita(cita)" pTooltip="Cancelar"
                                                *ngIf="cita.status === 'scheduled'"></button>
                                        <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger"
                                                (click)="confirmarEliminar(cita)" pTooltip="Eliminar"></button>
                                    </div>
                                </td>
                            </tr>
                        </ng-template>

                        <ng-template pTemplate="emptymessage">
                            <tr><td colspan="6" class="text-center py-4">No hay citas registradas</td></tr>
                        </ng-template>
                    </p-table>

                    <p-dialog [header]="citaSeleccionada ? 'Editar Cita' : 'Nueva Cita'"
                              [(visible)]="mostrarDialogo" [modal]="true" [style]="{width: '600px'}"
                              [closable]="!guardando()" [closeOnEscape]="!guardando()">
                        <form [formGroup]="formulario" class="grid gap-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block font-medium mb-1">Cliente *</label>
                                    <p-select formControlName="client" [options]="clientesOptions"
                                              optionLabel="label" optionValue="value"
                                              placeholder="Seleccionar cliente" class="w-full">
                                    </p-select>
                                </div>
                                <div>
                                    <label class="block font-medium mb-1">Empleado *</label>
                                    <p-select formControlName="stylist" [options]="empleadosOptions"
                                              optionLabel="label" optionValue="value"
                                              placeholder="Seleccionar empleado" class="w-full">
                                    </p-select>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block font-medium mb-1">Fecha *</label>
                                    <p-calendar formControlName="date" dateFormat="dd/mm/yy"
                                                class="w-full">
                                    </p-calendar>
                                </div>
                                <div>
                                    <label class="block font-medium mb-1">Hora *</label>
                                    <p-calendar formControlName="time"
                                                hourFormat="24" class="w-full" showTime="true" timeOnly="true">
                                    </p-calendar>
                                </div>
                            </div>

                            <div>
                                <label class="block font-medium mb-1">Servicio</label>
                                <p-select formControlName="service" [options]="serviciosOptions"
                                          optionLabel="label" optionValue="value"
                                          placeholder="Seleccionar servicio" class="w-full"
                                          [showClear]="true">
                                </p-select>
                            </div>

                            <div>
                                <label class="block font-medium mb-1">Notas</label>
                                <textarea pInputTextarea formControlName="description"
                                          class="w-full" rows="3"
                                          placeholder="Notas adicionales sobre la cita..."></textarea>
                            </div>

                            <div class="flex justify-end gap-2 mt-4">
                                <button pButton label="Cancelar" type="button" class="p-button-text"
                                        (click)="cerrarDialogo()" [disabled]="guardando()"></button>
                                <button pButton [label]="citaSeleccionada ? 'Actualizar' : 'Crear'"
                                        type="button" icon="pi pi-check" [loading]="guardando()"
                                        [disabled]="formulario.invalid" (click)="guardarCita()"></button>
                            </div>
                        </form>
                    </p-dialog>
                </div>
            </div>
        </div>

        <p-confirmDialog></p-confirmDialog>
        <p-toast></p-toast>
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
        this.cargando.set(true);
        try {
            const [citasRes, serviciosRes, usuariosRes, clientesRes] = await Promise.all([
                this.appointmentService.getAppointments().toPromise(),
                this.serviceService.getActiveServices().toPromise(),
                this.authService.getUsers().toPromise(),
                this.clientService.getClients().toPromise()
            ]);

            // Procesar citas
            const citas = (citasRes as any)?.results || citasRes || [];
            const servicios = (serviciosRes as any)?.results || serviciosRes || [];
            const usuarios = (usuariosRes as any)?.results || usuariosRes || [];
            const clientes = (clientesRes as any)?.results || clientesRes || [];

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
                .filter((u: any) => ['Estilista', 'Manager'].includes(u.role))
                .map((u: any) => ({
                    label: u.full_name || u.email,
                    value: u.id
                }));

            this.serviciosOptions = servicios.map((s: Service) => ({
                label: `${s.name} - $${s.price} (${s.duration}min)`,
                value: s.id
            }));

        } catch (error) {
            console.error('Error cargando datos:', error);
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
            console.error('Error guardando cita:', error);
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
            citasFiltradas = citasFiltradas.filter(cita =>
                cita.date_time.startsWith(fechaStr)
            );
        }

        if (this.estadoFiltro) {
            citasFiltradas = citasFiltradas.filter(cita =>
                cita.status === this.estadoFiltro
            );
        }

        if (this.empleadoFiltro) {
            citasFiltradas = citasFiltradas.filter(cita =>
                cita.stylist === this.empleadoFiltro
            );
        }

        this.citasFiltradas.set(citasFiltradas);
    }

    // Helpers
    getEstadoLabel(status: string): string {
        const estado = this.estadosOptions.find(e => e.value === status);
        return estado?.label || status;
    }

    getEstadoSeverity(status: string): 'success' | 'info' | 'danger' | 'secondary' {
        switch (status) {
            case 'scheduled': return 'info';
            case 'completed': return 'success';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    }

    cerrarDialogo() {
        this.mostrarDialogo = false;
        this.citaSeleccionada = null;
        this.formulario.reset();
    }
}
