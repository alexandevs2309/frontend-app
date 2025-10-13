import { Injectable, signal } from '@angular/core';
import { Observable, interval, combineLatest, map, catchError, of } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { SettingsService } from './settings.service';
import { SaasMetricsService } from './saas-metrics.service';
import { API_CONFIG } from '../config/api.config';

export interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical';
  services: {
    database: ServiceStatus;
    email: ServiceStatus;
    payments: ServiceStatus;
    paypal: ServiceStatus;
    twilio: ServiceStatus;
    storage: ServiceStatus;
  };
  metrics: {
    response_time: number;
    error_rate: number;
    uptime: number;
  };
  alerts: SystemAlert[];
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  last_check: string;
  response_time?: number;
  error_message?: string;
}

export interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  created_at: string;
  resolved: boolean;
}

export interface RevenueAlert {
  type: 'revenue_drop' | 'payment_failure' | 'churn_spike';
  severity: 'high' | 'medium' | 'low';
  message: string;
  value: number;
  threshold: number;
}

@Injectable({
  providedIn: 'root'
})
export class SystemMonitorService extends BaseApiService {
  
  systemHealth = signal<SystemHealth | null>(null);
  revenueAlerts = signal<RevenueAlert[]>([]);
  isMonitoring = signal(false);

  constructor(
    private settingsService: SettingsService,
    private saasMetricsService: SaasMetricsService
  ) {
    super();
  }

  startMonitoring() {
    this.isMonitoring.set(true);
    
    // Check system health every 5 minutes
    interval(300000).subscribe(() => {
      this.checkSystemHealth();
    });

    // Check revenue alerts every 15 minutes
    interval(900000).subscribe(() => {
      this.checkRevenueAlerts();
    });

    // Initial checks
    this.checkSystemHealth();
    this.checkRevenueAlerts();
  }

  stopMonitoring() {
    this.isMonitoring.set(false);
  }

  checkSystemHealth(): Observable<SystemHealth> {
    // Usar el nuevo endpoint SuperAdmin
    return this.get<SystemHealth>(`${API_CONFIG.ENDPOINTS.SETTINGS.ADMIN_SYSTEM_MONITOR}`).pipe(
      map((health: SystemHealth) => {
        this.systemHealth.set(health);
        return health;
      }),
      catchError(error => {
        console.error('System health check failed:', error);
        const criticalHealth: SystemHealth = {
          overall_status: 'critical',
          services: {
            database: { status: 'down', last_check: new Date().toISOString() },
            email: { status: 'down', last_check: new Date().toISOString() },
            payments: { status: 'down', last_check: new Date().toISOString() },
            paypal: { status: 'down', last_check: new Date().toISOString() },
            twilio: { status: 'down', last_check: new Date().toISOString() },
            storage: { status: 'down', last_check: new Date().toISOString() }
          },
          metrics: { response_time: 0, error_rate: 100, uptime: 0 },
          alerts: [{
            id: 'system-critical',
            type: 'critical',
            title: 'System Critical',
            message: 'Unable to perform system health check',
            created_at: new Date().toISOString(),
            resolved: false
          }]
        };
        this.systemHealth.set(criticalHealth);
        return of(criticalHealth);
      })
    );
  }

  private checkDatabaseHealth(): Observable<ServiceStatus> {
    const startTime = Date.now();
    return this.get(`${API_CONFIG.ENDPOINTS.TENANTS}?limit=1`).pipe(
      map(() => ({
        status: 'up' as const,
        last_check: new Date().toISOString(),
        response_time: Date.now() - startTime
      })),
      catchError(error => of({
        status: 'down' as const,
        last_check: new Date().toISOString(),
        error_message: error.message
      }))
    );
  }

  private checkEmailHealth(): Observable<ServiceStatus> {
    return this.settingsService.testEmailConnection({}).pipe(
      map((response: any) => ({
        status: response.success ? 'up' as const : 'down' as const,
        last_check: new Date().toISOString(),
        response_time: 200,
        error_message: response.success ? undefined : response.message
      })),
      catchError(error => of({
        status: 'down' as const,
        last_check: new Date().toISOString(),
        error_message: error.error?.message || 'Email service unavailable'
      }))
    );
  }

  private checkPaymentHealth(): Observable<ServiceStatus> {
    return this.settingsService.testPaymentConnection({}).pipe(
      map((response: any) => ({
        status: response.success ? 'up' as const : 'down' as const,
        last_check: new Date().toISOString(),
        response_time: 150,
        error_message: response.success ? undefined : response.message
      })),
      catchError(error => of({
        status: 'down' as const,
        last_check: new Date().toISOString(),
        error_message: error.error?.message || 'Payment service unavailable'
      }))
    );
  }

  private checkStorageHealth(): Observable<ServiceStatus> {
    // Mock storage check - in real app would test S3/file uploads
    return of({
      status: 'up' as const,
      last_check: new Date().toISOString(),
      response_time: 100
    });
  }

  checkRevenueAlerts() {
    this.saasMetricsService.getSaasMetrics().subscribe({
      next: (metrics) => {
        const alerts: RevenueAlert[] = [];

        // Check for revenue drop
        if (metrics.growth_rate < -10) {
          alerts.push({
            type: 'revenue_drop',
            severity: 'high',
            message: `Revenue growth is negative: ${metrics.growth_rate}%`,
            value: metrics.growth_rate,
            threshold: -10
          });
        }

        // Check for high churn rate
        if (metrics.churn_rate > 15) {
          alerts.push({
            type: 'churn_spike',
            severity: metrics.churn_rate > 25 ? 'high' : 'medium',
            message: `Churn rate is high: ${metrics.churn_rate.toFixed(1)}%`,
            value: metrics.churn_rate,
            threshold: 15
          });
        }

        // Check for low MRR
        if (metrics.mrr < 1000) {
          alerts.push({
            type: 'revenue_drop',
            severity: 'medium',
            message: `MRR is below target: $${metrics.mrr}`,
            value: metrics.mrr,
            threshold: 1000
          });
        }

        this.revenueAlerts.set(alerts);
      },
      error: (error) => {
        console.error('Revenue alerts check failed:', error);
      }
    });
  }

