import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { catchError, shareReplay, switchMap, tap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { BaseApiService } from '../base-api.service';
import { LocaleService } from '../locale/locale.service';

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
  private localeService = inject(LocaleService);
  private notificationsSignal = signal<InAppNotification[]>([]);
  private seenNotificationIds = new Set<number>();

  public unreadCount = computed(() =>
    this.notificationsSignal().filter((n) => !n.is_read).length
  );

  public appointmentNotifications = computed(() =>
    this.notificationsSignal().filter((n) => n.type === 'appointment')
  );

  public appointmentCount = computed(() =>
    this.appointmentNotifications().filter((n) => !n.is_read).length
  );

  public saleNotifications = computed(() =>
    this.notificationsSignal().filter((n) => n.type === 'sale')
  );

  public saleCount = computed(() =>
    this.saleNotifications().filter((n) => !n.is_read).length
  );

  public latestNotifications = computed(() =>
    [...this.notificationsSignal()].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  );

  public notifications$ = timer(0, 30000).pipe(
    switchMap(() => this.fetchNotifications()),
    tap((response) => {
      const currentIds = new Set(this.notificationsSignal().map((n) => n.id));
      this.notificationsSignal.set(response.results);

      if (this.seenNotificationIds.size === 0) {
        response.results.forEach((item) => this.seenNotificationIds.add(item.id));
        return;
      }

      const freshNotifications = response.results.filter(
        (item) => !this.seenNotificationIds.has(item.id) && !currentIds.has(item.id)
      );

      freshNotifications.forEach((item) => this.seenNotificationIds.add(item.id));

      const newAppointment = freshNotifications.find((item) => item.type === 'appointment' && !item.is_read);
      if (newAppointment) {
        this.messageService.add({
          severity: 'info',
          summary: 'Nueva cita',
          detail: newAppointment.title || newAppointment.message,
          life: 5000
        });
      }

      const newSale = freshNotifications.find((item) => item.type === 'sale' && !item.is_read);
      if (newSale) {
        this.messageService.add({
          severity: 'success',
          summary: 'Nueva venta',
          detail: newSale.title || newSale.message,
          life: 4500
        });
      }
    }),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  private fetchNotifications(): Observable<NotificationResponse> {
    return this.get<NotificationResponse>('/notifications/').pipe(
      catchError(() => of({ count: 0, results: [] }))
    );
  }

  public refresh(): void {
    this.fetchNotifications().subscribe({
      next: (response) => {
        this.notificationsSignal.set(response.results);
        response.results.forEach((item) => this.seenNotificationIds.add(item.id));
      }
    });
  }

  markAsRead(notificationId: number): Observable<any> {
    const current = this.notificationsSignal();
    this.notificationsSignal.set(
      current.map((n) => n.id === notificationId ? { ...n, is_read: true } : n)
    );

    return this.patch(`/notifications/${notificationId}/`, { is_read: true }).pipe(
      catchError((err) => {
        this.refresh();
        return of(err);
      })
    );
  }

  markAllAsRead(): Observable<any> {
    const current = this.notificationsSignal();
    this.notificationsSignal.set(current.map((n) => ({ ...n, is_read: true })));

    return this.post('/notifications/mark-all-read/', {}).pipe(
      catchError((err) => {
        this.refresh();
        return of(err);
      })
    );
  }

  deleteNotification(notificationId: number): Observable<any> {
    const current = this.notificationsSignal();
    this.notificationsSignal.set(current.filter((n) => n.id !== notificationId));

    return this.delete(`/notifications/${notificationId}/`).pipe(
      catchError((err) => {
        this.refresh();
        return of(err);
      })
    );
  }

  getRelativeTime(value: string): string {
    return this.localeService.formatRelativeTime(value);
  }
}
