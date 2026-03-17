import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { ActivityLogService, AuditLog } from '../../core/services/activity-log/activity-log.service';
import { DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-audit-logs',
    standalone: true,
    imports: [
        FormsModule, ButtonModule, TableModule, TagModule,
        InputIconModule, IconFieldModule, InputTextModule, SelectModule,
        ToolbarModule, DatePipe, ToastModule
    ],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <div class="flex items-center gap-4">
                    <h4 class="m-0">Logs del Sistema</h4>
                    <p-tag [value]="getLogStats()" severity="info" />
                </div>
            </ng-template>

            <ng-template #end>
                <div class="flex gap-2">
                    <p-select [(ngModel)]="selectedSource" [options]="sourceOptions" placeholder="Filtrar por fuente" (onChange)="filterLogs()" />
                    <p-select [(ngModel)]="selectedAction" [options]="actionOptions" placeholder="Filtrar por acción" (onChange)="filterLogs()" />
                    <input type="date" pInputText [(ngModel)]="startDate" placeholder="Fecha inicio" (change)="filterLogs()" />
                    <input type="date" pInputText [(ngModel)]="endDate" placeholder="Fecha fin" (change)="filterLogs()" />
                    <p-button label="Limpiar filtros" icon="pi pi-filter-slash" (click)="clearFilters()" />
                </div>
            </ng-template>
        </p-toolbar>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div class="text-sm text-gray-500">Total Logs</div>
                <div class="text-2xl font-bold">{{ summary().total }}</div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div class="text-sm text-gray-500">Errores</div>
                <div class="text-2xl font-bold text-red-600">{{ summary().errors }}</div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div class="text-sm text-gray-500">Advertencias</div>
                <div class="text-2xl font-bold text-yellow-600">{{ summary().warnings }}</div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div class="text-sm text-gray-500">Ultimas 24h</div>
                <div class="text-2xl font-bold text-blue-600">{{ summary().last_24h }}</div>
            </div>
        </div>

        <p-table
            [value]="filteredLogs()"
            [rows]="20"
            [paginator]="true"
            [globalFilterFields]="['user.email', 'action', 'source', 'description']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [rowHover]="true"
            [loading]="loading()"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} logs"
            [showCurrentPageReport]="true"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Actividad del Sistema</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter($event)" placeholder="Buscar logs..." />
                    </p-iconfield>
                </div>
            </ng-template>

            <ng-template #header>
                <tr>
                    <th style="min-width:12rem">Usuario</th>
                    <th style="min-width:10rem">Accion</th>
                    <th style="min-width:10rem">Fuente</th>
                    <th style="min-width:20rem">Descripcion</th>
                    <th style="min-width:8rem">Severidad</th>
                    <th style="min-width:12rem">IP</th>
                    <th style="min-width:12rem">Fecha</th>
                </tr>
            </ng-template>

            <ng-template #body let-log>
                <tr [class]="getRowClass(log.action)">
                    <td>{{ log.user?.email || 'Sistema' }}</td>
                    <td>
                        <p-tag [value]="formatActionLabel(log.action)" [severity]="getActionSeverity(log.action)" />
                    </td>
                    <td>
                        <p-tag [value]="formatSourceLabel(log.source)" [severity]="getSourceSeverity(log.source)" />
                    </td>
                    <td>
                        <div class="max-w-md">
                            <div class="truncate">{{ formatDescription(log.description) }}</div>
                            @if (log.extra_data && Object.keys(log.extra_data).length > 0) {
                                <div class="text-xs text-gray-500 mt-1">
                                    @for (key of Object.keys(log.extra_data); track key; let last = $last) {
                                        @if (formatExtraDataValue(log.extra_data[key])) {
                                            <span>{{key}}: {{formatExtraDataValue(log.extra_data[key])}}{{!last ? ', ' : ''}}</span>
                                        }
                                    }
                                </div>
                            }
                        </div>
                    </td>
                    <td>
                        <p-tag [value]="getSeverityLabel(log.action)" [severity]="getActionSeverity(log.action)" />
                    </td>
                    <td>{{ log.ip_address || 'N/A' }}</td>
                    <td>{{ log.timestamp | date:'dd/MM/yyyy HH:mm' }}</td>
                </tr>
            </ng-template>

            <ng-template #emptymessage>
                <tr>
                    <td colspan="7" class="text-center p-4">
                        <div class="flex flex-col items-center gap-3">
                            <i class="pi pi-info-circle text-4xl text-gray-400"></i>
                            <p class="text-gray-500 m-0">No hay logs de auditoria disponibles</p>
                            <p class="text-gray-400 text-sm m-0">Los logs apareceran aqui cuando los usuarios realicen acciones en el sistema</p>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `
})
export class AuditLogs implements OnInit {
    logs = signal<AuditLog[]>([]);
    filteredLogs = signal<AuditLog[]>([]);
    summary = signal<{ total: number; errors: number; warnings: number; last_24h: number }>({
        total: 0,
        errors: 0,
        warnings: 0,
        last_24h: 0
    });
    loading = signal(false);
    selectedAction: string | null = null;
    selectedSource: string | null = null;
    startDate: string | null = null;
    endDate: string | null = null;

    sourceOptions: { label: string; value: string | null }[] = [
        { label: 'Todas las fuentes', value: null },
        { label: 'Sistema', value: 'SYSTEM' },
        { label: 'Integraciones', value: 'INTEGRATIONS' },
        { label: 'Rendimiento', value: 'PERFORMANCE' },
        { label: 'Autenticacion', value: 'AUTH' },
        { label: 'Configuracion', value: 'SETTINGS' },
        { label: 'Roles y permisos', value: 'ROLES' },
        { label: 'Suscripciones', value: 'SUBSCRIPTIONS' },
        { label: 'Usuarios', value: 'USERS' }
    ];

    actionOptions: { label: string; value: string | null }[] = [
        { label: 'Todas las acciones', value: null },
        { label: 'Errores del sistema', value: 'SYSTEM_ERROR' },
        { label: 'Errores de integraciones', value: 'INTEGRATION_ERROR' },
        { label: 'Alertas de rendimiento', value: 'PERFORMANCE_ALERT' },
        { label: 'Errores de Stripe', value: 'STRIPE_ERROR' },
        { label: 'Errores de PayPal', value: 'PAYPAL_ERROR' },
        { label: 'Errores de Twilio', value: 'TWILIO_ERROR' },
        { label: 'Errores de SendGrid', value: 'SENDGRID_ERROR' }
    ];

    constructor(
        private activityLogService: ActivityLogService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadActions();
        this.loadSummary();
        this.loadLogs();
    }

    loadSummary() {
        this.activityLogService.getSummary().subscribe({
            next: (data: any) => {
                this.summary.set({
                    total: Number(data?.total_logs ?? data?.total ?? 0),
                    errors: Number(data?.error_logs ?? data?.errors ?? 0),
                    warnings: Number(data?.warning_logs ?? data?.warnings ?? 0),
                    last_24h: Number(data?.last_24h ?? data?.recent ?? 0)
                });
            },
            error: () => {
                // Keep defaults if summary endpoint is unavailable.
            }
        });
    }

    loadActions() {
        this.activityLogService.getActions().subscribe({
            next: (actions) => {
                this.actionOptions = [
                    { label: 'Todas las acciones', value: null },
                    ...actions.map(action => ({ label: action.label, value: action.value as string }))
                ];
            },
            error: (error) => {
                this.showErrorMessage('Error al cargar las acciones', error);
                this.actionOptions = [{ label: 'Todas las acciones', value: null }];
            }
        });
    }

    loadLogs() {
        this.loading.set(true);
        const params: any = {};

        if (this.selectedAction) {
            params.action = this.selectedAction;
        }

        if (this.startDate) {
            params.date_from = this.startDate;
        }

        if (this.endDate) {
            params.date_to = this.endDate;
        }

        if (this.selectedSource) {
            params.source = this.selectedSource;
        }

        this.activityLogService.getAuditLogs(params).subscribe({
            next: (response) => {
                const logs = (response.results || []).filter(log => this.isValidLog(log));
                this.logs.set(logs);
                this.filteredLogs.set(logs);
                this.loading.set(false);
            },
            error: (error) => {
                this.showErrorMessage('Error al cargar los logs de auditoria', error);
                this.loading.set(false);
                this.logs.set([]);
                this.filteredLogs.set([]);
            }
        });
    }

    filterLogs() {
        // Reload logs with filters applied on the server side
        this.loadLogs();
    }

    clearFilters() {
        this.selectedAction = null;
        this.selectedSource = null;
        this.startDate = null;
        this.endDate = null;
        this.loadLogs();
    }

    onGlobalFilter(event: Event) {
        const value = (event.target as HTMLInputElement).value.toLowerCase();
        if (!value) {
            this.filteredLogs.set(this.logs());
            return;
        }

        const filtered = this.logs().filter(log =>
            log.user?.email?.toLowerCase().includes(value) ||
            log.action?.toLowerCase().includes(value) ||
            log.description?.toLowerCase().includes(value) ||
            log.source?.toLowerCase().includes(value) ||
            (log.extra_data && JSON.stringify(log.extra_data).toLowerCase().includes(value))
        );
        this.filteredLogs.set(filtered);
    }

    getActionSeverity(action: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (action) {
            case 'CREATE': return 'success';
            case 'UPDATE': return 'info';
            case 'DELETE': return 'danger';
            case 'LOGIN': return 'secondary';
            case 'LOGOUT': return 'secondary';
            case 'SYSTEM_ERROR':
            case 'STRIPE_ERROR':
            case 'PAYPAL_ERROR':
            case 'TWILIO_ERROR':
            case 'SENDGRID_ERROR':
            case 'INTEGRATION_ERROR': return 'danger';
            case 'PERFORMANCE_ALERT': return 'warn';
            default: return 'info';
        }
    }

    getSourceSeverity(source: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (source) {
            case 'INTEGRATIONS': return 'warn';
            case 'PERFORMANCE': return 'info';
            case 'SYSTEM': return 'secondary';
            case 'AUTH': return 'success';
            default: return 'secondary';
        }
    }

    getRowClass(action: string): string {
        if (action.includes('ERROR')) {
            return 'bg-red-50 dark:bg-red-900/10';
        }
        if (action === 'PERFORMANCE_ALERT') {
            return 'bg-yellow-50 dark:bg-yellow-900/10';
        }
        return '';
    }

    getSeverityLabel(action: string): string {
        if (action.includes('ERROR')) {
            return 'Error';
        }
        if (action === 'PERFORMANCE_ALERT') {
            return 'Advertencia';
        }
        if (action === 'CREATE') {
            return 'Exito';
        }
        if (action === 'UPDATE') {
            return 'Info';
        }
        if (action === 'DELETE') {
            return 'Critico';
        }
        return 'Info';
    }

    getLogStats(): string {
        const total = this.filteredLogs().length;
        const errors = this.filteredLogs().filter(log => log.action.includes('ERROR')).length;
        const alerts = this.filteredLogs().filter(log => log.action === 'PERFORMANCE_ALERT').length;
        return `${total} logs (${errors} errores, ${alerts} alertas)`;
    }

    Object = Object;

    trackByLog(index: number, log: AuditLog): any {
        return log.id || `${log.timestamp}-${index}`;
    }

    trackByKey(index: number, key: string): string {
        return key;
    }

    formatExtraDataValue(value: any): string {
        if (value === null || value === undefined) {
            return 'null';
        }
        if (typeof value === 'object') {
            try {
                const jsonStr = JSON.stringify(value);
                // Don't show empty objects
                if (jsonStr === '{}' || jsonStr === '[]') {
                    return '';
                }
                return jsonStr;
            } catch (error) {
                return '[Complex Object]';
            }
        }
        return String(value);
    }

    isValidLog(log: any): boolean {
        // Filter out meaningless logs
        if (!log.description || log.description.trim() === '') {
            return false;
        }
        
        // Filter out periodic tasks with no real changes
        if (log.description.includes('periodic task') && 
            log.extra_data && 
            JSON.stringify(log.extra_data).includes('{}')) {
            return false;
        }
        
        // Filter out system updates with no meaningful data
        if (log.action === 'UPDATE' && 
            log.source === 'SYSTEM' && 
            log.description.includes('changes: {}')) {
            return false;
        }
        
        return true;
    }

    formatDescription(description: string): string {
        if (!description) return '';
        
        // Fix spacing issues
        return description
            .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
            .replace(/track updated/g, 'track updated ') // Fix specific spacing
            .replace(/changes:\s*\{\}/g, '') // Remove empty changes
            .trim();
    }

    formatActionLabel(action: string): string {
        const labels: Record<string, string> = {
            SYSTEM_ERROR: 'Error de sistema',
            INTEGRATION_ERROR: 'Error de integracion',
            PERFORMANCE_ALERT: 'Alerta de rendimiento',
            STRIPE_ERROR: 'Error de Stripe',
            PAYPAL_ERROR: 'Error de PayPal',
            TWILIO_ERROR: 'Error de Twilio',
            SENDGRID_ERROR: 'Error de SendGrid',
            LOGIN: 'Inicio de sesion',
            LOGOUT: 'Cierre de sesion',
            CREATE: 'Creacion',
            UPDATE: 'Actualizacion',
            DELETE: 'Eliminacion'
        };
        return labels[action] || action;
    }

    formatSourceLabel(source: string): string {
        const labels: Record<string, string> = {
            SYSTEM: 'Sistema',
            INTEGRATIONS: 'Integraciones',
            PERFORMANCE: 'Rendimiento',
            AUTH: 'Autenticacion',
            SETTINGS: 'Configuracion',
            ROLES: 'Roles y permisos',
            SUBSCRIPTIONS: 'Suscripciones',
            USERS: 'Usuarios'
        };
        return labels[source] || source;
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
        const errorMessage = error?.message || error?.error?.message;
        return typeof errorMessage === 'string' ? errorMessage.substring(0, 200) : fallback;
    }

    private logError(context: string, error: any): void {
        const errorInfo = {
            context,
            timestamp: new Date().toISOString(),
            error: error?.message || 'Unknown error',
            component: 'AuditLogs'
        };
        console.error(errorInfo);
    }
}
