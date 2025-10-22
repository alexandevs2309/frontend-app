import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { BillingService } from '../../core/services/billing.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

interface Invoice {
    id?: number;
    user?: {
        id: number;
        email: string;
        full_name: string;
    };
    user_email?: string;
    user_name?: string;
    tenant_name?: string;
    plan_name?: string;
    subscription?: {
        id: number;
        plan?: {
            id: number;
            name: string;
        };
    };
    amount?: number;
    status?: string;
    description?: string;
    issued_at?: string;
    due_date?: string;
    paid_at?: string;
    is_paid?: boolean;
    payment_method?: string;
}

interface BillingStats {
    total_revenue: number;
    pending_payments: number;
    overdue_invoices: number;
    active_subscriptions: number;
}

@Component({
    selector: 'app-billing-management',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, TableModule, TagModule,
        InputIconModule, IconFieldModule, InputTextModule, SelectModule,
        DialogModule, ToolbarModule, CardModule, DatePipe, CurrencyPipe, ToastModule, TooltipModule
    ],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <p-card>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-bold text-green-600">{{ stats().total_revenue | currency:'USD' }}</div>
                        <div class="text-sm text-gray-600">Total Revenue</div>
                    </div>
                    <i class="pi pi-dollar text-3xl text-green-600"></i>
                </div>
            </p-card>

            <p-card>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-bold text-orange-600">{{ stats().pending_payments | currency:'USD' }}</div>
                        <div class="text-sm text-gray-600">Pending Payments</div>
                    </div>
                    <i class="pi pi-clock text-3xl text-orange-600"></i>
                </div>
            </p-card>

            <p-card>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-bold text-red-600">{{ stats().overdue_invoices }}</div>
                        <div class="text-sm text-gray-600">Overdue Invoices</div>
                    </div>
                    <i class="pi pi-exclamation-triangle text-3xl text-red-600"></i>
                </div>
            </p-card>

            <p-card>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-bold text-blue-600">{{ stats().active_subscriptions }}</div>
                        <div class="text-sm text-gray-600">Active Subscriptions</div>
                    </div>
                    <i class="pi pi-users text-3xl text-blue-600"></i>
                </div>
            </p-card>
        </div>

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <h4 class="m-0">Billing & Invoices</h4>
            </ng-template>

            <ng-template #end>
                <div class="flex gap-2">
                    <p-select [(ngModel)]="selectedStatus" [options]="statusOptions" placeholder="Filter by Status" (onChange)="filterInvoices()" />
                    <p-button label="Generate Invoice" icon="pi pi-plus" (click)="showGenerateDialog = true" />
                </div>
            </ng-template>
        </p-toolbar>

        <p-table
            [value]="filteredInvoices()"
            [rows]="15"
            [paginator]="true"
            [globalFilterFields]="['user_email', 'tenant_name', 'plan_name', 'description']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [rowHover]="true"
            [loading]="loading()"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} invoices"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 15, 25, 50]" >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Invoice Management</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter($event)" placeholder="Search invoices..." />
                    </p-iconfield>
                </div>
            </ng-template>

            <ng-template #header>
                <tr>
                    <th style="min-width:12rem">Tenant</th>
                    <th style="min-width:10rem">Plan</th>
                    <th style="min-width:8rem">Amount</th>
                    <th style="min-width:10rem">Status</th>
                    <th style="min-width:12rem">Billing Period</th>
                    <th style="min-width:10rem">Due Date</th>
                    <th style="min-width:10rem">Paid Date</th>
                    <th style="min-width:10rem">Actions</th>
                </tr>
            </ng-template>

            <ng-template #body let-invoice>
                <tr>
                    <td>
                        <div>
                            <div class="font-semibold">{{ invoice.tenant_name || invoice.user?.email || 'N/A' }}</div>
                            <div class="text-sm text-gray-600">{{ invoice.description || 'Suscripción mensual - ' + (invoice.user_email || invoice.user?.email) }}</div>
                        </div>
                    </td>
                    <td>{{ invoice.plan_name || invoice.subscription?.plan?.name || 'N/A' }}</td>
                    <td>{{ +invoice.amount | currency:'USD' }}</td>
                    <td>
                        <p-tag [value]="invoice.status" [severity]="getStatusSeverity(invoice.status)" />
                    </td>
                    <td>{{ invoice.issued_at | date:'MMM yyyy' }}</td>
                    <td>{{ invoice.due_date | date:'dd/MM/yyyy' }}</td>
                    <td>{{ invoice.paid_at ? (invoice.paid_at | date:'dd/MM/yyyy') : '-' }}</td>
                    <td>
                        <div class="flex gap-2">
                            <p-button 
                                icon="pi pi-eye" 
                                size="small" 
                                [outlined]="true" 
                                (click)="viewInvoice(invoice)"
                                pTooltip="Ver detalles" />
                            <p-button 
                                icon="pi pi-send" 
                                size="small" 
                                [outlined]="true" 
                                (click)="sendInvoice(invoice)" 
                                *ngIf="!invoice.is_paid"
                                pTooltip="Enviar factura" />
                            <p-button 
                                icon="pi pi-check" 
                                size="small" 
                                severity="success" 
                                [outlined]="true" 
                                (click)="markAsPaid(invoice)" 
                                *ngIf="!invoice.is_paid"
                                pTooltip="Marcar como pagada" />
                            <p-button 
                                icon="pi pi-download" 
                                size="small" 
                                severity="secondary" 
                                [outlined]="true" 
                                (click)="downloadInvoice(invoice)"
                                pTooltip="Descargar PDF" />
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <!-- Generate Invoice Dialog -->
        <p-dialog [(visible)]="showGenerateDialog" [style]="{ width: '450px' }" header="Generate Invoice" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Tenant</label>
                        <p-select [(ngModel)]="newInvoice.tenant" [options]="tenantOptions" optionLabel="name" optionValue="id" placeholder="Select Tenant" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Amount</label>
                        <input type="number" pInputText [(ngModel)]="newInvoice.amount" placeholder="0.00" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Due Date</label>
                        <input type="date" pInputText [(ngModel)]="newInvoice.due_date" fluid />
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="showGenerateDialog = false" />
                <p-button label="Generate" icon="pi pi-check" (click)="generateInvoice()" />
            </ng-template>
        </p-dialog>
    `
})
export class BillingManagement implements OnInit {
    invoices = signal<Invoice[]>([]);
    filteredInvoices = signal<Invoice[]>([]);
    stats = signal<BillingStats>({ total_revenue: 0, pending_payments: 0, overdue_invoices: 0, active_subscriptions: 0 });
    loading = signal(false);
    selectedStatus: string | null = null;
    showGenerateDialog = false;

    newInvoice = {
        tenant: null,
        amount: null,
        due_date: null
    };

    tenantOptions = [
        { name: 'Barbería El Corte', id: 1 },
        { name: 'Salón Moderno', id: 2 }
    ];

    statusOptions = [
        { label: 'All Status', value: null },
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Cancelled', value: 'cancelled' }
    ];

    constructor(
        private billingService: BillingService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadInvoices();
    }

    loadInvoices() {
        this.loading.set(true);
        this.billingService.getInvoices().subscribe({
            next: (response: any) => {
                const invoices = response.results || response || [];
                this.invoices.set(invoices);
                this.filteredInvoices.set(invoices);
                this.loadStats();
                this.loading.set(false);
            },
            error: (error) => this.handleLoadError(error)
        });
    }

    loadStats() {
        const invoices = this.invoices();
        const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (+(i.amount ?? 0)), 0);
        const pendingPayments = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + (+(i.amount ?? 0)), 0);
        const overdueInvoices = invoices.filter(i => new Date(i.due_date || '') < new Date() && i.status === 'pending').length;

        this.stats.set({
            total_revenue: totalRevenue,
            pending_payments: pendingPayments,
            overdue_invoices: overdueInvoices,
            active_subscriptions: invoices.length
        });
    }

    filterInvoices() {
        let filtered = this.invoices();

        if (this.selectedStatus) {
            filtered = filtered.filter(invoice => invoice.status === this.selectedStatus);
        }

        this.filteredInvoices.set(filtered);
    }

    onGlobalFilter(event: Event) {
        const value = (event.target as HTMLInputElement).value.toLowerCase();
        if (!value) {
            this.filteredInvoices.set(this.invoices());
            return;
        }

        const filtered = this.invoices().filter((invoice: any) =>
            invoice.user_email?.toLowerCase().includes(value) ||
            invoice.tenant_name?.toLowerCase().includes(value) ||
            invoice.plan_name?.toLowerCase().includes(value) ||
            invoice.description?.toLowerCase().includes(value)
        );
        this.filteredInvoices.set(filtered);
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status) {
            case 'paid': return 'success';
            case 'pending': return 'warn';
            case 'overdue': return 'danger';
            case 'cancelled': return 'secondary';
            default: return 'info';
        }
    }

    viewInvoice(invoice: Invoice) {
        const userInfo = invoice.user_name || invoice.user?.full_name || invoice.user_email || invoice.user?.email || 'Usuario desconocido';
        this.messageService.add({
            severity: 'info',
            summary: 'Invoice Details',
            detail: `Invoice #${invoice.id} - ${userInfo} - $${invoice.amount}`,
            life: 5000
        });
    }

    sendInvoice(invoice: Invoice) {
        const userEmail = invoice.user_email || invoice.user?.email || 'usuario';
        this.messageService.add({
            severity: 'success',
            summary: 'Invoice Sent',
            detail: `Invoice sent to ${userEmail}`,
            life: 3000
        });
    }

    downloadInvoice(invoice: Invoice) {
        this.messageService.add({
            severity: 'info',
            summary: 'Download Started',
            detail: `Downloading invoice #${invoice.id}`,
            life: 3000
        });
        // Aquí iría la lógica real de descarga
    }

    markAsPaid(invoice: Invoice) {
        if (invoice.id) {
            this.billingService.markInvoiceAsPaid(invoice.id).subscribe({
                next: () => {
                    invoice.status = 'paid';
                    (invoice as any).paid_at = new Date().toISOString();
                    this.loadStats();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Invoice marked as paid'
                    });
                },
                error: (error) => this.showErrorMessage('Error al marcar la factura como pagada', error)
            });
        }
    }

    generateInvoice() {
        if (!this.newInvoice.tenant || !this.newInvoice.amount || !this.newInvoice.due_date) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill all required fields'
            });
            return;
        }

        this.messageService.add({
            severity: 'success',
            summary: 'Invoice Generated',
            detail: `Invoice for $${this.newInvoice.amount} created successfully`
        });

        this.newInvoice = { tenant: null, amount: null, due_date: null };
        this.showGenerateDialog = false;
        this.loadInvoices();
    }

    trackByInvoice(index: number, invoice: Invoice): any {
        return invoice.id || index;
    }

    private handleLoadError(error: any): void {
        this.showErrorMessage('Error al cargar las facturas', error);
        this.invoices.set([]);
        this.filteredInvoices.set([]);
        this.loading.set(false);
    }

    private showErrorMessage(message: string, error?: any): void {
        this.logError(message, error);
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.sanitizeErrorMessage(error, message),
            life: 3000
        });
    }

    private sanitizeErrorMessage(error: any, fallback: string): string {
        const errorMessage = error?.error?.message || error?.message;
        return typeof errorMessage === 'string' ? errorMessage.substring(0, 200) : fallback;
    }

    private logError(context: string, error: any): void {
        const errorInfo = {
            context,
            timestamp: new Date().toISOString(),
            error: error?.message || 'Unknown error',
            component: 'BillingManagement'
        };
        console.warn('[BillingManagement Error]', errorInfo);
    }
}
