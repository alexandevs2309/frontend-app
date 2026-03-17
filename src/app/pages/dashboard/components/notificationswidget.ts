import { Component, OnInit, signal } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { BaseApiService } from '../../../core/services/base-api.service';
import { API_CONFIG } from '../../../core/config/api.config';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [NgClass, DatePipe, ButtonModule, MenuModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <div class="font-semibold text-xl">Notificaciones</div>
            </div>

            @if (notifications().length > 0) {
                <ul class="p-0 m-0 list-none">
                    @for (notification of notifications(); track notification) {
                    <li class="flex items-center py-3 border-b border-surface">
                        <div class="w-12 h-12 flex items-center justify-center rounded-full mr-4 shrink-0"
                             [ngClass]="getNotificationStyle(notification.type)">
                            <i [class]="getNotificationIcon(notification.type)"></i>
                        </div>
                        <div class="flex-1">
                            <span class="text-surface-900 dark:text-surface-0 font-medium block">{{notification.title}}</span>
                            <span class="text-surface-600 dark:text-surface-300 text-sm">{{notification.message}}</span>
                            <div class="text-xs text-muted-color mt-1">{{notification.created_at | date:'short'}}</div>
                        </div>
                    </li>
                    }
                </ul>
            } @else {
                <div class="text-center py-6 text-muted-color">
                    <i class="pi pi-bell-slash text-4xl mb-3"></i>
                    <p>No hay notificaciones</p>
                </div>
            }
        </div>
    `
})
export class NotificationsWidget extends BaseApiService implements OnInit {
    notifications = signal<any[]>([]);

    ngOnInit() {
        this.loadNotifications();
    }

    loadNotifications() {
        this.get<any>(API_CONFIG.ENDPOINTS.NOTIFICATIONS).subscribe({
            next: (data: any) => {
                
                const notifications = Array.isArray(data) ? data : (data.results || []);
                this.notifications.set(notifications.slice(0, 5));
            },
            error: (error: any) => {
                
                
            }
        });
    }

    getNotificationStyle(type: string): string {
        const styles: { [key: string]: string } = {
            'sale': 'bg-blue-100 dark:bg-blue-400/10',
            'appointment': 'bg-emerald-100 dark:bg-emerald-400/10',
            'system': 'bg-slate-100 dark:bg-slate-700',
            'warning': 'bg-amber-100 dark:bg-amber-400/10'
        };
        return styles[type] || 'bg-slate-100 dark:bg-slate-700';
    }

    getNotificationIcon(type: string): string {
        const icons: { [key: string]: string } = {
            'sale': 'pi pi-dollar text-blue-500',
            'appointment': 'pi pi-calendar text-emerald-500',
            'system': 'pi pi-cog text-slate-600 dark:text-slate-400',
            'warning': 'pi pi-exclamation-triangle text-amber-500'
        };
        return icons[type] || 'pi pi-info-circle text-slate-500';
    }
}
