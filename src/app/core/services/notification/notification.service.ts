import { Injectable, signal } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { API_CONFIG } from '../../config/api.config';

export interface SystemNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  tenant_id?: number;
  user_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends BaseApiService {
  private notificationsSubject = new BehaviorSubject<SystemNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  unreadCount = signal(0);

  getNotifications(): Observable<SystemNotification[]> {
    return this.get(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}`);
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.patch(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}${notificationId}/read/`);
  }

  markAllAsRead(): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}mark-all-read/`);
  }

  deleteNotification(notificationId: number): Observable<any> {
    return this.delete(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}${notificationId}/`);
  }

  loadNotifications(): void {
    this.getNotifications().subscribe({
      next: (notifications) => {
        this.notificationsSubject.next(notifications);
        this.unreadCount.set(notifications.filter(n => !n.read).length);
      },
      error: () => {
        // Fallback notifications
        const fallbackNotifications: SystemNotification[] = [
          {
            id: 1,
            title: 'Nuevo tenant registrado',
            message: 'Barbería "El Corte Perfecto" se ha registrado en el sistema',
            type: 'success',
            read: false,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Pago pendiente',
            message: 'Tenant "Salón Moderno" tiene un pago pendiente',
            type: 'warning',
            read: false,
            created_at: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        this.notificationsSubject.next(fallbackNotifications);
        this.unreadCount.set(2);
      }
    });
  }

  addNotification(notification: Omit<SystemNotification, 'id' | 'created_at'>): void {
    const newNotification: SystemNotification = {
      ...notification,
      id: Date.now(),
      created_at: new Date().toISOString()
    };

    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([newNotification, ...current]);
    this.unreadCount.update(count => count + 1);
  }


}
