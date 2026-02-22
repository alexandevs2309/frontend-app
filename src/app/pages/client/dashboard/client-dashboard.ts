import { Component, signal, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import { TrialService } from '../../../core/services/trial.service';
import { NotificationBadgeService } from '../../../core/services/notification/notification-badge.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TrialBannerComponent } from '../../../shared/components/trial-banner.component';
import { SubscriptionStatusComponent } from '../../../shared/components/subscription-status.component';
import { StatsWidget } from '../../dashboard/components/statswidget';
import { RecentSalesWidget } from '../../dashboard/components/recentsaleswidget';
import { BestSellingWidget } from '../../dashboard/components/bestsellingwidget';
import { RevenueStreamWidget } from '../../dashboard/components/revenuestreamwidget';
import { NotificationsWidget } from '../../dashboard/components/notificationswidget';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-client-dashboard',
    standalone: true,
    imports: [CommonModule, ToastModule, TrialBannerComponent, SubscriptionStatusComponent, StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
    providers: [MessageService],
    // changeDetection: ChangeDetectionStrategy.OnPush, // REMOVIDO - No es seguro
    template: `
        <p-toast position="top-right" />
        <app-trial-banner></app-trial-banner>
        
        @if (currentUser(); as user) {
            <!-- Hero Header -->
            <div class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-8 rounded-xl mb-8">
                <div class="flex items-center gap-6">
                    <div class="p-4 bg-indigo-600 rounded-xl">
                        <i class="pi pi-cut text-white text-4xl"></i>
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            Bienvenido, {{user.full_name}}
                        </h1>
                        <p class="text-slate-600 dark:text-slate-400 text-base">
                            <span class="font-medium">{{getRoleDisplayName(user.role)}}</span>
                            <span class="mx-2">•</span>
                            <span>Panel de Control</span>
                        </p>
                    </div>
                </div>
            </div>

            <app-subscription-status></app-subscription-status>
            
            <div class="grid grid-cols-12 gap-8">
                <app-stats-widget class="contents" />
                
                <div class="col-span-12 xl:col-span-6">
                    <app-recent-sales-widget />
                    <app-best-selling-widget />
                </div>
                <div class="col-span-12 xl:col-span-6">
                    <app-revenue-stream-widget />
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
        private trialService: TrialService
    ) {}

    ngOnInit() {
        // Cargar usuario primero (ya está en memoria)
        this.subscription.add(
            this.authService.currentUser$.subscribe(user => {
                this.currentUser.set(user);
            })
        );
        
        // ⚡ OPTIMIZACIÓN: Trial status en background
        setTimeout(() => {
            this.trialService.loadTrialStatus();
            this.showAppointmentNotifications();
        }, 0);
    }

    showAppointmentNotifications() {
        const todayCount = this.notificationService.todayAppointments().length;
        const upcoming = this.notificationService.upcomingAppointments();

        if (todayCount > 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'Citas de Hoy',
                detail: `Tienes ${todayCount} cita${todayCount > 1 ? 's' : ''} programada${todayCount > 1 ? 's' : ''} para hoy`,
                life: 5000
            });
        }

        if (upcoming.length > 0) {
            const next = upcoming[0];
            const time = new Date(next.date_time).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
            this.messageService.add({
                severity: 'warn',
                summary: '¡Cita Próxima!',
                detail: `Cita en 30 minutos o menos - ${time}`,
                life: 8000
            });
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
        'Client-Staff': 'Empleado'
    } as const;

    getRoleDisplayName(role: string): string {
        return this.roleNames[role as keyof typeof this.roleNames] || role;
    }

    canAccessFeature(feature: string): boolean {
        return this.trialService.canAccessFeature(feature);
    }
}