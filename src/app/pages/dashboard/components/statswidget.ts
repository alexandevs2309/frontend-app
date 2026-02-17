import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';
import { AppCurrencyPipe } from '../../../core/pipes/app-currency.pipe';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule, AppCurrencyPipe],
    template: `
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Ventas Totales</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{(stats()?.total_sales || 0) | appCurrency}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{stats()?.total_transactions || 0}} </span>
                <span class="text-muted-color">transacciones</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Ticket Promedio</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{(stats()?.average_ticket || 0) | appCurrency}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-chart-line text-orange-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Por venta</span>
                <span class="text-muted-color">promedio</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Ingresos Febrero</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{getMonthRevenue() | appCurrency}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-calendar text-cyan-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Mes actual</span>
                <span class="text-muted-color">acumulado</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Ventas Recientes</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{stats()?.total_transactions || 0}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-purple-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Total </span>
                <span class="text-muted-color">registradas</span>
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
            next: (data) => {
                console.log('📊 Dashboard Stats:', data);
                this.stats.set(data);
            },
            error: (error) => {
                console.error('❌ Error loading stats:', error);
                console.error('Error details:', error.error);
            }
        });
    }

    getMonthRevenue(): number {
        const monthlyRevenue = this.stats()?.monthly_revenue || [];
        if (monthlyRevenue.length > 0) {
            return monthlyRevenue[monthlyRevenue.length - 1].revenue || 0;
        }
        return 0;
    }
}
