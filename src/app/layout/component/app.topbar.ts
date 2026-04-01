import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { AppConfigService } from '../../core/services/app-config.service';
import { NotificationService } from '../../core/services/notification/notification.service';
import { NotificationBadgeService } from '../../core/services/notification/notification-badge.service';
import { LocaleService } from '../../core/services/locale/locale.service';
import { Subscription } from 'rxjs';
import { OnboardingTourService } from '../../shared/onboarding/onboarding-tour.service';
import { environment } from '../../../environments/environment';
import { roleKey } from '../../core/utils/role-normalizer';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, MenuModule, BadgeModule, ConfirmDialogModule],
    providers: [ConfirmationService],
    template: `<div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" [routerLink]="getDashboardRoute()" style="cursor: pointer;">
                <span class="topbar-brand-mark">P</span>
                <div class="topbar-brand-copy">
                    <strong>{{ appConfig.platformName() }}</strong>
                    <small>{{ getWorkspaceLabel() }}</small>
                </div>
            </a>
        </div>

        <button type="button" class="layout-topbar-search" (click)="openCommandBar($event)">
            <i class="pi pi-search"></i>
            <span>Buscar, navegar o ejecutar</span>
            <kbd>Ctrl K</kbd>
        </button>
        <p-menu #quickSearchMenu [model]="quickSearchItems" [popup]="true" [style]="{'width': '320px'}"></p-menu>

        <div class="layout-topbar-actions">
            <button type="button" class="layout-topbar-action p-overlay-badge" (click)="appointmentMenu.toggle($event)">
                <i class="pi pi-calendar"></i>
                @if (appointmentBadgeService.badgeCount() > 0) {
                    <p-badge [value]="appointmentBadgeService.badgeCount().toString()" severity="info"></p-badge>
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
                <button type="button" class="layout-topbar-action" (click)="startOnboardingTour()" title="Recorrido guiado">
                    <i class="pi pi-compass"></i>
                </button>
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <button type="button" class="layout-topbar-action" (click)="languageMenu.toggle($event)" [title]="localeService.getLanguageLabel()">
                    <i class="pi pi-language"></i>
                </button>
                <p-menu #languageMenu [model]="languageMenuItems" [popup]="true"></p-menu>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <button type="button" class="layout-topbar-action layout-topbar-user" (click)="userMenu.toggle($event)" [title]="getUserDisplayName()">
                    <div class="topbar-user-avatar" [class.has-image]="!!getUserAvatarUrl()">
                        @if (getUserAvatarUrl(); as avatarUrl) {
                            <img [src]="avatarUrl" alt="Avatar de usuario" />
                        } @else {
                            <strong>{{ getUserInitials() }}</strong>
                        }
                    </div>
                    <span>{{ localeService.t('topbar.profile') }}</span>
                </button>
                <p-menu #userMenu [model]="userMenuItems" [popup]="true"></p-menu>
            </div>
        </div>
        <p-confirmDialog [closable]="false" [closeOnEscape]="false" [dismissableMask]="false"></p-confirmDialog>
    </div>`,
    styles: [`
        .layout-topbar-user {
            overflow: hidden;
        }

        .topbar-brand-mark {
            width: 2.25rem;
            height: 2.25rem;
            display: grid;
            place-items: center;
            border-radius: 0.9rem;
            background: var(--shell-brand-mark-bg);
            color: var(--shell-brand-mark-color);
            font-size: 0.95rem;
            font-weight: 800;
            letter-spacing: 0.04em;
        }

        .topbar-brand-copy {
            display: flex;
            flex-direction: column;
            line-height: 1.1;
        }

        .topbar-brand-copy strong {
            font-size: 0.98rem;
            color: var(--text-color);
            font-weight: 700;
        }

        .topbar-brand-copy small {
            font-size: 0.72rem;
            color: var(--text-color-secondary);
            letter-spacing: 0.02em;
        }

        .layout-topbar-search {
            min-width: min(38rem, 42vw);
            height: 2.85rem;
            border-radius: 999px;
            border: 1px solid var(--shell-search-border);
            background: var(--shell-search-bg);
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0 1rem;
            color: var(--text-color-secondary);
            box-shadow: var(--shell-search-shadow);
            transition: all 180ms ease;
        }

        .layout-topbar-search:hover {
            border-color: var(--shell-search-border-hover);
            color: var(--text-color);
            transform: translateY(-1px);
        }

        .layout-topbar-search span {
            flex: 1;
            text-align: left;
            font-size: 0.92rem;
        }

        .layout-topbar-search kbd {
            border-radius: 999px;
            border: 1px solid var(--shell-search-kbd-border);
            padding: 0.2rem 0.55rem;
            font-size: 0.72rem;
            background: var(--shell-search-kbd-bg);
            color: var(--text-color-secondary);
        }

        .topbar-user-avatar {
            width: 2rem;
            height: 2rem;
            border-radius: 999px;
            display: grid;
            place-items: center;
            background: linear-gradient(135deg, #4f46e5, #0ea5e9);
            color: #fff;
            font-size: 0.75rem;
            font-weight: 700;
            line-height: 1;
            overflow: hidden;
            flex-shrink: 0;
        }

        .topbar-user-avatar.has-image {
            background: transparent;
        }

        .topbar-user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        @media (max-width: 991px) {
            .layout-topbar-search {
                display: none;
            }
        }
    `]
})
export class AppTopbar implements OnInit, OnDestroy {
    @ViewChild('quickSearchMenu') quickSearchMenu!: Menu;
    @ViewChild('appointmentMenu') appointmentMenu!: Menu;
    @ViewChild('notificationMenu') notificationMenu!: Menu;
    @ViewChild('languageMenu') languageMenu!: Menu;
    
