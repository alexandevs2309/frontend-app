import { Injectable } from '@angular/core';

export interface PublicPlan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  description: string;
  features: string[];
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
  // Datos estáticos optimizados para landing
  // NO hace HTTP calls - render instantáneo
  
  getPlans(): PublicPlan[] {
    return [
      {
        id: 'basic',
        name: 'basic',
        displayName: 'Basic',
        price: 49.99,
        description: 'Para barberías pequeñas',
        maxEmployees: 5,
        popular: false,
        features: [
          'Hasta 5 empleados',
          'Gestión de citas',
          'Reportes básicos',
          'Soporte por email'
        ]
      },
      {
        id: 'standard',
        name: 'standard',
        displayName: 'Standard',
        price: 69.99,
        description: 'Para barberías en crecimiento',
        maxEmployees: 10,
        popular: true,
        features: [
          'Hasta 10 empleados',
          'Gestión de citas avanzada',
          'Reportes completos',
          'Soporte prioritario',
          'Multi-ubicación'
        ]
      },
      {
        id: 'premium',
        name: 'premium',
        displayName: 'Premium',
        price: 99.99,
        description: 'Para barberías establecidas',
        maxEmployees: 25,
        popular: false,
        features: [
          'Hasta 25 empleados',
          'Todas las funciones',
          'Reportes avanzados',
          'API personalizada',
          'Soporte dedicado 24/7'
        ]
      }
    ];
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
