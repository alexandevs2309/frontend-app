import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../core/services/auth/auth.service';
import { TrialService } from '../../core/services/trial.service';
import { LocaleService } from '../../core/services/locale/locale.service';
import { NotificationBadgeService } from '../../core/services/notification/notification-badge.service';
import { Subscription } from 'rxjs';
import { roleKey } from '../../core/utils/role-normalizer';

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
    private refreshIntervalId: ReturnType<typeof setInterval> | null = null;
    notificationService = inject(NotificationBadgeService);

    constructor(
        private authService: AuthService,
        private trialService: TrialService,
        private localeService: LocaleService
    ) {}

    ngOnInit() {
        // Build menu immediately if user exists
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
            this.updateMenuForUser(currentUser.role);
            // Load appointments badge only for roles that can access appointments
            if (this.canLoadAppointments(currentUser.role)) {
                this.notificationService.loadAppointments();
                // Refresh every 5 minutes
                this.refreshIntervalId = setInterval(() => this.notificationService.refresh(), 5 * 60000);
            }
        }

        // Subscribe to user changes
        this.subscription.add(
            this.authService.currentUser$.subscribe(user => {
                if (user) {
                    this.updateMenuForUser(user.role);
                    if (this.canLoadAppointments(user.role)) {
                        this.notificationService.loadAppointments();
                    }
                } else {
                    this.model = [];
                }
            })
        );
        
        // Subscribe to language changes
        this.subscription.add(
            this.localeService.languageChanged$.subscribe(() => {
                const currentUser = this.authService.getCurrentUser();
                if (currentUser) {
                    this.updateMenuForUser(currentUser.role);
                }
            })
        );
    }

    private updateMenuForUser(role: string) {
        const normalizedRole = roleKey(role);
        if (normalizedRole === 'SUPER_ADMIN') {
            this.model = this.getAdminMenu();
        } else {
            this.buildClientMenu();
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        if (this.refreshIntervalId) {
            clearInterval(this.refreshIntervalId);
            this.refreshIntervalId = null;
        }
    }

    buildClientMenu() {
        this.model = this.getClientMenu();
    }

    getAdminMenu(): MenuItem[] {
        return [
            {
                label: this.localeService.t('menu.admin_panel' as any),
                items: [
                    { label: this.localeService.t('menu.dashboard' as any), icon: 'pi pi-fw pi-home', routerLink: ['/admin/dashboard'] },
                    { label: this.localeService.t('menu.tenants' as any), icon: 'pi pi-fw pi-building', routerLink: ['/admin/tenants'] },
                    { label: this.localeService.t('menu.users' as any), icon: 'pi pi-fw pi-users', routerLink: ['/admin/users'] },
                    { label: this.localeService.t('menu.subscription_plans' as any), icon: 'pi pi-fw pi-credit-card', routerLink: ['/admin/plans'] },
                    { label: this.localeService.t('menu.billing' as any), icon: 'pi pi-fw pi-dollar', routerLink: ['/admin/billing'] },
                    { label: this.localeService.t('menu.reports' as any), icon: 'pi pi-fw pi-chart-line', routerLink: ['/admin/reports'] },
                    { label: 'Soporte', icon: 'pi pi-fw pi-headphones', routerLink: ['/admin/support'] },
                    { label: this.localeService.t('menu.system_monitor' as any), icon: 'pi pi-fw pi-eye', routerLink: ['/admin/monitor'] },
                    { label: this.localeService.t('menu.audit_logs' as any), icon: 'pi pi-fw pi-list', routerLink: ['/admin/audit-logs'] },
                    { label: this.localeService.t('menu.system_settings' as any), icon: 'pi pi-fw pi-cog', routerLink: ['/admin/settings'] }
                ]
            }
        ];
    }

    getClientMenu(): MenuItem[] {
        const user = this.authService.getCurrentUser();
        const userRole = user?.role;
        const userRoleKey = roleKey(userRole);
        const badgeCount = this.notificationService.badgeCount();
        
        const menuItems: MenuItem[] = [
            { label: this.localeService.t('menu.dashboard' as any), icon: 'pi pi-fw pi-home', routerLink: ['/client/dashboard'] }
        ];

        if (userRoleKey === 'CLIENT_ADMIN') {
            // CLIENT_ADMIN: All features available
            menuItems.push(
                { label: this.localeService.t('menu.employees' as any), icon: 'pi pi-fw pi-users', routerLink: ['/client/employees'] },
                { label: 'Turnos', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/client/schedules'] },
                { label: this.localeService.t('menu.clients' as any), icon: 'pi pi-fw pi-user-plus', routerLink: ['/client/clients'] },
                { 
                    label: this.localeService.t('menu.appointments' as any), 
                    icon: 'pi pi-fw pi-calendar', 
                    routerLink: ['/client/appointments'],
                    badge: badgeCount > 0 ? badgeCount.toString() : undefined,
                    badgeStyleClass: 'p-badge-danger'
                },
                { label: this.localeService.t('menu.services' as any), icon: 'pi pi-fw pi-wrench', routerLink: ['/client/services'] },
                { label: this.localeService.t('menu.products' as any), icon: 'pi pi-fw pi-box', routerLink: ['/client/products'] },
                { label: this.localeService.t('menu.pos' as any), icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/client/pos'] },
                { label: this.localeService.t('menu.payroll' as any), icon: 'pi pi-fw pi-wallet', routerLink: ['/client/payroll'] },
                { label: this.localeService.t('menu.reports' as any), icon: 'pi pi-fw pi-chart-line', routerLink: ['/client/reports'] },
                { label: this.localeService.t('menu.settings' as any), icon: 'pi pi-fw pi-cog', routerLink: ['/client/settings'] }
            );
        } else if (userRoleKey === 'CLIENT_STAFF' || userRoleKey === 'ESTILISTA') {
            // CLIENT_STAFF / Estilista: only routes allowed by client.routes
            menuItems.push(
                { 
                    label: this.localeService.t('menu.my_appointments' as any), 
                    icon: 'pi pi-fw pi-calendar', 
                    routerLink: ['/client/appointments'],
                    badge: badgeCount > 0 ? badgeCount.toString() : undefined,
                    badgeStyleClass: 'p-badge-danger'
                },
                { label: this.localeService.t('menu.clients' as any), icon: 'pi pi-fw pi-user-plus', routerLink: ['/client/clients'] }
            );
        } else if (userRoleKey === 'CAJERA') {
            menuItems.push(
                { 
                    label: this.localeService.t('menu.appointments' as any), 
                    icon: 'pi pi-fw pi-calendar', 
                    routerLink: ['/client/appointments'],
                    badge: badgeCount > 0 ? badgeCount.toString() : undefined,
                    badgeStyleClass: 'p-badge-danger'
                },
                { label: this.localeService.t('menu.sales' as any), icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/client/pos'] },
                { label: this.localeService.t('menu.clients' as any), icon: 'pi pi-fw pi-user-plus', routerLink: ['/client/clients'] },
                { label: this.localeService.t('menu.services' as any), icon: 'pi pi-fw pi-wrench', routerLink: ['/client/services'] },
                { label: this.localeService.t('menu.products' as any), icon: 'pi pi-fw pi-box', routerLink: ['/client/products'] }
            );
        } else if (userRoleKey === 'MANAGER') {
            menuItems.push(
                { label: this.localeService.t('menu.employees' as any), icon: 'pi pi-fw pi-users', routerLink: ['/client/employees'] },
                { label: 'Turnos', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/client/schedules'] },
                { label: this.localeService.t('menu.clients' as any), icon: 'pi pi-fw pi-user-plus', routerLink: ['/client/clients'] },
                { 
                    label: this.localeService.t('menu.appointments' as any), 
                    icon: 'pi pi-fw pi-calendar', 
                    routerLink: ['/client/appointments'],
                    badge: badgeCount > 0 ? badgeCount.toString() : undefined,
                    badgeStyleClass: 'p-badge-danger'
                },
                { label: this.localeService.t('menu.services' as any), icon: 'pi pi-fw pi-wrench', routerLink: ['/client/services'] },
                { label: this.localeService.t('menu.products' as any), icon: 'pi pi-fw pi-box', routerLink: ['/client/products'] },
                { label: this.localeService.t('menu.pos' as any), icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/client/pos'] },
                { label: this.localeService.t('menu.payroll' as any), icon: 'pi pi-fw pi-wallet', routerLink: ['/client/payroll'] },
                { label: this.localeService.t('menu.reports' as any), icon: 'pi pi-fw pi-chart-line', routerLink: ['/client/reports'] }
            );
        }

        return [
            {
                label: this.localeService.t('menu.barbershop' as any),
                items: menuItems
            }
        ];
    }

    private canLoadAppointments(role?: string): boolean {
        const normalizedRole = roleKey(role);
        return normalizedRole === 'CLIENT_ADMIN' || normalizedRole === 'CLIENT_STAFF' || normalizedRole === 'CAJERA' || normalizedRole === 'MANAGER' || normalizedRole === 'ESTILISTA';
    }
}
