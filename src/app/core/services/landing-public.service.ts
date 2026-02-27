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
        displayName: 'Professional',
        price: 29.99,
        description: 'Para pequeñas peluquerías',
        maxEmployees: 8,
        popular: false,
        features: [
          'Hasta 8 empleados',
          'Agenda completa',
          'Reportes básicos',
          'Control de caja',
          'Historial clientes'
        ]
      },
      {
        id: 'standard',
        name: 'standard',
        displayName: 'Business',
        price: 69.99,
        description: 'Para peluquerías en crecimiento',
        maxEmployees: 25,
        popular: true,
        features: [
          'Hasta 25 empleados',
          'Inventario',
          'Reportes avanzados',
          'Multi-sucursal',
          'Permisos por rol'
        ]
      },
      {
        id: 'premium',
        name: 'premium',
        displayName: 'Enterprise',
        price: 129.99,
        description: 'Para cadenas grandes',
        maxEmployees: 0,
        popular: false,
        features: [
          'Empleados ilimitados',
          'API',
          'Soporte prioritario',
          'SLA garantizado',
          'Todas las funciones'
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
