import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { SystemMonitorService, SystemHealth, RevenueAlert } from '../../core/services/system-monitor.service';

@Component({
    selector: 'app-system-monitor',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, TagModule, TableModule, ToastModule, ProgressBarModule],
    template: `
        <div class="grid grid-cols-12 gap-6">
            <!-- Header -->
            <div class="col-span-12">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <div class="flex justify-between items-center">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">🔍 Monitor del Sistema</h1>
                            <p class="text-gray-600 dark:text-gray-400">Monitoreo en tiempo real de la salud del sistema y alertas críticas</p>
                        </div>
                        <div class="flex gap-2">
                            <p-button [label]="isMonitoring() ? 'Detener Monitor' : 'Iniciar Monitor'" [icon]="isMonitoring() ? 'pi pi-pause' : 'pi pi-play'" [severity]="isMonitoring() ? 'danger' : 'success'" (onClick)="toggleMonitoring()" />
                            <p-button label="Verificar Ahora" icon="pi pi-refresh" (onClick)="runHealthCheck()" [loading]="checking()" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- System Status Overview -->
            <div class="col-span-12 md:col-span-4">
                <p-card>
                    <div class="text-center">
                        <div class="text-6xl mb-4">
                            {{ getStatusIcon(systemHealth()?.overall_status) }}
                        </div>
                        <div class="text-2xl font-bold mb-2" [class]="getStatusColor(systemHealth()?.overall_status)">
                            {{ getStatusText(systemHealth()?.overall_status) }}
                        </div>
                        <div class="text-sm text-gray-600">Estado General del Sistema</div>
                        <div class="mt-4">
                            <div class="text-xs text-gray-500">Uptime</div>
                            <div class="text-lg font-semibold">{{ systemHealth()?.metrics?.uptime || 0 }}%</div>
                        </div>
                    </div>
                </p-card>
            </div>

            <!-- Performance Metrics -->
            <div class="col-span-12 md:col-span-4">
                <p-card header="Métricas de Rendimiento">
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between mb-2">
                                <span class="text-sm">Tiempo de Respuesta</span>
                                <span class="text-sm font-semibold">{{ systemHealth()?.metrics?.response_time || 0 }}ms</span>
                            </div>
                            <p-progressBar [value]="getResponseTimePercentage()" />
                        </div>
                        <div>
                            <div class="flex justify-between mb-2">
                                <span class="text-sm">Tasa de Error</span>
                                <span class="text-sm font-semibold">{{ systemHealth()?.metrics?.error_rate || 0 }}%</span>
                            </div>
                            <p-progressBar [value]="systemHealth()?.metrics?.error_rate || 0" />
                        </div>
                    </div>
                </p-card>
            </div>

            <!-- Quick Actions -->
            <div class="col-span-12 md:col-span-4">
                <p-card header="Acciones Rápidas">
                    <div class="space-y-3">
                        <p-button label="Probar Email" icon="pi pi-envelope" (onClick)="testEmail()" [loading]="testingEmail()" class="w-full" severity="info" />
                        <p-button label="Probar Stripe" icon="pi pi-credit-card" (onClick)="testPayments()" [loading]="testingPayments()" class="w-full" severity="warn" />
                        <p-button label="Probar PayPal" icon="pi pi-paypal" (onClick)="testPaypal()" [loading]="testingPaypal()" class="w-full" severity="help" />
                        <p-button label="Probar SMS" icon="pi pi-mobile" (onClick)="testTwilio()" [loading]="testingTwilio()" class="w-full" severity="secondary" />
                    </div>
                </p-card>
            </div>

            <!-- Services Status -->
            <div class="col-span-12 md:col-span-8">
                <p-card header="Estado de Servicios">
                    <p-table [value]="servicesArray()" [tableStyle]="{ 'min-width': '100%' }">
                        <ng-template #header>
                            <tr>
                                <th>Servicio</th>
                                <th>Estado</th>
                                <th>Tiempo de Respuesta</th>
                                <th>Última Verificación</th>
                                <th>Error</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-service>
                            <tr>
                                <td>
                                    <div class="flex items-center gap-2">
                                        <i [class]="getServiceIcon(service.name)"></i>
                                        {{ getServiceDisplayName(service.name) }}
                                    </div>
                                </td>
                                <td>
                                    <p-tag [value]="service.status" [severity]="getServiceSeverity(service.status)" />
                                </td>
                                <td>{{ service.response_time || 'N/A' }}ms</td>
                                <td>{{ service.last_check | date: 'dd/MM/yyyy HH:mm' }}</td>
                                <td>
                                    <span class="text-red-500 text-sm" *ngIf="service.error_message">
                                        {{ service.error_message }}
                                    </span>
                                    <span class="text-green-500" *ngIf="!service.error_message">OK</span>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </p-card>
            </div>

            <!-- Revenue Alerts -->
            <div class="col-span-12 md:col-span-4">
                <p-card header="Alertas de Revenue">
                    <div class="space-y-3" *ngIf="hasRevenueAlerts(); else noAlerts">
                        <div *ngFor="let alert of alertsList(); trackBy: trackAlert" class="p-3 rounded-lg border-l-4" [class]="getAlertClass(alert.severity)">
                            <div class="font-semibold text-sm">{{ getAlertTitle(alert.type) }}</div>
                            <div class="text-xs text-gray-600 mt-1">{{ alert.message }}</div>
                            <div class="text-xs mt-2"><span class="font-medium">Valor:</span> {{ alert.value }} | <span class="font-medium">Umbral:</span> {{ alert.threshold }}</div>
                        </div>
                    </div>
                    <ng-template #noAlerts>
                        <div class="text-center text-gray-500 py-4">
                            <i class="pi pi-check-circle text-green-500 text-2xl mb-2"></i>
                            <div>No hay alertas de revenue</div>
                        </div>
                    </ng-template>
                </p-card>
            </div>

            <!-- System Alerts -->
            <div class="col-span-12">
                <p-card header="Alertas del Sistema">
                    <p-table [value]="systemHealth()?.alerts || []" [tableStyle]="{ 'min-width': '100%' }">
                        <ng-template #header>
                            <tr>
                                <th>Tipo</th>
                                <th>Título</th>
                                <th>Mensaje</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-alert>
                            <tr>
                                <td>
                                    <p-tag [value]="alert.type" [severity]="getAlertSeverity(alert.type)" />
                                </td>
                                <td class="font-semibold">{{ alert.title }}</td>
                                <td>{{ alert.message }}</td>
                                <td>{{ alert.created_at | date: 'dd/MM/yyyy HH:mm' }}</td>
                                <td>
                                    <p-tag [value]="alert.resolved ? 'Resuelto' : 'Activo'" [severity]="alert.resolved ? 'success' : 'danger'" />
                                </td>
                            </tr>
                        </ng-template>
                        <ng-template #emptymessage>
                            <tr>
                                <td colspan="5" class="text-center text-gray-500 py-4">
                                    <i class="pi pi-check-circle text-green-500 text-2xl mb-2"></i>
                                    <div>No hay alertas del sistema</div>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </p-card>
            </div>
        </div>

        <p-toast />
    `,
    providers: [MessageService]
})
export class SystemMonitor implements OnInit, OnDestroy {
    systemHealth = signal<SystemHealth | null>(null);
    revenueAlerts = signal<RevenueAlert[]>([]);
    isMonitoring = signal(false);
    checking = signal(false);
    testingEmail = signal(false);
    testingPayments = signal(false);
    testingPaypal = signal(false);
    testingTwilio = signal(false);
    testingAll = signal(false);

