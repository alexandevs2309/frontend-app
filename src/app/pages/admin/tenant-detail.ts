import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TenantService } from '../../core/services/tenant/tenant.service';
import { SubscriptionService } from '../../core/services/subscription/subscription.service';
import { ActivityLogService } from '../../core/services/activity-log/activity-log.service';
import { BillingService } from '../../core/services/billing.service';

interface DiagnosticFinding {
    severity: 'critical' | 'warning' | 'info';
    title: string;
    detail: string;
    action: string;
}

@Component({
    selector: 'app-tenant-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        TagModule,
        TableModule,
        SelectModule,
        ToastModule,
        DatePipe,
        JsonPipe
    ],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold m-0">Tenant Command Center</h1>
                <p class="text-gray-500 m-0">Operación, soporte y diagnóstico 360 del cliente</p>
            </div>
            <div class="flex gap-2">
                <p-button icon="pi pi-arrow-left" label="Volver" severity="secondary" (onClick)="goBack()" />
                <p-button icon="pi pi-refresh" label="Refrescar" (onClick)="loadTenantData()" [loading]="loading()" />
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <p-card>
                <div class="text-sm text-gray-500">Estado</div>
                <p-tag [value]="tenant()?.is_active ? 'Activo' : 'Inactivo'" [severity]="tenant()?.is_active ? 'success' : 'danger'" />
            </p-card>
            <p-card>
                <div class="text-sm text-gray-500">Suscripción</div>
                <p-tag [value]="tenant()?.subscription_status || 'N/A'" [severity]="getSubscriptionSeverity(tenant()?.subscription_status)" />
            </p-card>
            <p-card>
                <div class="text-sm text-gray-500">Usuarios</div>
                <div class="text-2xl font-bold">{{ users().length }}</div>
            </p-card>
            <p-card>
                <div class="text-sm text-gray-500">Trial End</div>
                <div class="text-lg font-semibold">{{ tenant()?.trial_end_date ? (tenant()?.trial_end_date | date:'dd/MM/yyyy') : '-' }}</div>
            </p-card>
            <p-card>
                <div class="text-sm text-gray-500">Facturas vencidas</div>
                <div class="text-2xl font-bold text-red-600">{{ overdueInvoicesCount() }}</div>
            </p-card>
            <p-card>
                <div class="text-sm text-gray-500">Pagos fallidos</div>
                <div class="text-2xl font-bold text-orange-600">{{ failedPaymentsCount() }}</div>
            </p-card>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <p-card header="Perfil del Tenant">
                <div class="space-y-2">
                    <div><strong>Nombre:</strong> {{ tenant()?.name || '-' }}</div>
                    <div><strong>Subdominio:</strong> {{ tenant()?.subdomain || '-' }}</div>
                    <div><strong>Contacto:</strong> {{ tenant()?.contact_email || '-' }}</div>
                    <div><strong>Plan actual:</strong> {{ tenant()?.subscription_plan?.name || tenant()?.plan_type || '-' }}</div>
                    <div><strong>Límites:</strong> Users {{ tenant()?.max_users || 0 }} / Employees {{ tenant()?.max_employees || 0 }}</div>
                    <div><strong>Creado:</strong> {{ tenant()?.created_at ? (tenant()?.created_at | date:'dd/MM/yyyy HH:mm') : '-' }}</div>
                </div>
            </p-card>

            <p-card header="Acciones Operativas">
                <div class="flex flex-wrap gap-2 mb-4">
                    <p-button
                        [label]="tenant()?.is_active ? 'Desactivar Tenant' : 'Activar Tenant'"
                        [severity]="tenant()?.is_active ? 'danger' : 'success'"
                        icon="pi pi-power-off"
                        (onClick)="toggleActive()"
                    />
                    <p-button
                        [label]="tenant()?.subscription_status === 'suspended' ? 'Reanudar Suscripción' : 'Suspender Suscripción'"
                        [severity]="tenant()?.subscription_status === 'suspended' ? 'success' : 'warn'"
                        icon="pi pi-pause"
                        (onClick)="toggleSuspension()"
                    />
                </div>

                <div class="flex gap-2 items-end">
                    <div class="grow">
                        <label class="block text-sm mb-2">Cambiar plan del tenant</label>
                        <p-select
                            [(ngModel)]="selectedPlanId"
                            [options]="planOptions()"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Seleccionar plan"
                        />
                    </div>
                    <p-button label="Aplicar" icon="pi pi-check" (onClick)="applyPlanChange()" [disabled]="!selectedPlanId" [loading]="saving()" />
                </div>
            </p-card>
        </div>

        <p-card header="Diagnóstico Asistido" styleClass="mb-6">
            <div class="space-y-3" *ngIf="diagnostics().length > 0; else noFindings">
                <div
                    *ngFor="let finding of diagnostics(); trackBy: trackByDiagnostic"
                    class="p-3 rounded border-l-4"
                    [class]="getDiagnosticClass(finding.severity)"
                >
                    <div class="font-semibold">{{ finding.title }}</div>
                    <div class="text-sm">{{ finding.detail }}</div>
                    <div class="text-xs mt-1 text-gray-600"><strong>Acción sugerida:</strong> {{ finding.action }}</div>
                </div>
            </div>
            <ng-template #noFindings>
                <div class="text-green-700">No se detectaron hallazgos críticos para este tenant.</div>
            </ng-template>
        </p-card>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <p-card header="Usuarios del Tenant">
                <p-table [value]="users()" [tableStyle]="{ 'min-width': '100%' }">
                    <ng-template #header>
                        <tr>
                            <th>Email</th>
                            <th>Nombre</th>
                            <th>Rol</th>
                            <th>Estado</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-user>
                        <tr>
                            <td>{{ user.email }}</td>
                            <td>{{ user.full_name || '-' }}</td>
                            <td>{{ user.role || '-' }}</td>
                            <td>
                                <p-tag [value]="user.is_active ? 'Activo' : 'Inactivo'" [severity]="user.is_active ? 'success' : 'danger'" />
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>

            <p-card header="Suscripción del Tenant">
                <div class="space-y-2">
                    <div><strong>Plan:</strong> {{ tenantSubscription()?.plan?.name || tenantSubscription()?.plan_name || '-' }}</div>
                    <div><strong>Estado:</strong> {{ tenantSubscription()?.status || tenant()?.subscription_status || '-' }}</div>
                    <div><strong>Inicio:</strong> {{ tenantSubscription()?.start_date ? (tenantSubscription()?.start_date | date:'dd/MM/yyyy') : '-' }}</div>
                    <div><strong>Fin:</strong> {{ tenantSubscription()?.end_date ? (tenantSubscription()?.end_date | date:'dd/MM/yyyy') : '-' }}</div>
                </div>
                <div class="mt-4" *ngIf="tenantStats()">
                    <strong>Stats:</strong>
                    <pre class="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto">{{ tenantStats() | json }}</pre>
                </div>
            </p-card>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <p-card header="Suscripciones de Usuarios">
                <p-table [value]="userSubscriptions()" [tableStyle]="{ 'min-width': '100%' }">
                    <ng-template #header>
                        <tr>
                            <th>Usuario</th>
                            <th>Plan</th>
                            <th>Estado</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                            <th>Acciones</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-sub>
                        <tr>
                            <td>{{ sub.user?.email || sub.user_email || '-' }}</td>
                            <td>{{ sub.plan?.name || sub.plan_name || '-' }}</td>
                            <td>
                                <p-tag [value]="sub.is_active ? 'Activa' : 'Inactiva'" [severity]="sub.is_active ? 'success' : 'danger'" />
                            </td>
                            <td>{{ sub.start_date ? (sub.start_date | date:'dd/MM/yyyy') : '-' }}</td>
                            <td>{{ sub.end_date ? (sub.end_date | date:'dd/MM/yyyy') : '-' }}</td>
                            <td>
                                <div class="flex gap-2">
                                    <p-button
                                        [label]="sub.is_active ? 'Cancelar' : 'Reactivar'"
                                        [severity]="sub.is_active ? 'danger' : 'success'"
                                        size="small"
                                        (onClick)="toggleUserSubscription(sub)"
                                    />
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>

            <p-card header="Facturación y Cobros">
                <p-table [value]="tenantInvoices()" [tableStyle]="{ 'min-width': '100%' }">
                    <ng-template #header>
                        <tr>
                            <th>Factura</th>
                            <th>Monto</th>
                            <th>Estado</th>
                            <th>Vence</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-inv>
                        <tr>
                            <td>#{{ inv.id }}</td>
                            <td>{{ inv.amount | currency:'USD' }}</td>
                            <td><p-tag [value]="inv.status || 'pending'" [severity]="getInvoiceSeverity(inv.status)" /></td>
                            <td>{{ inv.due_date ? (inv.due_date | date:'dd/MM/yyyy') : '-' }}</td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>

        <p-card header="Actividad Técnica Reciente del Tenant">
            <p-table [value]="tenantLogs()" [tableStyle]="{ 'min-width': '100%' }">
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
                        <td>{{ log.source }}</td>
                        <td>{{ log.description }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>
    `
})
export class TenantDetail implements OnInit {
    tenantId = signal<number | null>(null);
    tenant = signal<any>(null);
    tenantStats = signal<any>(null);
    users = signal<any[]>([]);
    tenantSubscription = signal<any>(null);
    userSubscriptions = signal<any[]>([]);
    tenantInvoices = signal<any[]>([]);
    tenantLogs = signal<any[]>([]);
    plans = signal<any[]>([]);
    selectedPlanId: number | null = null;
    loading = signal(false);
    saving = signal(false);
    diagnostics = signal<DiagnosticFinding[]>([]);

    planOptions = signal<any[]>([]);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private tenantService: TenantService,
        private subscriptionService: SubscriptionService,
        private activityLogService: ActivityLogService,
        private billingService: BillingService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!id) {
            this.goBack();
            return;
        }
        this.tenantId.set(id);
        this.loadTenantData();
        this.loadPlans();
    }

    loadTenantData(): void {
        const id = this.tenantId();
        if (!id) return;

        this.loading.set(true);
        const invoices$ = this.billingService
            .getInvoices({ tenant: id })
            .pipe(catchError(() => this.billingService.getInvoices().pipe(catchError(() => of([])))));

        forkJoin({
            tenant: this.tenantService.getTenant(id).pipe(catchError(() => of(null))),
            stats: this.tenantService.getTenantStats(id).pipe(catchError(() => of(null))),
            users: this.tenantService.getTenantUsers(id).pipe(catchError(() => of([]))),
            subscription: this.tenantService.getTenantSubscription(id).pipe(catchError(() => of(null))),
            userSubscriptions: this.subscriptionService.getUserSubscriptions({ tenant: id }).pipe(catchError(() => of([]))),
            invoices: invoices$,
            logs: this.activityLogService.getAuditLogs({ tenant: id, page_size: 20 }).pipe(catchError(() => of({ results: [] })))
        }).subscribe({
            next: ({ tenant, stats, users, subscription, userSubscriptions, invoices, logs }) => {
                const usersArr = Array.isArray(users) ? users : users?.results || [];
                const userSubsArr = Array.isArray(userSubscriptions) ? userSubscriptions : userSubscriptions?.results || [];
                const invoicesArrRaw = Array.isArray(invoices) ? invoices : invoices?.results || [];
                const logsArr = logs?.results || [];

                const filteredInvoices = invoicesArrRaw.filter((inv: any) => {
                    const tenantId = tenant?.id;
                    return inv?.tenant === tenantId || inv?.tenant_id === tenantId || inv?.tenant_name === tenant?.name;
                });

                this.tenant.set(tenant);
                this.tenantStats.set(stats);
                this.users.set(usersArr);
                this.tenantSubscription.set(subscription);
                this.userSubscriptions.set(userSubsArr);
                this.tenantInvoices.set(filteredInvoices);
                this.tenantLogs.set(logsArr);
                this.selectedPlanId = tenant?.subscription_plan?.id || tenant?.subscription_plan || null;
                this.diagnostics.set(this.buildDiagnostics(tenant, filteredInvoices, logsArr, userSubsArr));
                this.loading.set(false);
            },
            error: (error) => {
                this.loading.set(false);
                this.showError('No se pudo cargar detalle del tenant', error);
            }
        });
    }

    loadPlans(): void {
        this.subscriptionService.getPlans().subscribe({
            next: (data: any) => {
                const plans = Array.isArray(data) ? data : data?.results || [];
                this.plans.set(plans);
                this.planOptions.set(plans.map((p: any) => ({ id: p.id, name: p.name })));
            },
            error: () => {
                this.planOptions.set([]);
            }
        });
    }

    applyPlanChange(): void {
        const id = this.tenantId();
        if (!id || !this.selectedPlanId) return;

        this.saving.set(true);
        this.tenantService.updateTenant(id, { subscription_plan: this.selectedPlanId }).subscribe({
            next: () => {
                this.saving.set(false);
                this.showSuccess('Plan actualizado correctamente');
                this.loadTenantData();
            },
            error: (error) => {
                this.saving.set(false);
                this.showError('No se pudo actualizar plan del tenant', error);
            }
        });
    }

    toggleActive(): void {
        const id = this.tenantId();
        const current = this.tenant();
        if (!id || !current) return;

        const action$ = current.is_active
            ? this.tenantService.deactivateTenant(id)
            : this.tenantService.activateTenant(id);

        action$.subscribe({
            next: () => {
                this.showSuccess(current.is_active ? 'Tenant desactivado' : 'Tenant activado');
                this.loadTenantData();
            },
            error: (error) => this.showError('No se pudo actualizar estado activo', error)
        });
    }

    toggleSuspension(): void {
        const id = this.tenantId();
        const current = this.tenant();
        if (!id || !current) return;

        if (current.subscription_status === 'suspended') {
            this.tenantService.resumeTenant(id).subscribe({
                next: () => {
                    this.showSuccess('Suscripción reanudada');
                    this.loadTenantData();
                },
                error: (error) => this.showError('No se pudo reanudar suscripción', error)
            });
            return;
        }

        const reason = window.prompt('Razón de suspensión:') || 'Suspensión administrativa';
        this.tenantService.suspendTenant(id, reason).subscribe({
            next: () => {
                this.showSuccess('Suscripción suspendida');
                this.loadTenantData();
            },
            error: (error) => this.showError('No se pudo suspender suscripción', error)
        });
    }

    toggleUserSubscription(sub: any): void {
        if (!sub?.id) return;
        const action$ = sub.is_active
            ? this.subscriptionService.cancelUserSubscription(sub.id)
            : this.subscriptionService.reactivateUserSubscription(sub.id);

        action$.subscribe({
            next: () => {
                this.showSuccess(sub.is_active ? 'Suscripción cancelada' : 'Suscripción reactivada');
                this.loadTenantData();
            },
            error: (error) => this.showError('No se pudo cambiar estado de suscripción', error)
        });
    }

    overdueInvoicesCount(): number {
        const now = new Date();
        return this.tenantInvoices().filter((inv) => inv?.status === 'pending' && inv?.due_date && new Date(inv.due_date) < now).length;
    }

    failedPaymentsCount(): number {
        return this.tenantInvoices().filter((inv) => inv?.status === 'failed').length;
    }

    getSubscriptionSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        if (!status) return 'secondary';
        if (status === 'active') return 'success';
        if (status === 'trial') return 'info';
        if (status === 'suspended') return 'danger';
        return 'warn';
    }

    getInvoiceSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        if (status === 'paid') return 'success';
        if (status === 'pending') return 'warn';
        if (status === 'failed' || status === 'overdue') return 'danger';
        return 'secondary';
    }

    getLogSeverity(action?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        if (!action) return 'secondary';
        if (action.includes('ERROR')) return 'danger';
        if (action.includes('ALERT')) return 'warn';
        if (action === 'CREATE' || action === 'UPDATE') return 'success';
        return 'info';
    }

    getDiagnosticClass(severity: 'critical' | 'warning' | 'info'): string {
        if (severity === 'critical') return 'border-red-600 bg-red-50 dark:bg-red-900/10';
        if (severity === 'warning') return 'border-amber-600 bg-amber-50 dark:bg-amber-900/10';
        return 'border-blue-600 bg-blue-50 dark:bg-blue-900/10';
    }

    trackByDiagnostic(index: number, item: DiagnosticFinding): string {
        return `${item.severity}-${item.title}-${index}`;
    }

    private buildDiagnostics(tenant: any, invoices: any[], logs: any[], userSubscriptions: any[]): DiagnosticFinding[] {
        const findings: DiagnosticFinding[] = [];
        const overdue = invoices.filter((inv) => inv?.status === 'pending' && inv?.due_date && new Date(inv.due_date) < new Date()).length;
        const failed = invoices.filter((inv) => inv?.status === 'failed').length;
        const errors = logs.filter((log) => String(log?.action || '').includes('ERROR')).length;
        const inactiveUsers = (this.users() || []).filter((u) => u && u.is_active === false).length;
        const inactiveSubs = userSubscriptions.filter((s) => s && s.is_active === false).length;

        if (tenant?.subscription_status === 'suspended') {
            findings.push({
                severity: 'critical',
                title: 'Tenant suspendido',
                detail: 'El tenant no está en estado operativo normal.',
                action: 'Verificar causa de suspensión, pagos vencidos y reanudar si corresponde.'
            });
        }

        if (overdue > 0) {
            findings.push({
                severity: 'warning',
                title: 'Facturas vencidas detectadas',
                detail: `Se detectaron ${overdue} facturas vencidas.`,
                action: 'Contactar al cliente y gestionar cobro o plan de regularización.'
            });
        }

        if (failed > 0) {
            findings.push({
                severity: 'warning',
                title: 'Pagos fallidos',
                detail: `Se detectaron ${failed} pagos fallidos para este tenant.`,
                action: 'Revisar método de pago y logs de integración (Stripe/PayPal).'
            });
        }

        if (errors > 0) {
            findings.push({
                severity: 'warning',
                title: 'Errores técnicos recientes',
                detail: `Hay ${errors} eventos de error en actividad reciente del tenant.`,
                action: 'Inspeccionar logs técnicos y validar dependencias externas.'
            });
        }

        if (inactiveUsers > 0) {
            findings.push({
                severity: 'info',
                title: 'Usuarios inactivos',
                detail: `${inactiveUsers} usuarios están inactivos en este tenant.`,
                action: 'Confirmar si la inactividad es esperada o requiere soporte.'
            });
        }

        if (inactiveSubs > 0) {
            findings.push({
                severity: 'info',
                title: 'Suscripciones de usuario inactivas',
                detail: `${inactiveSubs} suscripciones de usuario aparecen inactivas.`,
                action: 'Validar estado de suscripciones y plan aplicable por usuario.'
            });
        }

        return findings;
    }

    goBack(): void {
        this.router.navigate(['/admin/tenants']);
    }

    private showSuccess(detail: string): void {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail, life: 3000 });
    }

    private showError(detail: string, error?: any): void {
        const errorMessage = error?.error?.message || error?.message || detail;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: String(errorMessage).substring(0, 200), life: 4000 });
    }
}
