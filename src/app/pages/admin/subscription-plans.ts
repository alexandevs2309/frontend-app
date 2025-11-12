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
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SubscriptionService } from '../../core/services/subscription/subscription.service';
import { StatusPipe } from '../../shared/pipes';

interface SubscriptionPlan {
    id?: number;
    name?: string;
    description?: string;
    price?: number;
    max_employees?: number;
    max_users?: number;
    max_appointments?: number;
    duration_month?: number;
    allows_multiple_branches?: boolean;
    features?: any;
    features_list?: string[];
    is_active?: boolean;
    created_at?: string;
}

@Component({
    selector: 'app-subscription-plans',
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
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,

    ],

    template: `
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div class="flex items-center gap-3">
                        <i class="pi pi-info-circle text-blue-600 dark:text-blue-400"></i>
                        <div>
                            <p class="font-semibold text-blue-900 dark:text-blue-100 mb-1">Planes del Sistema</p>
                            <p class="text-sm text-blue-700 dark:text-blue-300">Los planes se crean automáticamente. Puedes editar todo excepto las características.</p>
                        </div>
                    </div>
                </div>
            </ng-template>


        </p-toolbar>

        <p-table #dt
            [value]="plans()"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['name', 'description', 'price']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedPlans"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} plans"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
            [loading]="loading()"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Manage Subscription Plans</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>

                    <th pSortableColumn="name" style="min-width:12rem">
                        Name
                        <p-sortIcon field="name" />
                    </th>
                    <th style="min-width:20rem">Description</th>
                    <th pSortableColumn="price" style="min-width:8rem">
                        Price
                        <p-sortIcon field="price" />
                    </th>
                    <th style="min-width:8rem">Max-Employees</th>
                    <th style="min-width:10rem">Max-Users</th>
                    <th style="min-width:8rem">Multi-Sucursal</th>
                    <th style="min-width:15rem">Features</th>
                    <th pSortableColumn="is_active" style="min-width:8rem">
                        Status
                        <p-sortIcon field="is_active" />
                    </th>
                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-plan>
                <tr>

                    <td>{{ plan.name }}</td>
                    <td>{{ plan.description }}</td>
                    <td>{{ plan.price | currency:'USD' }}</td>
                    <td>{{ plan.max_employees || 'Unlimited' }}</td>
                    <td>{{ plan.max_users || 'Unlimited' }}</td>
                    <td>
                        <p-tag [value]="getMultiBranchText(plan)" [severity]="getMultiBranchSeverity(plan)" />
                    </td>
                    <td>
                        <span *ngFor="let feature of getFeaturesList(plan.features || plan.features_list).slice(0, 2); trackBy: trackByFeature" class="badge bg-info me-1">{{ feature }}</span>
                        <span *ngIf="getFeaturesList(plan.features || plan.features_list).length > 2" class="text-muted">+{{ getFeaturesList(plan.features || plan.features_list).length - 2 }} more</span>
                    </td>
                    <td>
                        <p-tag [value]="plan.is_active ? 'Activo' : 'Inactivo'" [severity]="plan.is_active ? 'success' : 'danger'" />
                    </td>
                    <td>
                        <p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true" (click)="editPlan(plan)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="planDialog" [style]="{ width: '600px' }" header="Subscription Plan Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="name" class="block font-bold mb-3">Name</label>
                            <input type="text" pInputText id="name" [(ngModel)]="plan.name" [disabled]="true" fluid />
                            <small class="text-red-500" *ngIf="submitted && !plan.name">Name is required.</small>
                        </div>

                        <div>
                            <label for="price" class="block font-bold mb-3">Price (USD)</label>
                            <p-inputnumber id="price" [(ngModel)]="plan.price" mode="currency" currency="USD" locale="en-US" fluid />
                        </div>
                    </div>

                    <div>
                        <label for="description" class="block font-bold mb-3">Description</label>
                        <textarea id="description" pTextarea [(ngModel)]="plan.description" rows="3" fluid></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="max_employees" class="block font-bold mb-3">Max Employees</label>
                            <p-inputnumber id="max_employees" [(ngModel)]="plan.max_employees" [min]="1" fluid />
                            <small class="text-muted">Leave empty for unlimited</small>
                        </div>

                        <div>
                            <label for="max_users" class="block font-bold mb-3">Max Users</label>
                            <p-inputnumber id="max_users" [(ngModel)]="plan.max_users" [min]="1" fluid />
                            <small class="text-muted">Leave empty for unlimited</small>
                        </div>
                    </div>

                    <div>
                        <label class="block font-bold mb-3">Features</label>
                        <div class="flex flex-col gap-2">
                            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Características del Plan:</p>
                                <div class="grid grid-cols-2 gap-2">
                                    <div *ngFor="let feature of getFeaturesList(plan.features || plan.features_list); trackBy: trackByFeature" class="flex items-center gap-2">
                                        <i class="pi pi-check text-green-500"></i>
                                        <span class="text-sm">{{ feature }}</span>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mt-2">Las características se configuran automáticamente</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="is_active" [(ngModel)]="plan.is_active" />
                        <label for="is_active">Active</label>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="savePlan()" [loading]="saving()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
        <p-toast />
    `,
    providers: [MessageService, ConfirmationService]
})
export class SubscriptionPlans implements OnInit {
    planDialog: boolean = false;
    plans = signal<SubscriptionPlan[]>([]);
    plan!: SubscriptionPlan;
    selectedPlans!: SubscriptionPlan[] | null;
    submitted: boolean = false;
    loading = signal(false);
    saving = signal(false);



