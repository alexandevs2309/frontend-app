import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { API_CONFIG } from '../../config/api.config';

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  is_active: boolean;
  tenant: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService extends BaseApiService {

  getServices(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.SERVICES, params);
  }

  getService(id: number): Observable<Service> {
    return this.get(`${API_CONFIG.ENDPOINTS.SERVICES}${id}/`);
  }

  createService(service: Partial<Service>): Observable<Service> {
    return this.post(API_CONFIG.ENDPOINTS.SERVICES, service);
  }

  updateService(id: number, service: Partial<Service>): Observable<Service> {
    return this.put(`${API_CONFIG.ENDPOINTS.SERVICES}${id}/`, service);
  }

  deleteService(id: number): Observable<any> {
    return this.delete(`${API_CONFIG.ENDPOINTS.SERVICES}${id}/`);
  }

  // Service specific actions
  getActiveServices(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.SERVICES, { is_active: true });
  }

  getServicesByCategory(category: string): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.SERVICES, { category });
  }

  getServiceStats(id: number): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.SERVICES}${id}/stats/`);
  }

  getPopularServices(): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.SERVICES}popular/`);
  }

  searchServices(query: string): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.SERVICES, { search: query });
  }

  bulkUpdatePrices(updates: { id: number; price: number }[]): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.SERVICES}bulk_update_prices/`, { updates });
  }
}