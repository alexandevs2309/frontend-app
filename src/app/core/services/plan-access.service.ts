import { Injectable } from '@angular/core';

interface TenantPlanLike {
  name?: string;
  display_name?: string;
  max_users?: number;
  max_employees?: number;
  features?: Record<string, boolean> | null;
}

interface TenantLike {
  id?: number;
  name?: string;
  subscription_plan?: TenantPlanLike | null;
}

export interface PlanLimitStatus {
  reached: boolean;
  current: number;
  limit: number;
  unlimited: boolean;
  planName: string;
}

export interface UpgradeRecommendation {
  nextPlanName: string;
  reason: string;
  detail: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanAccessService {
  getStoredTenant(): TenantLike | null {
    const raw = localStorage.getItem('tenant');
    if (!raw) return null;

    try {
      return JSON.parse(raw) as TenantLike;
    } catch {
      return null;
    }
  }

  getStoredPlan(): TenantPlanLike | null {
    return this.getStoredTenant()?.subscription_plan || null;
  }

  getPlanName(): string {
    const plan = this.getStoredPlan();
    return String(plan?.display_name || plan?.name || 'tu plan actual');
  }

  hasFeature(featureName: string): boolean {
    const features = this.getStoredPlan()?.features;
    return !!features && !!features[featureName];
  }

  getUserLimitStatus(currentUsers: number): PlanLimitStatus {
    const plan = this.getStoredPlan();
    const limit = Number(plan?.max_users || 0);
    return this.buildLimitStatus(currentUsers, limit);
  }

  getEmployeeLimitStatus(currentEmployees: number): PlanLimitStatus {
    const plan = this.getStoredPlan();
    const limit = Number(plan?.max_employees || 0);
    return this.buildLimitStatus(currentEmployees, limit);
  }

  getUserLimitMessage(status: PlanLimitStatus): string {
    return `Has alcanzado el límite de usuarios de ${status.planName} (${status.current}/${status.limit}). Actualiza tu plan para seguir agregando usuarios.`;
  }

  getEmployeeLimitMessage(status: PlanLimitStatus): string {
    return `Has alcanzado el límite de empleados de ${status.planName} (${status.current}/${status.limit}). Actualiza tu plan para seguir agregando personal.`;
  }

  getUpgradeRecommendation(limitType: 'users' | 'employees'): UpgradeRecommendation | null {
    const currentPlan = String(this.getStoredPlan()?.name || '').toLowerCase();

    if (currentPlan === 'basic') {
      return {
        nextPlanName: 'Business',
        reason: limitType === 'employees'
          ? 'Necesitas más capacidad para seguir sumando personal.'
          : 'Necesitas más capacidad para seguir sumando usuarios internos.',
        detail: 'Business te lleva a 25 empleados y 50 usuarios, además de multi-sucursal, inventario y reportes avanzados.'
      };
    }

    if (currentPlan === 'standard') {
      return {
        nextPlanName: 'Premium',
        reason: limitType === 'employees'
          ? 'Tu operación ya pide una capacidad más alta sin topes fijos.'
          : 'Tu operación ya pide más usuarios y una capa más premium.',
        detail: 'Premium te lleva a empleados y usuarios ilimitados, además de branding, acceso a API y permisos avanzados por rol.'
      };
    }

    return null;
  }

  private buildLimitStatus(current: number, limit: number): PlanLimitStatus {
    const unlimited = limit === 0;
    return {
      reached: !unlimited && current >= limit,
      current,
      limit,
      unlimited,
      planName: this.getPlanName()
    };
  }
}
