import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaasMetricsService, SaasMetrics } from '../../../core/services/saas-metrics.service';

@Component({
    standalone: true,
    selector: 'app-saas-stats-widget',
    imports: [CommonModule],
    template: `
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div class="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">MRR</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">{{(metrics()?.mrr || 0) | currency:'USD':'symbol':'1.0-0'}}</div>
                        </div>
                        <div class="flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg" style="width: 3rem; height: 3rem">
                            <i class="pi pi-dollar text-white text-2xl"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-green-500 font-bold text-lg">+{{metrics()?.growth_rate || 0}}%</span>
                        <i class="pi pi-arrow-up text-green-500"></i>
                        <span class="text-muted-color text-sm">crecimiento</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Tenants Activos</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">{{metrics()?.active_tenants || 0}}</div>
                        </div>
                        <div class="flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-lg" style="width: 3rem; height: 3rem">
                            <i class="pi pi-users text-white text-2xl"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-blue-500 font-bold text-lg">{{metrics()?.total_tenants || 0}}</span>
                        <span class="text-muted-color text-sm">total</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div class="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Churn Rate</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">{{(metrics()?.churn_rate || 0).toFixed(1)}}%</div>
                        </div>
                        <div class="flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg" style="width: 3rem; height: 3rem">
                            <i class="pi pi-chart-line text-white text-2xl"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-orange-500 font-bold text-lg">Mensual</span>
                        <span class="text-muted-color text-sm">cancelaciones</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div class="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Revenue por Plan</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">{{getTopPlan()}}</div>
                        </div>
                        <div class="flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl shadow-lg" style="width: 3rem; height: 3rem">
                            <i class="pi pi-star text-white text-2xl"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-purple-500 font-bold text-lg">{{getTopPlanRevenue() | currency:'USD':'symbol':'1.0-0'}}</span>
                        <span class="text-muted-color text-sm">top plan</span>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SaasStatsWidget implements OnInit {
    metrics = signal<SaasMetrics | null>(null);

    constructor(private saasMetricsService: SaasMetricsService) {}

    ngOnInit() {
        this.loadMetrics();
    }

    loadMetrics() {
        this.saasMetricsService.getSaasMetrics().subscribe({
            next: (data) => this.metrics.set(data),
            error: (error) => console.error('Error loading SaaS metrics:', error)
        });
    }

    getTopPlan(): string {
        const plans = this.metrics()?.revenue_by_plan || [];
        if (plans.length === 0) return 'N/A';
        const topPlan = plans.reduce((max, plan) => plan.revenue > max.revenue ? plan : max);
        return topPlan.plan_name;
    }

    getTopPlanRevenue(): number {
        const plans = this.metrics()?.revenue_by_plan || [];
        if (plans.length === 0) return 0;
        const topPlan = plans.reduce((max, plan) => plan.revenue > max.revenue ? plan : max);
        return topPlan.revenue;
    }
}