import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../core/services/auth/auth.service';
import { PlanAccessService } from '../../core/services/plan-access.service';
import { TrialService } from '../../core/services/trial.service';
import { LocaleService } from '../../core/services/locale/locale.service';
import { NotificationBadgeService } from '../../core/services/notification/notification-badge.service';
import { Subscription } from 'rxjs';
import { roleKey } from '../../core/utils/role-normalizer';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [AppMenuitem, RouterModule, BadgeModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item; let i = $index) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [index]="i" [root]="true"></li>
            }
            @if (item.separator) {
                <li class="menu-separator"></li>
            }
        }
    </ul> `
})
export class AppMenu implements OnInit, OnDestroy {
    model: MenuItem[] = [];
    private subscription = new Subscription();
    private refreshIntervalId: ReturnType<typeof setInterval> | null = null;
    notificationService = inject(NotificationBadgeService);

    constructor(
        private authService: AuthService,
        private planAccessService: PlanAccessService,
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
                label: 'Resumen',
                items: [
                    { label: this.localeService.t('menu.dashboard' as any), icon: 'pi pi-fw pi-home', routerLink: ['/admin/dashboard'] }
                ]
            },
            {
                label: 'Crecimiento',
                items: [
                    { label: this.localeService.t('menu.subscription_plans' as any), icon: 'pi pi-fw pi-credit-card', routerLink: ['/admin/plans'] },
                    { label: this.localeService.t('menu.billing' as any), icon: 'pi pi-fw pi-dollar', routerLink: ['/admin/billing'] },
                    { label: this.localeService.t('menu.reports' as any), icon: 'pi pi-fw pi-chart-line', routerLink: ['/admin/reports'] }
                ]
            },
            {
                label: 'Operaciones',
                items: [
                    { label: this.localeService.t('menu.tenants' as any), icon: 'pi pi-fw pi-building', routerLink: ['/admin/tenants'] },
                    { label: this.localeService.t('menu.users' as any), icon: 'pi pi-fw pi-users', routerLink: ['/admin/users'] },
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
            menuItems.push(
                { label: this.localeService.t('menu.employees' as any), icon: 'pi pi-fw pi-users', routerLink: ['/client/employees'] },
                { label: 'Turnos', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/client/schedules'] },
                { label: this.localeService.t('menu.services' as any), icon: 'pi pi-fw pi-wrench', routerLink: ['/client/services'] },
                { label: this.localeService.t('menu.products' as any), icon: 'pi pi-fw pi-box', routerLink: ['/client/products'], visible: this.planAccessService.canAccessFeature('inventory') },
                { label: this.localeService.t('menu.clients' as any), icon: 'pi pi-fw pi-user-plus', routerLink: ['/client/clients'] },
                { 
                    label: this.localeService.t('menu.appointments' as any), 
                    icon: 'pi pi-fw pi-calendar', 
                    routerLink: ['/client/appointments'],
                    badge: badgeCount > 0 ? badgeCount.toString() : undefined,
                    badgeStyleClass: 'p-badge-danger'
                },
                { label: this.localeService.t('menu.pos' as any), icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/client/pos'], visible: this.planAccessService.canAccessFeature('cash_register') },
                { label: this.localeService.t('menu.payroll' as any), icon: 'pi pi-fw pi-wallet', routerLink: ['/client/payroll'] },
                { label: this.localeService.t('menu.reports' as any), icon: 'pi pi-fw pi-chart-line', routerLink: ['/client/reports'] },
                { label: this.localeService.t('menu.settings' as any), icon: 'pi pi-fw pi-cog', routerLink: ['/client/settings'] }
            );
        } else if (userRoleKey === 'CLIENT_STAFF' || userRoleKey === 'ESTILISTA') {
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
                { label: this.localeService.t('menu.clients' as any), icon: 'pi pi-fw pi-user-plus', routerLink: ['/client/clients'] },
                { label: this.localeService.t('menu.services' as any), icon: 'pi pi-fw pi-wrench', routerLink: ['/client/services'] },
                { label: this.localeService.t('menu.products' as any), icon: 'pi pi-fw pi-box', routerLink: ['/client/products'], visible: this.planAccessService.canAccessFeature('inventory') },
                { 
                    label: this.localeService.t('menu.appointments' as any), 
                    icon: 'pi pi-fw pi-calendar', 
                    routerLink: ['/client/appointments'],
                    badge: badgeCount > 0 ? badgeCount.toString() : undefined,
                    badgeStyleClass: 'p-badge-danger'
                },
                { label: this.localeService.t('menu.sales' as any), icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/client/pos'], visible: this.planAccessService.canAccessFeature('cash_register') }
            );
        } else if (userRoleKey === 'MANAGER') {
            menuItems.push(
                { label: this.localeService.t('menu.employees' as any), icon: 'pi pi-fw pi-users', routerLink: ['/client/employees'] },
                { label: 'Turnos', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/client/schedules'] },
                { label: this.localeService.t('menu.services' as any), icon: 'pi pi-fw pi-wrench', routerLink: ['/client/services'] },
                { label: this.localeService.t('menu.products' as any), icon: 'pi pi-fw pi-box', routerLink: ['/client/products'], visible: this.planAccessService.canAccessFeature('inventory') },
                { label: this.localeService.t('menu.clients' as any), icon: 'pi pi-fw pi-user-plus', routerLink: ['/client/clients'] },
                { 
                    label: this.localeService.t('menu.appointments' as any), 
                    icon: 'pi pi-fw pi-calendar', 
                    routerLink: ['/client/appointments'],
                    badge: badgeCount > 0 ? badgeCount.toString() : undefined,
                    badgeStyleClass: 'p-badge-danger'
                },
                { label: this.localeService.t('menu.pos' as any), icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/client/pos'], visible: this.planAccessService.canAccessFeature('cash_register') },
                { label: this.localeService.t('menu.payroll' as any), icon: 'pi pi-fw pi-wallet', routerLink: ['/client/payroll'] },
                { label: this.localeService.t('menu.reports' as any), icon: 'pi pi-fw pi-chart-line', routerLink: ['/client/reports'] }
            );
        } else if (userRoleKey === 'UTILITY') {
            menuItems.push(
                { label: this.localeService.t('menu.profile' as any), icon: 'pi pi-fw pi-user', routerLink: ['/client/profile'] },
                { label: this.localeService.t('menu.change_password' as any), icon: 'pi pi-fw pi-key', routerLink: ['/client/change-password'] },
                { label: this.localeService.t('menu.help' as any), icon: 'pi pi-fw pi-question-circle', routerLink: ['/client/help'] }
            );
        }

        const sections: MenuItem[] = [
            {
                label: 'Resumen',
                items: menuItems.filter(item => item.routerLink?.[0] === '/client/dashboard')
            }
        ];

        const operationsItems = menuItems.filter(item =>
            ['/client/appointments', '/client/pos', '/client/schedules'].includes(item.routerLink?.[0] as string)
        );
        if (operationsItems.length > 0) {
            sections.push({ label: 'Operaciones', items: operationsItems });
        }

        const customerItems = menuItems.filter(item =>
            ['/client/clients', '/client/services', '/client/products'].includes(item.routerLink?.[0] as string)
        );
        if (customerItems.length > 0) {
            sections.push({ label: 'Clientes y catalogo', items: customerItems });
        }

        const teamItems = menuItems.filter(item =>
            ['/client/employees', '/client/payroll'].includes(item.routerLink?.[0] as string)
        );
        if (teamItems.length > 0) {
            sections.push({ label: 'Equipo', items: teamItems });
        }

        const businessItems = menuItems.filter(item =>
            ['/client/reports', '/client/settings'].includes(item.routerLink?.[0] as string)
        );
        if (businessItems.length > 0) {
            sections.push({ label: 'Negocio', items: businessItems });
        }

        const accountItems = menuItems.filter(item =>
            ['/client/profile', '/client/change-password', '/client/help'].includes(item.routerLink?.[0] as string)
        );
        if (accountItems.length > 0) {
            sections.push({ label: 'Cuenta', items: accountItems });
        }

        return sections.filter(section => (section.items?.length || 0) > 0);
    }

    private canLoadAppointments(role?: string): boolean {
        const normalizedRole = roleKey(role);
        return normalizedRole === 'CLIENT_ADMIN' || normalizedRole === 'CLIENT_STAFF' || normalizedRole === 'CAJERA' || normalizedRole === 'MANAGER' || normalizedRole === 'ESTILISTA';
    }
}
