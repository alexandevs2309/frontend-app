import { AfterViewInit, Component, DestroyRef, ElementRef, OnInit, ViewChild, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import esLocale from '@fullcalendar/core/locales/es';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { AppointmentService, AppointmentWithDetails } from '../../../core/services/appointment/appointment.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AppointmentDialogComponent, AppointmentDialogValue } from './appointment-dialog.component';
import { AppointmentsDataService } from './appointments-data.service';
import { AppointmentsUiService } from './appointments-ui.service';

@Component({
    selector: 'app-appointments-calendar',
    standalone: true,
    imports: [CommonModule, DialogModule, ButtonModule, TagModule, InputTextModule, ToastModule, ConfirmDialogModule, AppointmentDialogComponent],
    providers: [MessageService, ConfirmationService],
    template: `
        <div class="mb-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <div class="text-sm font-semibold text-slate-900 dark:text-white">Vista de agenda visual</div>
                    <div class="text-sm text-slate-600 dark:text-slate-400">
                        Aquí ves la carga horaria del día o la semana. Haz clic sobre una cita para revisar el detalle, editarla o eliminarla.
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 text-xs">
                    <span class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                        <span class="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Programada
                    </span>
                    <span class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Completada
                    </span>
                    <span class="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                        <span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Cancelada
                    </span>
                    <span class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                        <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span> No asistió
                    </span>
                </div>
            </div>
        </div>

        <div class="calendar-wrapper">
            <div #calendarEl></div>
        </div>

        <p-dialog [(visible)]="mostrarDetalle" [modal]="true" [style]="{ width: '450px' }" header="Detalle de Cita">
            <div *ngIf="citaSeleccionada" class="space-y-4">
                <div class="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded">
                    <i class="pi pi-user text-2xl text-blue-600"></i>
                    <div>
                        <label class="text-xs text-surface-500 dark:text-surface-400">Cliente</label>
                        <p class="font-semibold">{{ citaSeleccionada.client_name }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded">
                    <i class="pi pi-briefcase text-2xl text-purple-600"></i>
                    <div>
                        <label class="text-xs text-surface-500 dark:text-surface-400">Empleado</label>
                        <p class="font-semibold">{{ citaSeleccionada.stylist_name }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded">
                    <i class="pi pi-star text-2xl text-yellow-600"></i>
                    <div>
                        <label class="text-xs text-surface-500 dark:text-surface-400">Servicio</label>
                        <p class="font-semibold">{{ citaSeleccionada.service_name }}</p>
                        <p class="text-sm text-surface-600 dark:text-surface-400">{{ citaSeleccionada.service_duration || 30 }} min</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded">
                    <i class="pi pi-clock text-2xl text-green-600"></i>
                    <div>
                        <label class="text-xs text-surface-500 dark:text-surface-400">Fecha y Hora</label>
                        <p class="font-semibold">{{ citaSeleccionada.date_time | date: 'dd/MM/yyyy HH:mm' }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded">
                    <i class="pi pi-info-circle text-2xl text-gray-600"></i>
                    <div class="flex-1">
                        <label class="text-xs text-surface-500 dark:text-surface-400">Estado</label>
                        <div class="mt-1">
                            <p-tag [value]="getStatusLabel(citaSeleccionada.status)" [severity]="getStatusSeverity(citaSeleccionada.status)"></p-tag>
                        </div>
                    </div>
                </div>
                <div *ngIf="citaSeleccionada.description" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <label class="text-xs text-surface-500 dark:text-surface-400">Notas</label>
                    <p class="text-sm mt-1">{{ citaSeleccionada.description }}</p>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <div class="flex gap-2">
                    <button pButton label="Cerrar" class="p-button-text" (click)="mostrarDetalle = false"></button>
                    <button pButton label="Editar" icon="pi pi-pencil" (click)="abrirEdicion()" *ngIf="citaSeleccionada?.status === 'scheduled'"></button>
                    <button pButton label="Eliminar" icon="pi pi-trash" severity="danger" (click)="confirmarEliminar()" *ngIf="citaSeleccionada && canDeleteAppointments"></button>
                </div>
            </ng-template>
        </p-dialog>

        <app-appointment-dialog
            [(visible)]="mostrarFormulario"
            [saving]="guardando()"
            [appointment]="citaSeleccionada"
            [clientsOptions]="clientesOptions()"
            [employeesOptions]="empleadosOptions()"
            [servicesOptions]="servicesOptionsForDialog()"
            (save)="guardarCita($event)"
            (cancel)="cerrarFormulario()"
        ></app-appointment-dialog>

        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>
    `,
    styles: [`
        .calendar-wrapper {
            background: var(--surface-card);
            color: var(--text-color);
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid var(--surface-border);
        }
        :host ::ng-deep .fc {
            font-family: inherit;
            color: var(--text-color);
        }
        :host ::ng-deep .fc .fc-scrollgrid,
        :host ::ng-deep .fc .fc-theme-standard td,
        :host ::ng-deep .fc .fc-theme-standard th {
            border-color: var(--surface-border);
        }
        :host ::ng-deep .fc .fc-col-header-cell-cushion,
        :host ::ng-deep .fc .fc-daygrid-day-number,
        :host ::ng-deep .fc .fc-timegrid-axis-cushion,
        :host ::ng-deep .fc .fc-timegrid-slot-label-cushion {
            color: var(--text-color);
        }
        :host ::ng-deep .fc .fc-button {
            background: var(--primary-color);
            border-color: var(--primary-color);
        }
        :host ::ng-deep .fc-event {
            cursor: pointer;
            border-radius: 4px;
            padding: 2px 4px;
        }
        :host ::ng-deep .fc-event:hover {
            opacity: 0.8;
        }
    `]
})
export class AppointmentsCalendar implements OnInit, AfterViewInit {
    @ViewChild('calendarEl', { static: false }) calendarEl!: ElementRef;

    private readonly appointmentService = inject(AppointmentService);
    private readonly authService = inject(AuthService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly appointmentsUiService = inject(AppointmentsUiService);
    private readonly appointmentsDataService = inject(AppointmentsDataService);
    private readonly destroyRef = inject(DestroyRef);

    private calendar!: Calendar;

    citas = this.appointmentsDataService.appointments;
    clientesOptions = this.appointmentsDataService.clientsOptions;
    empleadosOptions = this.appointmentsDataService.employeesOptions;
    serviciosOptions = this.appointmentsDataService.servicesOptions;
    loading = this.appointmentsDataService.loading;

    guardando = signal(false);
    mostrarDetalle = false;
    mostrarFormulario = false;
    citaSeleccionada: AppointmentWithDetails | null = null;
    canDeleteAppointments = false;

    constructor() {
        effect(() => {
            this.citas();
            this.actualizarEventos();
        });
    }

    ngOnInit(): void {
        this.canDeleteAppointments = this.computeCanDeleteAppointments();
        this.cargarCitas();
        this.appointmentsUiService.refresh$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.cargarCitas(true);
        });
    }

    ngAfterViewInit(): void {
        this.initCalendar();
        this.actualizarEventos();
    }

    loadAppointments(): void {
        this.cargarCitas();
    }

    abrirFormulario(): void {
        this.citaSeleccionada = null;
        this.mostrarFormulario = true;
    }

    abrirEdicion(): void {
        if (!this.citaSeleccionada) {
            return;
        }
        this.mostrarDetalle = false;
        this.mostrarFormulario = true;
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

            const payload = {
                client: formData.client,
                stylist: formData.stylist,
                service: formData.service ?? undefined,
                date_time: fecha.toISOString(),
                description: formData.description,
                status: 'scheduled' as const
            };

            if (this.citaSeleccionada) {
                await this.appointmentService.updateAppointment(this.citaSeleccionada.id, payload).toPromise();
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita actualizada' });
            } else {
                await this.appointmentService.createAppointment(payload).toPromise();
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita creada' });
            }

            this.cerrarFormulario();
            this.appointmentsUiService.requestRefresh();
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar' });
        } finally {
            this.guardando.set(false);
        }
    }

    confirmarEliminar(): void {
        if (!this.canDeleteAppointments) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Acceso restringido',
                detail: 'Tu rol no puede eliminar citas'
            });
            return;
        }

        this.confirmationService.confirm({
            message: '¿Eliminar esta cita?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => this.eliminarCita()
        });
    }

    async eliminarCita(): Promise<void> {
        if (!this.canDeleteAppointments || !this.citaSeleccionada) {
            return;
        }

        try {
            await this.appointmentService.deleteAppointment(this.citaSeleccionada.id).toPromise();
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita eliminada' });
            this.mostrarDetalle = false;
            this.appointmentsUiService.requestRefresh();
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar' });
        }
    }

    cerrarFormulario(): void {
        this.mostrarFormulario = false;
        this.citaSeleccionada = null;
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            scheduled: 'Programada',
            completed: 'Completada',
            cancelled: 'Cancelada',
            no_show: 'No asistió'
        };
        return labels[status] || status;
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'danger' | 'warn' | 'secondary' {
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

    servicesOptionsForDialog(): Array<{ label: string; value: number }> {
        return this.serviciosOptions().map((service) => ({
            label: service.label.replace(/ \(\d+min\)$/, ''),
            value: service.value
        }));
    }

    private async cargarCitas(force = false): Promise<void> {
        try {
            await this.appointmentsDataService.load(force);
        } catch {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar las citas'
            });
        }
    }

    private initCalendar(): void {
        this.calendar = new Calendar(this.calendarEl.nativeElement, {
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
            initialView: 'timeGridWeek',
            locale: esLocale,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            },
            buttonText: {
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                list: 'Lista'
            },
            slotMinTime: '08:00:00',
            slotMaxTime: '21:00:00',
            slotDuration: '00:15:00',
            allDaySlot: false,
            height: 'auto',
            eventClick: (info) => this.onEventClick(info),
            events: [],
            eventColor: '#3b82f6',
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }
        });

        this.calendar.render();
    }

    private actualizarEventos(): void {
        if (!this.calendar) {
            return;
        }

        const eventos = this.citas().map((cita) => ({
            id: cita.id.toString(),
            title: `${cita.client_name} - ${cita.service_name}`,
            start: cita.date_time,
            end: this.calcularFechaFin(cita),
            backgroundColor: this.getColorByCita(cita),
            borderColor: this.getColorByCita(cita),
            extendedProps: { cita }
        }));

        this.calendar.removeAllEvents();
        this.calendar.addEventSource(eventos);
    }

    private calcularFechaFin(cita: AppointmentWithDetails): string {
        const inicio = new Date(cita.date_time);
        const fin = new Date(inicio.getTime() + (cita.service_duration || 30) * 60000);
        return fin.toISOString();
    }

    private getColorByCita(cita: AppointmentWithDetails): string {
        switch (cita.status) {
            case 'scheduled':
                return '#3b82f6';
            case 'completed':
                return '#10b981';
            case 'cancelled':
                return '#ef4444';
            case 'no_show':
                return '#f59e0b';
            default:
                return '#6b7280';
        }
    }

    private onEventClick(info: any): void {
        this.citaSeleccionada = info.event.extendedProps.cita;
        this.mostrarDetalle = true;
    }

    private computeCanDeleteAppointments(): boolean {
        const role = this.authService.getCurrentUser()?.role;
        return role === 'CLIENT_ADMIN' || role === 'Manager' || role === 'SUPER_ADMIN';
    }
}
