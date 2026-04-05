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
import { SettingsService } from '../../core/services/settings.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AdminErrorLogService } from '../../core/services/admin-error-log.service';
import { getSubscriptionPlanLabel } from '../../core/utils/subscription-plan-label';

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

        <section class="mb-8 overflow-hidden rounded-[2rem] border border-surface-200/70 bg-surface-0 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.45)] dark:border-surface-800 dark:bg-surface-900">
            <div class="relative overflow-hidden px-8 py-8 lg:px-10">
                <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_36%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_34%),linear-gradient(135deg,_rgba(15,23,42,0.92),_rgba(30,41,59,0.86))]"></div>
                <div class="relative grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)] lg:items-start">
                    <div>
                        <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-surface-200 bg-surface-50/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-surface-600 dark:border-surface-700 dark:bg-surface-800/80 dark:text-surface-300">
                            <i class="pi pi-wallet text-emerald-500"></i>
                            Billing control
                        </div>
                        <h1 class="max-w-3xl text-3xl font-semibold tracking-tight text-surface-950 dark:text-surface-0 lg:text-4xl">
                            Facturación, cobros y salud de ingresos del SaaS
                        </h1>
                        <p class="mt-3 max-w-2xl text-base leading-7 text-surface-600 dark:text-surface-300">
                            Gestiona facturas, morosidad y generación manual desde un panel más claro y más ejecutivo.
                        </p>
                    </div>
                    <div class="rounded-3xl border border-surface-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-surface-700 dark:bg-surface-800/80">
                        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-surface-500 dark:text-surface-400">Lectura rápida</div>
                        <div class="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                            <div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-900/10">
                                <div class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Ingresos</div>
                                <div class="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-100">{{ stats().total_revenue | currency:currencyCode() }}</div>
                            </div>
                            <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-900/10">
                                <div class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Pendiente</div>
                                <div class="mt-2 text-2xl font-semibold text-amber-900 dark:text-amber-100">{{ stats().pending_payments | currency:currencyCode() }}</div>
                            </div>
                            <div class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/60 dark:bg-rose-900/10">
                                <div class="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700 dark:text-rose-300">Riesgo</div>
                                <div class="mt-2 text-2xl font-semibold text-rose-900 dark:text-rose-100">{{ stats().overdue_invoices }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <p-card>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-bold text-green-600">{{ stats().total_revenue | currency:currencyCode() }}</div>
                        <div class="text-sm text-gray-600">Ingresos totales</div>
                    </div>
                    <i class="pi pi-dollar text-3xl text-green-600"></i>
                </div>
            </p-card>

            <p-card>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-bold text-orange-600">{{ stats().pending_payments | currency:currencyCode() }}</div>
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

        <p-toolbar styleClass="mb-6 rounded-[1.5rem] border border-surface-200 bg-surface-0 px-5 py-4 shadow-sm dark:border-surface-800 dark:bg-surface-900">
            <ng-template #start>
                <div>
                    <div class="text-xs font-semibold uppercase tracking-[0.24em] text-surface-500 dark:text-surface-400">Gestión</div>
                    <h4 class="m-0 mt-2 text-xl font-semibold text-surface-950 dark:text-surface-0">Facturas del ecosistema</h4>
                </div>
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
                <div class="flex items-center justify-between gap-4 rounded-t-[1.5rem] border-b border-surface-200 bg-surface-0 px-5 py-4 dark:border-surface-800 dark:bg-surface-900">
                    <div>
                        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-surface-500 dark:text-surface-400">Cobranza</div>
                        <div class="mt-2 text-lg font-semibold text-surface-950 dark:text-surface-0">Listado de facturas y estado operativo</div>
                    </div>
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
                    <td>{{ getPlanDisplayName(invoice) }}</td>
                    <td>{{ invoice.amount | currency:currencyCode() }}</td>
                    <td>
                        <p-tag
                            [value]="getInvoiceDisplayStatus(invoice)"
                            [severity]="getStatusSeverity(getInvoiceDisplayStatus(invoice))" />
                    </td>
                    <td>{{ invoice.issued_at | date:'mediumDate' }}</td>
                    <td>{{ invoice.due_date | date:'mediumDate' }}</td>
                    <td>
                        <div class="flex gap-2">
                            <p-button
                                icon="pi pi-eye"
                                size="small"
                                severity="info"
                                [outlined]="true"
                                (click)="viewInvoice(invoice)"
                                pTooltip="Ver detalle" />
                            @if (!invoice.is_paid) {
                                <p-button
                                    icon="pi pi-credit-card"
                                    size="small"
                                    severity="help"
                                    [outlined]="true"
                                    (click)="payInvoice(invoice)"
                                    pTooltip="Procesar cobro" />
                            }
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
                    <div class="rounded-2xl border border-surface-200 bg-surface-50 p-4 text-sm text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
                        Crea una factura manual usando el plan activo del tenant y deja el cobro listo desde administración.
                    </div>
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

        <p-dialog [(visible)]="showInvoiceDetailDialog" [style]="{ width: '42rem' }" header="Detalle de factura" [modal]="true">
            <ng-template #content>
                @if (invoiceDetailLoading()) {
                    <div class="py-8 text-center text-gray-500">Cargando detalle...</div>
                } @else if (selectedInvoice(); as invoice) {
                    <div class="grid gap-4 md:grid-cols-2">
                        <div class="rounded-2xl border border-surface-200 p-4 dark:border-surface-700">
                            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-surface-500">Factura</div>
                            <div class="mt-3 text-2xl font-semibold text-surface-950 dark:text-surface-0">#{{ invoice.id }}</div>
                            <div class="mt-2">
                                <p-tag [value]="getInvoiceDisplayStatus(invoice)" [severity]="getStatusSeverity(getInvoiceDisplayStatus(invoice))" />
                            </div>
                        </div>
                        <div class="rounded-2xl border border-surface-200 p-4 dark:border-surface-700">
                            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-surface-500">Monto</div>
                            <div class="mt-3 text-2xl font-semibold text-surface-950 dark:text-surface-0">{{ invoice.amount | currency:currencyCode() }}</div>
                            <div class="mt-2 text-sm text-surface-500">{{ invoice.payment_method || 'Método no registrado' }}</div>
                        </div>
                        <div class="rounded-2xl border border-surface-200 p-4 dark:border-surface-700">
                            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-surface-500">Tenant / Usuario</div>
                            <div class="mt-3 font-medium text-surface-900 dark:text-surface-100">{{ invoice.tenant_name || invoice.user_name || '—' }}</div>
                            <div class="mt-1 text-sm text-surface-500">{{ invoice.user_email || invoice.user?.email || 'Sin correo' }}</div>
                        </div>
                        <div class="rounded-2xl border border-surface-200 p-4 dark:border-surface-700">
                            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-surface-500">Plan</div>
                            <div class="mt-3 font-medium text-surface-900 dark:text-surface-100">{{ getPlanDisplayName(invoice) }}</div>
                            <div class="mt-1 text-sm text-surface-500">Suscripción #{{ invoice.subscription?.id || '—' }}</div>
                        </div>
                        <div class="rounded-2xl border border-surface-200 p-4 dark:border-surface-700">
                            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-surface-500">Emisión</div>
                            <div class="mt-3 font-medium text-surface-900 dark:text-surface-100">{{ invoice.issued_at | date:'medium' }}</div>
                        </div>
                        <div class="rounded-2xl border border-surface-200 p-4 dark:border-surface-700">
                            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-surface-500">Vencimiento</div>
                            <div class="mt-3 font-medium text-surface-900 dark:text-surface-100">{{ invoice.due_date | date:'mediumDate' }}</div>
                            <div class="mt-1 text-sm text-surface-500">Pagada: {{ invoice.paid_at ? (invoice.paid_at | date:'medium') : 'No' }}</div>
                        </div>
                    </div>
                    @if (invoice.description) {
                        <div class="mt-4 rounded-2xl border border-surface-200 p-4 text-sm text-surface-600 dark:border-surface-700 dark:text-surface-300">
                            {{ invoice.description }}
                        </div>
                    }
                } @else {
                    <div class="py-8 text-center text-gray-500">No hay factura seleccionada.</div>
                }
            </ng-template>

            <ng-template #footer>
                <p-button label="Cerrar" icon="pi pi-times" text (click)="showInvoiceDetailDialog = false" />
                @if (selectedInvoice(); as invoice) {
                    @if (!invoice.is_paid) {
                        <p-button label="Cobrar" icon="pi pi-credit-card" severity="help" [outlined]="true" (click)="payInvoice(invoice)" />
                        <p-button label="Marcar pagada" icon="pi pi-check" severity="success" (click)="markAsPaid(invoice)" />
                    }
                    <p-button label="Imprimir" icon="pi pi-print" severity="secondary" [outlined]="true" (click)="downloadInvoice(invoice)" />
                }
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
    currencyCode = signal('USD');
    selectedStatus: string | null = null;
    showGenerateDialog = false;
    showInvoiceDetailDialog = false;
    invoiceDetailLoading = signal(false);
    selectedInvoice = signal<Invoice | null>(null);

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
        private settingsService: SettingsService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadCurrency();
        this.loadInvoices();
        this.loadTenants();
    }

    loadCurrency() {
        this.settingsService.getSettings().subscribe({
            next: (settings) => {
                if (settings?.default_currency) {
                    this.currencyCode.set(settings.default_currency);
                }
            },
            error: () => {}
        });
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

    getPlanDisplayName(invoice: Invoice | null | undefined): string {
        return getSubscriptionPlanLabel(
            invoice?.plan_name,
            invoice?.subscription?.plan?.name
        );
    }

    viewInvoice(invoice: Invoice) {
        if (!invoice.id) {
            return;
        }

        this.invoiceDetailLoading.set(true);
        this.selectedInvoice.set(null);
        this.showInvoiceDetailDialog = true;

        this.billingService.getInvoice(invoice.id).subscribe({
            next: (detail: Invoice) => {
                this.selectedInvoice.set(detail);
                this.invoiceDetailLoading.set(false);
            },
            error: () => {
                this.selectedInvoice.set(invoice);
                this.invoiceDetailLoading.set(false);
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Detalle parcial',
                    detail: 'No se pudo cargar el detalle completo; mostrando la información disponible.'
                });
            }
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
            const invoiceId = invoice.id;
            this.billingService.markInvoiceAsPaid(invoice.id).subscribe({
                next: () => {
                    const paidAt = new Date().toISOString();
                    const updatedInvoices = this.invoices().map(current =>
                        current.id === invoiceId
                            ? { ...current, status: 'paid', is_paid: true, paid_at: paidAt }
                            : current
                    );
                    this.invoices.set(updatedInvoices);
                    this.updateSelectedInvoice(invoiceId, { status: 'paid', is_paid: true, paid_at: paidAt });
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

    payInvoice(invoice: Invoice) {
        if (invoice.id) {
            const invoiceId = invoice.id;
            this.billingService.payInvoice(invoice.id).subscribe({
                next: () => {
                    const paidAt = new Date().toISOString();
                    const updatedInvoices = this.invoices().map(current =>
                        current.id === invoiceId
                            ? { ...current, status: 'paid', is_paid: true, paid_at: paidAt }
                            : current
                    );
                    this.invoices.set(updatedInvoices);
                    this.updateSelectedInvoice(invoiceId, { status: 'paid', is_paid: true, paid_at: paidAt });
                    this.loadStats();
                    this.filterInvoices();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Cobro procesado',
                        detail: 'La factura fue cobrada correctamente'
                    });
                },
                error: (error) => this.showErrorMessage('Error al procesar el cobro', error)
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

    private updateSelectedInvoice(invoiceId: number, patch: Partial<Invoice>): void {
        const current = this.selectedInvoice();
        if (current?.id === invoiceId) {
            this.selectedInvoice.set({ ...current, ...patch });
        }
    }

    private buildInvoicePrintHtml(invoice: Invoice): string {
        const tenantName = invoice.tenant_name || invoice.user_name || invoice.user_email || 'N/A';
        const issued = invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString() : '-';
        const due = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-';
        const paid = invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : '-';
        const amount = this.formatMoney(Number(invoice.amount || 0));

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
    <div class="box"><strong>Plan</strong><div>${this.escapeHtml(this.getPlanDisplayName(invoice))}</div></div>
    <div class="box"><strong>Emisión</strong><div>${issued}</div></div>
    <div class="box"><strong>Vencimiento</strong><div>${due}</div></div>
    <div class="box"><strong>Estado</strong><div>${this.escapeHtml(invoice.status || 'pending')}</div></div>
    <div class="box"><strong>Pagada</strong><div>${paid}</div></div>
  </div>
  <div class="box">
    <div class="muted">Monto</div>
    <div class="amount">${amount}</div>
  </div>
</body>
</html>`;
    }

    private formatMoney(value: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.currencyCode()
        }).format(Number(value || 0));
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