  private calculateOverallStatus(services: any): 'healthy' | 'warning' | 'critical' {
    const statuses = Object.values(services).map((s: any) => s.status);
    
    if (statuses.includes('down')) return 'critical';
    if (statuses.includes('degraded')) return 'warning';
    return 'healthy';
  }

  private calculateAverageResponseTime(services: any): number {
    const times = Object.values(services)
      .map((s: any) => s.response_time)
      .filter(t => t !== undefined);
    
    return times.length > 0 ? times.reduce((a: any, b: any) => a + b, 0) / times.length : 0;
  }

  private calculateErrorRate(services: any): number {
    const total = Object.keys(services).length;
    const errors = Object.values(services).filter((s: any) => s.status === 'down').length;
    return (errors / total) * 100;
  }

  private generateSystemAlerts(services: any): SystemAlert[] {
    const alerts: SystemAlert[] = [];

    Object.entries(services).forEach(([serviceName, service]: [string, any]) => {
      if (service.status === 'down') {
        alerts.push({
          id: `${serviceName}-down`,
          type: 'critical',
          title: `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Service Down`,
          message: service.error_message || `${serviceName} service is not responding`,
          created_at: service.last_check,
          resolved: false
        });
      } else if (service.status === 'degraded') {
        alerts.push({
          id: `${serviceName}-degraded`,
          type: 'warning',
          title: `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Service Degraded`,
          message: `${serviceName} service is experiencing issues`,
          created_at: service.last_check,
          resolved: false
        });
      }
    });

    return alerts;
  }

  // Manual health checks
  runFullSystemCheck(): Observable<SystemHealth> {
    return this.checkSystemHealth();
  }

  testEmailService(): Observable<ServiceStatus> {
    return this.post(`${API_CONFIG.ENDPOINTS.SETTINGS.ADMIN_TEST_SERVICE}`, { service: 'email' }).pipe(
      map((response: any) => ({
        status: response.success ? 'up' as const : 'down' as const,
        last_check: new Date().toISOString(),
        response_time: 200,
        error_message: response.success ? undefined : response.message
      }))
    );
  }

  testPaymentService(): Observable<ServiceStatus> {
    return this.post(`${API_CONFIG.ENDPOINTS.SETTINGS.ADMIN_TEST_SERVICE}`, { service: 'payments' }).pipe(
      map((response: any) => ({
        status: response.success ? 'up' as const : 'down' as const,
        last_check: new Date().toISOString(),
        response_time: 150,
        error_message: response.success ? undefined : response.message
      }))
    );
  }

  private checkPaypalHealth(): Observable<ServiceStatus> {
    return this.settingsService.testPaypalConnection({}).pipe(
      map((response: any) => ({
        status: response.success ? 'up' as const : 'down' as const,
        last_check: new Date().toISOString(),
        response_time: 180,
        error_message: response.success ? undefined : response.message
      })),
      catchError(error => of({
        status: 'down' as const,
        last_check: new Date().toISOString(),
        error_message: error.error?.message || 'PayPal service unavailable'
      }))
    );
  }

  private checkTwilioHealth(): Observable<ServiceStatus> {
    return this.settingsService.testTwilioConnection({}).pipe(
      map((response: any) => ({
        status: response.success ? 'up' as const : 'down' as const,
        last_check: new Date().toISOString(),
        response_time: 120,
        error_message: response.success ? undefined : response.message
      })),
      catchError(error => of({
        status: 'down' as const,
        last_check: new Date().toISOString(),
        error_message: error.error?.message || 'Twilio service unavailable'
      }))
    );
  }

  testPaypalService(): Observable<ServiceStatus> {
    return this.post(`${API_CONFIG.ENDPOINTS.SETTINGS.ADMIN_TEST_SERVICE}`, { service: 'paypal' }).pipe(
      map((response: any) => ({
        status: response.success ? 'up' as const : 'down' as const,
        last_check: new Date().toISOString(),
        response_time: 180,
        error_message: response.success ? undefined : response.message
      }))
    );
  }

  testTwilioService(): Observable<ServiceStatus> {
    return this.post(`${API_CONFIG.ENDPOINTS.SETTINGS.ADMIN_TEST_SERVICE}`, { service: 'twilio' }).pipe(
      map((response: any) => ({
        status: response.success ? 'up' as const : 'down' as const,
        last_check: new Date().toISOString(),
        response_time: 120,
        error_message: response.success ? undefined : response.message
      }))
    );
  }

  testAllIntegrations(): Observable<{email: boolean, payments: boolean, paypal: boolean, twilio: boolean, storage: boolean}> {
    return combineLatest([
      this.checkEmailHealth(),
      this.checkPaymentHealth(),
      this.checkPaypalHealth(),
      this.checkTwilioHealth(),
      this.checkStorageHealth()
    ]).pipe(
      map(([email, payments, paypal, twilio, storage]) => ({
        email: email.status === 'up',
        payments: payments.status === 'up',
        paypal: paypal.status === 'up',
        twilio: twilio.status === 'up',
        storage: storage.status === 'up'
      }))
    );
  }
}