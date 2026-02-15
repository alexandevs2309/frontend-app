import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../core/services/auth/auth.service';
import { TrialService } from '../../core/services/trial.service';
import { NotificationBadgeService } from '../../core/services/notification/notification-badge.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule, BadgeModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit, OnDestroy {
    model: MenuItem[] = [];
    private subscription = new Subscription();
    notificationService = inject(NotificationBadgeService);

    constructor(
        private authService: AuthService,
        private trialService: TrialService
    ) {}

    ngOnInit() {
        // Build menu immediately if user exists
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
            this.updateMenuForUser(currentUser.role);
            // Load appointments for badge
            if (currentUser.role !== 'SUPER_ADMIN') {
                this.notificationService.loadAppointments();
                // Refresh every 5 minutes
                setInterval(() => this.notificationService.refresh(), 5 * 60000);
            }
        }

        // Subscribe to user changes
        this.subscription.add(
            this.authService.currentUser$.subscribe(user => {
                if (user) {
                    this.updateMenuForUser(user.role);
                    if (user.role !== 'SUPER_ADMIN') {
                        this.notificationService.loadAppointments();
                    }
                } else {
                    this.model = [];
                }
            })
        );
    }



    private updateMenuForUser(role: string) {
        if (role === 'SUPER_ADMIN') {
            this.model = this.getAdminMenu();
        } else {
            this.buildClientMenu();
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    buildClientMenu() {
        this.model = this.getClientMenu();
    }

    getAdminMenu(): MenuItem[] {
        return [
            {
                label: 'Admin Panel',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/admin/dashboard'] },
                    { label: 'Tenants', icon: 'pi pi-fw pi-building', routerLink: ['/admin/tenants'] },
                    { label: 'Users', icon: 'pi pi-fw pi-users', routerLink: ['/admin/users'] },
                    { label: 'Subscription Plans', icon: 'pi pi-fw pi-credit-card', routerLink: ['/admin/plans'] },
                    { label: 'Billing', icon: 'pi pi-fw pi-dollar', routerLink: ['/admin/billing'] },
                    { label: 'Reports', icon: 'pi pi-fw pi-chart-line', routerLink: ['/admin/reports'] },
                    { label: 'System Monitor', icon: 'pi pi-fw pi-eye', routerLink: ['/admin/monitor'] },
                    { label: 'Audit Logs', icon: 'pi pi-fw pi-list', routerLink: ['/admin/audit-logs'] },
                    { label: 'System Settings', icon: 'pi pi-fw pi-cog', routerLink: ['/admin/settings'] }
                ]
            }
        ];
    }

    getClientMenu(): MenuItem[] {
        const user = this.authService.getCurrentUser();
        const userRole = user?.role;
        const badgeCount = this.notificationService.badgeCount();
        
        const menuItems: MenuItem[] = [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/client/dashboard'] }
        ];

        if (userRole === 'CLIENT_ADMIN') {
            // CLIENT_ADMIN: All features available
            menuItems.push(
                { label: 'Empleados', icon: 'pi pi-fw pi-users', routerLink: ['/client/employees'] },
                { label: 'Clientes', icon: 'pi pi-fw pi-user-plus', routerLink: ['/client/clients'] },
                { 
                    label: 'Citas', 
                    icon: 'pi pi-fw pi-calendar', 
                    routerLink: ['/client/appointments'],
                    badge: badgeCount > 0 ? badgeCount.toString() : undefined,
                    badgeStyleClass: 'p-badge-danger'
                },
                { label: 'Servicios', icon: 'pi pi-fw pi-wrench', routerLink: ['/client/services'] },
                { label: 'Productos', icon: 'pi pi-fw pi-box', routerLink: ['/client/products'] },
                { label: 'Punto de Venta', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/client/pos'] },
                { label: 'Nómina', icon: 'pi pi-fw pi-wallet', routerLink: ['/client/payroll'] },
                { label: 'Reportes', icon: 'pi pi-fw pi-chart-line', routerLink: ['/client/reports'] },
                { label: 'Configuración', icon: 'pi pi-fw pi-cog', routerLink: ['/client/settings'] }
            );
        } else if (userRole === 'CLIENT_STAFF') {
            // CLIENT_STAFF: Limited features
            menuItems.push(
                { 
                    label: 'Mis Citas', 
                    icon: 'pi pi-fw pi-calendar', 
                    routerLink: ['/client/appointments'],
                    badge: badgeCount > 0 ? badgeCount.toString() : undefined,
                    badgeStyleClass: 'p-badge-danger'
                },
                { label: 'Clientes', icon: 'pi pi-fw pi-user-plus', routerLink: ['/client/clients'] },
                { label: 'Ventas', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/client/pos'] },
                { label: 'Empleados', icon: 'pi pi-fw pi-users', routerLink: ['/client/employees'] },
                { label: 'Servicios', icon: 'pi pi-fw pi-wrench', routerLink: ['/client/services'] },
                { label: 'Reportes', icon: 'pi pi-fw pi-chart-line', routerLink: ['/client/reports'] }
            );
        }

        return [
            {
                label: 'Barbershop',
                items: menuItems
            }
        ];
    }
}
