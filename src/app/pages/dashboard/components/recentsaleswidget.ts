import { Component, OnInit, signal } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';
import { AppCurrencyPipe } from '../../../core/pipes/app-currency.pipe';

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, AppCurrencyPipe],
    template: `
        <div class="card mb-8!">
            <div class="font-semibold text-xl mb-4">Ventas Recientes</div>
            <p-table [value]="sales()" [paginator]="true" [rows]="5" responsiveLayout="scroll">
                <ng-template #header>
                    <tr>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Fecha</th>
                        <th>Servicios</th>
                    </tr>
                </ng-template>
                <ng-template #body let-sale>
                    <tr>
                        <td>{{ getClientName(sale) }}</td>
                        <td>{{ sale.total | appCurrency }}</td>
                        <td>{{ sale.date_time | date: 'short' }}</td>
                        <td>{{ getServices(sale) }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class RecentSalesWidget implements OnInit {
    sales = signal<any[]>([]);

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        this.loadRecentSales();
    }

    loadRecentSales() {
        this.dashboardService.getRecentSales(10).subscribe({
            next: (data) => {
                console.log('📊 Recent Sales:', data);
                const sales = Array.isArray(data) ? data : (data.results || []);
                this.sales.set(sales.slice(0, 10));
            },
            error: (error) => {
                console.error('❌ Error loading recent sales:', error);
                console.error('Error details:', error.error);
            }
        });
    }

    getClientName(sale: any): string {
        return sale.client_name || 'Cliente Anónimo';
    }

    getServices(sale: any): string {
        const details = sale.details || [];
        const services = details
            .filter((item: any) => item.item_type === 'service')
            .map((item: any) => item.name);
        return services.length > 0 ? services.join(', ') : 'N/A';
    }
}
