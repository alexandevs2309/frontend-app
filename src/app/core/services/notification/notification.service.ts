import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { switchMap, shareReplay, tap, catchError } from 'rxjs/operators';
import { BaseApiService } from '../base-api.service';
import { API_CONFIG } from '../../config/api.config';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';

export interface InAppNotification {
  id: number;
  type: 'appointment' | 'sale' | 'system' | 'warning';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationResponse {
  count: number;
  results: InAppNotification[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends BaseApiService {
  private messageService = inject(MessageService);
  
  // ✅ Single source of truth con signal
  private notificationsSignal = signal<InAppNotification[]>([]);
  
  // ✅ Computed para contador total no leídas
  public unreadCount = computed(() => 
    this.notificationsSignal().filter(n => !n.is_read).length
  );

  // ✅ Computed para notificaciones de citas
  public appointmentNotifications = computed(() =>
    this.notificationsSignal().filter(n => n.type === 'appointment')
  );

  // ✅ Computed para contador de citas NO LEÍDAS
  public appointmentCount = computed(() =>
    this.appointmentNotifications().filter(n => !n.is_read).length
  );

  // ✅ Computed para notificaciones de ventas
  public saleNotifications = computed(() =>
    this.notificationsSignal().filter(n => n.type === 'sale')
  );

  // ✅ Computed para contador de ventas NO LEÍDAS
  public saleCount = computed(() =>
    this.saleNotifications().filter(n => !n.is_read).length
  );

  // ✅ Observable compartido con polling cada 30s
  public notifications$ = timer(0, 30000).pipe(
    switchMap(() => this.fetchNotifications()),
    tap(response => {
      const previousCount = this.notificationsSignal().length;
      this.notificationsSignal.set(response.results);
      
      // 🔔 Toast solo para notificaciones NUEVAS de citas
      if (previousCount > 0) { // Evitar toast en carga inicial
        const newAppointments = response.results.filter(
          n => n.type === 'appointment' && !n.is_read
        ).slice(0, previousCount === 0 ? 0 : response.results.length - previousCount);
        
        if (newAppointments.length > 0) {
          this.messageService.add({
            severity: 'info',
            summary: '📅 Nueva cita asignada',
            detail: newAppointments[0].message,
            sticky: true,
            closable: true
          });
        }
      }
    }),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  private fetchNotifications(): Observable<NotificationResponse> {
    return this.get<NotificationResponse>('/notifications/').pipe(
      catchError(err => {
        return of({ count: 0, results: [] });
      })
    );
  }

  // ✅ Método para forzar actualización inmediata
  public refresh(): void {
    this.fetchNotifications().subscribe({
      next: (response) => this.notificationsSignal.set(response.results)
    });
  }

  // ✅ Optimistic update al marcar como leída
  markAsRead(notificationId: number): Observable<any> {
    // Actualización optimista
    const current = this.notificationsSignal();
    this.notificationsSignal.set(
      current.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );

    return this.patch(`/notifications/${notificationId}/`, { is_read: true }).pipe(
      catchError(err => {
        // Revertir si falla
        this.refresh();
        return of(err);
      })
    );
  }

  markAllAsRead(): Observable<any> {
    const current = this.notificationsSignal();
    this.notificationsSignal.set(current.map(n => ({ ...n, is_read: true })));

    return this.post('/notifications/mark-all-read/', {}).pipe(
      catchError(err => {
        this.refresh();
        return of(err);
      })
    );
  }

  deleteNotification(notificationId: number): Observable<any> {
    const current = this.notificationsSignal();
    this.notificationsSignal.set(current.filter(n => n.id !== notificationId));

    return this.delete(`/notifications/${notificationId}/`).pipe(
      catchError(err => {
        this.refresh();
        return of(err);
      })
    );
  }
}
