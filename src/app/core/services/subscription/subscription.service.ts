import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { API_CONFIG } from '../../config/api.config';

export interface SubscriptionStatus {
  tenant_name: string;
  current_status: string;
  trial_end_date: string;
  access_level: string;
  days_in_grace: number;
  available_plans: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService extends BaseApiService {

  getSubscriptionStatus(): Observable<SubscriptionStatus> {
    return this.get(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.RENEW);
  }

  renewSubscription(planId: number): Observable<any> {
    return this.post(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.RENEW, { plan_id: planId });
  }

  getPlans(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.PLANS);
  }

  updatePlan(planId: number, planData: any): Observable<any> {
    return this.put(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.PLANS}${planId}/`, planData);
  }
}