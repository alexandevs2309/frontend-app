import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    imports: [CommonModule, StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
    template: `
        <div class="mb-6" *ngIf="currentUser$ | async as user">
            <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-lg border">
                <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">
                    ¡Bienvenido, {{user.full_name}}! 💈
                </h1>
                <p class="text-surface-600 dark:text-surface-300">
                    Rol: <span class="font-semibold">{{getRoleDisplayName(user.role)}}</span>
                    <span *ngIf="user.tenant_id" class="ml-4">Tenant ID: {{user.tenant_id}}</span>
                </p>
            </div>
        </div>
        
        <div class="grid grid-cols-12 gap-8" *ngIf="!loading(); else loadingTemplate">
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
        
        <ng-template #loadingTemplate>
            <div class="grid grid-cols-12 gap-8">
                <div class="col-span-12 text-center py-8">
                    <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
                    <p class="mt-4 text-surface-600">Cargando datos del dashboard...</p>
                </div>
            </div>
        </ng-template>
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
            error: (error) => {
                console.error('Error loading dashboard data:', error);
                this.loading.set(false);
            }
        });
    }

    getRoleDisplayName(role: string): string {
        const roleNames: { [key: string]: string } = {
            'SuperAdmin': 'Super Administrador',
            'ClientAdmin': 'Administrador de Peluquería', 
            'ClientStaff': 'Empleado'
        };
        return roleNames[role] || role;
    }
}
