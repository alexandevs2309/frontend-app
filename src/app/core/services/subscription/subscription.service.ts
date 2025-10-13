import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { API_CONFIG } from '../../config/api.config';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_month: number;
  max_employees: number;
  max_users: number;
  features: any;
  is_active: boolean;
}

export interface OnboardingRequest {
  fullName: string;
  email: string;
  businessName: string;
  planType: string;
  phone?: string;
  address?: string;
  country?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService extends BaseApiService {

  // Plans (SuperAdmin)
  getPlans(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.PLANS, params);
  }

  getPlan(id: number): Observable<SubscriptionPlan> {
    return this.get(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.PLANS}${id}/`);
  }

  createPlan(plan: Partial<SubscriptionPlan>): Observable<SubscriptionPlan> {
    return this.post(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.PLANS, plan);
  }

  updatePlan(id: number, plan: Partial<SubscriptionPlan>): Observable<SubscriptionPlan> {
    return this.put(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.PLANS}${id}/`, plan);
  }

  deletePlan(id: number): Observable<any> {
    return this.delete(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.PLANS}${id}/`);
  }

  deactivatePlan(id: number): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.PLANS}${id}/deactivate/`, {});
  }

  // User Subscriptions
  getUserSubscriptions(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.USER_SUBSCRIPTIONS, params);
  }

  getUserSubscription(id: number): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.USER_SUBSCRIPTIONS}${id}/`);
  }

  createUserSubscription(subscription: any): Observable<any> {
    return this.post(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.USER_SUBSCRIPTIONS, subscription);
  }

  cancelSubscription(id: number): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.USER_SUBSCRIPTIONS}${id}/cancel/`, {});
  }

  getCurrentSubscription(): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.USER_SUBSCRIPTIONS}current/`);
  }

  // My Subscription Info
  getMyActiveSubscription(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.MY_ACTIVE);
  }

  getMyEntitlements(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.MY_ENTITLEMENTS);
  }

  // Onboarding ⭐ Feature clave
  onboardTenant(data: OnboardingRequest): Observable<any> {
    return this.post(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.ONBOARD, data);
  }

  registerWithPlan(data: any): Observable<any> {
    return this.post(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.REGISTER, data);
  }

  // Audit Logs
  getAuditLogs(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.AUDIT_LOGS, params);
  }

  // Plan specific actions
  changePlan(newPlanId: number): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.USER_SUBSCRIPTIONS}change_plan/`, {
      plan_id: newPlanId
    });
  }

  renewSubscription(subscriptionId: number): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.USER_SUBSCRIPTIONS}${subscriptionId}/renew/`, {});
  }

  pauseSubscription(subscriptionId: number): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.USER_SUBSCRIPTIONS}${subscriptionId}/pause/`, {});
  }

  resumeSubscription(subscriptionId: number): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.USER_SUBSCRIPTIONS}${subscriptionId}/resume/`, {});
  }
}