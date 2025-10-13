import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { API_CONFIG } from '../../config/api.config';

export interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  owner: any;
  contact_email: string;
  contact_phone: string;
  address: string;
  country: string;
  plan_type: string;
  subscription_plan: any;
  subscription_status: string;
  is_active: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class TenantService extends BaseApiService {

  // Tenant CRUD (SuperAdmin)
  getTenants(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.TENANTS, params);
  }

  getTenant(id: number): Observable<Tenant> {
    return this.get(`${API_CONFIG.ENDPOINTS.TENANTS}${id}/`);
  }

  createTenant(tenant: Partial<Tenant>): Observable<Tenant> {
    return this.post(API_CONFIG.ENDPOINTS.TENANTS, tenant);
  }

  updateTenant(id: number, tenant: Partial<Tenant>): Observable<Tenant> {
    return this.put(`${API_CONFIG.ENDPOINTS.TENANTS}${id}/`, tenant);
  }

  deleteTenant(id: number): Observable<any> {
    return this.delete(`${API_CONFIG.ENDPOINTS.TENANTS}${id}/`);
  }

  // Tenant specific actions
  activateTenant(id: number): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.TENANTS}${id}/activate/`, {});
  }

  deactivateTenant(id: number): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.TENANTS}${id}/deactivate/`, {});
  }

  suspendTenant(id: number, reason: string): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.TENANTS}${id}/suspend/`, { reason });
  }

  resumeTenant(id: number): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.TENANTS}${id}/resume/`, {});
  }

  // Tenant stats and analytics (SuperAdmin)
  getTenantStats(id: number): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.TENANTS}${id}/stats/`);
  }

  getTenantUsers(id: number): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.TENANTS}${id}/users/`);
  }

  getTenantSubscription(id: number): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.TENANTS}${id}/subscription/`);
  }

  // Bulk operations (SuperAdmin)
  bulkActivate(tenantIds: number[]): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.TENANTS}bulk_activate/`, { tenant_ids: tenantIds });
  }

  bulkDeactivate(tenantIds: number[]): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.TENANTS}bulk_deactivate/`, { tenant_ids: tenantIds });
  }

  // Current tenant info (for logged user)
  getCurrentTenant(): Observable<Tenant> {
    return this.get(`${API_CONFIG.ENDPOINTS.TENANTS}current/`);
  }

  updateCurrentTenant(data: Partial<Tenant>): Observable<Tenant> {
    return this.patch(`${API_CONFIG.ENDPOINTS.TENANTS}current/`, data);
  }
}