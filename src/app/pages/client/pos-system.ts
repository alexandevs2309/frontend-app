import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

interface Service {
    id: number;
    name: string;
    price: number;
    commission_rate: number;
}

interface Employee {
    id: number;
    name: string;
    email: string;
}

interface SaleItem {
    service: Service;
    employee: Employee;
    quantity: number;
    subtotal: number;
    commission: number;
}

@Component({
    selector: 'app-pos-system',
    standalone: true,
    imports: [CommonModule, ButtonModule, InputTextModule, SelectModule, TableModule, CardModule, DividerModule, ToastModule, FormsModule],
    providers: [MessageService],
    template: `
        <div class="grid">
            <!-- Left Panel: Services & Cart -->
            <div class="col-12 lg:col-8">
                <div class="card">
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h5 class="m-0">Sistema POS - Punto de Venta</h5>
                        <span class="text-500">{{ getCurrentDateTime() }}</span>
                    </div>
                    
                    <!-- Services Grid -->
                    <div class="mb-6">
                        <h6>Servicios Disponibles</h6>
                        <div class="grid">
                            <div *ngFor="let service of services" 
                                 class="col-12 md:col-6 lg:col-4 mb-3">
                                <div class="surface-card p-3 border-round shadow-1 cursor-pointer hover:shadow-3 transition-all transition-duration-300"
                                     (click)="addServiceToCart(service)">
                                    <div class="flex justify-content-between align-items-center mb-2">
                                        <span class="font-semibold text-900">{{ service.name }}</span>
                                        <span class="text-primary font-bold">\${{ service.price }}</span>
                                    </div>
                                    <div class="text-600 text-sm">
                                        Comisión: {{ service.commission_rate }}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Cart -->
                    <div *ngIf="cart.length > 0">
                        <h6>Carrito de Venta</h6>
                        <p-table [value]="cart" [tableStyle]="{'min-width': '50rem'}">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Servicio</th>
                                    <th>Empleado</th>
                                    <th>Precio</th>
                                    <th>Comisión</th>
                                    <th>Acciones</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-item let-i="rowIndex">
                                <tr>
                                    <td>{{ item.service.name }}</td>
                                    <td>
                                        <p-select 
                                            [options]="employees" 
                                            [(ngModel)]="item.employee"
                                            optionLabel="name"
                                            placeholder="Seleccionar empleado"
                                            (onChange)="updateCommission(i)"
                                            class="w-full">
                                        </p-select>
                                    </td>
                                    <td class="font-semibold">\${{ item.service.price }}</td>
                                    <td class="text-green-600 font-semibold">\${{ item.commission.toFixed(2) }}</td>
                                    <td>
                                        <p-button 
                                            icon="pi pi-trash" 
                                            severity="danger" 
                                            size="small"
                                            (onClick)="removeFromCart(i)"
                                            [text]="true">
                                        </p-button>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>
                </div>
            </div>
            
            <!-- Right Panel: Summary & Payment -->
            <div class="col-12 lg:col-4">
                <div class="card sticky" style="top: 2rem;">
                    <h6>Resumen de Venta</h6>
                    
                    <div class="mb-4">
                        <div class="flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <span class="font-semibold">\${{ getSubtotal().toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-content-between mb-2">
                            <span>Total Comisiones:</span>
                            <span class="text-green-600 font-semibold">\${{ getTotalCommissions().toFixed(2) }}</span>
                        </div>
                        <p-divider></p-divider>
                        <div class="flex justify-content-between">
                            <span class="text-xl font-bold">Total:</span>
                            <span class="text-xl font-bold text-primary">\${{ getSubtotal().toFixed(2) }}</span>
                        </div>
                    </div>
                    
                    <!-- Payment Method -->
                    <div class="mb-4">
                        <label class="block text-900 font-medium mb-2">Método de Pago</label>
                        <p-select
                            [options]="paymentMethods" 
                            [(ngModel)]="selectedPaymentMethod"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccionar método"
                            class="w-full">
                        </p-select>
                    </div>
                    
                    <!-- Customer Info -->
                    <div class="mb-4">
                        <label class="block text-900 font-medium mb-2">Cliente (Opcional)</label>
                        <input 
                            type="text" 
                            pInputText 
                            [(ngModel)]="customerName"
                            placeholder="Nombre del cliente"
                            class="w-full">
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex flex-column gap-2">
                        <p-button 
                            label="Procesar Venta"
                            icon="pi pi-check"
                            [disabled]="cart.length === 0 || !selectedPaymentMethod || !allEmployeesSelected()"
                            (onClick)="processSale()"
                            class="w-full">
                        </p-button>
                        
                        <p-button 
                            label="Limpiar Carrito"
                            icon="pi pi-trash"
                            severity="secondary"
                            [outlined]="true"
                            (onClick)="clearCart()"
                            class="w-full">
                        </p-button>
                    </div>
                    
                    <!-- Quick Stats -->
                    <div class="mt-4 p-3 surface-100 border-round">
                        <h6 class="mt-0 mb-3">Estadísticas del Día</h6>
                        <div class="flex justify-content-between mb-2">
                            <span class="text-600">Ventas:</span>
                            <span class="font-semibold">{{ dailyStats.sales }}</span>
                        </div>
                        <div class="flex justify-content-between mb-2">
                            <span class="text-600">Ingresos:</span>
                            <span class="font-semibold text-green-600">\${{ dailyStats.revenue.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-content-between">
                            <span class="text-600">Comisiones:</span>
                            <span class="font-semibold text-blue-600">\${{ dailyStats.commissions.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <p-toast></p-toast>
    `
})
export class PosSystem implements OnInit {
    services: Service[] = [
        { id: 1, name: 'Corte Clásico', price: 15, commission_rate: 30 },
        { id: 2, name: 'Corte + Barba', price: 25, commission_rate: 35 },
        { id: 3, name: 'Afeitado', price: 12, commission_rate: 25 },
        { id: 4, name: 'Corte Niño', price: 10, commission_rate: 30 },
        { id: 5, name: 'Arreglo Cejas', price: 8, commission_rate: 40 },
        { id: 6, name: 'Lavado + Peinado', price: 18, commission_rate: 25 }
    ];
    
