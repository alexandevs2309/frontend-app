import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
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
import { AdminErrorLogService } from '../../core/services/admin-error-log.service';

interface SubscriptionPlan {
    id?: number;
    name?: string;
    display_name?: string;
    description?: string;
    price?: number;
    max_users?: number;
    duration_month?: number;
    stripe_price_id?: string | null;
    allows_multiple_branches?: boolean;
    features?: Record<string, boolean> | string[];
    features_list?: string[];
    commercial_benefits?: string[];
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

@Component({
    selector: 'app-subscription-plans',
    standalone: true,
    imports: [
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
        CurrencyPipe,
    ],
    template: `
        <p-toolbar styleClass="mb-6 rounded-2xl shadow-lg border-0">
            <ng-template #start>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <i class="pi pi-credit-card text-white"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Planes de Suscripción</h2>
                        <p class="text-sm text-muted-color m-0">Gestiona los planes del sistema</p>
                    </div>
                </div>
            </ng-template>
            <ng-template #end>
                <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-info-circle text-blue-600 dark:text-blue-400 text-sm"></i>
                        <p class="text-xs text-blue-700 dark:text-blue-300 m-0">Las funciones técnicas y los beneficios comerciales se administran por separado.</p>
                    </div>
                </div>
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="plans()"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['name', 'description', 'price']"
            [tableStyle]="{ 'min-width': '80rem' }"
            [(selection)]="selectedPlans"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} plans"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
            [loading]="loading()"
            styleClass="rounded-2xl overflow-hidden shadow-lg"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between p-4 bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                    <h5 class="m-0 font-bold text-lg">Gestionar Planes de Suscripción</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input
                            pInputText
                            type="text"
                            (input)="onGlobalFilter(dt, $event)"
                            placeholder="Buscar..."
                            class="rounded-xl border-2 focus:border-emerald-500"
                        />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th pSortableColumn="name" style="min-width:12rem">
                        Plan
                        <p-sortIcon field="name" />
                    </th>
                    <th style="min-width:18rem">Descripción</th>
                    <th pSortableColumn="price" style="min-width:8rem">
                        Precio
                        <p-sortIcon field="price" />
                    </th>
                    <th style="min-width:8rem">Duración</th>
                    <th style="min-width:10rem">Usuarios activos</th>
                    <th style="min-width:8rem">Multi-Sucursal</th>
                    <th style="min-width:15rem">Funciones</th>
                    <th style="min-width:15rem">Beneficios</th>
                    <th pSortableColumn="is_active" style="min-width:8rem">
                        Estado
                        <p-sortIcon field="is_active" />
                    </th>
                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-plan>
                <tr>
                    <td>
                        <div class="font-semibold">{{ plan.display_name || plan.name }}</div>
                        <div class="text-sm text-gray-500">{{ plan.name }}</div>
                    </td>
                    <td>{{ plan.description }}</td>
                    <td>{{ plan.price | currency:'USD' }}</td>
                    <td>{{ formatDuration(plan.duration_month) }}</td>
                    <td>{{ plan.max_users || 'Ilimitado' }}</td>
                    <td>
                        <p-tag [value]="getMultiBranchText(plan)" [severity]="getMultiBranchSeverity(plan)" />
                    </td>
                    <td>
                        @for (feature of getFeaturesList(plan.features || plan.features_list).slice(0, 2); track feature) {
                            <span class="badge bg-info me-1">{{ feature }}</span>
                        }
                        @if (getFeaturesList(plan.features || plan.features_list).length > 2) {
                            <span class="text-muted">+{{ getFeaturesList(plan.features || plan.features_list).length - 2 }} más</span>
                        }
                    </td>
                    <td>
                        @for (benefit of (plan.commercial_benefits || []).slice(0, 2); track benefit) {
                            <span class="badge bg-primary me-1">{{ benefit }}</span>
                        }
                        @if ((plan.commercial_benefits || []).length > 2) {
                            <span class="text-muted">+{{ (plan.commercial_benefits || []).length - 2 }} más</span>
                        }
                        @if (!(plan.commercial_benefits || []).length) {
                            <span class="text-muted">-</span>
                        }
                    </td>
                    <td>
                        <p-tag [value]="plan.is_active ? 'Activo' : 'Inactivo'" [severity]="plan.is_active ? 'success' : 'danger'" />
                    </td>
                    <td>
                        <p-button
                            icon="pi pi-pencil"
                            [rounded]="true"
                            [outlined]="true"
                            severity="info"
                            styleClass="hover:scale-110 transition-transform"
                            (click)="editPlan(plan)"
                        />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="planDialog" [style]="{ width: '640px' }" header="Detalle del plan" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="name" class="block font-bold mb-3">Nombre técnico</label>
                            <input type="text" pInputText id="name" [(ngModel)]="plan.name" [disabled]="true" fluid />
                            @if (submitted && !plan.name) {
                                <small class="text-red-500">El nombre es obligatorio.</small>
                            }
                        </div>

                        <div>
                            <label for="price" class="block font-bold mb-3">Precio (USD)</label>
                            <p-inputnumber id="price" [(ngModel)]="plan.price" mode="currency" currency="USD" locale="en-US" fluid />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="display_name" class="block font-bold mb-3">Nombre visible</label>
                            <input type="text" pInputText id="display_name" [ngModel]="plan.display_name || plan.name" [disabled]="true" fluid />
                            <small class="text-muted">Se deriva del tipo de plan y no se edita desde este panel.</small>
                        </div>

                        <div>
                            <label for="duration_month" class="block font-bold mb-3">Duración (meses)</label>
                            <p-inputnumber id="duration_month" [(ngModel)]="plan.duration_month" [min]="1" fluid />
                        </div>
                    </div>

                    <div>
                        <label for="description" class="block font-bold mb-3">Descripción</label>
                        <textarea id="description" pTextarea [(ngModel)]="plan.description" rows="3" fluid></textarea>
                    </div>

                    <div>
                        <label for="max_users" class="block font-bold mb-3">Máximo de usuarios activos</label>
                        <p-inputnumber id="max_users" [(ngModel)]="plan.max_users" [min]="1" fluid />
                        <small class="text-muted">Es el límite comercial efectivo del plan. Déjalo vacío para ilimitado.</small>
                    </div>

                    <div>
                        <label class="block font-bold mb-3">Funciones técnicas</label>
                        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Capacidades del sistema controladas por el plan:</p>
                            <div class="grid grid-cols-2 gap-2">
                                @for (feature of getFeaturesList(plan.features || plan.features_list); track feature) {
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-check text-green-500"></i>
                                        <span class="text-sm">{{ feature }}</span>
                                    </div>
                                }
                            </div>
                            <p class="text-xs text-gray-500 mt-2">Las funciones técnicas se configuran automáticamente.</p>
                        </div>
                    </div>

                    <div>
                        <label class="block font-bold mb-3">Beneficios comerciales</label>
                        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/40">
                            <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">Beneficios operativos o comerciales no gobernados por feature flags:</p>
                            @if ((plan.commercial_benefits || []).length) {
                                <div class="flex flex-col gap-2">
                                    @for (benefit of plan.commercial_benefits || []; track benefit) {
                                        <div class="flex items-center gap-2">
                                            <i class="pi pi-briefcase text-blue-500"></i>
                                            <span class="text-sm">{{ benefit }}</span>
                                        </div>
                                    }
                                </div>
                            } @else {
                                <p class="text-sm text-gray-500 m-0">Este plan no tiene beneficios comerciales adicionales definidos.</p>
                            }
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="allows_multiple_branches" [(ngModel)]="plan.allows_multiple_branches" />
                        <label for="allows_multiple_branches">Permite múltiples sucursales</label>
                    </div>

                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="is_active" [(ngModel)]="plan.is_active" />
                        <label for="is_active">Activo</label>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancelar" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Guardar" icon="pi pi-check" (click)="savePlan()" [loading]="saving()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
        <p-toast />
    `,
    providers: [MessageService, ConfirmationService]
})
export class SubscriptionPlans implements OnInit {
    private readonly errorLogger = inject(AdminErrorLogService);

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