    // Computed properties for template optimization
    hasRevenueAlerts = computed(() => this.revenueAlerts().length > 0);
    alertsList = computed(() => this.revenueAlerts());
    servicesArray = computed(() => {
        const health = this.systemHealth();
        if (!health?.services) return [];
        return Object.entries(health.services).map(([name, service]) => ({ name, ...service }));
    });

    constructor(
        private systemMonitorService: SystemMonitorService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        // Subscribe to system monitor signals
        this.systemHealth = this.systemMonitorService.systemHealth;
        this.revenueAlerts = this.systemMonitorService.revenueAlerts;
        this.isMonitoring = this.systemMonitorService.isMonitoring;

        // Run initial health check
        this.runHealthCheck();
    }

    ngOnDestroy() {
        this.systemMonitorService.stopMonitoring();
    }

    toggleMonitoring() {
        if (this.isMonitoring()) {
            this.systemMonitorService.stopMonitoring();
            this.messageService.add({
                severity: 'info',
                summary: 'Monitoreo Detenido',
                detail: 'El monitoreo automático ha sido detenido'
            });
        } else {
            this.systemMonitorService.startMonitoring();
            this.messageService.add({
                severity: 'success',
                summary: 'Monitoreo Iniciado',
                detail: 'El monitoreo automático está activo'
            });
        }
    }