    employees: Employee[] = [
        { id: 1, name: 'Carlos López', email: 'carlos@barberia.com' },
        { id: 2, name: 'Ana Rodríguez', email: 'ana@barberia.com' },
        { id: 3, name: 'Miguel Torres', email: 'miguel@barberia.com' }
    ];
    
    paymentMethods = [
        { label: 'Efectivo', value: 'cash' },
        { label: 'Tarjeta', value: 'card' },
        { label: 'Transferencia', value: 'transfer' }
    ];
    
    cart: SaleItem[] = [];
    selectedPaymentMethod: string = '';
    customerName: string = '';
    
    dailyStats = {
        sales: 12,
        revenue: 340.50,
        commissions: 95.25
    };
    
    constructor(private messageService: MessageService) {}
    
    ngOnInit() {
        // Load data from API in real implementation
    }
    
    addServiceToCart(service: Service) {
        const item: SaleItem = {
            service: service,
            employee: null as any,
            quantity: 1,
            subtotal: service.price,
            commission: 0
        };
        this.cart.push(item);
        
        this.messageService.add({
            severity: 'success',
            summary: 'Servicio Agregado',
            detail: `${service.name} agregado al carrito`
        });
    }
    
    removeFromCart(index: number) {
        this.cart.splice(index, 1);
        this.messageService.add({
            severity: 'info',
            summary: 'Servicio Removido',
            detail: 'Servicio eliminado del carrito'
        });
    }
    
    updateCommission(index: number) {
        const item = this.cart[index];
        if (item.employee) {
            item.commission = (item.service.price * item.service.commission_rate) / 100;
        }
    }
    
    getSubtotal(): number {
        return this.cart.reduce((sum, item) => sum + item.subtotal, 0);
    }
    
    getTotalCommissions(): number {
        return this.cart.reduce((sum, item) => sum + item.commission, 0);
    }
    
    allEmployeesSelected(): boolean {
        return this.cart.every(item => item.employee !== null);
    }
    
    processSale() {
        // In real implementation, send to backend API
        const saleData = {
            items: this.cart,
            total: this.getSubtotal(),
            payment_method: this.selectedPaymentMethod,
            customer_name: this.customerName || 'Cliente General',
            timestamp: new Date()
        };
        
        console.log('Processing sale:', saleData);
        
        // Update daily stats
        this.dailyStats.sales++;
        this.dailyStats.revenue += this.getSubtotal();
        this.dailyStats.commissions += this.getTotalCommissions();
        
        this.messageService.add({
            severity: 'success',
            summary: 'Venta Procesada',
            detail: `Venta por $${this.getSubtotal().toFixed(2)} procesada exitosamente`,
            life: 5000
        });
        
        // Clear cart
        this.clearCart();
    }
    
    clearCart() {
        this.cart = [];
        this.selectedPaymentMethod = '';
        this.customerName = '';
    }
    
    getCurrentDateTime(): string {
        return new Date().toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}