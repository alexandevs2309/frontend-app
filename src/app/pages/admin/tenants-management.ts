import { Component, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TenantService } from '../../core/services/tenant/tenant.service';
import { SubscriptionService } from '../../core/services/subscription/subscription.service';
import { ActivityLogService } from '../../core/services/activity-log/activity-log.service';
import { LocaleService } from '../../core/services/locale/locale.service';
import { DatePipe } from '@angular/common';

interface Tenant {
    id?: number;
    name?: string;
    subdomain?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    country?: string;
    subscription_plan?: any;
    plan_type?: string;
    subscription_status?: string;
    trial_end_date?: string;
    billing_info?: any;
    settings?: any;
    max_employees?: number;
    max_users?: number;
    branches_count?: number;
    is_active?: boolean;
    created_at?: string;
    users_count?: number;
}

@Component({
    selector: 'app-tenants-management',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        DatePipe,
    ],
    template: `
        <p-toolbar styleClass="mb-6 rounded-2xl shadow-lg border-0">
            <ng-template #start>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <i class="pi pi-building text-white"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Tenants</h2>
                        <p class="text-sm text-muted-color m-0">Gestiona todas las barberías</p>
                    </div>
                </div>
            </ng-template>
            <ng-template #end>
                <div class="flex gap-2">
                    <p-button 
                        label="Nuevo Tenant" 
                        icon="pi pi-plus" 
                        styleClass="bg-gradient-to-r from-blue-500 to-purple-500 border-0 shadow-lg hover:shadow-xl transition-all"
                        (onClick)="openNew()" 
                    />
                    <p-button 
                        severity="danger" 
                        label="Eliminar" 
                        icon="pi pi-trash" 
                        outlined 
                        (onClick)="deleteSelectedTenants()" 
                        [disabled]="!selectedTenants || !selectedTenants.length" 
                    />
                </div>
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="tenants()"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['name', 'subdomain', 'owner_email', 'subscription_plan']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedTenants"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} tenants"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
            [loading]="loading()"
            styleClass="rounded-2xl overflow-hidden shadow-lg">
            <ng-template #caption>
                <div class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <h5 class="m-0 font-bold text-lg">Gestionar Tenants</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input 
                            pInputText 
                            type="text" 
                            (input)="onGlobalFilter(dt, $event)" 
                            placeholder="Buscar..." 
                            class="rounded-xl border-2 focus:border-blue-500"
                        />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th pSortableColumn="name" style="min-width:16rem">
                        Name
                        <p-sortIcon field="name" />
                    </th>
                    <th pSortableColumn="subdomain" style="min-width:12rem">
                        Subdomain
                        <p-sortIcon field="subdomain" />
                    </th>
                    <th style="min-width:16rem">Contact</th>
                    <th pSortableColumn="subscription_plan" style="min-width:12rem">
                        Plan
                        <p-sortIcon field="subscription_plan" />
                    </th>
                    <th style="min-width:10rem">Sub. Status</th>
                    <th style="min-width:10rem">Trial End</th>
                    <th style="min-width:8rem">Sucursales</th>
                    <th style="min-width:8rem">Limits</th>
                    <th pSortableColumn="is_active" style="min-width:8rem">
                        Active
                        <p-sortIcon field="is_active" />
                    </th>
                    <th pSortableColumn="created_at" style="min-width:12rem">
                        Created
                        <p-sortIcon field="created_at" />
                    </th>
                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-tenant>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="tenant" />
                    </td>
                    <td style="min-width: 16rem">{{ tenant.name }}</td>
                    <td style="min-width: 12rem">
                        <code>{{ tenant.subdomain }}</code>
                    </td>
                    <td>{{ tenant.contact_email }}</td>
                    <td>{{ tenant.plan_type || tenant.subscription_plan?.name }}</td>
                    <td>
                        <p-tag [value]="tenant.subscription_status || 'trial'" [severity]="tenant.subscription_status === 'active' ? 'success' : 'warn'" />
                    </td>
                    <td>{{ tenant.trial_end_date ? (tenant.trial_end_date | date:'dd/MM/yyyy') : '-' }}</td>
                    <td>
                        <p-tag [value]="tenant.branches_count || 1" severity="info" />
                    </td>
                    <td>
                        <small>Users: {{ tenant.max_users || 0 }}<br>Emp: {{ tenant.max_employees || 0 }}</small>
                    </td>
                    <td>
                        <p-tag [value]="tenant.is_active ? 'Sí' : 'No'" [severity]="tenant.is_active ? 'success' : 'danger'" />
                    </td>
                    <td>{{ tenant.created_at | date:'dd/MM/yyyy' }}</td>
                    <td>
                        <div class="flex gap-2">
                            <p-button 
                                icon="pi pi-pencil" 
                                [rounded]="true" 
                                [outlined]="true" 
                                severity="info"
                                styleClass="hover:scale-110 transition-transform"
                                (click)="editTenant(tenant)" 
                            />
                            <p-button 
                                icon="pi pi-trash" 
                                severity="danger" 
                                [rounded]="true" 
                                [outlined]="true" 
                                styleClass="hover:scale-110 transition-transform"
                                (click)="deleteTenant(tenant)" 
                            />
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="tenantDialog" [style]="{ width: '450px' }" header="Tenant Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="name" class="block font-bold mb-3">Name</label>
                        <input type="text" pInputText id="name" [(ngModel)]="tenant.name" required autofocus fluid />
                        <small class="text-red-500" *ngIf="submitted && !tenant.name">Name is required.</small>
                    </div>

                    <div>
                        <label for="subdomain" class="block font-bold mb-3">Subdomain</label>
                        <input type="text" pInputText id="subdomain" [(ngModel)]="tenant.subdomain" required fluid />
                        <small class="text-red-500" *ngIf="submitted && !tenant.subdomain">Subdomain is required.</small>
                    </div>

                    <div>
                        <label for="contact_email" class="block font-bold mb-3">Contact Email</label>
                        <input type="email" pInputText id="contact_email" [(ngModel)]="tenant.contact_email" required fluid />
                        <small class="text-red-500" *ngIf="submitted && !tenant.contact_email">Contact email is required.</small>
                    </div>

                    <div>
                        <label for="contact_phone" class="block font-bold mb-3">Contact Phone</label>
                        <input type="text" pInputText id="contact_phone" [(ngModel)]="tenant.contact_phone" fluid />
                    </div>

                    <div>
                        <label for="subscription_plan" class="block font-bold mb-3">Subscription Plan</label>
                        <p-select [(ngModel)]="tenant.subscription_plan" inputId="subscription_plan" [options]="subscriptionPlans()" optionLabel="name" optionValue="id" placeholder="Select a Plan" fluid />
                    </div>

                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="is_active" [(ngModel)]="tenant.is_active" />
                        <label for="is_active">Active</label>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveTenant()" [loading]="saving()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
        <p-toast />
    `,
    providers: [MessageService, ConfirmationService]
})
export class TenantsManagement implements OnInit {
    tenantDialog: boolean = false;
    tenants = signal<Tenant[]>([]);
    subscriptionPlans = signal<any[]>([]);
    tenant!: Tenant;
    selectedTenants!: Tenant[] | null;
    submitted: boolean = false;
    loading = signal(false);
    saving = signal(false);



