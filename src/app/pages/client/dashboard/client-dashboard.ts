import { Component, signal, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { TrialService } from '../../../core/services/trial.service';
import { NotificationBadgeService } from '../../../core/services/notification/notification-badge.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TrialBannerComponent } from '../../../shared/components/trial-banner.component';
import { StatsWidget } from '../../dashboard/components/statswidget';
import { RecentSalesWidget } from '../../dashboard/components/recentsaleswidget';
import { BestSellingWidget } from '../../dashboard/components/bestsellingwidget';
import { RevenueStreamWidget } from '../../dashboard/components/revenuestreamwidget';
import { NotificationsWidget } from '../../dashboard/components/notificationswidget';
import { Subscription } from 'rxjs';
import { LocaleService } from '../../../core/services/locale/locale.service';

@Component({
    selector: 'app-client-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, ToastModule, TrialBannerComponent, StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <app-trial-banner></app-trial-banner>
        
        @if (currentUser(); as user) {
            <section id="onb-dashboard-welcome" class="dashboard-hero mb-8">
                <div class="dashboard-hero__content">
                    <div class="dashboard-hero__eyebrow">{{ t('dashboard.hero_eyebrow') }}</div>
                    <h1 class="dashboard-hero__title">
                        {{ t('dashboard.welcome') }}, {{ user.full_name }}
                    </h1>
                    <p class="dashboard-hero__subtitle">
                        {{ getHeroSummary() }}
                    </p>
                    <div class="dashboard-hero__actions">
                        <button pButton type="button" [label]="t('dashboard.hero_cta_agenda')" icon="pi pi-calendar" class="p-button-sm" (click)="goTo('/client/appointments')"></button>
                        <button pButton type="button" [label]="t('dashboard.hero_cta_pos')" icon="pi pi-shopping-cart" class="p-button-sm p-button-outlined" (click)="goTo('/client/pos')"></button>
                    </div>
                </div>
                <div class="dashboard-hero__aside">
                    <div class="dashboard-hero__pulse">
                        <span class="dashboard-hero__pulse-dot"></span>
                        {{ getRoleDisplayName(user.role) }}
                    </div>
                    <div class="dashboard-hero__stat">
                        <strong>{{ appointmentCount() }}</strong>
                        <span>{{ t('dashboard.hero_stat_appointments') }}</span>
                    </div>
                    <div class="dashboard-hero__stat">
                        <strong>{{ overdueCount() }}</strong>
                        <span>{{ t('dashboard.hero_stat_overdue') }}</span>
                    </div>
                </div>
            </section>
            
            <div class="grid grid-cols-12 gap-8">
                <app-stats-widget class="contents" />
                
                <div class="col-span-12 xl:col-span-6">
                    <app-recent-sales-widget />
                    @if (showAdminWidgets()) {
                        <app-best-selling-widget />
                    }
                </div>
                <div class="col-span-12 xl:col-span-6">
                    @if (showAdminWidgets()) {
                        <app-revenue-stream-widget />
                    }
                    @defer (on viewport) {
                        <app-notifications-widget />
                    } @placeholder {
                        <div class="card h-32 animate-pulse bg-surface-100 dark:bg-surface-800 rounded-xl"></div>
                    }
                </div>
            </div>
        }
    `,
    styles: [`
        .dashboard-hero {
            display: grid;
            grid-template-columns: minmax(0, 1.7fr) minmax(16rem, 0.9fr);
            gap: 1.5rem;
            padding: 1.75rem;
            border-radius: 1.75rem;
            background:
                linear-gradient(135deg, rgba(248, 250, 252, 0.98), rgba(238, 242, 255, 0.96));
            color: #0f172a;
            border: 1px solid rgba(148, 163, 184, 0.18);
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
        }

        .dashboard-hero__content {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .dashboard-hero__eyebrow {
            font-size: 0.74rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: rgba(79, 70, 229, 0.78);
            font-weight: 700;
        }

        .dashboard-hero__title {
            margin: 0;
            font-size: clamp(2rem, 4vw, 3rem);
            line-height: 1.02;
            font-weight: 800;
        }

        .dashboard-hero__subtitle {
            margin: 0;
            max-width: 52rem;
            color: rgba(51, 65, 85, 0.88);
            font-size: 1rem;
            line-height: 1.6;
        }

        .dashboard-hero__actions {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            padding-top: 0.5rem;
        }

        .dashboard-hero__aside {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 0.85rem;
            padding: 1.1rem;
            border-radius: 1.35rem;
            background: rgba(255, 255, 255, 0.72);
            border: 1px solid rgba(148, 163, 184, 0.18);
        }

        .dashboard-hero__pulse {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.88rem;
            color: rgba(30, 41, 59, 0.92);
        }

        .dashboard-hero__pulse-dot {
            width: 0.55rem;
            height: 0.55rem;
            border-radius: 999px;
            background: #22c55e;
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
            animation: pulseGlow 1.8s infinite;
        }

        .dashboard-hero__stat {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
            padding: 0.9rem 0;
            border-top: 1px solid rgba(148, 163, 184, 0.18);
        }

        .dashboard-hero__stat:first-of-type {
            border-top: 0;
            padding-top: 0;
        }

        .dashboard-hero__stat strong {
            font-size: 2rem;
            line-height: 1;
            font-weight: 800;
        }

        .dashboard-hero__stat span {
            color: rgba(71, 85, 105, 0.88);
            font-size: 0.92rem;
        }

        :host-context(.app-dark) .dashboard-hero {
            background:
                linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92));
            color: #f8fafc;
            border-color: rgba(148, 163, 184, 0.12);
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
        }

        :host-context(.app-dark) .dashboard-hero__eyebrow {
            color: rgba(191, 219, 254, 0.78);
        }

        :host-context(.app-dark) .dashboard-hero__subtitle {
            color: rgba(226, 232, 240, 0.9);
        }

        :host-context(.app-dark) .dashboard-hero__aside {
            background: rgba(148, 163, 184, 0.12);
            border-color: rgba(148, 163, 184, 0.16);
        }

        :host-context(.app-dark) .dashboard-hero__pulse {
            color: rgba(226, 232, 240, 0.92);
        }

        :host-context(.app-dark) .dashboard-hero__stat {
            border-top-color: rgba(148, 163, 184, 0.16);
        }

        :host-context(.app-dark) .dashboard-hero__stat span {
            color: rgba(226, 232, 240, 0.78);
        }

        @keyframes pulseGlow {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.35); }
            70% { box-shadow: 0 0 0 0.65rem rgba(34, 197, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        @media (max-width: 960px) {
            .dashboard-hero {
                grid-template-columns: 1fr;
            }
        }
    `]
})
export class ClientDashboard implements OnInit, OnDestroy {
    currentUser = signal<any>(null);
    private subscription = new Subscription();
    private notificationService = inject(NotificationBadgeService);
    private messageService = inject(MessageService);
    private router = inject(Router);

    constructor(
        private authService: AuthService,
        private trialService: TrialService,
        private localeService: LocaleService
    ) {}

    ngOnInit() {
        this.subscription.add(
            this.authService.currentUser$.subscribe(user => {
                this.currentUser.set(user);
            })
        );
        
        setTimeout(() => {
            this.trialService.loadTrialStatus();
            if (this.canLoadAppointments()) {
                this.showAppointmentNotifications();
            }
        }, 0);
    }

    showAppointmentNotifications() {
        const todayAppointments = this.notificationService.todayAppointments();
        const todayCount = todayAppointments.length;
        const upcoming = this.notificationService.upcomingAppointments();
        const overdueCount = this.notificationService.overdueAppointments().length;

        if (todayCount > 0) {
            const details = this.buildTodayAppointmentsDetail(todayAppointments);
            this.messageService.add({
                severity: 'info',
                summary: this.t('dashboard.notifications.today_appointments'),
                detail: `${this.t('dashboard.notifications.today_appointments_detail').replace('{count}', String(todayCount))}\n${details}`,
                life: 9000
            });
        }

        if (upcoming.length > 0) {
            const next = upcoming[0];
            const time = this.localeService.formatTime(next.date_time);
            this.messageService.add({
                severity: 'warn',
                summary: this.t('dashboard.notifications.upcoming_appointment'),
                detail: this.t('dashboard.notifications.upcoming_appointment_detail').replace('{time}', time),
                life: 8000
            });
            this.playNotificationSound();
        }

        if (overdueCount > 0) {
            this.messageService.add({
                severity: 'error',
                summary: this.t('dashboard.notifications.overdue_appointments'),
                detail: this.t('dashboard.notifications.overdue_appointments_detail').replace('{count}', String(overdueCount)),
                life: 9000
            });
            this.playNotificationSound();
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private readonly roleNames = {
        'SuperAdmin': 'dashboard.role.super_admin',
        'SUPER_ADMIN': 'dashboard.role.super_admin',
        'CLIENT_ADMIN': 'dashboard.role.client_admin',
        'Client-Admin': 'dashboard.role.client_admin', 
        'CLIENT_STAFF': 'dashboard.role.client_staff',
        'Client-Staff': 'dashboard.role.client_staff',
        'Cajera': 'dashboard.role.cashier',
        'Manager': 'dashboard.role.manager',
        'Estilista': 'dashboard.role.stylist'
    } as const;

    getRoleDisplayName(role: string): string {
        const key = this.roleNames[role as keyof typeof this.roleNames];
        return key ? this.t(key) : role;
    }

    appointmentCount(): number {
        return this.notificationService.todayAppointments().length;
    }

    overdueCount(): number {
        return this.notificationService.overdueAppointments().length;
    }

    getHeroSummary(): string {
        const appointmentCount = this.appointmentCount();
        const overdueCount = this.overdueCount();
        if (appointmentCount === 0 && overdueCount === 0) {
            return this.t('dashboard.hero_summary_empty');
        }
        return this.t('dashboard.hero_summary_active')
            .replace('{appointments}', String(appointmentCount))
            .replace('{overdue}', String(overdueCount));
    }

    goTo(route: string): void {
        this.router.navigate([route]);
    }

    canAccessFeature(feature: string): boolean {
        return this.trialService.canAccessFeature(feature);
    }

    showAdminWidgets(): boolean {
        const role = this.currentUser()?.role;
        return role === 'CLIENT_ADMIN' || role === 'Manager';
    }

    private canLoadAppointments(): boolean {
        const role = this.currentUser()?.role;
        return role === 'CLIENT_ADMIN' || role === 'CLIENT_STAFF' || role === 'Cajera' || role === 'Manager' || role === 'Estilista';
    }

    private playNotificationSound(): void {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.07, audioContext.currentTime);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.18);
        } catch {
        }
    }

    t(key: string): string {
        return this.localeService.t(key as any);
    }

    private buildTodayAppointmentsDetail(appointments: any[]): string {
        const maxItems = 3;
        const lines = appointments.slice(0, maxItems).map((apt) => {
            const time = this.localeService.formatTime(apt.date_time);
            const client = apt.client_name || `Cliente #${apt.client}`;
            const service = apt.service_name || 'Servicio no especificado';
            return `• ${time} - ${client} - ${service}`;
        });

        if (appointments.length > maxItems) {
            lines.push(this.t('dashboard.notifications.more').replace('{count}', String(appointments.length - maxItems)));
        } else {
            lines.push(this.t('dashboard.notifications.view_full_agenda'));
        }

        return lines.join('\n');
    }
}
