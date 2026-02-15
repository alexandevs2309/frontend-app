import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
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
    template: `
        <p-toast position="top-right" />
        <app-trial-banner></app-trial-banner>
        
        @if (currentUser(); as user) {
            <!-- Hero Header con Gradiente -->
            <div class="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white p-8 rounded-2xl mb-8 shadow-2xl">
                <div class="absolute inset-0 bg-black/10"></div>
                <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div class="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl -ml-24 -mb-24"></div>
                
                <div class="relative flex items-center gap-6">
                    <div class="p-4 bg-white/20 backdrop-blur-sm rounded-2xl animate-float shadow-xl">
                        <i class="pi pi-cut text-5xl"></i>
                    </div>
                    <div>
                        <h1 class="text-4xl font-bold mb-2 drop-shadow-lg">
                            ¡Bienvenido, {{user.full_name}}! ✂️
                        </h1>
                        <p class="text-blue-100 text-lg">
                            <span class="font-semibold">{{getRoleDisplayName(user.role)}}</span>
                            <span class="mx-3">•</span>
                            <span>Panel de Control - Barbería</span>
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
    styles: [`
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        .animate-float {
            animation: float 3s ease-in-out infinite;
        }
    `]
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
        this.trialService.loadTrialStatus();
        this.subscription.add(
            this.authService.currentUser$.subscribe(user => {
                this.currentUser.set(user);
            })
        );
        
        // Mostrar notificaciones de citas
        setTimeout(() => this.showAppointmentNotifications(), 1000);
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
        'Client-Admin': 'Administrador de Barbería', 
        'Client-Staff': 'Empleado de Barbería'
    } as const;

    getRoleDisplayName(role: string): string {
        return this.roleNames[role as keyof typeof this.roleNames] || role;
    }

    canAccessFeature(feature: string): boolean {
        return this.trialService.canAccessFeature(feature);
    }
}