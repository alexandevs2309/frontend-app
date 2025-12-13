import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';

@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: `
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <div class="font-semibold text-xl">Servicios Más Populares</div>
            </div>
            <ul class="list-none p-0 m-0">
                <li *ngFor="let service of topServices(); let i = index" class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">{{service.name}}</span>
                        <div class="mt-1 text-muted-color">{{service.count}} veces solicitado</div>
                    </div>
                    <div class="mt-2 md:mt-0 flex items-center">
                        <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
                            <div [class]="getBarColor(i)" class="h-full" [style.width.%]="getPercentage(service.count)"></div>
                        </div>
                        <span [class]="getTextColor(i)" class="ml-4 font-medium">{{(service.revenue || 0) | currency:'USD':'symbol':'1.0-0'}}</span>
                    </div>
                </li>
                <li *ngIf="topServices().length === 0" class="text-center py-4 text-muted-color">
                    No hay datos de servicios disponibles
                </li>
            </ul>
        </div>
    `
})
export class BestSellingWidget implements OnInit {
    topServices = signal<any[]>([]);
    maxCount = 0;

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        this.loadTopServices();
    }

    loadTopServices() {
        this.dashboardService.getDashboardStats().subscribe({
            next: (data: any) => {
                const services = data.top_services || [];
                this.topServices.set(services.slice(0, 5));
                this.maxCount = services.length > 0 ? Math.max(...services.map((s: any) => s.count || 1), 1) : 1;
            },
            error: (error: any) => console.error('Error loading top services:', error)
        });
    }

    getPercentage(count: number): number {
        return this.maxCount > 0 ? (count / this.maxCount) * 100 : 0;
    }

    getBarColor(index: number): string {
        const colors = ['bg-orange-500', 'bg-cyan-500', 'bg-pink-500', 'bg-green-500', 'bg-purple-500'];
        return colors[index % colors.length];
    }

    getTextColor(index: number): string {
        const colors = ['text-orange-500', 'text-cyan-500', 'text-pink-500', 'text-green-500', 'text-purple-500'];
        return colors[index % colors.length];
    }
}