    constructor(
        private tenantService: TenantService,
        private subscriptionService: SubscriptionService,
        private activityLogService: ActivityLogService,
        public localeService: LocaleService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadTenants();
        this.loadSubscriptionPlans();
    }

    loadTenants() {
        this.loading.set(true);
        this.tenantService.getTenants().subscribe({
            next: (data: any) => {
                const tenants = Array.isArray(data) ? data : (data && data.results ? data.results : []);
                this.tenants.set(tenants);
                this.loading.set(false);
            },
            error: (error) => this.handleLoadError(error)
        });
    }

    loadSubscriptionPlans() {
        this.subscriptionService.getPlans().subscribe({
            next: (data: any) => {
                const plans = Array.isArray(data) ? data : (data.results || []);
                this.subscriptionPlans.set(plans);
            },
            error: (error) => this.handlePlansLoadError(error)
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }



    openNew() {
        this.tenant = { is_active: true };
        this.submitted = false;
        this.tenantDialog = true;
    }

    editTenant(tenant: Tenant) {
        this.tenant = { ...tenant };
        this.tenantDialog = true;
    }

    deleteSelectedTenants() {
        if (!this.selectedTenants?.length) return;

        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected tenants?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const tenantIds = this.selectedTenants!.map(t => t.id!).filter(id => id);
                this.tenantService.bulkDelete(tenantIds).subscribe({
                    next: () => {
                        this.loadTenants();
                        this.selectedTenants = null;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Tenants Deleted',
                            life: 3000
                        });
                    },
                    error: (error) => this.showErrorMessage('Failed to delete tenants', error)
                });
            }
        });
    }

    deleteTenant(tenant: Tenant) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${tenant.name || 'this tenant'}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (tenant.id) {
                    this.tenantService.deleteTenant(tenant.id).subscribe({
                        next: () => {
                            // Reload data from server to ensure consistency
                            this.loadTenants();
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Tenant Deleted',
                                life: 3000
                            });
                        },
                        error: (error) => this.showErrorMessage('Failed to delete tenant', error)
                    });
                }
            }
        });
    }

    hideDialog() {
        this.tenantDialog = false;
        this.submitted = false;
    }

    saveTenant() {
        this.submitted = true;

        if (this.tenant.name?.trim() && this.tenant.subdomain?.trim() && this.tenant.contact_email?.trim()) {
            // Validate subscription plan is selected
            if (!this.tenant.subscription_plan) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Please select a subscription plan'
                });
                return;
            }

            this.saving.set(true);

            if (this.tenant.id) {
                // Update existing tenant
                this.tenantService.updateTenant(this.tenant.id, this.tenant).subscribe({
                    next: (updatedTenant) => {
                        const tenants = this.tenants();
                        const index = tenants.findIndex(t => t.id === this.tenant.id);
                        if (index !== -1) {
                            tenants[index] = updatedTenant;
                            this.tenants.set([...tenants]);
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Tenant Updated',
                            life: 3000
                        });
                        // Update subscription if plan changed
                        this.updateTenantSubscription(updatedTenant);
                        this.tenantDialog = false;
                        this.saving.set(false);
                    },
                    error: (error) => {
                        this.showErrorMessage('Failed to update tenant', error);
                        this.saving.set(false);
                    }
                });
            } else {
                // Create new tenant - prepare data
                const tenantData = {
                    name: this.tenant.name,
                    subdomain: this.tenant.subdomain,
                    contact_email: this.tenant.contact_email,
                    contact_phone: this.tenant.contact_phone || '',
                    subscription_plan: this.tenant.subscription_plan,
                    is_active: this.tenant.is_active
                };



                this.tenantService.createTenant(tenantData).subscribe({
                    next: (newTenant) => {
                        this.tenants.set([...this.tenants(), newTenant]);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Tenant Created',
                            life: 3000
                        });
                        this.tenantDialog = false;
                        this.saving.set(false);
                    },
                    error: (error) => {
                        this.showErrorMessage('Failed to create tenant', error);
                        this.saving.set(false);
                    }
                });
            }
        }
    }

    private updateTenantSubscription(tenant: Tenant): void {
        if (tenant.subscription_plan && tenant.id) {
            // TODO: Implement subscription update when backend method is available
        }
    }

    validateTenantLimits() {
        const activeTenants = this.tenants().filter(t => t.is_active).length;
        // TODO: Get max tenants from system settings
        const maxTenants = 100;

        if (activeTenants >= maxTenants) {
            this.messageService.add({
                severity: 'error',
                summary: 'Limit Reached',
                detail: `Maximum number of tenants (${maxTenants}) reached`
            });
            return false;
        }
        return true;
    }

    trackByTenant(index: number, tenant: Tenant): any {
        return tenant.id || index;
    }

    private handleLoadError(error: any): void {
        this.logError('Failed to load tenants', error);
        this.tenants.set([]);
        this.loading.set(false);
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los tenants. Por favor, intenta de nuevo.',
            life: 5000
        });
    }

    private handlePlansLoadError(error: any): void {
        this.logError('Failed to load subscription plans', error);
        this.subscriptionPlans.set([]);
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'No se pudieron cargar los planes de suscripción',
            life: 3000
        });
    }

    private showErrorMessage(message: string, error?: any): void {
        this.logError(message, error);
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.sanitizeErrorMessage(error, message)
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
            component: 'TenantsManagement'
        };
        console.warn('[TenantsManagement Error]', errorInfo);
    }
}
