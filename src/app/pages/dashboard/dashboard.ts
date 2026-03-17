import { Component, OnInit, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { AuthService } from '../../core/services/auth/auth.service';
import { DashboardService, DashboardStats } from '../../core/services/dashboard/dashboard.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    imports: [AsyncPipe, StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
    template: `
        @if (currentUser$ | async; as user) {
            <div class="mb-6">
                <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-lg border">
                    <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">
                        ¡Bienvenido, {{user.full_name}}! 💈
                    </h1>
                    <p class="text-surface-600 dark:text-surface-300">
                        Rol: <span class="font-semibold">{{getRoleDisplayName(user.role)}}</span>
                        @if (user.tenant_id) {
                            <span class="ml-4">Tenant ID: {{user.tenant_id}}</span>
                        }
                    </p>
                </div>
            </div>
        }

        @if (!loading()) {
            <div class="grid grid-cols-12 gap-8">
                <app-stats-widget class="contents" />

                @if (isClientAdmin()) {
                    <div class="col-span-12 xl:col-span-6">
                        <app-recent-sales-widget />
                        <app-best-selling-widget />
                    </div>
                    <div class="col-span-12 xl:col-span-6">
                        @defer (on viewport) {
                            <app-revenue-stream-widget />
                        } @placeholder {
                            <div class="card mb-8! h-48 animate-pulse bg-surface-100 dark:bg-surface-800 rounded-xl"></div>
                        }
                        <app-notifications-widget />
                    </div>
                }

                @if (isClientStaff()) {
                    <div class="col-span-12 xl:col-span-8">
                        <app-recent-sales-widget />
                    </div>
                    <div class="col-span-12 xl:col-span-4">
                        <app-notifications-widget />
                    </div>
                }
            </div>
        } @else {
            <div class="grid grid-cols-12 gap-8">
                <div class="col-span-12 text-center py-8">
                    <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
                    <p class="mt-4 text-surface-600">Cargando datos del dashboard...</p>
                </div>
            </div>
        }
    `
})
export class Dashboard implements OnInit {
    currentUser$: Observable<any>;
    dashboardData = signal<DashboardStats | null>(null);
    loading = signal(true);

    constructor(
        private authService: AuthService,
        private dashboardService: DashboardService
    ) {
        this.currentUser$ = this.authService.currentUser$;
    }

    ngOnInit() {
        this.loadDashboardData();
    }

    loadDashboardData() {
        this.loading.set(true);
        this.dashboardService.getDashboardStats().subscribe({
            next: (data) => {
                this.dashboardData.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    getRoleDisplayName(role: string): string {
        const roleNames: { [key: string]: string } = {
            'SUPER_ADMIN': 'Super Administrador',
            'CLIENT_ADMIN': 'Administrador de Peluquería',
            'CLIENT_STAFF': 'Empleado/Barbero',
            'SuperAdmin': 'Super Administrador',
            'Client-Admin': 'Administrador de Peluquería',
            'Client-Staff': 'Empleado/Barbero'
        };
        return roleNames[role] || role;
    }

    isClientAdmin(): boolean {
        const user = this.authService.getCurrentUser();
        return user?.role === 'CLIENT_ADMIN';
    }

    isClientStaff(): boolean {
        const user = this.authService.getCurrentUser();
        return user?.role === 'CLIENT_STAFF';
    }
}
