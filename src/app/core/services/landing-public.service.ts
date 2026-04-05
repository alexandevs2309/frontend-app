import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

export interface PublicPlan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  description: string;
  highlightFeatures: string[];
  technicalFeatures: string[];
  commercialBenefits: string[];
  maxEmployees: number;
  popular: boolean;
}

export interface PublicMetrics {
  mrr: number;
  totalTenants: number;
  activeTenants: number;
  churnRate: number;
  growthRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class LandingPublicService {
  private readonly http = inject(HttpClient);

  getPlans(): Observable<PublicPlan[]> {
    return this.http.get<any[]>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.PUBLIC_PLANS}`).pipe(
      map((plans) => Array.isArray(plans) ? plans.map((plan) => this.normalizePlan(plan)) : this.getFallbackPlans()),
      catchError(() => of(this.getFallbackPlans()))
    );
  }

  private getFallbackPlans(): PublicPlan[] {
    return [
      {
        id: 'basic',
        name: 'basic',
        displayName: 'Professional',
        price: 29.99,
        description: 'Para barberias pequenas que necesitan operar con orden',
        maxEmployees: 8,
        popular: false,
        highlightFeatures: [
          '8 empleados',
          '16 usuarios',
          '1 sucursal'
        ],
        technicalFeatures: [
          'Hasta 8 empleados',
          'Hasta 16 usuarios',
          'Agenda completa',
          'Caja y ventas',
          'Historial de clientes',
          'Reportes basicos',
          '1 sucursal'
        ],
        commercialBenefits: []
      },
      {
        id: 'standard',
        name: 'standard',
        displayName: 'Business',
        price: 69.99,
        description: 'Para negocios en crecimiento con operacion multi-sucursal',
        maxEmployees: 25,
        popular: true,
        highlightFeatures: [
          '25 empleados',
          '50 usuarios',
          'Multi-sucursal'
        ],
        technicalFeatures: [
          'Hasta 25 empleados',
          'Hasta 50 usuarios',
          'Agenda completa',
          'Caja y ventas',
          'Historial de clientes',
          'Inventario',
          'Reportes basicos y avanzados',
          'Multiples sucursales'
        ],
        commercialBenefits: []
      },
      {
        id: 'premium',
        name: 'premium',
        displayName: 'Premium',
        price: 129.99,
        description: 'Para operaciones grandes que necesitan escala sin limites fijos',
        maxEmployees: 0,
        popular: false,
        highlightFeatures: [
          'Empleados ilimitados',
          'Usuarios ilimitados',
          'Logo personalizado'
        ],
        technicalFeatures: [
          'Empleados ilimitados',
          'Usuarios ilimitados',
          'Agenda completa',
          'Control de caja',
          'Historial de clientes',
          'Inventario',
          'Reportes avanzados',
          'Multiples sucursales',
          'Branding basico con logo personalizado',
          'Permisos avanzados por rol',
          'Acceso a API'
        ],
        commercialBenefits: [
          'Atencion prioritaria',
          'Acompanamiento comercial'
        ]
      }
    ];
  }

  private normalizePlan(plan: any): PublicPlan {
    return {
      id: String(plan.id ?? plan.name),
      name: plan.name ?? 'basic',
      displayName: plan.display_name ?? plan.displayName ?? plan.name ?? 'Plan',
      price: Number(plan.price ?? 0),
      description: plan.description ?? '',
      highlightFeatures: Array.isArray(plan.highlight_features) ? plan.highlight_features : [],
      technicalFeatures: Array.isArray(plan.technical_features) ? plan.technical_features : [],
      commercialBenefits: Array.isArray(plan.commercial_benefits) ? plan.commercial_benefits : [],
      maxEmployees: Number(plan.max_employees ?? 0),
      popular: plan.name === 'standard'
    };
  }

  getMetrics(): PublicMetrics {
    return {
      mrr: 45000,
      totalTenants: 180,
      activeTenants: 165,
      churnRate: 2.5,
      growthRate: 25
    };
  }
}
