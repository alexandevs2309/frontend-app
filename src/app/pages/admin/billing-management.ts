import { Component, OnInit, inject, signal } from '@angular/core';
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
import { TenantService } from '../../core/services/tenant/tenant.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AdminErrorLogService } from '../../core/services/admin-error-log.service';

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
        FormsModule, ButtonModule, TableModule, TagModule,
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
                        <div class="text-sm text-gray-600">Ingresos totales</div>
                    </div>
                    <i class="pi pi-dollar text-3xl text-green-600"></i>
                </div>
            </p-card>

            <p-card>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-bold text-orange-600">{{ stats().pending_payments | currency:'USD' }}</div>
                        <div class="text-sm text-gray-600">Pagos pendientes</div>
                    </div>
                    <i class="pi pi-clock text-3xl text-orange-600"></i>
                </div>
            </p-card>

            <p-card>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-bold text-red-600">{{ stats().overdue_invoices }}</div>
                        <div class="text-sm text-gray-600">Facturas vencidas</div>
                    </div>
                    <i class="pi pi-exclamation-triangle text-3xl text-red-600"></i>
                </div>
            </p-card>

            <p-card>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-bold text-blue-600">{{ stats().active_subscriptions }}</div>
                        <div class="text-sm text-gray-600">Suscripciones activas</div>
                    </div>
                    <i class="pi pi-users text-3xl text-blue-600"></i>
                </div>
            </p-card>
        </div>

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <h4 class="m-0">Facturación y facturas</h4>
            </ng-template>

            <ng-template #end>
                <div class="flex gap-2">
                    <p-select [(ngModel)]="selectedStatus" [options]="statusOptions" placeholder="Filtrar por estado" (onChange)="filterInvoices()" />
                    <p-button
                        label="Generar factura"
                        icon="pi pi-plus"
                        (click)="showGenerateDialog = true" />
                </div>
            </ng-template>
        </p-toolbar>

        <p-table
            [value]="filteredInvoices()"
            [loading]="loading()"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[10, 25, 50]"
            class="p-datatable-gridlines">

            <ng-template #caption>
                <div class="flex justify-end">
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" placeholder="Buscar facturas..." (input)="onGlobalFilter($event)" />
                    </p-iconfield>
                </div>
            </ng-template>

            <ng-template #header>
                <tr>
                    <th>ID</th>
                    <th>Tenant / User</th>
                    <th>Plan</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Emisión</th>
                    <th>Vencimiento</th>
                    <th>Acciones</th>
                </tr>
            </ng-template>

            <ng-template #body let-invoice>
                <tr>
                    <td>#{{ invoice.id }}</td>
                    <td>
                        <div class="font-medium">{{ invoice.tenant_name || invoice.user_name || '—' }}</div>
                        <div class="text-sm text-gray-500">{{ invoice.user_email || invoice.user?.email || '' }}</div>
                    </td>
                    <td>{{ invoice.plan_name || invoice.subscription?.plan?.name || '—' }}</td>
                    <td>{{ invoice.amount | currency:'USD' }}</td>
                    <td>
                        <p-tag
                            [value]="getInvoiceDisplayStatus(invoice)"
                            [severity]="getStatusSeverity(getInvoiceDisplayStatus(invoice))" />
                    </td>
                    <td>{{ invoice.issued_at | date:'mediumDate' }}</td>
                    <td>{{ invoice.due_date | date:'mediumDate' }}</td>
                    <td>
                        <div class="flex gap-2">
                            @if (!invoice.is_paid) {
                                <p-button
                                    icon="pi pi-check"
                                    size="small"
                                    severity="success"
                                    [outlined]="true"
                                    (click)="markAsPaid(invoice)"
                                    pTooltip="Marcar como pagada" />
                            }
                            <p-button
                                icon="pi pi-print"
                                size="small"
                                severity="secondary"
                                [outlined]="true"
                                (click)="downloadInvoice(invoice)"
                                pTooltip="Imprimir o guardar como PDF" />
                        </div>
                    </td>
                </tr>
            </ng-template>

            <ng-template #emptymessage>
                <tr>
                    <td colspan="8" class="text-center py-8 text-gray-500">No se encontraron facturas.</td>
                </tr>
            </ng-template>
        </p-table>

        <!-- Generate Invoice Dialog -->
        <p-dialog [(visible)]="showGenerateDialog" [style]="{ width: '450px' }" header="Generar factura" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Tenant</label>
                        <p-select [(ngModel)]="newInvoice.tenant" [options]="tenantOptions()" appendTo="body" optionLabel="name" optionValue="id" placeholder="Selecciona un tenant" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Descripción (opcional)</label>
                        <input type="text" pInputText [(ngModel)]="newInvoice.description" placeholder="Factura manual de suscripción" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Fecha de vencimiento</label>
                        <input type="date" pInputText [(ngModel)]="newInvoice.due_date" fluid />
                    </div>
                    <small class="text-gray-500">
                        El monto se calcula automáticamente usando el plan activo del tenant.
                    </small>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancelar" icon="pi pi-times" text (click)="showGenerateDialog = false" />
                <p-button label="Generar" icon="pi pi-check" (click)="generateInvoice()" />
            </ng-template>
        </p-dialog>
    `
})
export class BillingManagement implements OnInit {
    private readonly errorLogger = inject(AdminErrorLogService);
    invoices = signal<Invoice[]>([]);
    filteredInvoices = signal<Invoice[]>([]);
    stats = signal<BillingStats>({ total_revenue: 0, pending_payments: 0, overdue_invoices: 0, active_subscriptions: 0 });
    loading = signal(false);
    selectedStatus: string | null = null;
    showGenerateDialog = false;

    newInvoice = {
        tenant: null,
        description: '',
        due_date: null
    };

    tenantOptions = signal<any[]>([]);

    statusOptions = [
        { label: 'Todos los estados', value: null },
        { label: 'Pendiente', value: 'pending' },
        { label: 'Pagada', value: 'paid' },
        { label: 'Fallida', value: 'failed' },
        { label: 'Vencida', value: 'overdue' },
        { label: 'Cancelada', value: 'canceled' }
    ];

    constructor(
        private billingService: BillingService,
        private tenantService: TenantService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadInvoices();
        this.loadTenants();
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

    loadTenants() {
        this.tenantService.getTenants().subscribe({
            next: (data: any) => {
                const tenants = Array.isArray(data) ? data : data.results || [];
                this.tenantOptions.set(tenants.map((t: any) => ({ name: t.name, id: t.id })));
            },
            error: () => {
                this.tenantOptions.set([]);
            }
        });
    }

    loadStats() {
        this.billingService.getAdminStats().subscribe({
            next: (stats: any) => {
                this.stats.set({
                    total_revenue: Number(stats?.total_revenue ?? 0),
                    pending_payments: Number(stats?.pending_payments ?? 0),
                    overdue_invoices: Number(stats?.overdue_invoices ?? 0),
                    active_subscriptions: Number(stats?.active_subscriptions ?? 0)
                });
            },
            error: () => {
                const invoices = this.invoices();
                const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (+(i.amount ?? 0)), 0);
                const pendingPayments = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + (+(i.amount ?? 0)), 0);
                const overdueInvoices = invoices.filter(i => new Date(i.due_date || '') < new Date() && i.status === 'pending').length;

                this.stats.set({
                    total_revenue: totalRevenue,
                    pending_payments: pendingPayments,
                    overdue_invoices: overdueInvoices,
                    active_subscriptions: new Set(
                        invoices
                            .map(invoice => invoice.subscription?.id)
                            .filter((id): id is number => typeof id === 'number')
                    ).size
                });
            }
        });
    }

    filterInvoices() {
        let filtered = this.invoices();

        if (this.selectedStatus) {
            filtered = filtered.filter(invoice => this.getInvoiceDisplayStatus(invoice) === this.selectedStatus);
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
            case 'failed': return 'danger';
            case 'overdue': return 'danger';
            case 'canceled': return 'secondary';
            default: return 'info';
        }
    }

    getInvoiceDisplayStatus(invoice: Invoice): string {
        if (!invoice.is_paid && invoice.status === 'pending' && invoice.due_date && new Date(invoice.due_date) < new Date()) {
            return 'overdue';
        }

        return invoice.status || 'pending';
    }

    viewInvoice(invoice: Invoice) {
        const userInfo = invoice.user_name || invoice.user?.full_name || invoice.user_email || invoice.user?.email || 'Usuario desconocido';
        this.messageService.add({
            severity: 'info',
            summary: 'Detalle de factura',
            detail: `Invoice #${invoice.id} - ${userInfo} - $${invoice.amount}`,
            life: 5000
        });
    }

    downloadInvoice(invoice: Invoice) {
        const html = this.buildInvoicePrintHtml(invoice);
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Popup bloqueado',
                detail: 'Permite popups para imprimir o guardar la factura como PDF'
            });
            return;
        }

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            try {
                printWindow.print();
            } catch {
                // no-op
            }
        }, 300);
    }

    markAsPaid(invoice: Invoice) {
        if (invoice.id) {
            this.billingService.markInvoiceAsPaid(invoice.id).subscribe({
                next: () => {
                    const paidAt = new Date().toISOString();
                    const updatedInvoices = this.invoices().map(current =>
                        current.id === invoice.id
                            ? { ...current, status: 'paid', is_paid: true, paid_at: paidAt }
                            : current
                    );
                    this.invoices.set(updatedInvoices);
                    this.loadStats();
                    this.filterInvoices();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Factura marcada como pagada'
                    });
                },
                error: (error) => this.showErrorMessage('Error al marcar la factura como pagada', error)
            });
        }
    }

    generateInvoice() {
        if (!this.newInvoice.tenant || !this.newInvoice.due_date) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Selecciona un tenant y una fecha de vencimiento'
            });
            return;
        }

        this.billingService.generateInvoiceForTenant({
            tenant_id: this.newInvoice.tenant,
            due_date: this.newInvoice.due_date,
            description: this.newInvoice.description?.trim() || undefined
        }).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Factura generada',
                    detail: 'La factura se creó correctamente usando la suscripción activa del tenant'
                });
                this.newInvoice = { tenant: null, description: '', due_date: null };
                this.showGenerateDialog = false;
                this.loadInvoices();
            },
            error: (error) => this.showErrorMessage('Error al generar la factura', error)
        });
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
        this.errorLogger.log('BillingManagement', context, error);
    }

    private buildInvoicePrintHtml(invoice: Invoice): string {
        const tenantName = invoice.tenant_name || invoice.user_name || invoice.user_email || 'N/A';
        const issued = invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString() : '-';
        const due = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-';
        const paid = invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : '-';
        const amount = Number(invoice.amount || 0).toFixed(2);

        return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Factura #${invoice.id || '-'}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
    .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 20px; }
    .muted { color: #6b7280; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
    .amount { font-size: 28px; font-weight: 700; }
    @media print { @page { margin: 1cm; } }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin:0;">Factura</h2>
    <p class="muted" style="margin:4px 0 0 0;">Factura #${invoice.id || '-'}</p>
  </div>
  <div class="grid">
    <div class="box"><strong>Cliente/Tenant</strong><div>${this.escapeHtml(tenantName)}</div></div>
    <div class="box"><strong>Plan</strong><div>${this.escapeHtml(invoice.plan_name || invoice.subscription?.plan?.name || 'N/A')}</div></div>
    <div class="box"><strong>Emisión</strong><div>${issued}</div></div>
    <div class="box"><strong>Vencimiento</strong><div>${due}</div></div>
    <div class="box"><strong>Estado</strong><div>${this.escapeHtml(invoice.status || 'pending')}</div></div>
    <div class="box"><strong>Pagada</strong><div>${paid}</div></div>
  </div>
  <div class="box">
    <div class="muted">Monto</div>
    <div class="amount">$${amount}</div>
  </div>
</body>
</html>`;
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
