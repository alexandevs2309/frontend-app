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
        <div class="appts-list">
            <section class="appts-list__hero">
                <div class="appts-list__hero-copy">
                    <span class="appts-list__eyebrow">Lista operativa</span>
                    <h3>Resuelve la agenda sin salir del flujo</h3>
                    <p>Busca, completa, cancela o edita la siguiente cita desde una sola cola de trabajo.</p>
                    <div class="appts-list__metrics">
                        <div class="appts-metric">
                            <span>Visibles</span>
                            <strong>{{ citasFiltradas().length }}</strong>
                        </div>
                        <div class="appts-metric appts-metric--warn">
                            <span>Pendientes</span>
                            <strong>{{ getVisibleCountByStatus('scheduled') }}</strong>
                        </div>
                        <div class="appts-metric appts-metric--ok">
                            <span>Completadas</span>
                            <strong>{{ getVisibleCountByStatus('completed') }}</strong>
                        </div>
                    </div>
                </div>
                <div class="appts-list__hero-actions">
                    <div class="appts-list__hero-note">{{ getOperationHint() }}</div>
                    <button pButton label="Nueva cita" icon="pi pi-plus" (click)="abrirDialogo()" class="appts-list__primary-btn"></button>
                    <div class="appts-list__quick-actions">
                        <button pButton label="Hoy" class="p-button-sm p-button-text" (click)="aplicarFiltroHoy()"></button>
                        <button pButton label="Pendientes" class="p-button-sm p-button-text" (click)="aplicarFiltroRapido('scheduled')"></button>
                        <button pButton label="Limpiar" class="p-button-sm p-button-text" (click)="limpiarFiltros()"></button>
                    </div>
                </div>
            </section>

            <div class="appts-list__toolbar">
                <div class="appts-list__filters appts-list__filters--wide">
                    <span class="p-input-icon-left appts-list__search">
                        <i class="pi pi-search"></i>
                        <input pInputText [(ngModel)]="textoBusqueda" (ngModelChange)="aplicarFiltros()" placeholder="Cliente, empleado o servicio" />
                    </span>
                    <p-datepicker [(ngModel)]="fechaFiltro" dateFormat="dd/mm/yy" (onSelect)="filtrarPorFecha()" [showClear]="true" placeholder="Fecha"></p-datepicker>
                    <p-select [(ngModel)]="estadoFiltro" [options]="estadosOptions" optionLabel="label" optionValue="value" (onChange)="filtrarPorEstado()" [showClear]="true" placeholder="Estado"></p-select>
                    <p-select [(ngModel)]="empleadoFiltro" [options]="empleadosOptions()" optionLabel="label" optionValue="value" (onChange)="filtrarPorEmpleado()" [showClear]="true" placeholder="Empleado"></p-select>
                    <button pButton icon="pi pi-filter-slash" (click)="limpiarFiltros()" class="p-button-text p-button-sm" pTooltip="Limpiar filtros"></button>
                </div>
                <span class="appts-list__count">{{ citasFiltradas().length }} resultado{{ citasFiltradas().length === 1 ? '' : 's' }}</span>
            </div>

            <div *ngIf="cargando()" class="appts-list__loading">
                <i class="pi pi-spin pi-spinner"></i> Cargando citas...
            </div>

            <div *ngIf="!cargando() && citasFiltradas().length === 0" class="appts-list__empty">
                <i class="pi pi-calendar"></i>
                <span>Sin citas con los filtros actuales</span>
                <button pButton label="Limpiar filtros" class="p-button-text p-button-sm" (click)="limpiarFiltros()"></button>
            </div>

            <div *ngIf="!cargando() && citasFiltradas().length > 0" class="appts-list__rows">
                <div *ngFor="let cita of citasFiltradas()" class="appt-row" [class.appt-row--overdue]="cita.status === 'scheduled' && isOverdue(cita)">
                    <div class="appt-row__time">
                        <strong>{{ cita.date_time | date: 'dd/MM' }}</strong>
                        <span>{{ cita.date_time | date: 'HH:mm' }}</span>
                    </div>
                    <div class="appt-row__info">
                        <strong>{{ cita.client_name || ('Cliente #' + cita.client) }}</strong>
                        <span>{{ cita.stylist_name || ('Empleado #' + cita.stylist) }}</span>
                        <span *ngIf="cita.service_name" class="appt-row__service">{{ cita.service_name }}</span>
                    </div>
                    <p-tag [value]="getEstadoLabel(cita.status)" [severity]="getEstadoSeverity(cita.status)" class="appt-row__tag"></p-tag>
                    <div class="appt-row__actions">
                        <button *ngIf="cita.status === 'scheduled'" pButton icon="pi pi-check" class="p-button-success p-button-sm" (click)="completarCita(cita)" pTooltip="Completar"></button>
                        <button *ngIf="cita.status === 'scheduled'" pButton icon="pi pi-times" class="p-button-warning p-button-sm p-button-outlined" (click)="cancelarCita(cita)" pTooltip="Cancelar"></button>
                        <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editarCita(cita)" [disabled]="cita.status === 'completed'" pTooltip="Editar"></button>
                        <button *ngIf="canDeleteAppointments" pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="confirmarEliminar(cita)" pTooltip="Eliminar"></button>
                    </div>
                </div>
            </div>

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

        <style>
        .appts-list { display: flex; flex-direction: column; gap: 0.75rem; }

        .appts-list__hero {
            display: grid;
            grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.9fr);
            gap: 1rem;
            padding: 1rem;
            border: 1px solid var(--surface-border);
            background: linear-gradient(135deg, color-mix(in srgb, var(--surface-card) 78%, #ffffff 22%) 0%, color-mix(in srgb, var(--surface-card) 88%, #cbd5e1 12%) 100%);
            border-radius: 1rem;
        }

        .appts-list__hero-copy h3 {
            margin: 0.25rem 0 0;
            font-size: 1.55rem;
            line-height: 1.1;
            color: var(--text-color);
        }

        .appts-list__hero-copy p {
            margin: 0.65rem 0 0;
            max-width: 42rem;
            color: var(--text-color-secondary);
        }

        .appts-list__eyebrow {
            display: inline-flex;
            align-items: center;
            padding: 0.35rem 0.65rem;
            border-radius: 999px;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #334155;
            background: #e2e8f0;
        }

        .appts-list__metrics {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.75rem;
            margin-top: 1rem;
        }

        .appts-metric {
            padding: 0.85rem 1rem;
            border-radius: 0.9rem;
            background: color-mix(in srgb, var(--surface-card) 75%, #f8fafc 25%);
            border: 1px solid var(--surface-border);
        }

        .appts-metric span {
            display: block;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: var(--text-color-secondary);
        }

        .appts-metric strong {
            display: block;
            margin-top: 0.35rem;
            font-size: 2rem;
            line-height: 1;
            color: var(--text-color);
        }

        .appts-metric--warn { border-color: rgba(217, 119, 6, 0.25); background: rgba(245, 158, 11, 0.08); }
        .appts-metric--ok { border-color: rgba(5, 150, 105, 0.22); background: rgba(16, 185, 129, 0.08); }

        .appts-list__hero-actions {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            padding: 1rem;
            border-radius: 1rem;
            background: #0f172a;
            color: #e2e8f0;
        }

        .appts-list__hero-note {
            padding: 0.9rem 1rem;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 0.9rem;
            background: rgba(255, 255, 255, 0.04);
            font-size: 0.92rem;
            line-height: 1.5;
        }

        .appts-list__primary-btn {
            width: 100%;
            border: 0;
            background: #f8fafc;
            color: #0f172a;
        }

        .appts-list__quick-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.35rem;
        }

        .appts-list__toolbar {
            display: flex; align-items: center; justify-content: space-between;
            flex-wrap: wrap; gap: 0.5rem;
            padding: 0.75rem;
            border: 1px solid var(--surface-border);
            background: var(--surface-card);
            border-radius: 0.75rem;
        }

        .appts-list__filters { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .appts-list__filters--wide { width: min(100%, 64rem); }
        .appts-list__search { flex: 1 1 14rem; }
        .appts-list__search input { width: 100%; }
        .appts-list__filters .p-datepicker-input, .appts-list__filters .p-select { min-width: 9rem; }

        .appts-list__count { font-size: 0.82rem; color: var(--text-color-secondary); white-space: nowrap; }

        .appts-list__loading, .appts-list__empty {
            display: flex; align-items: center; justify-content: center; gap: 0.65rem;
            padding: 2rem; color: var(--text-color-secondary); font-size: 0.9rem;
            border: 1px dashed var(--surface-border); border-radius: 0.75rem;
        }

        .appts-list__rows { display: flex; flex-direction: column; gap: 0.35rem; }

        .appt-row {
            display: grid;
            grid-template-columns: 4rem 1fr auto auto;
            align-items: center;
            gap: 0.75rem;
            padding: 0.65rem 0.85rem;
            border: 1px solid var(--surface-border);
            background: var(--surface-card);
            border-radius: 0.65rem;
            transition: border-color 120ms;
        }

        .appt-row:hover { border-color: #6366f1; }
        .appt-row--overdue { border-left: 3px solid #d97706; }

        .appt-row__time {
            display: flex; flex-direction: column; align-items: center;
            font-size: 0.82rem; line-height: 1.3;
        }

        .appt-row__time strong { font-size: 0.9rem; color: var(--text-color); }
        .appt-row__time span { color: var(--text-color-secondary); }

        .appt-row__info {
            display: flex; flex-direction: column; gap: 0.1rem; min-width: 0;
        }

        .appt-row__info strong { font-size: 0.92rem; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .appt-row__info span { font-size: 0.8rem; color: var(--text-color-secondary); }
        .appt-row__service { font-style: italic; }

        .appt-row__actions { display: flex; gap: 0.25rem; }

        @media (max-width: 640px) {
            .appts-list__hero { grid-template-columns: 1fr; }
            .appts-list__metrics { grid-template-columns: 1fr; }
            .appt-row { grid-template-columns: 3.5rem 1fr; grid-template-rows: auto auto; }
            .appt-row__tag { grid-column: 2; }
            .appt-row__actions { grid-column: 1 / -1; justify-content: flex-end; }
        }
        </style>
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
    textoBusqueda = '';

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
        this.appointmentsUiService.create$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((target) => {
            if (target === 'list') {
                this.abrirDialogo();
            }
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

    isOverdue(cita: AppointmentWithDetails): boolean {
        return new Date(cita.date_time) < new Date();
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
        this.textoBusqueda = '';
        this.citasFiltradas.set(this.citas());
    }

    aplicarFiltroRapido(status: string): void {
        this.estadoFiltro = status;
        this.aplicarFiltros();
    }

    aplicarFiltroHoy(): void {
        this.fechaFiltro = new Date();
        this.aplicarFiltros();
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

    aplicarFiltros(): void {
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

        const termino = this.textoBusqueda.trim().toLowerCase();
        if (termino) {
            citasFiltradas = citasFiltradas.filter((cita) =>
                [cita.client_name, cita.stylist_name, cita.service_name]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(termino))
            );
        }

        this.citasFiltradas.set(citasFiltradas);
    }

    getVisibleCountByStatus(status: AppointmentWithDetails['status']): number {
        return this.citasFiltradas().filter((cita) => cita.status === status).length;
    }

    getOperationHint(): string {
        const pendientes = this.getVisibleCountByStatus('scheduled');
        if (pendientes > 0) {
            return `${pendientes} cita${pendientes === 1 ? '' : 's'} pendiente${pendientes === 1 ? '' : 's'} en esta vista. Completa o cancela desde la fila y sigue con la siguiente.`;
        }

        if (this.citasFiltradas().length === 0) {
            return 'No hay citas visibles con los filtros actuales. Limpia filtros o crea una nueva cita para seguir operando.';
        }

        return 'La agenda visible está controlada. Mantén esta cola limpia para que recepción y caja trabajen sin fricción.';
    }

    private computeCanDeleteAppointments(): boolean {
        const role = this.authService.getCurrentUser()?.role;
        return role === 'CLIENT_ADMIN' || role === 'Manager';
    }
}
