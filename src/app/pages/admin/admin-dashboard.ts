import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';
import { StatsWidget } from '../dashboard/components/statswidget';
import { SaasStatsWidget } from '../dashboard/components/saas-stats-widget';
import { NotificationsWidget } from '../dashboard/components/notificationswidget';
import { RecentSalesWidget } from '../dashboard/components/recentsaleswidget';
import { BestSellingWidget } from '../dashboard/components/bestsellingwidget';
import { RevenueStreamWidget } from '../dashboard/components/revenuestreamwidget';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, StatsWidget, SaasStatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
    template: `
        @if (currentUser(); as user) {
            <!-- Hero Header con Gradiente -->
            <div class="mb-8 relative overflow-hidden rounded-3xl">
                <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-90"></div>
                <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0); background-size: 40px 40px;"></div>
                <div class="relative p-8">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
                            <i class="pi pi-crown text-white text-3xl"></i>
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold text-white mb-1">
                                ¡Bienvenido, {{user.full_name}}! 🚀
                            </h1>
                            <p class="text-white/90 text-lg">
                                <span class="font-semibold">{{getRoleDisplayName(user.role)}}</span>
                                <span class="mx-2">•</span>
                                <span>Panel de Control Global SaaS</span>
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-4 text-white/80 text-sm">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-calendar"></i>
                            <span>{{getCurrentDate()}}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-clock"></i>
                            <span>{{getCurrentTime()}}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-12 gap-8">
                @if (isSuperAdmin(user)) {
                    <app-saas-stats-widget class="contents" />
                    <div class="col-span-12 xl:col-span-6">
                        <app-notifications-widget />
                    </div>
                } @else {
                    <app-stats-widget class="contents" />
                    <div class="col-span-12 xl:col-span-6">
                        <app-recent-sales-widget />
                        <app-best-selling-widget />
                    </div>
                    <div class="col-span-12 xl:col-span-6">
                        <app-revenue-stream-widget />
                        <app-notifications-widget />
                    </div>
                }
            </div>
        }
    `
})
export class AdminDashboard implements OnInit, OnDestroy {
    currentUser = signal<any>(null);
    private subscription = new Subscription();

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.subscription.add(
            this.authService.currentUser$.subscribe(user => {
                this.currentUser.set(user);
            })
        );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private readonly roleNames = {
        'SUPER_ADMIN': 'Super Administrador',
        'CLIENT_ADMIN': 'Administrador de Peluquería', 
        'CLIENT_STAFF': 'Empleado'
    } as const;

    getRoleDisplayName(role: string): string {
        return this.roleNames[role as keyof typeof this.roleNames] || role;
    }

    isSuperAdmin(user: any): boolean {
        return user?.role === 'SUPER_ADMIN';
    }

    getCurrentDate(): string {
        return new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    getCurrentTime(): string {
        return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
}