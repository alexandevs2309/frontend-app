import { Component, signal, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import { TrialService } from '../../../core/services/trial.service';
import { NotificationBadgeService } from '../../../core/services/notification/notification-badge.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
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
    imports: [CommonModule, ToastModule, TrialBannerComponent, StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <app-trial-banner></app-trial-banner>
        
        @if (currentUser(); as user) {
            <!-- Hero Header -->
            <div id="onb-dashboard-welcome" class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-8 rounded-xl mb-8">
                <div class="flex items-center gap-6">
                    <div class="p-4 bg-indigo-600 rounded-xl">
                        <i class="pi pi-cut text-white text-4xl"></i>
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            {{ t('dashboard.welcome') }}, {{user.full_name}}
                        </h1>
                        <p class="text-slate-600 dark:text-slate-400 text-base">
                            <span class="font-medium">{{getRoleDisplayName(user.role)}}</span>
                            <span class="mx-2">•</span>
                            <span>{{ t('dashboard.control_panel') }}</span>
                        </p>
                    </div>
                </div>
            </div>
            
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
                    <app-notifications-widget />
                </div>
            </div>
        }
    `,
    styles: [``]
})
export class ClientDashboard implements OnInit, OnDestroy {
    currentUser = signal<any>(null);
    private subscription = new Subscription();
    private notificationService = inject(NotificationBadgeService);
    private messageService = inject(MessageService);

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
        const todayCount = this.notificationService.todayAppointments().length;
        const upcoming = this.notificationService.upcomingAppointments();
        const overdueCount = this.notificationService.overdueAppointments().length;

        if (todayCount > 0) {
            this.messageService.add({
                severity: 'info',
                summary: this.t('dashboard.notifications.today_appointments'),
                detail: this.t('dashboard.notifications.today_appointments_detail').replace('{count}', String(todayCount)),
                life: 5000
            });
        }

        if (upcoming.length > 0) {
            const next = upcoming[0];
            const time = new Date(next.date_time).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
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
        'SuperAdmin': 'Super Administrador',
        'CLIENT_ADMIN': 'Administrador',
        'Client-Admin': 'Administrador', 
        'CLIENT_STAFF': 'Empleado',
        'Client-Staff': 'Empleado',
        'Cajera': 'Cajera',
        'Manager': 'Manager',
        'Estilista': 'Estilista'
    } as const;

    getRoleDisplayName(role: string): string {
        return this.roleNames[role as keyof typeof this.roleNames] || role;
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
}
