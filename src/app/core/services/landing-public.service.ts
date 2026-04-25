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
  isPublic: boolean;
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
        displayName: 'Esencial',
        price: 29.99,
        description: 'Para barberias pequenas que necesitan ordenar citas, cobros y seguimiento de clientes sin complicarse',
        maxEmployees: 8,
        popular: false,
        isPublic: true,
        highlightFeatures: [
          'Hasta 8 empleados',
          '1 sucursal'
        ],
        technicalFeatures: [
          'Agenda de citas organizada',
          'Caja y ventas en un solo lugar',
          'Historial completo de clientes',
          'Reportes basicos del negocio',
          '1 sucursal'
        ],
        commercialBenefits: [
          'Ideal para empezar a operar con orden',
          'Sin limite de tiempo y listo para uso diario'
        ]
      },
      {
        id: 'standard',
        name: 'standard',
        displayName: 'Crecimiento',
        price: 69.99,
        description: 'El plan recomendado para negocios en crecimiento que necesitan mas control, visibilidad y operacion multi-sucursal',
        maxEmployees: 25,
        popular: true,
        isPublic: true,
        highlightFeatures: [
          'Hasta 25 empleados',
          'Varias sucursales'
        ],
        technicalFeatures: [
          'Todo lo de Esencial',
          'Control de inventario en tiempo real',
          'Reportes avanzados para tomar decisiones',
          'Gestion de multiples sucursales'
        ],
        commercialBenefits: [
          'La mejor relacion valor-precio para crecer',
          'Mas control operativo para equipos y sucursales'
        ]
      },
      {
        id: 'premium',
        name: 'premium',
        displayName: 'Escala',
        price: 129.99,
        description: 'Para operaciones grandes que necesitan crecer sin topes fijos y reforzar su marca',
        maxEmployees: 0,
        popular: false,
        isPublic: true,
        highlightFeatures: [
          'Empleados ilimitados',
          'Logo personalizado'
        ],
        technicalFeatures: [
          'Todo lo de Crecimiento',
          'Empleados ilimitados',
          'Usuarios ilimitados',
          'Logo personalizado para tu negocio'
        ],
        commercialBenefits: [
          'Atencion prioritaria',
          'Acompanamiento comercial',
          'Escala sin limite de empleados ni usuarios'
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
      popular: plan.name === 'standard',
      isPublic: plan.is_public !== false
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