    userMenuItems: MenuItem[] = [];
    quickSearchItems: MenuItem[] = [];
    appointmentMenuItems: MenuItem[] = [];
    notificationMenuItems: MenuItem[] = [];
    languageMenuItems: MenuItem[] = [];
    private subscription = new Subscription();
    private refreshIntervalId: ReturnType<typeof setInterval> | null = null;
    private dueAlertIntervalId: ReturnType<typeof setInterval> | null = null;
    private dueAlertActive = false;

    constructor(
        public layoutService: LayoutService,
        public appConfig: AppConfigService,
        public notificationService: NotificationService,
        public appointmentBadgeService: NotificationBadgeService,
        public localeService: LocaleService,
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        private onboardingTourService: OnboardingTourService,
        private confirmationService: ConfirmationService
    ) {
        this.initUserMenu();
        this.initLanguageMenu();
        this.initQuickSearchMenu();
    }

    ngOnInit() {
        this.appointmentBadgeService.loadAppointments();
        this.buildAppointmentMenu();
        this.checkDueAppointmentAlerts();
        this.refreshIntervalId = setInterval(() => {
            this.appointmentBadgeService.refresh();
            this.buildAppointmentMenu();
            this.checkDueAppointmentAlerts();
        }, 2 * 60000);

        this.dueAlertIntervalId = setInterval(() => {
            this.checkDueAppointmentAlerts();
        }, 30 * 1000);

        this.subscription.add(
            this.notificationService.notifications$.subscribe(() => {
                this.buildAppointmentMenu();
                this.buildNotificationMenu();
            })
        );
        
        this.subscription.add(
            this.localeService.languageChanged$.subscribe(() => {
                this.initUserMenu();
                this.initLanguageMenu();
                this.initQuickSearchMenu();
                this.buildAppointmentMenu();
                this.buildNotificationMenu();
            })
        );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        if (this.refreshIntervalId) {
            clearInterval(this.refreshIntervalId);
            this.refreshIntervalId = null;
        }
        if (this.dueAlertIntervalId) {
            clearInterval(this.dueAlertIntervalId);
            this.dueAlertIntervalId = null;
        }
    }

    getDashboardRoute(): string {
        const user = this.authService.getCurrentUser();
        if (roleKey(user?.role) === 'SUPER_ADMIN') {
            return '/admin/dashboard';
        }
        return '/client/dashboard';
    }

    getWorkspaceLabel(): string {
        const user = this.authService.getCurrentUser();
        return roleKey(user?.role) === 'SUPER_ADMIN' ? 'Control Center' : (user?.tenant_name || 'Workspace');
    }

    initUserMenu() {
        this.userMenuItems = [
            {
                label: 'Mi Cuenta',
                icon: 'pi pi-user',
                command: () => this.goToProfile()
            },
            {
                label: 'Cambiar Contraseña',
                icon: 'pi pi-key',
                command: () => this.goToChangePassword()
            },
            {
                label: 'Ayuda',
                icon: 'pi pi-question-circle',
                command: () => this.goToHelp()
            },
            {
                separator: true
            },
            {
                label: this.localeService.t('topbar.logout'),
                icon: 'pi pi-sign-out',
                command: () => this.logout()
            }
        ];
    }

