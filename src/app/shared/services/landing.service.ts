import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SaasMetrics {
  mrr: number;
  total_tenants: number;
  active_tenants: number;
  churn_rate: number;
  growth_rate: number;
  isReal?: boolean;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: string | number;
  duration_month: number;
  is_active: boolean;
  max_employees: number;
  max_users: number;
  allows_multiple_branches: boolean;
  features: any;
  features_list?: string[];
  created_at?: string;
  updated_at?: string;
  isReal?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class LandingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSaasMetrics(): Observable<SaasMetrics> {
    // Datos estáticos para landing público
    const staticMetrics: SaasMetrics = {
      mrr: 45000,
      total_tenants: 180,
      active_tenants: 165,
      churn_rate: 2.5,
      growth_rate: 25,
      isReal: false
    };
    
    // Intentar obtener datos reales, pero usar estáticos como fallback
    return this.http.get<SaasMetrics>(`${this.apiUrl}/settings/admin/metrics/`).pipe(
      map(data => ({ ...data, isReal: true })),
      catchError(() => of(staticMetrics))
    );
  }

  getSubscriptionPlans(): Observable<PaginatedResponse<SubscriptionPlan>> {
    return this.http.get<PaginatedResponse<SubscriptionPlan>>(`${this.apiUrl}/subscriptions/plans/`);
  }
}