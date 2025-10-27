import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface TrialStatus {
  plan: string;
  subscription_status: string;
  trial_end_date: string | null;
  trial_days_remaining: number | null;
  is_trial: boolean;
  features: any;
  limits: any;
  usage: any;
}

@Injectable({
  providedIn: 'root'
})
export class TrialService extends BaseApiService {
  private trialStatusSubject = new BehaviorSubject<TrialStatus | null>(null);
  public trialStatus$ = this.trialStatusSubject.asObservable();

  getEntitlements(): Observable<TrialStatus> {
    return this.get<TrialStatus>('/subscriptions/me/entitlements/');
  }

  loadTrialStatus(): void {
    this.getEntitlements().subscribe({
      next: (status) => {
        this.trialStatusSubject.next(status);
      },
      error: (error) => {
        console.warn('Trial status not available, using defaults:', error.status);
        // Establecer status por defecto para desarrollo
        const defaultStatus: TrialStatus = {
          plan: 'trial',
          subscription_status: 'trial',
          trial_end_date: null,
          trial_days_remaining: 30,
          is_trial: true,
          features: {
            employees_management: true,
            appointments_management: true,
            services_management: true,
            pos_system: true,
            inventory_management: true,
            earnings_management: true,
            reports: true
          },
          limits: { max_employees: 10 },
          usage: { employees: 0 }
        };
        this.trialStatusSubject.next(defaultStatus);
      }
    });
  }

  getCurrentTrialStatus(): TrialStatus | null {
    return this.trialStatusSubject.value;
  }

  isTrialActive(): boolean {
    const status = this.getCurrentTrialStatus();
    return !!(status?.is_trial && (status?.trial_days_remaining || 0) > 0);
  }

  isTrialExpired(): boolean {
    const status = this.getCurrentTrialStatus();
    return !!(status?.is_trial && (status?.trial_days_remaining || 0) <= 0);
  }

  getTrialDaysRemaining(): number {
    const status = this.getCurrentTrialStatus();
    return status?.trial_days_remaining || 0;
  }

  shouldShowUpgradePrompt(): boolean {
    const status = this.getCurrentTrialStatus();
    if (!status?.is_trial) return false;
    
    const daysRemaining = status.trial_days_remaining || 0;
    return daysRemaining <= 3; // Mostrar prompt cuando quedan 3 días o menos
  }

  canAccessFeature(featureName: string): boolean {
    const status = this.getCurrentTrialStatus();
    
    // Si no hay status, permitir features básicas para desarrollo
    if (!status) {
      const basicFeatures = [
        'employees_management', 
        'appointments_management', 
        'services_management', 
        'pos_system',
        'inventory_management',
        'earnings_management',
        'reports'
      ];
      return basicFeatures.includes(featureName);
    }
    
    // Si el trial expiró, verificar período de gracia
    if (this.isTrialExpired()) {
      return this.isInGracePeriod() ? ['view_only', 'export_data'].includes(featureName) : false;
    }
    
    // Durante trial activo o suscripción activa, permitir features
    if (status.is_trial || status.subscription_status === 'active') {
      return ['employees_management', 'appointments_management', 'pos_system', 'services_management', 'inventory_management', 'earnings_management', 'reports'].includes(featureName);
    }
    
    return status.features?.[featureName] || false;
  }

  isInGracePeriod(): boolean {
    const status = this.getCurrentTrialStatus();
    if (!status?.trial_end_date || !this.isTrialExpired()) return false;
    
    const trialEndDate = new Date(status.trial_end_date);
    const daysSinceExpiry = Math.floor((Date.now() - trialEndDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceExpiry <= 3;
  }

  isBlocked(): boolean {
    return this.isTrialExpired() && !this.isInGracePeriod();
  }

  hasReachedLimit(limitType: string): boolean {
    const status = this.getCurrentTrialStatus();
    if (!status) return true;
    
    const limit = status.limits?.[limitType];
    const usage = status.usage?.[limitType];
    
    if (limit === 0) return false; // Unlimited
    return usage >= limit;
  }

  getUpgradeUrl(): string {
    return '/subscriptions/upgrade/';
  }

  getAccessMessage(): string {
    if (this.isBlocked()) {
      return 'Your access has been blocked. Please subscribe to continue using the service.';
    }
    if (this.isInGracePeriod()) {
      const status = this.getCurrentTrialStatus();
      const trialEndDate = new Date(status?.trial_end_date || '');
      const daysSinceExpiry = Math.floor((Date.now() - trialEndDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysLeft = 3 - daysSinceExpiry;
      return `Your trial has expired. You have ${daysLeft} day(s) left to subscribe before losing access.`;
    }
    return '';
  }
}