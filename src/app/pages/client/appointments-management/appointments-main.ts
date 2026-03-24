import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { NotificationBadgeService } from '../../../core/services/notification/notification-badge.service';
import { AppointmentsCalendar } from './appointments-calendar';
import { AppointmentsDataService } from './appointments-data.service';
import { AppointmentsManagement } from './appointments-management';
import { AppointmentsUiService } from './appointments-ui.service';

type AppointmentTab = 'calendar' | 'list';

@Component({
    selector: 'app-appointments-main',
    standalone: true,
    imports: [CommonModule, TabsModule, ButtonModule, AppointmentsCalendar, AppointmentsManagement],
    template: `
        <div class="p-4 md:p-6">
            <div class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-6 rounded-xl mb-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-indigo-600 rounded-xl">
                            <i class="pi pi-calendar text-white text-3xl"></i>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Citas</h2>
                            <p class="text-slate-600 dark:text-slate-400 mt-1">Administra las citas de tu barbería</p>
                            <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                {{ activeTab === 'calendar' ? 'El calendario te ayuda a visualizar la agenda y detectar huecos u horas cargadas.' : 'La lista te ayuda a filtrar rápido, completar pendientes y revisar estados sin perder detalle.' }}
                            </p>
                        </div>
                    </div>
                    <button
                        pButton
                        [label]="activeTab === 'list' ? 'Nueva Cita en Lista' : 'Nueva Cita en Calendario'"
                        icon="pi pi-plus"
                        (click)="crearCita()"
                        class="!bg-indigo-600 !text-white hover:!bg-indigo-700 !border-0 !shadow-lg"
                    ></button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
                <div class="md:col-span-2 xl:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Próxima cita</div>
                    <div class="mt-2" *ngIf="stats().nextAppointment as next; else noNextAppointment">
                        <div class="text-lg font-semibold text-slate-900 dark:text-white">{{ next.client_name || ('Cliente #' + next.client) }}</div>
                        <div class="text-sm text-slate-600 dark:text-slate-400">{{ next.stylist_name || ('Empleado #' + next.stylist) }}</div>
                        <div class="mt-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">{{ next.date_time | date: 'dd/MM/yyyy HH:mm' }}</div>
                    </div>
                    <ng-template #noNextAppointment>
                        <div class="mt-2 text-sm text-slate-500 dark:text-slate-400">No hay citas futuras programadas ahora mismo.</div>
                    </ng-template>
                </div>

                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Hoy</div>
                    <div class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ stats().todayCount }}</div>
                    <div class="text-sm text-slate-500 dark:text-slate-400">citas del día</div>
                </div>

                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Pendientes</div>
                    <div class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ stats().statusCounts.scheduled }}</div>
                    <div class="text-sm text-slate-500 dark:text-slate-400">programadas</div>
                </div>

                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Vencidas</div>
                    <div class="mt-2 text-3xl font-bold" [ngClass]="stats().overdueCount > 0 ? 'text-amber-600 dark:text-amber-300' : 'text-slate-900 dark:text-white'">{{ stats().overdueCount }}</div>
                    <div class="text-sm text-slate-500 dark:text-slate-400">requieren revisión</div>
                </div>

                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</div>
                    <div class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ stats().total }}</div>
                    <div class="text-sm text-slate-500 dark:text-slate-400">citas registradas</div>
                </div>
            </div>

            <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
                <div *ngFor="let card of summaryCards" class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm border-l-4" [ngClass]="card.accent">
                    <div class="text-sm font-medium">{{ card.label }}</div>
                    <div class="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{{ stats().statusCounts[card.key] }}</div>
                </div>
            </div>

            <p-tabs [(value)]="activeTab">
                <p-tablist>
                    <p-tab value="calendar">
                        <i class="pi pi-calendar mr-2"></i>
                        <span>Calendario</span>
                    </p-tab>
                    <p-tab value="list">
                        <i class="pi pi-list mr-2"></i>
                        <span>Lista</span>
                    </p-tab>
                </p-tablist>

                <p-tabpanels>
                    <p-tabpanel value="calendar">
                        <app-appointments-calendar #calendar></app-appointments-calendar>
                    </p-tabpanel>

                    <p-tabpanel value="list">
                        <app-appointments-management #lista></app-appointments-management>
                    </p-tabpanel>
                </p-tabpanels>
            </p-tabs>
        </div>
    `
})
export class AppointmentsMain implements OnInit {
    @ViewChild('lista') listaComponent!: AppointmentsManagement;
    @ViewChild('calendar') calendarComponent!: AppointmentsCalendar;

    private readonly notificationService = inject(NotificationBadgeService);
    private readonly appointmentsUiService = inject(AppointmentsUiService);
    private readonly appointmentsDataService = inject(AppointmentsDataService);
    private readonly destroyRef = inject(DestroyRef);

    activeTab: AppointmentTab = 'calendar';
    stats = this.appointmentsDataService.stats;

    summaryCards = [
        { key: 'scheduled', label: 'Programadas', accent: 'border-l-blue-500 text-blue-700 dark:text-blue-300' },
        { key: 'completed', label: 'Completadas', accent: 'border-l-emerald-500 text-emerald-700 dark:text-emerald-300' },
        { key: 'cancelled', label: 'Canceladas', accent: 'border-l-rose-500 text-rose-700 dark:text-rose-300' },
        { key: 'no_show', label: 'No asistió', accent: 'border-l-amber-500 text-amber-700 dark:text-amber-300' }
    ] as const;

    ngOnInit(): void {
        this.appointmentsDataService.load();
        this.appointmentsUiService.refresh$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.notificationService.refresh();
        });
    }

    crearCita(): void {
        if (this.activeTab === 'list') {
            this.listaComponent?.abrirDialogo();
            return;
        }

        this.calendarComponent?.abrirFormulario();
    }
}