    runHealthCheck() {
        this.checking.set(true);
        this.systemMonitorService.runFullSystemCheck().subscribe({
            next: (health) => {
                this.checking.set(false);
                this.messageService.add({
                    severity: health.overall_status === 'healthy' ? 'success' : 'warn',
                    summary: 'Verificación Completa',
                    detail: `Sistema: ${this.getStatusText(health.overall_status)}`
                });
            },
            error: (error) => {
                this.checking.set(false);
                this.showErrorMessage('No se pudo verificar el estado del sistema', error);
            }
        });
    }

    testEmail() {
        this.testingEmail.set(true);
        this.systemMonitorService.testEmailService().subscribe({
            next: (result) => {
                this.testingEmail.set(false);
                this.messageService.add({
                    severity: result.status === 'up' ? 'success' : 'error',
                    summary: result.status === 'up' ? '✅ Email OK' : '❌ Email Error',
                    detail: result.error_message || 'Email funcionando correctamente',
                    life: 5000
                });
            },
            error: (error) => {
                this.testingEmail.set(false);
                this.showErrorMessage('No se pudo probar el servicio de email', error);
            }
        });
    }

    testPayments() {
        this.testingPayments.set(true);
        this.systemMonitorService.testPaymentService().subscribe({
            next: (result) => {
                this.testingPayments.set(false);
                this.messageService.add({
                    severity: result.status === 'up' ? 'success' : 'error',
                    summary: result.status === 'up' ? '✅ Stripe OK' : '❌ Stripe Error',
                    detail: result.error_message || 'Pagos funcionando correctamente',
                    life: 5000
                });
            },
            error: (error) => {
                this.testingPayments.set(false);
                this.showErrorMessage('No se pudo probar el servicio de pagos', error);
            }
        });
    }

    testPaypal() {
        this.testingPaypal.set(true);
        this.systemMonitorService.testPaypalService().subscribe({
            next: (result) => {
                this.testingPaypal.set(false);
                this.messageService.add({
                    severity: result.status === 'up' ? 'success' : 'error',
                    summary: result.status === 'up' ? '✅ PayPal OK' : '❌ PayPal Error',
                    detail: result.error_message || 'PayPal funcionando correctamente',
                    life: 5000
                });
            },
            error: (error) => {
                this.testingPaypal.set(false);
                this.showErrorMessage('No se pudo probar PayPal', error);
            }
        });
    }

    testTwilio() {
        this.testingTwilio.set(true);
        this.systemMonitorService.testTwilioService().subscribe({
            next: (result) => {
                this.testingTwilio.set(false);
                this.messageService.add({
                    severity: result.status === 'up' ? 'success' : 'error',
                    summary: result.status === 'up' ? '✅ SMS OK' : '❌ SMS Error',
                    detail: result.error_message || 'SMS funcionando correctamente',
                    life: 5000
                });
            },
            error: (error) => {
                this.testingTwilio.set(false);
                this.showErrorMessage('No se pudo probar SMS', error);
            }
        });
    }

    testAllServices() {
        this.testingAll.set(true);
        this.systemMonitorService.testAllIntegrations().subscribe({
            next: (results) => this.handleAllServicesSuccess(results),
            error: (error) => this.handleAllServicesError(error)
        });
    }