    initLanguageMenu() {
        const languages: Array<{code: 'es' | 'en' | 'fr' | 'pt' | 'de', key: string}> = [
            { code: 'es', key: 'language.spanish' },
            { code: 'en', key: 'language.english' },
            { code: 'fr', key: 'language.french' },
            { code: 'pt', key: 'language.portuguese' },
            { code: 'de', key: 'language.german' }
        ];

        this.languageMenuItems = languages.map(lang => ({
            label: this.localeService.t(lang.key as any),
            icon: 'pi pi-globe',
            styleClass: this.localeService.getCurrentLanguage() === lang.code ? 'font-bold' : '',
            command: () => this.changeLanguage(lang.code)
        }));
    }

    initQuickSearchMenu() {
        const isSuperAdmin = roleKey(this.authService.getCurrentUser()?.role) === 'SUPER_ADMIN';

        this.quickSearchItems = isSuperAdmin
            ? [
                {
                    label: 'Ir al dashboard admin',
                    icon: 'pi pi-home',
                    command: () => this.router.navigate(['/admin/dashboard'])
                },
                {
                    label: 'Tenants',
                    icon: 'pi pi-building',
                    command: () => this.router.navigate(['/admin/tenants'])
                },
                {
                    label: 'Usuarios',
                    icon: 'pi pi-users',
                    command: () => this.router.navigate(['/admin/users'])
                },
                {
                    label: 'Facturacion',
                    icon: 'pi pi-credit-card',
                    command: () => this.router.navigate(['/admin/billing'])
                },
                {
                    label: 'Soporte',
                    icon: 'pi pi-life-ring',
                    command: () => this.router.navigate(['/admin/support'])
                }
            ]
            : [
                {
                    label: 'Dashboard',
                    icon: 'pi pi-home',
                    command: () => this.router.navigate(['/client/dashboard'])
                },
                {
                    label: 'Agenda',
                    icon: 'pi pi-calendar',
                    command: () => this.router.navigate(['/client/appointments'])
                },
                {
                    label: 'POS',
                    icon: 'pi pi-shopping-cart',
                    command: () => this.router.navigate(['/client/pos'])
                },
                {
                    label: 'Clientes',
                    icon: 'pi pi-users',
                    command: () => this.router.navigate(['/client/clients'])
                },
                {
                    label: 'Reportes',
                    icon: 'pi pi-chart-line',
                    command: () => this.router.navigate(['/client/reports'])
                }
            ];
    }

