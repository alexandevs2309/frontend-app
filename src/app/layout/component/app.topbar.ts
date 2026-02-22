import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { AppConfigService } from '../../core/services/app-config.service';
import { BarbershopSettingsService } from '../../shared/services/barbershop-settings.service';
import { NotificationService } from '../../core/services/notification/notification.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, MenuModule, BadgeModule],
    template: `<div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" [routerLink]="getDashboardRoute()" style="cursor: pointer;">
                @if (barbershopSettings.getLogo()) {
                    <img [src]="barbershopSettings.getLogo()" alt="Logo" class="h-10 w-auto" />
                } @else {
                    <span>{{ appConfig.platformName() }}</span>
                }
            </a>
        </div>

        <div class="layout-topbar-actions">
            <button type="button" class="layout-topbar-action p-overlay-badge" (click)="appointmentMenu.toggle($event)">
                <i class="pi pi-calendar"></i>
                @if (notificationService.appointmentCount() > 0) {
                    <p-badge [value]="notificationService.appointmentCount().toString()" severity="info"></p-badge>
                }
            </button>
            <p-menu #appointmentMenu [model]="appointmentMenuItems" [popup]="true" [style]="{'width': '350px'}"></p-menu>
            
            <button type="button" class="layout-topbar-action p-overlay-badge" (click)="notificationMenu.toggle($event)">
                <i class="pi pi-envelope"></i>
                @if (notificationService.saleCount() > 0) {
                    <p-badge [value]="notificationService.saleCount().toString()" severity="danger"></p-badge>
                }
            </button>
            <p-menu #notificationMenu [model]="notificationMenuItems" [popup]="true" [style]="{'width': '350px'}"></p-menu>

            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <button type="button" class="layout-topbar-action" (click)="userMenu.toggle($event)">
                    <i class="pi pi-user"></i>
                    <span>Profile</span>
                </button>
                <p-menu #userMenu [model]="userMenuItems" [popup]="true"></p-menu>
            </div>
        </div>
    </div>`
})
export class AppTopbar implements OnInit, OnDestroy {
    @ViewChild('appointmentMenu') appointmentMenu!: Menu;
    @ViewChild('notificationMenu') notificationMenu!: Menu;
    
    userMenuItems: MenuItem[] = [];
    appointmentMenuItems: MenuItem[] = [];
    notificationMenuItems: MenuItem[] = [];
    private subscription = new Subscription();

    constructor(
        public layoutService: LayoutService,
        public appConfig: AppConfigService,
        public barbershopSettings: BarbershopSettingsService,
        public notificationService: NotificationService,
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {
        this.initUserMenu();
    }

    ngOnInit() {
        this.subscription.add(
            this.notificationService.notifications$.subscribe(() => {
                console.log('🔔 TopBar - appointmentCount:', this.notificationService.appointmentCount());
                console.log('🔔 TopBar - saleCount:', this.notificationService.saleCount());
                console.log('🔔 TopBar - total unreadCount:', this.notificationService.unreadCount());
                this.buildAppointmentMenu();
                this.buildNotificationMenu();
            })
        );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getDashboardRoute(): string {
        const user = this.authService.getCurrentUser();
        if (user?.role === 'SuperAdmin') {
            return '/admin/dashboard';
        }
        return '/client/dashboard';
    }

    initUserMenu() {
        this.userMenuItems = [
            {
                label: 'Profile',
                icon: 'pi pi-user',
                command: () => this.goToProfile()
            },
            {
                label: 'Settings',
                icon: 'pi pi-cog',
                command: () => this.goToSettings()
            },
            {
                separator: true
            },
            {
                label: 'Logout',
                icon: 'pi pi-sign-out',
                command: () => this.logout()
            }
        ];
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    goToProfile() {
        console.log('Navigate to profile');
    }

    goToSettings() {
        console.log('Navigate to settings');
    }

    goToAppointments() {
        this.router.navigate(['/client/appointments']);
    }

    goToNotifications() {
        this.messageService.add({ 
            severity: 'info', 
            summary: 'Notificaciones', 
            detail: `Tienes ${this.notificationService.unreadCount()} notificaciones sin leer` 
        });
    }

    buildAppointmentMenu() {
        const appointments = this.notificationService.appointmentNotifications();
        
        this.appointmentMenuItems = appointments.length > 0 
            ? appointments.map(notif => ({
                label: notif.title,
                icon: notif.is_read ? 'pi pi-check' : 'pi pi-circle-fill',
                styleClass: notif.is_read ? '' : 'font-bold',
                command: () => {
                    this.notificationService.markAsRead(notif.id).subscribe();
                    this.router.navigate(['/client/appointments']);
                }
            }))
            : [{ label: 'No hay notificaciones de citas', disabled: true }];
        
        this.appointmentMenuItems.push(
            { separator: true },
            { label: 'Ver todas las citas', icon: 'pi pi-calendar', command: () => this.goToAppointments() }
        );
    }

    buildNotificationMenu() {
        const sales = this.notificationService.saleNotifications();
        
        this.notificationMenuItems = sales.length > 0
            ? sales.map(notif => ({
                label: notif.title,
                icon: notif.is_read ? 'pi pi-check' : 'pi pi-circle-fill',
                styleClass: notif.is_read ? '' : 'font-bold',
                command: () => {
                    this.notificationService.markAsRead(notif.id).subscribe();
                }
            }))
            : [{ label: 'No hay notificaciones de ventas', disabled: true }];
        
        this.notificationMenuItems.push(
            { separator: true },
            { label: 'Marcar todas como leídas', icon: 'pi pi-check-circle', command: () => this.markAllAsRead() }
        );
    }

    markAllAsRead() {
        this.notificationService.markAllAsRead().subscribe(() => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Todas las notificaciones marcadas como leídas' });
        });
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Session cerrada correctamente!' });
                this.router.navigate(['/auth/login']);
            },
            error: () => {
                this.authService.clearAuthData();
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Session cerrada correctamente!' });
                this.router.navigate(['/auth/login']);
            }
        });
    }
}