    private handleAllServicesSuccess(results: any): void {
        this.testingAll.set(false);
        const services = ['email', 'payments', 'paypal', 'twilio', 'storage'];
        const workingCount = services.filter((s) => results[s as keyof typeof results]).length;
        this.messageService.add({
            severity: workingCount === services.length ? 'success' : 'warn',
            summary: 'Prueba Completa',
            detail: `${workingCount}/${services.length} servicios funcionando`
        });
    }

    private handleAllServicesError(error: any): void {
        this.testingAll.set(false);
        this.showErrorMessage('No se pudieron probar los servicios', error);
    }

    getStatusIcon(status?: string): string {
        switch (status) {
            case 'healthy':
                return '✅';
            case 'warning':
                return '⚠️';
            case 'critical':
                return '🚨';
            default:
                return '❓';
        }
    }

    getStatusText(status?: string): string {
        switch (status) {
            case 'healthy':
                return 'Saludable';
            case 'warning':
                return 'Advertencia';
            case 'critical':
                return 'Crítico';
            default:
                return 'Desconocido';
        }
    }

    getStatusColor(status?: string): string {
        switch (status) {
            case 'healthy':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600';
            case 'critical':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    }

    trackAlert(index: number, alert: RevenueAlert): any {
        return alert.type + alert.value;
    }

    getServiceDisplayName(name: string): string {
        const names: { [key: string]: string } = {
            database: 'Base de Datos',
            email: 'Correo Electrónico',
            payments: 'Stripe',
            paypal: 'PayPal',
            twilio: 'SMS (Twilio)',
            storage: 'Almacenamiento'
        };
        return names[name] || name;
    }

    getServiceIcon(name: string): string {
        const icons: { [key: string]: string } = {
            database: 'pi pi-database',
            email: 'pi pi-envelope',
            payments: 'pi pi-credit-card',
            paypal: 'pi pi-paypal',
            twilio: 'pi pi-mobile',
            storage: 'pi pi-cloud'
        };
        return icons[name] || 'pi pi-cog';
    }

    getServiceSeverity(status: string): string {
        switch (status) {
            case 'up':
                return 'success';
            case 'degraded':
                return 'warning';
            case 'down':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    getResponseTimePercentage(): number {
        const responseTime = this.systemHealth()?.metrics?.response_time || 0;
        return Math.min((responseTime / 1000) * 100, 100);
    }

    getAlertClass(severity: string): string {
        switch (severity) {
            case 'high':
                return 'border-red-500 bg-red-50';
            case 'medium':
                return 'border-yellow-500 bg-yellow-50';
            case 'low':
                return 'border-blue-500 bg-blue-50';
            default:
                return 'border-gray-500 bg-gray-50';
        }
    }

    getAlertTitle(type: string): string {
        switch (type) {
            case 'revenue_drop':
                return 'Caída de Ingresos';
            case 'payment_failure':
                return 'Fallo de Pagos';
            case 'churn_spike':
                return 'Aumento de Churn';
            default:
                return 'Alerta';
        }
    }

    getAlertSeverity(type: string): string {
        switch (type) {
            case 'critical':
                return 'danger';
            case 'warning':
                return 'warning';
            case 'info':
                return 'info';
            default:
                return 'secondary';
        }
    }

    private showErrorMessage(message: string, error?: any): void {
        const errorDetail = this.sanitizeErrorMessage(error, message);
        this.logError(message, error);
        this.messageService.add({
            severity: 'error',
            summary: '🚨 Error Crítico',
            detail: errorDetail,
            life: 5000
        });
    }

    private sanitizeErrorMessage(error: any, fallbackMessage: string): string {
        if (!error) return fallbackMessage;
        
        const errorMessage = error?.error?.message || error?.message;
        if (typeof errorMessage === 'string' && errorMessage.trim()) {
            return errorMessage.substring(0, 200);
        }
        
        return fallbackMessage;
    }

    private logError(context: string, error: any): void {
        const errorInfo = {
            context,
            timestamp: new Date().toISOString(),
            error: error?.message || 'Unknown error',
            component: 'SystemMonitor'
        };
        // Replace console.error with structured logging
        console.warn('[SystemMonitor Error]', errorInfo);
    }
}
