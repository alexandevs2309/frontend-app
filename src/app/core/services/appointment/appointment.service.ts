import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { API_CONFIG } from '../../config/api.config';

export interface Appointment {
  id: number;
  client: any;
  stylist: any;
  service: any;
  date_time: string;
  duration: number;
  status: string;
  notes: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService extends BaseApiService {

  getAppointments(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE, params);
  }

  getAppointment(id: number): Observable<Appointment> {
    return this.get(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}${id}/`);
  }

  createAppointment(appointment: Partial<Appointment>): Observable<Appointment> {
    return this.post(API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE, appointment);
  }

  updateAppointment(id: number, appointment: Partial<Appointment>): Observable<Appointment> {
    return this.put(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}${id}/`, appointment);
  }

  deleteAppointment(id: number): Observable<any> {
    return this.delete(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}${id}/`);
  }

  // Appointment actions
  confirmAppointment(id: number): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}${id}/confirm/`, {});
  }

  cancelAppointment(id: number, reason?: string): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}${id}/cancel/`, { reason });
  }

  completeAppointment(id: number): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}${id}/complete/`, {});
  }

  rescheduleAppointment(id: number, newDateTime: string): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}${id}/reschedule/`, { 
      new_date_time: newDateTime 
    });
  }

  // Calendar views
  getCalendarAppointments(start: string, end: string): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE, { start, end });
  }

  getDayAppointments(date: string): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE, { date });
  }

  // Availability
  checkAvailability(stylistId: number, date: string, duration: number): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}check_availability/`, {
      stylist_id: stylistId,
      date,
      duration
    });
  }

  getAvailableSlots(stylistId: number, date: string): Observable<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}available_slots/`, {
      stylist_id: stylistId,
      date
    });
  }

  // Test endpoint
  testAppointment(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.APPOINTMENTS.TEST);
  }
}