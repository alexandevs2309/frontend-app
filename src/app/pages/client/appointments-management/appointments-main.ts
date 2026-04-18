import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { NotificationBadgeService } from '../../../core/services/notification/notification-badge.service';
import { AppointmentsDataService } from './appointments-data.service';
import { AppointmentsUiService } from './appointments-ui.service';

type AppointmentTab = 'calendar' | 'list';

@Component({
    selector: 'app-appointments-main',
    standalone: true,
    imports: [CommonModule, ButtonModule, RouterLink, RouterLinkActive, RouterOutlet],
    template: `
        <div class="appts-shell">
            <header class="appts-header">
                <div class="appts-header__left">
                    <div class="appts-status">
                        <span class="appts-status__dot"></span>
                        Agenda activa
                    </div>
                    <div class="appts-header__title">
                        <strong>Gestiona la jornada sin fricción</strong>
                        <span>{{ getHeaderNarrative() }}</span>
                    </div>
                    <div class="appts-header__counts">
                        <span><strong>{{ stats().todayCount }}</strong> hoy</span>
                        <span class="appts-header__sep">·</span>
                        <span [class.appts-header__overdue]="stats().overdueCount > 0"><strong>{{ stats().overdueCount }}</strong> vencidas</span>
                        <span class="appts-header__sep">·</span>
                        <span><strong>{{ stats().statusCounts.scheduled }}</strong> programadas</span>
                    </div>
                </div>
                <div class="appts-header__right">
                    <a routerLink="calendar" routerLinkActive="is-active" class="appts-tab">
                        <i class="pi pi-calendar"></i> Calendario
                    </a>
                    <a routerLink="list" routerLinkActive="is-active" class="appts-tab">
                        <i class="pi pi-list"></i> Lista
                    </a>
                    <button pButton icon="pi pi-plus" label="Nueva cita" (click)="crearCita()" class="appts-cta"></button>
                </div>
            </header>

            <div class="appts-next" *ngIf="stats().nextAppointment as next; else noNextAppointment">
                <span class="appts-next__label">Próxima</span>
                <strong>{{ next.client_name || ('Cliente #' + next.client) }}</strong>
                <span>{{ next.stylist_name || ('Empleado #' + next.stylist) }}</span>
                <span class="appts-next__time">{{ next.date_time | date: 'dd/MM HH:mm' }}</span>
            </div>
            <ng-template #noNextAppointment>
                <div class="appts-next">
                    <span class="appts-next__label">Estado</span>
                    <strong>Sin próxima cita</strong>
                    <span>{{ stats().statusCounts.scheduled > 0 ? 'Todavía hay citas pendientes por resolver en la lista.' : 'La agenda está limpia por ahora.' }}</span>
                </div>
            </ng-template>

            <router-outlet></router-outlet>
        </div>

        <style>
        .appts-shell { display: flex; flex-direction: column; gap: 0; }

        .appts-header {
            display: flex; align-items: center; justify-content: space-between;
            flex-wrap: wrap; gap: 0.75rem;
            padding: 0.85rem 1rem;
            border: 1px solid var(--surface-border);
            background: var(--surface-card);
            border-radius: 0.85rem;
            margin-bottom: 0.75rem;
        }

        .appts-header__left, .appts-header__right { display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap; }

        .appts-header__title {
            display: flex;
            flex-direction: column;
            gap: 0.12rem;
            margin-left: 0.25rem;
        }

        .appts-header__title strong {
            font-size: 1rem;
            color: var(--text-color);
        }

        .appts-header__title span {
            font-size: 0.82rem;
            color: var(--text-color-secondary);
        }

        .appts-status {
            display: inline-flex; align-items: center; gap: 0.4rem;
            font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.1em; color: var(--text-color-secondary);
        }

        .appts-status__dot {
            width: 0.5rem; height: 0.5rem; border-radius: 999px; background: #10b981;
        }

        .appts-header__counts { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--text-color); }
        .appts-header__sep { color: var(--text-color-secondary); }
        .appts-header__overdue strong { color: #d97706; }

        .appts-tab {
            display: inline-flex; align-items: center; gap: 0.4rem;
            padding: 0.45rem 0.9rem; border-radius: 6px;
            font-size: 0.88rem; font-weight: 600;
            border: 1px solid var(--surface-border);
            color: var(--text-color-secondary);
            text-decoration: none; transition: all 120ms;
        }

        .appts-tab.is-active {
            background: #111827; color: #fff; border-color: #111827;
        }

        .appts-cta { height: 2.25rem; font-size: 0.88rem; }

        .appts-next {
            display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
            padding: 0.65rem 1rem;
            border: 1px solid var(--surface-border);
            background: var(--surface-ground);
            border-radius: 0.65rem;
            font-size: 0.88rem;
            margin-bottom: 0.75rem;
        }

        .appts-next__label {
            font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.1em; color: var(--text-color-secondary);
        }

        .appts-next strong { color: var(--text-color); font-weight: 700; }
        .appts-next span { color: var(--text-color-secondary); }

        .appts-next__time {
            margin-left: auto; font-weight: 700;
            color: #4f46e5;
        }
        </style>
    `
})
export class AppointmentsMain implements OnInit {
    private readonly notificationService = inject(NotificationBadgeService);
    private readonly appointmentsUiService = inject(AppointmentsUiService);
    private readonly appointmentsDataService = inject(AppointmentsDataService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly router = inject(Router);

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
        this.setActiveTabFromUrl(this.router.url);
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((event) => {
            this.setActiveTabFromUrl(event.urlAfterRedirects);
        });
    }

    crearCita(): void {
        this.appointmentsUiService.requestCreate(this.activeTab);
    }

    getHeaderNarrative(): string {
        if (this.activeTab === 'list') {
            return 'Modo de resolución rápida para completar, cancelar y seguir.';
        }

        return 'Modo visual para repartir mejor la carga y detectar huecos.';
    }

    private setActiveTabFromUrl(url: string): void {
        this.activeTab = url.includes('/appointments/list') ? 'list' : 'calendar';
    }
}