    editPlan(plan: SubscriptionPlan) {
        this.plan = { ...plan };
        this.planDialog = true;
    }

    hideDialog() {
        this.planDialog = false;
        this.submitted = false;
    }

    getFeaturesList(features: any): string[] {
        if (!features) return [];
        if (Array.isArray(features)) {
            return features;
        }
        if (typeof features === 'object' && features !== null) {
            try {
                return Object.entries(features)
                    .filter(([_, value]) => value === true)
                    .map(([key]) => this.translateFeature(key));
            } catch {
                return [];
            }
        }
        return [];
    }

    private translateFeature(key: string): string {
        const translations: { [key: string]: string } = {
            appointments: 'Gestión de Citas',
            basic_reports: 'Reportes Básicos',
            inventory: 'Gestión de Inventario',
            advanced_reports: 'Reportes Avanzados',
            multi_location: 'Múltiples Ubicaciones',
            role_permissions: 'Permisos avanzados por rol',
            api_access: 'Acceso a API',
            custom_branding: 'Marca Personalizada',
            priority_support: 'Soporte Prioritario',
            cash_register: 'Caja y Ventas',
            client_history: 'Historial de Clientes'
        };
        return translations[key] || key;
    }

    getMultiBranchText(plan: SubscriptionPlan): string {
        return plan.allows_multiple_branches ? 'Si' : 'No';
    }

    getMultiBranchSeverity(plan: SubscriptionPlan): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        return plan.allows_multiple_branches ? 'success' : 'secondary';
    }

    formatDuration(durationMonths?: number): string {
        if (!durationMonths || durationMonths <= 1) {
            return '1 mes';
        }
        return `${durationMonths} meses`;
    }

    savePlan() {
        this.submitted = true;

        if (this.plan.name?.trim()) {
            this.saving.set(true);

            if (this.plan.id) {
                this.subscriptionService.updatePlan(this.plan.id, {
                    description: this.plan.description,
                    price: this.plan.price,
                    duration_month: this.plan.duration_month,
                    max_users: this.plan.max_users,
                    allows_multiple_branches: this.plan.allows_multiple_branches,
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

    trackByFeature(index: number, value: string): any {
        return value || index;
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
        this.errorLogger.log('SubscriptionPlans', context, error);
    }
}
