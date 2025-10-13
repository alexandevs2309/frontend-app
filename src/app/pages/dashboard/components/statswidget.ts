import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Citas Hoy</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{stats()?.total_appointments_today || 0}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-calendar text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{stats()?.appointments_this_week || 0}} </span>
                <span class="text-muted-color">esta semana</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Ingresos Hoy</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{(stats()?.revenue_today || 0) | currency:'USD':'symbol':'1.0-0'}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-orange-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{(stats()?.revenue_this_month || 0) | currency:'USD':'symbol':'1.0-0'}} </span>
                <span class="text-muted-color">este mes</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Clientes</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{stats()?.total_clients || 0}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-cyan-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Total </span>
                <span class="text-muted-color">registrados</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Empleados</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{stats()?.total_employees || 0}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-briefcase text-purple-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{stats()?.total_sales_today || 0}} </span>
                <span class="text-muted-color">ventas hoy</span>
            </div>
        </div>
    `
})
export class StatsWidget implements OnInit {
    stats = signal<any>(null);

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        this.loadStats();
    }

    loadStats() {
        this.dashboardService.getDashboardStats().subscribe({
            next: (data) => this.stats.set(data),
            error: (error) => console.error('Error loading stats:', error)
        });
    }
}
