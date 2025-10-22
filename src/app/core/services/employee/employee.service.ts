import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { API_CONFIG } from '../../config/api.config';

export interface Employee {
  id: number;
  user: any;
  tenant: number;
  specialty?: string;
  phone?: string;
  hire_date?: string;
  is_active: boolean;
  commission_rate?: number;
}

export interface Earning {
  id: number;
  employee: number;
  amount: number;
  service_type: string;
  date: string;
  fortnight_period: string;
}

export interface FortnightSummary {
  id: number;
  employee: number;
  period: string;
  total_earnings: number;
  total_services: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService extends BaseApiService {

  // Employee CRUD
  getEmployees(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.EMPLOYEES.BASE, params);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.get(`${API_CONFIG.ENDPOINTS.EMPLOYEES.BASE}${id}/`);
  }

  createEmployee(employee: Partial<Employee>): Observable<Employee> {
    return this.post(API_CONFIG.ENDPOINTS.EMPLOYEES.BASE, employee);
  }

  updateEmployee(id: number, employee: Partial<Employee>): Observable<Employee> {
    return this.put(`${API_CONFIG.ENDPOINTS.EMPLOYEES.BASE}${id}/`, employee);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.delete(`${API_CONFIG.ENDPOINTS.EMPLOYEES.BASE}${id}/`);
  }

  // Schedules
  getSchedules(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.EMPLOYEES.SCHEDULES, params);
  }

  createSchedule(schedule: any): Observable<any> {
    return this.post(API_CONFIG.ENDPOINTS.EMPLOYEES.SCHEDULES, schedule);
  }

  updateSchedule(id: number, schedule: any): Observable<any> {
    return this.put(`${API_CONFIG.ENDPOINTS.EMPLOYEES.SCHEDULES}${id}/`, schedule);
  }

  // Earnings ⭐ Feature estrella
  getEarnings(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.EMPLOYEES.EARNINGS, params);
  }

  createEarning(earning: Partial<Earning>): Observable<Earning> {
    return this.post(API_CONFIG.ENDPOINTS.EMPLOYEES.EARNINGS, earning);
  }

  getMyEarnings(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.EMPLOYEES.MY_EARNINGS);
  }

  getCurrentFortnight(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.EMPLOYEES.CURRENT_FORTNIGHT);
  }

  // Fortnight Summaries
  getFortnightSummaries(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.EMPLOYEES.FORTNIGHT_SUMMARIES, params);
  }

  getFortnightSummary(id: number): Observable<FortnightSummary> {
    return this.get(`${API_CONFIG.ENDPOINTS.EMPLOYEES.FORTNIGHT_SUMMARIES}${id}/`);
  }

  // Employee specific actions
  assignServices(employeeId: number, serviceIds: number[]): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.EMPLOYEES.BASE}${employeeId}/assign_services/`, {
      service_ids: serviceIds
    });
  }

  getEmployeeServices(employeeId: number): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.EMPLOYEES.BASE}${employeeId}/services/`);
  }

  getEmployeeSchedule(employeeId: number): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.EMPLOYEES.BASE}${employeeId}/schedule/`);
  }

  setEmployeeSchedule(employeeId: number, schedules: any[]): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.EMPLOYEES.BASE}${employeeId}/set_schedule/`, {
      schedules
    });
  }

  getEmployeeStats(employeeId: number): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.EMPLOYEES.BASE}${employeeId}/stats/`);
  }
}