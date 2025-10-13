import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule],
    template: `
        <div class="card mb-8!">
            <div class="font-semibold text-xl mb-4">Ingresos Mensuales</div>
            <p-chart type="line" [data]="chartData()" [options]="chartOptions" class="h-100" />
        </div>
    `
})
export class RevenueStreamWidget implements OnInit, OnDestroy {
    chartData = signal<any>({});
    chartOptions: any;
    subscription!: Subscription;
    monthlyRevenue = signal<any[]>([]);

    constructor(
        public layoutService: LayoutService,
        private dashboardService: DashboardService
    ) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.loadMonthlyRevenue();
        this.initChart();
    }

    loadMonthlyRevenue() {
        this.dashboardService.getMonthlyRevenue().subscribe({
            next: (data: any) => {
                const revenue = Array.isArray(data) ? data : (data.results || []);
                this.monthlyRevenue.set(revenue);
                this.updateChart();
            },
            error: (error: any) => console.error('Error loading monthly revenue:', error)
        });
    }

    updateChart() {
        const data = this.monthlyRevenue();
        const labels = Array.isArray(data) ? data.map((item: any) => item.month || 'Mes') : [];
        const revenues = Array.isArray(data) ? data.map((item: any) => item.revenue || 0) : [];

        const documentStyle = getComputedStyle(document.documentElement);
        
        this.chartData.set({
            labels: labels.length > 0 ? labels : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Ingresos',
                    data: revenues.length > 0 ? revenues : [0, 0, 0, 0, 0, 0],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    borderColor: documentStyle.getPropertyValue('--p-primary-500'),
                    tension: 0.4
                }
            ]
        });
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: borderColor,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: borderColor,
                        drawBorder: false
                    }
                }
            }
        };

        this.updateChart();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
