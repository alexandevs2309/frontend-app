import { Component, OnInit, signal, ViewChild, ElementRef, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { AppointmentService, AppointmentWithDetails } from '../../../core/services/appointment/appointment.service';
import { AppointmentValidationService } from '../../../core/services/appointment/appointment-validation.service';
import { ServiceService, Service } from '../../../core/services/service/service.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ClientService } from '../../../core/services/client/client.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
    selector: 'app-appointments-calendar',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, TagModule, InputTextModule, SelectModule, DatePickerModule, TextareaModule, ToastModule, ConfirmDialogModule],
    providers: [MessageService, ConfirmationService],
    template: `
        <div class="calendar-wrapper">
            <div #calendarEl></div>
        </div>

        <!-- Dialog Detalle -->
        <p-dialog [(visible)]="mostrarDetalle" [modal]="true" [style]="{width: '450px'}" header="Detalle de Cita">
            <div *ngIf="citaSeleccionada" class="space-y-4">
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <i class="pi pi-user text-2xl text-blue-600"></i>
                    <div>
                        <label class="text-xs text-gray-500">Cliente</label>
                        <p class="font-semibold">{{ citaSeleccionada.client_name }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <i class="pi pi-briefcase text-2xl text-purple-600"></i>
                    <div>
                        <label class="text-xs text-gray-500">Empleado</label>
                        <p class="font-semibold">{{ citaSeleccionada.stylist_name }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <i class="pi pi-star text-2xl text-yellow-600"></i>
                    <div>
                        <label class="text-xs text-gray-500">Servicio</label>
                        <p class="font-semibold">{{ citaSeleccionada.service_name }}</p>
                        <p class="text-sm text-gray-600">{{ citaSeleccionada.service_duration || 30 }} min</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <i class="pi pi-clock text-2xl text-green-600"></i>
                    <div>
                        <label class="text-xs text-gray-500">Fecha y Hora</label>
                        <p class="font-semibold">{{ citaSeleccionada.date_time | date:'dd/MM/yyyy HH:mm' }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <i class="pi pi-info-circle text-2xl text-gray-600"></i>
                    <div class="flex-1">
                        <label class="text-xs text-gray-500">Estado</label>
                        <div class="mt-1">
                            <p-tag [value]="getStatusLabel(citaSeleccionada.status)" 
                                   [severity]="getStatusSeverity(citaSeleccionada.status)"></p-tag>
                        </div>
                    </div>
                </div>
                <div *ngIf="citaSeleccionada.description" class="p-3 bg-blue-50 rounded">
                    <label class="text-xs text-gray-500">Notas</label>
                    <p class="text-sm mt-1">{{ citaSeleccionada.description }}</p>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <div class="flex gap-2">
                    <button pButton label="Cerrar" class="p-button-text" (click)="mostrarDetalle = false"></button>
                    <button pButton label="Editar" icon="pi pi-pencil" (click)="abrirEdicion()" 
                            *ngIf="citaSeleccionada?.status === 'scheduled'"></button>
                    <button pButton label="Eliminar" icon="pi pi-trash" severity="danger" (click)="confirmarEliminar()" 
                            *ngIf="citaSeleccionada"></button>
                </div>
            </ng-template>
        </p-dialog>

        <!-- Dialog Formulario -->
        <p-dialog [(visible)]="mostrarFormulario" [modal]="true" [style]="{width: '600px'}" 
                  [header]="editando ? 'Editar Cita' : 'Nueva Cita'">
            <form [formGroup]="formulario" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-2 font-semibold">Cliente *</label>
                        <p-select formControlName="client" [options]="clientesOptions" 
                                  optionLabel="label" optionValue="value" placeholder="Seleccionar" 
                                  class="w-full" [filter]="true"></p-select>
                    </div>
                    <div>
                        <label class="block mb-2 font-semibold">Empleado *</label>
                        <p-select formControlName="stylist" [options]="empleadosOptions" 
                                  optionLabel="label" optionValue="value" placeholder="Seleccionar" 
                                  class="w-full"></p-select>
                    </div>
                </div>
                <div>
                    <label class="block mb-2 font-semibold">Servicio</label>
                    <p-select formControlName="service" [options]="serviciosOptions" 
                              optionLabel="label" optionValue="value" placeholder="Seleccionar" 
                              class="w-full" [showClear]="true"></p-select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-2 font-semibold">Fecha *</label>
                        <p-datepicker formControlName="date" dateFormat="dd/mm/yy" 
                                      [showIcon]="true" class="w-full"></p-datepicker>
                    </div>
                    <div>
                        <label class="block mb-2 font-semibold">Hora *</label>
                        <p-datepicker formControlName="time" [timeOnly]="true" [showIcon]="true" 
                                      hourFormat="24" class="w-full"></p-datepicker>
                    </div>
                </div>
                <div>
                    <label class="block mb-2 font-semibold">Notas</label>
                    <textarea pInputTextarea formControlName="description" rows="3" 
                              class="w-full" placeholder="Notas adicionales..."></textarea>
                </div>
            </form>
            <ng-template pTemplate="footer">
                <div class="flex gap-2">
                    <button pButton label="Cancelar" class="p-button-text" (click)="cerrarFormulario()"></button>
                    <button pButton [label]="editando ? 'Actualizar' : 'Crear'" 
                            [disabled]="formulario.invalid" [loading]="guardando()" 
                            (click)="guardarCita()"></button>
                </div>
            </ng-template>
        </p-dialog>

        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>
    `,
    styles: [`
        .calendar-wrapper {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        :host ::ng-deep .fc {
            font-family: inherit;
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
    private calendar!: Calendar;
    private appointmentService = inject(AppointmentService);
    private validationService = inject(AppointmentValidationService);
    private serviceService = inject(ServiceService);
    private authService = inject(AuthService);
    private clientService = inject(ClientService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private fb = inject(FormBuilder);

    citas = signal<AppointmentWithDetails[]>([]);
    guardando = signal(false);
    mostrarDetalle = false;
    mostrarFormulario = false;
    editando = false;
    citaSeleccionada: AppointmentWithDetails | null = null;

    clientesOptions: any[] = [];
    empleadosOptions: any[] = [];
    serviciosOptions: any[] = [];

    formulario: FormGroup = this.fb.group({
        client: [null, Validators.required],
        stylist: [null, Validators.required],
        service: [null],
        date: [null, Validators.required],
        time: [null, Validators.required],
        description: ['']
    });

    ngOnInit() {
        this.cargarCitas();
        this.cargarOpciones();
        window.addEventListener('appointmentSaved', () => this.loadAppointments());
    }

    ngAfterViewInit() {
        this.initCalendar();
    }

    initCalendar() {
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

    async cargarCitas() {
        try {
            const [citasRes, serviciosRes, usuariosRes, clientesRes] = await Promise.all([
                this.appointmentService.getAppointments().toPromise(),
                this.serviceService.getActiveServices().toPromise(),
                this.authService.getUsers().toPromise(),
                this.clientService.getClients().toPromise()
            ]);

            const citas = (citasRes as any)?.results || citasRes || [];
            const servicios = (serviciosRes as any)?.results || serviciosRes || [];
            const usuarios = (usuariosRes as any)?.results || usuariosRes || [];
            const clientes = (clientesRes as any)?.results || clientesRes || [];

            // Enriquecer citas con nombres
            const citasEnriquecidas = citas.map((cita: any) => {
                const servicio = servicios.find((s: any) => s.id === cita.service);
                const empleado = usuarios.find((u: any) => u.id === cita.stylist);
                const cliente = clientes.find((c: any) => c.id === cita.client);

                return {
                    ...cita,
                    client_name: cliente?.name || cliente?.full_name || 'Sin nombre',
                    stylist_name: empleado?.full_name || 'Sin nombre',
                    service_name: servicio?.name || 'Sin servicio',
                    service_duration: servicio?.duration || 30
                };
            });

            this.citas.set(citasEnriquecidas);
            this.actualizarEventos();
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar las citas'
            });
        }
    }

    loadAppointments() {
        this.cargarCitas();
    }

    actualizarEventos() {
        if (!this.calendar) return;

        const eventos = this.citas().map(cita => ({
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

    calcularFechaFin(cita: AppointmentWithDetails): string {
        const inicio = new Date(cita.date_time);
        const fin = new Date(inicio.getTime() + (cita.service_duration || 30) * 60000);
        return fin.toISOString();
    }

    getColorByCita(cita: AppointmentWithDetails): string {
        switch (cita.status) {
            case 'scheduled': return '#3b82f6';
            case 'completed': return '#10b981';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    }

    getStatusLabel(status: string): string {
        const labels: any = {
            'scheduled': 'Programada',
            'completed': 'Completada',
            'cancelled': 'Cancelada'
        };
        return labels[status] || status;
    }

    getStatusSeverity(status: string): any {
        switch (status) {
            case 'scheduled': return 'info';
            case 'completed': return 'success';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    }

    onEventClick(info: any) {
        const cita = info.event.extendedProps.cita;
        this.citaSeleccionada = cita;
        this.mostrarDetalle = true;
    }

    async cargarOpciones() {
        try {
            const [servicios, usuarios, clientes] = await Promise.all([
                this.serviceService.getActiveServices().toPromise(),
                this.authService.getUsers().toPromise(),
                this.clientService.getClients().toPromise()
            ]);

            const serviciosArray = (servicios as any)?.results || servicios || [];
            const usuariosArray = (usuarios as any)?.results || usuarios || [];
            const clientesArray = (clientes as any)?.results || clientes || [];

            this.serviciosOptions = serviciosArray.map((s: any) => ({
                label: `${s.name} - $${s.price}`,
                value: s.id
            }));

            this.empleadosOptions = usuariosArray
                .filter((u: any) => ['Estilista', 'Manager', 'Client-Staff'].includes(u.role))
                .map((u: any) => ({ label: u.full_name, value: u.id }));

            this.clientesOptions = clientesArray.map((c: any) => ({
                label: c.name || c.full_name,
                value: c.id
            }));
        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error cargando opciones' });
        }
    }

    abrirFormulario() {
        this.editando = false;
        this.citaSeleccionada = null;
        this.formulario.reset();
        this.mostrarFormulario = true;
    }

    abrirEdicion() {
        if (!this.citaSeleccionada) return;
        this.editando = true;
        const fecha = new Date(this.citaSeleccionada.date_time);
        this.formulario.patchValue({
            client: this.citaSeleccionada.client,
            stylist: this.citaSeleccionada.stylist,
            service: this.citaSeleccionada.service,
            date: fecha,
            time: fecha,
            description: this.citaSeleccionada.description
        });
        this.mostrarDetalle = false;
        this.mostrarFormulario = true;
    }

    async guardarCita() {
        if (this.formulario.invalid) return;
        this.guardando.set(true);
        try {
            const formData = this.formulario.value;
            const fecha = new Date(formData.date);
            const hora = new Date(formData.time);
            fecha.setHours(hora.getHours(), hora.getMinutes(), 0, 0);

            const payload = {
                client: formData.client,
                stylist: formData.stylist,
                service: formData.service,
                date_time: fecha.toISOString(),
                description: formData.description,
                status: 'scheduled' as const
            };

            if (this.editando && this.citaSeleccionada) {
                await this.appointmentService.updateAppointment(this.citaSeleccionada.id, payload).toPromise();
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita actualizada' });
            } else {
                await this.appointmentService.createAppointment(payload).toPromise();
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita creada' });
            }

            this.cerrarFormulario();
            this.cargarCitas();
        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar' });
        } finally {
            this.guardando.set(false);
        }
    }

    confirmarEliminar() {
        this.confirmationService.confirm({
            message: '¿Eliminar esta cita?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => this.eliminarCita()
        });
    }

    async eliminarCita() {
        if (!this.citaSeleccionada) return;
        try {
            await this.appointmentService.deleteAppointment(this.citaSeleccionada.id).toPromise();
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita eliminada' });
            this.mostrarDetalle = false;
            this.cargarCitas();
        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar' });
        }
    }

    cerrarFormulario() {
        this.mostrarFormulario = false;
        this.formulario.reset();
        this.citaSeleccionada = null;
        this.editando = false;
    }
}