    changeLanguage(lang: 'es' | 'en' | 'fr' | 'pt' | 'de') {
        this.localeService.setLanguage(lang);
        
        const langKeys: Record<string, string> = {
            es: 'language.changed_to_es',
            en: 'language.changed_to_en',
            fr: 'language.changed_to_fr',
            pt: 'language.changed_to_pt',
            de: 'language.changed_to_de'
        };
        
        this.messageService.add({ 
            severity: 'success', 
            summary: this.localeService.t('language.changed'), 
            detail: this.localeService.t(langKeys[lang] as any)
        });
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    openCommandBar(event: Event) {
        this.quickSearchMenu.toggle(event);
    }

    goToProfile() {
        this.router.navigate(['/client/profile']);
    }

    goToChangePassword() {
        this.router.navigate(['/client/change-password']);
    }

    goToHelp() {
        this.router.navigate(['/client/help']);
    }

    goToAppointments() {
        this.router.navigate(['/client/appointments']);
    }

    goToNotifications() {
        const count = this.notificationService.unreadCount();
        this.messageService.add({ 
            severity: 'info', 
            summary: this.localeService.t('topbar.notifications'), 
            detail: `${count} ${this.localeService.t('topbar.unread_notifications')}` 
        });
    }

    buildAppointmentMenu() {
        const overdue = this.appointmentBadgeService.overdueAppointments();
        const today = this.appointmentBadgeService.todayAppointments();
        const items: MenuItem[] = [];

        if (overdue.length > 0) {
            items.push({
                label: `Vencidas (${overdue.length})`,
                icon: 'pi pi-exclamation-triangle',
                disabled: true
            });
            items.push(...overdue.slice(0, 3).map((apt: any) => this.mapAppointmentToMenuItem(apt, true)));
        }

        if (today.length > 0) {
            if (items.length > 0) {
                items.push({ separator: true });
            }
            items.push({
                label: `Hoy (${today.length})`,
                icon: 'pi pi-calendar',
                disabled: true
            });
            items.push(...today.slice(0, 5).map((apt: any) => this.mapAppointmentToMenuItem(apt, false)));
        }

        if (items.length === 0) {
            items.push({ label: this.localeService.t('topbar.no_appointments'), disabled: true });
        }

        items.push(
            { separator: true },
            { label: this.localeService.t('topbar.view_all'), icon: 'pi pi-calendar', command: () => this.goToAppointments() }
        );

        this.appointmentMenuItems = items;
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
            : [{ label: this.localeService.t('topbar.no_sales'), disabled: true }];
        
        this.notificationMenuItems.push(
            { separator: true },
            { label: this.localeService.t('topbar.mark_all_read'), icon: 'pi pi-check-circle', command: () => this.markAllAsRead() }
        );
    }

    markAllAsRead() {
        this.notificationService.markAllAsRead().subscribe(() => {
            this.messageService.add({ 
                severity: 'success', 
                summary: this.localeService.t('common.success'), 
                detail: this.localeService.t('topbar.mark_all_read') 
            });
        });
    }

    async startOnboardingTour() {
        const started = await this.onboardingTourService.startManualTour();
        if (!started) {
            this.messageService.add({
                severity: 'info',
                summary: 'Tour no disponible',
                detail: 'Este módulo no tiene recorrido guiado por ahora.'
            });
        }
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => {
                this.messageService.add({ 
                    severity: 'success', 
                    summary: this.localeService.t('common.success'), 
                    detail: this.localeService.t('auth.logout_success') 
                });
                this.router.navigate(['/auth/login']);
            },
            error: () => {
                this.authService.clearAuthData();
                this.messageService.add({ 
                    severity: 'success', 
                    summary: this.localeService.t('common.success'), 
                    detail: this.localeService.t('auth.logout_success') 
                });
                this.router.navigate(['/auth/login']);
            }
        });
    }

    getUserAvatarUrl(): string | null {
        const user: any = this.authService.getCurrentUser();
        const rawUrl = user?.avatar_url || user?.profile_image || user?.photo || null;
        if (!rawUrl) return null;
        if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

        const apiOrigin = new URL(environment.apiUrl).origin;
        return rawUrl.startsWith('/') ? `${apiOrigin}${rawUrl}` : `${apiOrigin}/${rawUrl}`;
    }

    getUserDisplayName(): string {
        const user: any = this.authService.getCurrentUser();
        return user?.full_name || user?.email || this.localeService.t('topbar.profile');
    }

    getUserInitials(): string {
        const raw = this.getUserDisplayName();
        if (!raw) return 'U';
        const parts = raw.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
    }

    private mapAppointmentToMenuItem(apt: any, overdue: boolean): MenuItem {
        const time = new Date(apt.date_time).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
        const client = apt.client_name || `Cliente #${apt.client}`;
        const service = apt.service_name || 'Servicio';
        return {
            label: `${time} · ${client} · ${service}`,
            icon: overdue ? 'pi pi-clock' : 'pi pi-user',
            command: () => this.goToAppointments()
        };
    }

    private checkDueAppointmentAlerts(): void {
        if (this.dueAlertActive) return;
        const pending = this.appointmentBadgeService.getPendingDueAlerts();
        if (!pending.length) return;

        const apt = pending[0];
        const time = new Date(apt.date_time).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
        const client = apt.client_name || `Cliente #${apt.client}`;
        const service = apt.service_name || 'Servicio no especificado';

        this.dueAlertActive = true;
        this.playDueAlertSound();

        this.confirmationService.confirm({
            header: 'Cita en curso',
            message: `${time} · ${client} · ${service}\n¿Qué deseas hacer?`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Confirmar',
            rejectLabel: 'Descartar',
            accept: () => {
                this.appointmentBadgeService.dismissDueAlert(apt.id);
                this.dueAlertActive = false;
                this.goToAppointments();
            },
            reject: () => {
                this.appointmentBadgeService.dismissDueAlert(apt.id);
                this.dueAlertActive = false;
            }
        });
    }

    private playDueAlertSound(): void {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(990, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.09, audioContext.currentTime);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.25);
        } catch {
        }
    }
}
