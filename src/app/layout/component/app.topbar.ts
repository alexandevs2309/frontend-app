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
import { LocaleService } from '../../core/services/locale/locale.service';
import { Subscription } from 'rxjs';
import { OnboardingTourService } from '../../shared/onboarding/onboarding-tour.service';

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
                <button type="button" class="layout-topbar-action" (click)="userMenu.toggle($event)">
                    <i class="pi pi-user"></i>
                    <span>{{ localeService.t('topbar.profile') }}</span>
                </button>
                <p-menu #userMenu [model]="userMenuItems" [popup]="true"></p-menu>
            </div>
        </div>
    </div>`
})
export class AppTopbar implements OnInit, OnDestroy {
    @ViewChild('appointmentMenu') appointmentMenu!: Menu;
    @ViewChild('notificationMenu') notificationMenu!: Menu;
    @ViewChild('languageMenu') languageMenu!: Menu;
    
    userMenuItems: MenuItem[] = [];
    appointmentMenuItems: MenuItem[] = [];
    notificationMenuItems: MenuItem[] = [];
    languageMenuItems: MenuItem[] = [];
    private subscription = new Subscription();

    constructor(
        public layoutService: LayoutService,
        public appConfig: AppConfigService,
        public barbershopSettings: BarbershopSettingsService,
        public notificationService: NotificationService,
        public localeService: LocaleService,
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        private onboardingTourService: OnboardingTourService
    ) {
        this.initUserMenu();
        this.initLanguageMenu();
    }

    ngOnInit() {
        this.subscription.add(
            this.notificationService.notifications$.subscribe(() => {
                this.buildAppointmentMenu();
                this.buildNotificationMenu();
            })
        );
        
        // Suscribirse a cambios de idioma
        this.subscription.add(
            this.localeService.languageChanged$.subscribe(() => {
                this.initUserMenu();
                this.initLanguageMenu();
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
        if (user?.role === 'SUPER_ADMIN' || user?.role === 'SuperAdmin') {
            return '/admin/dashboard';
        }
        return '/client/dashboard';
    }

    initUserMenu() {
        this.userMenuItems = [
            {
                label: this.localeService.t('topbar.profile'),
                icon: 'pi pi-user',
                command: () => this.goToProfile()
            },
            {
                label: this.localeService.t('topbar.settings'),
                icon: 'pi pi-cog',
                command: () => this.goToSettings()
            },
            {
                label: 'Recorrido guiado',
                icon: 'pi pi-compass',
                command: () => this.startOnboardingTour()
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

    changeLanguage(lang: 'es' | 'en' | 'fr' | 'pt' | 'de') {
        this.localeService.setLanguage(lang);
        // Los menús se actualizan automáticamente vía languageChanged$
        
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

    goToProfile() {
        // TODO: Implement profile navigation
    }

    goToSettings() {
        // TODO: Implement settings navigation
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
            : [{ label: this.localeService.t('topbar.no_appointments'), disabled: true }];
        
        this.appointmentMenuItems.push(
            { separator: true },
            { label: this.localeService.t('topbar.view_all'), icon: 'pi pi-calendar', command: () => this.goToAppointments() }
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
}
