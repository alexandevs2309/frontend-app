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
        <div class="p-4 md:p-6 space-y-6">
            <section class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div class="grid gap-6 px-6 py-7 xl:grid-cols-[1.35fr,0.85fr] xl:px-8">
                    <div class="space-y-5">
                        <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                            Agenda operativa
                        </div>
                        <div>
                            <h2 class="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Gestión de citas</h2>
                            <p class="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">Administra agenda, estados y carga diaria del negocio desde una vista más clara y accionable.</p>
                            <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
                                {{ activeTab === 'calendar' ? 'El calendario te ayuda a visualizar la agenda y detectar huecos u horas cargadas.' : 'La lista te ayuda a filtrar rápido, completar pendientes y revisar estados sin perder detalle.' }}
                            </p>
                        </div>
                    </div>
                    <div class="rounded-[1.6rem] bg-slate-950 p-5 text-white shadow-xl">
                        <div class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Pulso de agenda</div>
                        <div class="mt-2 text-2xl font-black">{{ stats().todayCount }} citas hoy</div>
                        <div class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                            {{ stats().overdueCount }} requieren revision y {{ stats().statusCounts.scheduled }} siguen programadas.
                        </div>
                        <button
                            pButton
                            [label]="activeTab === 'list' ? 'Nueva cita en lista' : 'Nueva cita en calendario'"
                            icon="pi pi-plus"
                            (click)="crearCita()"
                            class="mt-4 w-full !bg-white !text-slate-950 hover:!bg-slate-100 !border-0"
                        ></button>
                    </div>
                </div>
            </section>

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
        this.appointmentsDataService.load(true);
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
