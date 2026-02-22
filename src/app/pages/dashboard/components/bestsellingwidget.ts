import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';
import { AppCurrencyPipe } from '../../../core/pipes/app-currency.pipe';

@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ButtonModule, MenuModule, AppCurrencyPipe],
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
                        <div class="bg-slate-200 dark:bg-slate-700 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
                            <div class="bg-indigo-600 h-full" [style.width.%]="getPercentage(service.count)"></div>
                        </div>
                        <span class="text-indigo-600 ml-4 font-medium">{{(service.revenue || 0) | appCurrency}}</span>
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
        // El endpoint /pos/dashboard/stats/ NO devuelve top_services
        // Necesitamos obtenerlo de otro endpoint o calcularlo
        this.dashboardService.getRecentSales(100).subscribe({
            next: (data: any) => {
                console.log('📊 Sales for Top Services:', data);
                const sales = Array.isArray(data) ? data : (data.results || []);
                
                // Debug: ver estructura de una venta
                if (sales.length > 0) {
                    console.log('📊 Sample sale structure:', sales[0]);
                }
                
                // Calcular servicios más populares desde las ventas
                const serviceCount: { [key: string]: { name: string; count: number; revenue: number } } = {};
                
                sales.forEach((sale: any) => {
                    const details = sale.details || [];
                    
                    if (Array.isArray(details) && details.length > 0) {
                        details.forEach((item: any) => {
                            if (item.item_type === 'service') {
                                const serviceName = item.name || 'Servicio';
                                const price = parseFloat(item.price || 0) * (item.quantity || 1);
                                
                                if (!serviceCount[serviceName]) {
                                    serviceCount[serviceName] = { name: serviceName, count: 0, revenue: 0 };
                                }
                                serviceCount[serviceName].count += (item.quantity || 1);
                                serviceCount[serviceName].revenue += price;
                            }
                        });
                    }
                });
                
                // Convertir a array y ordenar por count
                const services = Object.values(serviceCount)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
                
                console.log('📊 Top Services calculated:', services);
                this.topServices.set(services);
                this.maxCount = services.length > 0 ? Math.max(...services.map(s => s.count), 1) : 1;
            },
            error: (error: any) => {
                console.error('❌ Error loading top services:', error);
                console.error('Error details:', error.error);
            }
        });
    }

    getPercentage(count: number): number {
        return this.maxCount > 0 ? (count / this.maxCount) * 100 : 0;
    }
}
