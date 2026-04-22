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
  plan_type?: string;
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
    const tenant = this.getStoredTenant();
    return String(plan?.display_name || plan?.name || tenant?.plan_type || 'tu plan actual');
  }

  hasFeature(featureName: string): boolean {
    const features = this.getStoredPlan()?.features;
    return !!features && !!features[featureName];
  }

  canAccessFeature(featureName: string): boolean {
    const plan = this.getStoredPlan();
    const features = plan?.features;

    if (features && typeof features === 'object' && featureName in features) {
      return !!features[featureName];
    }

    const currentPlan = this.getCurrentPlanKey();
    const featureMatrix: Record<string, string[]> = {
      basic: ['basic_reports', 'cash_register', 'client_history'],
      standard: ['basic_reports', 'cash_register', 'client_history', 'inventory', 'advanced_reports', 'multi_location'],
      premium: ['basic_reports', 'cash_register', 'client_history', 'inventory', 'advanced_reports', 'multi_location', 'custom_branding']
    };

    return (featureMatrix[currentPlan] || []).includes(featureName);
  }

  getUserLimitStatus(currentUsers: number): PlanLimitStatus {
    const plan = this.getStoredPlan();
    const limit = Number(plan?.max_users || 0);
    return this.buildLimitStatus(currentUsers, limit);
  }

  getEmployeeLimitStatus(currentEmployees: number): PlanLimitStatus {
    const plan = this.getStoredPlan();
    const limit = Number(plan?.max_users || 0);
    return this.buildLimitStatus(currentEmployees, limit);
  }

  getUserLimitMessage(status: PlanLimitStatus): string {
    return `Has alcanzado el límite de usuarios de ${status.planName} (${status.current}/${status.limit}). Actualiza tu plan para seguir agregando usuarios.`;
  }

  getEmployeeLimitMessage(status: PlanLimitStatus): string {
    return `Has alcanzado el límite de usuarios activos de ${status.planName} (${status.current}/${status.limit}). Actualiza tu plan para seguir agregando personal.`;
  }

  getUpgradeRecommendation(limitType: 'users' | 'employees', contextText?: string): UpgradeRecommendation | null {
    const currentPlan = this.getCurrentPlanKey(contextText);

    if (currentPlan === 'basic') {
      return {
        nextPlanName: 'Crecimiento',
        reason: limitType === 'employees'
          ? 'Necesitas más usuarios activos para seguir sumando personal.'
          : 'Necesitas más capacidad para seguir sumando usuarios internos.',
        detail: 'Crecimiento te lleva a 25 empleados, ademas de inventario, reportes avanzados y operacion en varias sucursales.'
      };
    }

    if (currentPlan === 'standard') {
      return {
        nextPlanName: 'Escala',
        reason: limitType === 'employees'
          ? 'Tu operación ya pide más usuarios activos sin topes fijos para seguir creciendo.'
          : 'Tu operación ya pide más usuarios y una capa más premium.',
        detail: 'Escala te lleva a empleados y usuarios ilimitados, ademas de logo personalizado y atencion prioritaria.'
      };
    }

    return null;
  }

  getFeatureUpgradeRecommendation(featureName: string): UpgradeRecommendation | null {
    const currentPlan = this.getCurrentPlanKey();

    if (featureName === 'inventory' || featureName === 'advanced_reports' || featureName === 'multi_location') {
      if (currentPlan === 'basic') {
        return {
          nextPlanName: 'Crecimiento',
          reason: 'Tu plan actual no incluye esta funcionalidad operativa.',
          detail: 'Crecimiento habilita inventario, reportes avanzados y operacion en varias sucursales.'
        };
      }
      if (currentPlan === 'standard') {
        return {
          nextPlanName: 'Escala',
          reason: 'Tu operacion ya esta en Crecimiento y esta mejora pide una capa superior.',
          detail: 'Escala elimina topes de usuarios y empleados y anade branding personalizado.'
        };
      }
    }

    if (featureName === 'custom_branding') {
      return {
        nextPlanName: 'Escala',
        reason: 'La personalizacion de marca esta reservada para el plan Escala.',
        detail: 'Escala habilita logo personalizado y una experiencia mas alineada a tu marca.'
      };
    }

    return null;
  }

  private getCurrentPlanKey(contextText?: string): string {
    const tenant = this.getStoredTenant();
    const rawPlan =
      tenant?.subscription_plan?.name ||
      tenant?.subscription_plan?.display_name ||
      tenant?.plan_type ||
      this.inferPlanFromText(contextText) ||
      '';

    const normalized = String(rawPlan).trim().toLowerCase();

    if (['basic', 'professional', 'profesional', 'esencial'].includes(normalized)) {
      return 'basic';
    }

    if (['standard', 'business', 'crecimiento'].includes(normalized)) {
      return 'standard';
    }

    if (['premium', 'escala'].includes(normalized)) {
      return 'premium';
    }

    return normalized;
  }

  private inferPlanFromText(contextText?: string): string {
    const normalized = String(contextText || '').trim().toLowerCase();

    if (!normalized) {
      return '';
    }

    if (normalized.includes('plan basic') || normalized.includes('professional') || normalized.includes('profesional') || normalized.includes('esencial')) {
      return 'basic';
    }

    if (normalized.includes('plan standard') || normalized.includes('business') || normalized.includes('crecimiento')) {
      return 'standard';
    }

    if (normalized.includes('premium') || normalized.includes('escala')) {
      return 'premium';
    }

    return '';
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
