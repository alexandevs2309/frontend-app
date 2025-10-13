import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaasMetricsService, SaasMetrics } from '../../../core/services/saas-metrics.service';

@Component({
    standalone: true,
    selector: 'app-saas-stats-widget',
    imports: [CommonModule],
    template: `
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">MRR</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{(metrics()?.mrr || 0) | currency:'USD':'symbol':'1.0-0'}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-green-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">+{{metrics()?.growth_rate || 0}}% </span>
                <span class="text-muted-color">crecimiento</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Tenants Activos</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{metrics()?.active_tenants || 0}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{metrics()?.total_tenants || 0}} </span>
                <span class="text-muted-color">total</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Churn Rate</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{(metrics()?.churn_rate || 0).toFixed(1)}}%</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-chart-line text-orange-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Mensual </span>
                <span class="text-muted-color">cancelaciones</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Revenue por Plan</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{getTopPlan()}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-star text-purple-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{getTopPlanRevenue() | currency:'USD':'symbol':'1.0-0'}} </span>
                <span class="text-muted-color">top plan</span>
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