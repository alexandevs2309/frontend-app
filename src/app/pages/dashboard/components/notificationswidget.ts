import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { BaseApiService } from '../../../core/services/base-api.service';
import { API_CONFIG } from '../../../core/config/api.config';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <div class="font-semibold text-xl">Notificaciones</div>
            </div>

            <div *ngIf="notifications().length > 0; else noNotifications">
                <ul class="p-0 m-0 list-none">
                    <li *ngFor="let notification of notifications()" class="flex items-center py-3 border-b border-surface">
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
                </ul>
            </div>
            
            <ng-template #noNotifications>
                <div class="text-center py-6 text-muted-color">
                    <i class="pi pi-bell-slash text-4xl mb-3"></i>
                    <p>No hay notificaciones</p>
                </div>
            </ng-template>
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
            error: (error: any) => console.error('Error loading notifications:', error)
        });
    }

    getNotificationStyle(type: string): string {
        const styles: { [key: string]: string } = {
            'sale': 'bg-blue-100 dark:bg-blue-400/10',
            'appointment': 'bg-green-100 dark:bg-green-400/10',
            'system': 'bg-orange-100 dark:bg-orange-400/10',
            'warning': 'bg-red-100 dark:bg-red-400/10'
        };
        return styles[type] || 'bg-gray-100 dark:bg-gray-400/10';
    }

    getNotificationIcon(type: string): string {
        const icons: { [key: string]: string } = {
            'sale': 'pi pi-dollar text-blue-500',
            'appointment': 'pi pi-calendar text-green-500',
            'system': 'pi pi-cog text-orange-500',
            'warning': 'pi pi-exclamation-triangle text-red-500'
        };
        return icons[type] || 'pi pi-info-circle text-gray-500';
    }
}
