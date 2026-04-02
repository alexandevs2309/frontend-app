import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AppointmentService, AppointmentWithDetails } from '../../../core/services/appointment/appointment.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { environment } from '../../../../environments/environment';
import { AppointmentDialogComponent, AppointmentDialogValue } from './appointment-dialog.component';
import { AppointmentsDataService } from './appointments-data.service';
import { AppointmentsUiService } from './appointments-ui.service';

@Component({
    selector: 'app-appointments-management',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, SelectModule, DatePickerModule, TagModule, ToastModule, ConfirmDialogModule, TooltipModule, CardModule, AppointmentDialogComponent],
    providers: [MessageService, ConfirmationService],
    template: `
        <div class="p-4 md:p-6">
            <div class="relative overflow-hidden bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-6 rounded-2xl mb-6 shadow-2xl">
                <div class="absolute inset-0 bg-black/10"></div>
                <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24"></div>

                <div class="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-white/20 backdrop-blur-sm rounded-xl animate-pulse">
                            <i class="pi pi-list text-4xl"></i>
                        </div>
                        <div>
                            <h2 class="text-3xl font-bold drop-shadow-lg">Lista de Citas</h2>
                            <p class="text-purple-100 mt-1">Vista detallada de todas las citas</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <div class="text-sm font-semibold text-slate-900 dark:text-white">Vista de control detallado</div>
                        <div class="text-sm text-slate-600 dark:text-slate-400">
                            Usa esta vista cuando necesites filtrar por fecha, empleado o estado, y resolver pendientes uno por uno.
                        </div>
                    </div>
                    <div class="text-sm text-slate-500 dark:text-slate-400">
                        {{ citasFiltradas().length }} resultado{{ citasFiltradas().length === 1 ? '' : 's' }} visibles
                    </div>
                </div>
            </div>

            <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 w-full">
                <div class="flex flex-wrap gap-3 flex-1">
                    <div class="w-full sm:w-1/2 md:w-auto">
                        <label class="block font-medium mb-1">Fecha</label>
                        <p-datepicker [(ngModel)]="fechaFiltro" dateFormat="dd/mm/yy" (onSelect)="filtrarPorFecha()" class="w-full" [showClear]="true"></p-datepicker>
                    </div>
                    <div class="w-full sm:w-1/2 md:w-auto">
                        <label class="block font-medium mb-1">Estado</label>
                        <p-select
                            [(ngModel)]="estadoFiltro"
                            [options]="estadosOptions"
                            optionLabel="label"
                            optionValue="value"
                            (onChange)="filtrarPorEstado()"
                            class="w-full"
                            [showClear]="true"
                        ></p-select>
                    </div>
                    <div class="w-full sm:w-1/2 md:w-auto">
                        <label class="block font-medium mb-1">Empleado</label>
                        <p-select
                            [(ngModel)]="empleadoFiltro"
                            [options]="empleadosOptions()"
                            optionLabel="label"
                            optionValue="value"
                            (onChange)="filtrarPorEmpleado()"
                            class="w-full"
                            [showClear]="true"
                        ></p-select>
                    </div>
                </div>

                <button pButton label="Limpiar Filtros" icon="pi pi-filter-slash" (click)="limpiarFiltros()" class="p-button-outlined w-full md:w-auto"></button>
            </div>

            <div class="block md:hidden space-y-4">
                <ng-container *ngFor="let cita of citasFiltradas()">
                    <div class="surface-card border-round shadow-md p-4">
                        <div class="flex justify-between items-center mb-2">
                            <div>
                                <div class="text-sm text-surface-500 dark:text-surface-400">{{ cita.date_time | date: 'dd/MM/yyyy HH:mm' }}</div>
                                <div class="font-medium">{{ cita.client_name || 'Cliente #' + cita.client }}</div>
                                <div class="text-surface-600 dark:text-surface-400 text-sm">{{ cita.stylist_name || 'Empleado #' + cita.stylist }}</div>
                            </div>
                            <p-tag [value]="getEstadoLabel(cita.status)" [severity]="getEstadoSeverity(cita.status)"></p-tag>
                        </div>
                        <div class="text-surface-700 dark:text-surface-300 mb-2">{{ cita.service_name || 'Sin servicio' }}</div>
                        <div class="flex gap-2 flex-wrap">
                            <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editarCita(cita)" pTooltip="Editar" [disabled]="cita.status === 'completed'"></button>
                            <button pButton icon="pi pi-check" class="p-button-text p-button-sm p-button-success" (click)="completarCita(cita)" pTooltip="Completar" *ngIf="cita.status === 'scheduled'"></button>
                            <button pButton icon="pi pi-times" class="p-button-text p-button-sm p-button-warning" (click)="cancelarCita(cita)" pTooltip="Cancelar" *ngIf="cita.status === 'scheduled'"></button>
                            <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="confirmarEliminar(cita)" pTooltip="Eliminar" *ngIf="canDeleteAppointments"></button>
                        </div>
                    </div>
                </ng-container>
            </div>

            <p-table class="w-full hidden md:block" [value]="citasFiltradas()" [responsiveLayout]="'scroll'" [loading]="cargando()" [globalFilterFields]="['client_name', 'stylist_name', 'service_name']" #dt>
                <ng-template pTemplate="caption">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-surface-600 dark:text-surface-400">Total: {{ citasFiltradas().length }} citas</span>
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
                            <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="confirmarEliminar(cita)" pTooltip="Eliminar" *ngIf="canDeleteAppointments"></button>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="6" class="text-center py-4">No hay citas registradas</td>
                    </tr>
                </ng-template>
            </p-table>

            <app-appointment-dialog
                [(visible)]="mostrarDialogo"
                [saving]="guardando()"
                [appointment]="citaSeleccionada"
                [clientsOptions]="clientesOptions()"
                [employeesOptions]="empleadosOptions()"
                [servicesOptions]="serviciosOptions()"
                (save)="guardarCita($event)"
                (cancel)="cerrarDialogo()"
            ></app-appointment-dialog>

            <p-confirmDialog></p-confirmDialog>
            <p-toast></p-toast>
        </div>
    `
})
export class AppointmentsManagement implements OnInit {
    private readonly appointmentService = inject(AppointmentService);
    private readonly authService = inject(AuthService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly appointmentsUiService = inject(AppointmentsUiService);
    private readonly appointmentsDataService = inject(AppointmentsDataService);
    private readonly destroyRef = inject(DestroyRef);

    citas = this.appointmentsDataService.appointments;
    cargando = this.appointmentsDataService.loading;
    clientesOptions = this.appointmentsDataService.clientsOptions;
    empleadosOptions = this.appointmentsDataService.employeesOptions;
    serviciosOptions = this.appointmentsDataService.servicesOptions;

    citasFiltradas = signal<AppointmentWithDetails[]>([]);
    guardando = signal(false);
    mostrarDialogo = false;
    citaSeleccionada: AppointmentWithDetails | null = null;
    canDeleteAppointments = false;

    fechaFiltro: Date | null = null;
    estadoFiltro: string | null = null;
    empleadoFiltro: number | null = null;

    estadosOptions = [
        { label: 'Programada', value: 'scheduled' },
        { label: 'Completada', value: 'completed' },
        { label: 'Cancelada', value: 'cancelled' },
        { label: 'No asistió', value: 'no_show' }
    ];

    ngOnInit(): void {
        this.canDeleteAppointments = this.computeCanDeleteAppointments();
        this.cargarDatos(true);
        this.appointmentsUiService.refresh$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.cargarDatos(true);
        });
    }

    async cargarDatos(force = false): Promise<void> {
        try {
            await this.appointmentsDataService.load(force);
            this.aplicarFiltros();
        } catch (error) {
            if (!environment.production) {
            }
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar los datos'
            });
        }
    }

    loadAppointments(): void {
        this.cargarDatos();
    }

    async abrirDialogo(): Promise<void> {
        await this.appointmentsDataService.load(true);
        this.citaSeleccionada = null;
        this.mostrarDialogo = true;
    }

    async editarCita(cita: AppointmentWithDetails): Promise<void> {
        await this.appointmentsDataService.load(true);
        this.citaSeleccionada = cita;
        this.mostrarDialogo = true;
    }

    async guardarCita(formData: AppointmentDialogValue): Promise<void> {
        if (!formData.date || !formData.time) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario incompleto',
                detail: 'Debes seleccionar fecha y hora para la cita'
            });
            return;
        }

        this.guardando.set(true);
        try {
            const fecha = new Date(formData.date);
            const hora = new Date(formData.time);
            fecha.setHours(hora.getHours(), hora.getMinutes(), 0, 0);

            const citaData = {
                client: formData.client,
                stylist: formData.stylist,
                service: formData.service ?? undefined,
                date_time: fecha.toISOString(),
                description: formData.description,
                status: 'scheduled' as const
            };

            if (this.citaSeleccionada) {
                await this.appointmentService.updateAppointment(this.citaSeleccionada.id, citaData).toPromise();
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita actualizada correctamente' });
            } else {
                await this.appointmentService.createAppointment(citaData).toPromise();
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita creada correctamente' });
            }

            this.cerrarDialogo();
            this.appointmentsUiService.requestRefresh();
        } catch (error: any) {
            if (!environment.production) {
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

    async completarCita(cita: AppointmentWithDetails): Promise<void> {
        try {
            await this.appointmentService.completeAppointment(cita.id).toPromise();
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita completada correctamente' });
            this.appointmentsUiService.requestRefresh();
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al completar la cita'
            });
        }
    }

    async cancelarCita(cita: AppointmentWithDetails): Promise<void> {
        try {
            await this.appointmentService.cancelAppointment(cita.id).toPromise();
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita cancelada correctamente' });
            this.appointmentsUiService.requestRefresh();
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al cancelar la cita'
            });
        }
    }

    confirmarEliminar(cita: AppointmentWithDetails): void {
        if (!this.canDeleteAppointments) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Acceso restringido',
                detail: 'Tu rol no puede eliminar citas'
            });
            return;
        }

        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar la cita del ${new Date(cita.date_time).toLocaleDateString()}?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: () => this.eliminarCita(cita)
        });
    }

    async eliminarCita(cita: AppointmentWithDetails): Promise<void> {
        if (!this.canDeleteAppointments) {
            return;
        }

        try {
            await this.appointmentService.deleteAppointment(cita.id).toPromise();
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita eliminada correctamente' });
            this.appointmentsUiService.requestRefresh();
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al eliminar la cita'
            });
        }
    }

    filtrarPorFecha(): void {
        this.aplicarFiltros();
    }

    filtrarPorEstado(): void {
        this.aplicarFiltros();
    }

    filtrarPorEmpleado(): void {
        this.aplicarFiltros();
    }

    limpiarFiltros(): void {
        this.fechaFiltro = null;
        this.estadoFiltro = null;
        this.empleadoFiltro = null;
        this.citasFiltradas.set(this.citas());
    }

    getEstadoLabel(status: string): string {
        const estado = this.estadosOptions.find((item) => item.value === status);
        return estado?.label || status;
    }

    getEstadoSeverity(status: string): 'success' | 'info' | 'danger' | 'warn' | 'secondary' {
        switch (status) {
            case 'scheduled':
                return 'info';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'danger';
            case 'no_show':
                return 'warn';
            default:
                return 'secondary';
        }
    }

    cerrarDialogo(): void {
        this.mostrarDialogo = false;
        this.citaSeleccionada = null;
    }

    private aplicarFiltros(): void {
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

    private computeCanDeleteAppointments(): boolean {
        const role = this.authService.getCurrentUser()?.role;
        return role === 'CLIENT_ADMIN' || role === 'Manager' || role === 'SUPER_ADMIN';
    }
}