    constructor(
        private subscriptionService: SubscriptionService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadPlans();
    }

    loadPlans() {
        this.loading.set(true);
        this.subscriptionService.getPlans().subscribe({
            next: (data: any) => {
                const plans = Array.isArray(data) ? data : (data.results || []);
                this.plans.set(plans);
                this.loading.set(false);
            },
            error: (error: any) => {
                this.showErrorMessage('Error al cargar los planes', error);
                this.plans.set([]);
                this.loading.set(false);
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }



    // Removed - Plans are created automatically via management command

    editPlan(plan: SubscriptionPlan) {
        const features = this.getFeaturesList(plan.features);
        this.plan = { ...plan, features: [...features] };
        this.planDialog = true;
    }

    // Removed - Plans cannot be deleted from frontend

    // Removed - Plans cannot be deleted from frontend

    hideDialog() {
        this.planDialog = false;
        this.submitted = false;
    }

    addFeature() {
        if (!this.plan.features || !Array.isArray(this.plan.features)) {
            this.plan.features = [];
        }
        this.plan.features.push('');
    }

    removeFeature(index: number) {
        if (this.plan.features) {
            this.plan.features.splice(index, 1);
        }
    }

    updateFeature(index: number, event: any) {
        if (this.plan.features && this.plan.features[index] !== undefined) {
            this.plan.features[index] = event.target.value;
        }
    }

    trackByIndex(index: number): number {
        return index;
    }

    getFeaturesList(features: any): string[] {
        if (!features) return [];
        if (Array.isArray(features)) {
            return features;
        }
        if (typeof features === 'object' && features !== null) {
            const featureNames: { [key: string]: string } = {
                'appointments': 'Gestión de Citas',
                'basic_reports': 'Reportes Básicos',
                'inventory': 'Gestión de Inventario',
                'advanced_reports': 'Reportes Avanzados',
                'multi_location': 'Múltiples Ubicaciones',
                'api_access': 'Acceso a API',
                'custom_branding': 'Marca Personalizada',
                'priority_support': 'Soporte Prioritario'
            };
            try {
                return Object.entries(features)
                    .filter(([key, value]) => value === true)
                    .map(([key]) => featureNames[key] || key);
            } catch (error) {
                return [];
            }
        }
        return [];
    }

    getMultiBranchText(plan: SubscriptionPlan): string {
        return plan.allows_multiple_branches ? 'Sí' : 'No';
    }

    getMultiBranchSeverity(plan: SubscriptionPlan): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        return plan.allows_multiple_branches ? 'success' : 'secondary';
    }

    savePlan() {
        this.submitted = true;

        if (this.plan.name?.trim()) {
            this.saving.set(true);

            if (this.plan.id) {
                // Update existing plan - name es read-only
                this.subscriptionService.updatePlan(this.plan.id, {
                    description: this.plan.description,
                    price: this.plan.price,
                    max_employees: this.plan.max_employees,
                    max_users: this.plan.max_users,
                    is_active: this.plan.is_active
                }).subscribe({
                    next: (updatedPlan: any) => {
                        const plans = this.plans();
                        const index = plans.findIndex(p => p.id === this.plan.id);
                        if (index !== -1) {
                            plans[index] = updatedPlan;
                            this.plans.set([...plans]);
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Exitoso',
                            detail: 'Plan actualizado correctamente',
                            life: 3000
                        });
                        this.planDialog = false;
                        this.saving.set(false);
                    },
                    error: (error: any) => {
                        this.showErrorMessage('Error al actualizar el plan', error);
                        this.saving.set(false);
                    }
                });
            }
        }
    }

    trackByPlan(index: number, plan: SubscriptionPlan): any {
        return plan.id || index;
    }

    trackByFeature(index: number, feature: string): any {
        return feature || index;
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
            component: 'SubscriptionPlans'
        };
        console.warn('[SubscriptionPlans Error]', errorInfo);
    }
}
