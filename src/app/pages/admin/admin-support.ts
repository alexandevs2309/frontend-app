import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TenantService } from '../../core/services/tenant/tenant.service';
import { ActivityLogService } from '../../core/services/activity-log/activity-log.service';
import { BillingService } from '../../core/services/billing.service';

@Component({
    selector: 'app-admin-support',
    standalone: true,
    imports: [FormsModule, CardModule, InputTextModule, ButtonModule, TableModule, TagModule, ToastModule, DatePipe],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <div class="mb-6">
            <h1 class="text-2xl font-bold m-0">Soporte SaaS</h1>
            <p class="text-gray-500 m-0">Busca tenants, inspecciona actividad y diagnostica incidentes operativos.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <p-card>
                <div class="text-sm text-gray-500">Tenants</div>
                <div class="text-2xl font-bold">{{ tenants().length }}</div>
            </p-card>
            <p-card>
                <div class="text-sm text-gray-500">Activos</div>
                <div class="text-2xl font-bold text-green-600">{{ activeCount() }}</div>
            </p-card>
            <p-card>
                <div class="text-sm text-gray-500">Suspendidos</div>
                <div class="text-2xl font-bold text-red-600">{{ suspendedCount() }}</div>
            </p-card>
            <p-card>
                <div class="text-sm text-gray-500">Trials</div>
                <div class="text-2xl font-bold text-amber-600">{{ trialCount() }}</div>
            </p-card>
        </div>

        <p-card header="Búsqueda de Tenant" styleClass="mb-6">
            <div class="flex gap-2 mb-4">
                <input
                    pInputText
                    type="text"
                    [(ngModel)]="searchTerm"
                    (input)="applyFilter()"
                    placeholder="Buscar por nombre, subdominio, email o plan"
                    class="w-full"
                />
                <p-button icon="pi pi-refresh" label="Refrescar" (onClick)="loadTenants()" [loading]="loading()" />
            </div>

            <p-table [value]="filteredTenants()" [paginator]="true" [rows]="10" [tableStyle]="{ 'min-width': '100%' }" [loading]="loading()">
                <ng-template #header>
                    <tr>
                        <th>Tenant</th>
                        <th>Plan</th>
                        <th>Suscripción</th>
                        <th>Estado</th>
                        <th>Contacto</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>
                <ng-template #body let-tenant>
                    <tr>
                        <td>
                            <div class="font-semibold">{{ tenant.name }}</div>
                            <div class="text-xs text-gray-500">{{ tenant.subdomain || '-' }}</div>
                        </td>
                        <td>{{ tenant.subscription_plan?.name || tenant.plan_type || '-' }}</td>
                        <td>
                            <p-tag [value]="tenant.subscription_status || 'trial'" [severity]="getSubscriptionSeverity(tenant.subscription_status)" />
                        </td>
                        <td>
                            <p-tag [value]="tenant.is_active ? 'Activo' : 'Inactivo'" [severity]="tenant.is_active ? 'success' : 'danger'" />
                        </td>
                        <td>{{ tenant.contact_email || tenant.owner_email || '-' }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button icon="pi pi-search" label="Inspeccionar" size="small" (onClick)="inspectTenant(tenant)" />
                                <p-button icon="pi pi-arrow-right" label="Abrir" severity="secondary" size="small" (onClick)="openTenantDetail(tenant)" />
                            </div>
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr>
                        <td colspan="6" class="text-center text-sm text-gray-500 py-6">
                            No hay tenants que coincidan con la búsqueda.
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>

        @if (selectedTenant()) {
        <p-card [header]="'Diagnóstico Rápido: ' + selectedTenant().name">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div class="p-3 rounded bg-gray-50 dark:bg-gray-800">
                    <div class="text-sm text-gray-500">Facturas vencidas</div>
                    <div class="text-xl font-bold text-red-600">{{ supportStats().overdue }}</div>
                </div>
                <div class="p-3 rounded bg-gray-50 dark:bg-gray-800">
                    <div class="text-sm text-gray-500">Pagos fallidos</div>
                    <div class="text-xl font-bold text-orange-600">{{ supportStats().failed }}</div>
                </div>
                <div class="p-3 rounded bg-gray-50 dark:bg-gray-800">
                    <div class="text-sm text-gray-500">Errores técnicos (20 logs)</div>
                    <div class="text-xl font-bold text-rose-600">{{ supportStats().errors }}</div>
                </div>
            </div>

            <p-table [value]="recentLogs()" [tableStyle]="{ 'min-width': '100%' }">
                <ng-template #header>
                    <tr>
                        <th>Fecha</th>
                        <th>Acción</th>
                        <th>Fuente</th>
                        <th>Descripción</th>
                    </tr>
                </ng-template>
                <ng-template #body let-log>
                    <tr>
                        <td>{{ log.timestamp | date:'dd/MM/yyyy HH:mm' }}</td>
                        <td><p-tag [value]="log.action" [severity]="getLogSeverity(log.action)" /></td>
                        <td>{{ log.source || '-' }}</td>
                        <td>{{ log.description || '-' }}</td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr>
                        <td colspan="4" class="text-center text-sm text-gray-500 py-6">
                            No hay registros recientes para este tenant.
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>
        }
    `
})
export class AdminSupport implements OnInit {
    tenants = signal<any[]>([]);
    filteredTenants = signal<any[]>([]);
    selectedTenant = signal<any | null>(null);
    recentLogs = signal<any[]>([]);
    supportStats = signal({ overdue: 0, failed: 0, errors: 0 });
    loading = signal(false);
    searchTerm = '';

    constructor(
        private tenantService: TenantService,
        private activityLogService: ActivityLogService,
        private billingService: BillingService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadTenants();
    }

    loadTenants(): void {
        this.loading.set(true);
        this.tenantService.getTenants().subscribe({
            next: (data: any) => {
                const list = Array.isArray(data) ? data : data?.results || [];
                this.tenants.set(list);
                this.filteredTenants.set(list);
                this.loading.set(false);
            },
            error: (error) => {
                this.loading.set(false);
                this.tenants.set([]);
                this.filteredTenants.set([]);
                this.showError('No se pudieron cargar los tenants', error);
            }
        });
    }

    applyFilter(): void {
        const query = (this.searchTerm || '').trim().toLowerCase();
        if (!query) {
            this.filteredTenants.set(this.tenants());
            return;
        }

        const filtered = this.tenants().filter((tenant) => {
            const haystack = [
                tenant?.name,
                tenant?.subdomain,
                tenant?.contact_email,
                tenant?.owner_email,
                tenant?.subscription_plan?.name,
                tenant?.plan_type
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(query);
        });
        this.filteredTenants.set(filtered);
    }

    inspectTenant(tenant: any): void {
        const tenantId = tenant?.id;
        if (!tenantId) return;

        this.selectedTenant.set(tenant);

        const invoices$ = this.billingService
            .getInvoices({ tenant: tenantId, page_size: 500 })
            .pipe(catchError(() => of([])));

        forkJoin({
            logs: this.activityLogService.getAuditLogs({ tenant: tenantId, page_size: 20 }).pipe(catchError(() => of({ results: [] }))),
            invoices: invoices$
        }).subscribe({
            next: ({ logs, invoices }) => {
                const logsArr = logs?.results || [];
                const invoicesArrRaw = Array.isArray(invoices) ? invoices : invoices?.results || [];
                const tenantInvoices = invoicesArrRaw.filter((inv: any) =>
                    inv?.tenant === tenantId || inv?.tenant_id === tenantId || inv?.tenant_name === tenant?.name
                );

                this.recentLogs.set(logsArr);
                this.supportStats.set({
                    overdue: tenantInvoices.filter((inv: any) => inv?.status === 'pending' && inv?.due_date && new Date(inv.due_date) < new Date()).length,
                    failed: tenantInvoices.filter((inv: any) => inv?.status === 'failed').length,
                    errors: logsArr.filter((log: any) => String(log?.action || '').includes('ERROR')).length
                });
            },
            error: (error) => {
                this.recentLogs.set([]);
                this.supportStats.set({ overdue: 0, failed: 0, errors: 0 });
                this.showError('No se pudo cargar diagnóstico del tenant', error);
            }
        });
    }

    openTenantDetail(tenant: any): void {
        if (!tenant?.id) return;
        this.router.navigate(['/admin/tenants', tenant.id]);
    }

    activeCount(): number {
        return this.tenants().filter((t) => t?.is_active).length;
    }

    suspendedCount(): number {
        return this.tenants().filter((t) => t?.subscription_status === 'suspended').length;
    }

    trialCount(): number {
        return this.tenants().filter((t) => t?.subscription_status === 'trial').length;
    }

    getSubscriptionSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        if (status === 'active') return 'success';
        if (status === 'trial') return 'info';
        if (status === 'suspended') return 'danger';
        return 'warn';
    }

    getLogSeverity(action?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        return String(action || '').includes('ERROR') ? 'danger' : 'info';
    }

    private showError(detail: string, error?: any): void {
        const message = error?.error?.message || error?.message || detail;
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: String(message).substring(0, 200),
            life: 4000
        });
    }
}
