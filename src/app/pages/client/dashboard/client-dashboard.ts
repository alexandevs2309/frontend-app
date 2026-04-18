import { Component, signal, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { TrialService } from '../../../core/services/trial.service';
import { NotificationBadgeService } from '../../../core/services/notification/notification-badge.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TrialBannerComponent } from '../../../shared/components/trial-banner.component';
import { SubscriptionService } from '../../../core/services/subscription/subscription.service';
import { TenantService } from '../../../core/services/tenant/tenant.service';
import { StatsWidget } from '../../dashboard/components/statswidget';
import { RecentSalesWidget } from '../../dashboard/components/recentsaleswidget';
import { BestSellingWidget } from '../../dashboard/components/bestsellingwidget';
import { RevenueStreamWidget } from '../../dashboard/components/revenuestreamwidget';
import { NotificationsWidget } from '../../dashboard/components/notificationswidget';
import { Subscription } from 'rxjs';
import { LocaleService } from '../../../core/services/locale/locale.service';
import { getSubscriptionPlanLabel } from '../../../core/utils/subscription-plan-label';

@Component({
    selector: 'app-client-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, ToastModule, TrialBannerComponent, StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <app-trial-banner></app-trial-banner>
        
        @if (currentUser(); as user) {
            <section id="onb-dashboard-welcome" class="dashboard-hero mb-8">
                <div class="dashboard-hero__content">
                    <div class="dashboard-hero__eyebrow">Panel operativo</div>
                    <h1 class="dashboard-hero__title">Hola, {{ user.full_name }}</h1>
                    <div class="dashboard-hero__actions">
                        <button pButton type="button" label="Abrir agenda" icon="pi pi-calendar" class="p-button-sm" (click)="goTo('/client/appointments')"></button>
                        @if (canSeeBusinessOperations()) {
                            <button pButton type="button" label="Abrir caja" icon="pi pi-shopping-cart" class="p-button-sm p-button-outlined" (click)="goTo('/client/pos')"></button>
                        }
                        @if (canAccessClients()) {
                            <button pButton type="button" label="Clientes" icon="pi pi-users" class="p-button-sm p-button-text" (click)="goTo('/client/clients')"></button>
                        }
                    </div>
                    <div class="dashboard-status-strip">
                        <div class="dashboard-status-pill" [class.is-alert]="overdueCount() > 0">
                            <span>Atrasadas</span>
                            <strong>{{ overdueCount() }}</strong>
                        </div>
                        <div class="dashboard-status-pill">
                            <span>Citas hoy</span>
                            <strong>{{ appointmentCount() }}</strong>
                        </div>
                        <div class="dashboard-status-pill">
                            <span>Rol</span>
                            <strong>{{ getRoleDisplayName(user.role) }}</strong>
                        </div>
                    </div>
                    @if (canSeeBusinessDashboard() && subscriptionStatus(); as subscription) {
                        <div class="dashboard-plan-card">
                            <div>
                                <div class="dashboard-plan-card__eyebrow">Plan</div>
                                <div class="dashboard-plan-card__title">{{ getCurrentPlanName() }}</div>
                                <p class="dashboard-plan-card__copy">{{ getSubscriptionStatusLine(subscription) }}</p>
                            </div>
                            @if (canManageSubscription()) {
                                <button pButton type="button" label="Ver planes" icon="pi pi-credit-card" class="p-button-sm p-button-outlined" (click)="goTo('/client/payment')"></button>
                            }
                        </div>
                    }
                </div>
                <div class="dashboard-hero__aside">
                    <div class="dashboard-hero__pulse">
                        <span class="dashboard-hero__pulse-dot"></span>
                        Accesos rápidos
                    </div>
                    <div class="dashboard-quick-actions">
                        <button *ngFor="let action of quickActions()" pButton type="button" [label]="action.label" [icon]="action.icon" class="p-button-text p-button-sm dashboard-quick-actions__btn" (click)="goTo(action.route)"></button>
                    </div>
                    <div class="dashboard-hero__stat">
                        <strong>{{ overdueCount() > 0 ? 'Revisar agenda' : 'Operación estable' }}</strong>
                        <span>{{ overdueCount() > 0 ? 'Hay citas pendientes de resolver.' : 'Sin bloqueos urgentes ahora mismo.' }}</span>
                    </div>
                </div>
            </section>

            <section class="dashboard-operations mb-8">
                <header class="dashboard-operations__header">
                    <div>
                        <div class="dashboard-operations__eyebrow">Operación diaria</div>
                        <h2>{{ isRestrictedDashboard() ? 'Mi jornada' : 'Entradas rápidas' }}</h2>
                    </div>
                    <p>{{ isRestrictedDashboard() ? 'Solo acciones necesarias para tu trabajo de hoy.' : 'Abre la pantalla correcta y sigue trabajando.' }}</p>
                </header>
                <div class="dashboard-operations__grid">
                    <button *ngFor="let action of operationalCards()" type="button" class="dashboard-operation-card" (click)="goTo(action.route)">
                        <span class="dashboard-operation-card__icon"><i [class]="action.icon"></i></span>
                        <strong>{{ action.label }}</strong>
                        <p>{{ action.copy }}</p>
                    </button>
                </div>
            </section>
            
            @if (canSeeBusinessDashboard()) {
                <div class="grid grid-cols-12 gap-8">
                    <app-stats-widget class="contents" />
                    
                    <div class="col-span-12 xl:col-span-6">
                        <app-recent-sales-widget />
                        @if (showAdminWidgets()) {
                            <app-best-selling-widget />
                        }
                    </div>
                    <div class="col-span-12 xl:col-span-6">
                        @if (showAdminWidgets()) {
                            <app-revenue-stream-widget />
                        }
                        @defer (on viewport) {
                            <app-notifications-widget />
                        } @placeholder {
                            <div class="card h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"></div>
                        }
                    </div>
                </div>
            }
        }
    `,
    styles: [`
        .dashboard-hero {
            display: grid;
            grid-template-columns: minmax(0, 1.7fr) minmax(16rem, 0.9fr);
            gap: 1.5rem;
            padding: 1.75rem;
            border-radius: 1.75rem;
            background:
                linear-gradient(135deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.96));
            color: #0f172a;
            border: 1px solid rgba(148, 163, 184, 0.18);
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
        }

        .dashboard-hero__content {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .dashboard-hero__eyebrow {
            font-size: 0.74rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: rgba(51, 65, 85, 0.82);
            font-weight: 700;
        }

        .dashboard-hero__title {
            margin: 0;
            font-size: clamp(2rem, 4vw, 3rem);
            line-height: 1.02;
            font-weight: 800;
        }

        .dashboard-hero__actions {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            padding-top: 0.35rem;
        }

        .dashboard-status-strip {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.85rem;
        }

        .dashboard-status-pill {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            padding: 0.9rem 1rem;
            border-radius: 1rem;
            background: rgba(255, 255, 255, 0.72);
            border: 1px solid rgba(148, 163, 184, 0.16);
        }

        .dashboard-status-pill.is-alert {
            border-color: rgba(217, 119, 6, 0.24);
            background: rgba(245, 158, 11, 0.1);
        }

        .dashboard-status-pill span {
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            font-weight: 700;
            color: rgba(100, 116, 139, 0.95);
        }

        .dashboard-status-pill strong {
            font-size: 1.3rem;
            line-height: 1.05;
            color: #0f172a;
        }

        .dashboard-plan-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding: 1rem 1.1rem;
            border-radius: 1.2rem;
            background: rgba(255, 255, 255, 0.76);
            border: 1px solid rgba(148, 163, 184, 0.18);
        }

        .dashboard-plan-card__eyebrow {
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: rgba(51, 65, 85, 0.82);
            font-weight: 700;
        }

        .dashboard-plan-card__title {
            margin-top: 0.25rem;
            font-size: 1.2rem;
            font-weight: 800;
            color: #0f172a;
        }

        .dashboard-plan-card__copy {
            margin: 0.3rem 0 0;
            color: rgba(51, 65, 85, 0.88);
            font-size: 0.92rem;
        }

        .dashboard-hero__aside {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 0.85rem;
            padding: 1.1rem;
            border-radius: 1.35rem;
            background: rgba(255, 255, 255, 0.72);
            border: 1px solid rgba(148, 163, 184, 0.18);
        }

        .dashboard-hero__pulse {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.88rem;
            color: rgba(30, 41, 59, 0.92);
        }

        .dashboard-quick-actions {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }

        .dashboard-quick-actions__btn {
            justify-content: flex-start;
            width: 100%;
        }

        .dashboard-hero__pulse-dot {
            width: 0.55rem;
            height: 0.55rem;
            border-radius: 999px;
            background: #22c55e;
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
            animation: pulseGlow 1.8s infinite;
        }

        .dashboard-hero__stat {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
            padding: 0.9rem 0 0;
            border-top: 1px solid rgba(148, 163, 184, 0.18);
        }

        .dashboard-hero__stat strong {
            font-size: 1.15rem;
            line-height: 1.1;
            font-weight: 800;
        }

        .dashboard-hero__stat span {
            color: rgba(71, 85, 105, 0.88);
            font-size: 0.92rem;
        }

        .dashboard-operations {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .dashboard-operations__header {
            display: flex;
            align-items: end;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .dashboard-operations__eyebrow {
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            font-weight: 700;
            color: rgba(51, 65, 85, 0.82);
        }

        .dashboard-operations__header h2 {
            margin: 0.35rem 0 0;
            font-size: 1.5rem;
            line-height: 1.05;
            color: var(--text-color, #0f172a);
        }

        .dashboard-operations__header p {
            margin: 0;
            max-width: 32rem;
            color: var(--text-color-secondary, rgba(51, 65, 85, 0.86));
        }

        .dashboard-operations__grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 0.85rem;
        }

        .dashboard-operation-card {
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
            padding: 1rem;
            border: 1px solid rgba(148, 163, 184, 0.18);
            background: var(--surface-card, #fff);
            border-radius: 1.1rem;
            text-align: left;
            transition: transform 120ms, border-color 120ms, box-shadow 120ms;
        }

        .dashboard-operation-card:hover {
            transform: translateY(-1px);
            border-color: rgba(51, 65, 85, 0.26);
            box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
        }

        .dashboard-operation-card__icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 2.6rem;
            height: 2.6rem;
            border-radius: 0.9rem;
            background: rgba(15, 23, 42, 0.06);
            color: #0f172a;
            font-size: 1rem;
        }

        .dashboard-operation-card strong {
            font-size: 1rem;
            color: var(--text-color, #0f172a);
        }

        .dashboard-operation-card p {
            margin: 0;
            font-size: 0.88rem;
            line-height: 1.5;
            color: var(--text-color-secondary, rgba(51, 65, 85, 0.86));
        }

        :host-context(.app-dark) .dashboard-hero {
            background:
                linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92));
            color: #f8fafc;
            border-color: rgba(148, 163, 184, 0.12);
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
        }

        :host-context(.app-dark) .dashboard-hero__eyebrow {
            color: rgba(226, 232, 240, 0.76);
        }

        :host-context(.app-dark) .dashboard-plan-card {
            background: rgba(148, 163, 184, 0.12);
            border-color: rgba(148, 163, 184, 0.16);
        }

        :host-context(.app-dark) .dashboard-status-pill {
            background: rgba(148, 163, 184, 0.12);
            border-color: rgba(148, 163, 184, 0.16);
        }

        :host-context(.app-dark) .dashboard-status-pill strong {
            color: #f8fafc;
        }

        :host-context(.app-dark) .dashboard-plan-card__eyebrow {
            color: rgba(226, 232, 240, 0.76);
        }

        :host-context(.app-dark) .dashboard-plan-card__title {
            color: #f8fafc;
        }

        :host-context(.app-dark) .dashboard-plan-card__copy {
            color: rgba(226, 232, 240, 0.84);
        }

        :host-context(.app-dark) .dashboard-hero__aside {
            background: rgba(148, 163, 184, 0.12);
            border-color: rgba(148, 163, 184, 0.16);
        }

        :host-context(.app-dark) .dashboard-hero__pulse {
            color: rgba(226, 232, 240, 0.92);
        }

        :host-context(.app-dark) .dashboard-hero__stat {
            border-top-color: rgba(148, 163, 184, 0.16);
        }

        :host-context(.app-dark) .dashboard-hero__stat span {
            color: rgba(226, 232, 240, 0.78);
        }

        :host-context(.app-dark) .dashboard-operations__header p,
        :host-context(.app-dark) .dashboard-operation-card p {
            color: rgba(226, 232, 240, 0.82);
        }

        :host-context(.app-dark) .dashboard-operation-card {
            background: rgba(15, 23, 42, 0.9);
            border-color: rgba(148, 163, 184, 0.12);
        }

        :host-context(.app-dark) .dashboard-operation-card strong,
        :host-context(.app-dark) .dashboard-operations__header h2 {
            color: #f8fafc;
        }

        :host-context(.app-dark) .dashboard-operation-card__icon {
            background: rgba(148, 163, 184, 0.12);
            color: #e2e8f0;
        }

        @keyframes pulseGlow {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.35); }
            70% { box-shadow: 0 0 0 0.65rem rgba(34, 197, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        @media (max-width: 960px) {
            .dashboard-hero {
                grid-template-columns: 1fr;
            }

            .dashboard-status-strip,
            .dashboard-operations__grid {
                grid-template-columns: 1fr;
            }
        }
    `]
})
export class ClientDashboard implements OnInit, OnDestroy {
    currentUser = signal<any>(null);
    subscriptionStatus = signal<any>(null);
    currentTenant = signal<any>(null);
    private subscription = new Subscription();
    private notificationService = inject(NotificationBadgeService);
    private messageService = inject(MessageService);
    private router = inject(Router);

    constructor(
        private authService: AuthService,
        private trialService: TrialService,
        private subscriptionService: SubscriptionService,
        private tenantService: TenantService,
        private localeService: LocaleService
    ) {}

    ngOnInit() {
        this.subscription.add(
            this.authService.currentUser$.subscribe(user => {
                this.currentUser.set(user);
            })
        );
        
        setTimeout(() => {
            this.trialService.loadTrialStatus();
            this.loadSubscriptionStatus();
            this.loadCurrentTenant();
            if (this.canLoadAppointments()) {
                this.showAppointmentNotifications();
            }
        }, 0);
    }

    showAppointmentNotifications() {
        const todayAppointments = this.notificationService.todayAppointments();
        const todayCount = todayAppointments.length;
        const upcoming = this.notificationService.upcomingAppointments();
        const overdueCount = this.notificationService.overdueAppointments().length;

        if (todayCount > 0) {
            const details = this.buildTodayAppointmentsDetail(todayAppointments);
            this.messageService.add({
                severity: 'info',
                summary: this.t('dashboard.notifications.today_appointments'),
                detail: `${this.t('dashboard.notifications.today_appointments_detail').replace('{count}', String(todayCount))}\n${details}`,
                life: 9000
            });
        }

        if (upcoming.length > 0) {
            const next = upcoming[0];
            const time = this.localeService.formatTime(next.date_time);
            this.messageService.add({
                severity: 'warn',
                summary: this.t('dashboard.notifications.upcoming_appointment'),
                detail: this.t('dashboard.notifications.upcoming_appointment_detail').replace('{time}', time),
                life: 8000
            });
            this.playNotificationSound();
        }

        if (overdueCount > 0) {
            this.messageService.add({
                severity: 'error',
                summary: this.t('dashboard.notifications.overdue_appointments'),
                detail: this.t('dashboard.notifications.overdue_appointments_detail').replace('{count}', String(overdueCount)),
                life: 9000
            });
            this.playNotificationSound();
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private readonly roleNames = {
        'SuperAdmin': 'dashboard.role.super_admin',
        'SUPER_ADMIN': 'dashboard.role.super_admin',
        'CLIENT_ADMIN': 'dashboard.role.client_admin',
        'Client-Admin': 'dashboard.role.client_admin', 
        'CLIENT_STAFF': 'dashboard.role.client_staff',
        'Client-Staff': 'dashboard.role.client_staff',
        'Cajera': 'dashboard.role.cashier',
        'Manager': 'dashboard.role.manager',
        'Estilista': 'dashboard.role.stylist'
    } as const;

    getRoleDisplayName(role: string): string {
        const key = this.roleNames[role as keyof typeof this.roleNames];
        return key ? this.t(key) : role;
    }

    appointmentCount(): number {
        return this.notificationService.todayAppointments().length;
    }

    overdueCount(): number {
        return this.notificationService.overdueAppointments().length;
    }

    private currentRoleKey(): string {
        const role = this.currentUser()?.role || '';
        return String(role).trim().toUpperCase().replace(/[\s-]+/g, '_');
    }

    isRestrictedDashboard(): boolean {
        const role = this.currentRoleKey();
        return role === 'CLIENT_STAFF' || role === 'ESTILISTA';
    }

    canSeeBusinessDashboard(): boolean {
        const role = this.currentRoleKey();
        return role === 'CLIENT_ADMIN' || role === 'CAJERA' || role === 'MANAGER';
    }

    canSeeBusinessOperations(): boolean {
        const role = this.currentRoleKey();
        return role === 'CLIENT_ADMIN' || role === 'CAJERA' || role === 'MANAGER';
    }

    canManageSubscription(): boolean {
        const role = this.currentRoleKey();
        return role === 'CLIENT_ADMIN' || role === 'MANAGER';
    }

    canAccessClients(): boolean {
        const role = this.currentRoleKey();
        return role === 'CLIENT_ADMIN' || role === 'CLIENT_STAFF' || role === 'CAJERA' || role === 'MANAGER' || role === 'ESTILISTA';
    }

    quickActions(): Array<{ label: string; icon: string; route: string }> {
        if (this.isRestrictedDashboard()) {
            return [
                { label: 'Agenda', icon: 'pi pi-calendar', route: '/client/appointments' },
                { label: 'Clientes', icon: 'pi pi-users', route: '/client/clients' },
                { label: 'Perfil', icon: 'pi pi-user', route: '/client/profile' }
            ];
        }

        const actions = [
            { label: 'Agenda', icon: 'pi pi-calendar', route: '/client/appointments' },
            { label: 'Clientes', icon: 'pi pi-users', route: '/client/clients' }
        ];

        if (this.canSeeBusinessOperations()) {
            actions.splice(1, 0, { label: 'Caja / POS', icon: 'pi pi-shopping-cart', route: '/client/pos' });
        }

        if (this.currentRoleKey() === 'CLIENT_ADMIN') {
            actions.push({ label: 'Configuración', icon: 'pi pi-cog', route: '/client/settings' });
        }

        return actions;
    }

    operationalCards(): Array<{ label: string; copy: string; icon: string; route: string }> {
        if (this.isRestrictedDashboard()) {
            return [
                { label: 'Mis citas', copy: 'Revisa y atiende tu agenda del dia.', icon: 'pi pi-calendar', route: '/client/appointments' },
                { label: 'Clientes', copy: 'Busca una ficha para continuar la atencion.', icon: 'pi pi-users', route: '/client/clients' },
                { label: 'Mi perfil', copy: 'Actualiza tus datos, clave o ayuda.', icon: 'pi pi-user', route: '/client/profile' }
            ];
        }

        const cards = [
            { label: 'Agenda', copy: 'Confirma, mueve o completa citas del turno actual.', icon: 'pi pi-calendar', route: '/client/appointments' },
            { label: 'Clientes', copy: 'Busca una ficha o crea un cliente en pocos pasos.', icon: 'pi pi-users', route: '/client/clients' }
        ];

        if (this.canSeeBusinessOperations()) {
            cards.splice(1, 0, { label: 'Caja', copy: 'Entra directo a cobrar y cerrar ventas rápidas.', icon: 'pi pi-shopping-cart', route: '/client/pos' });
        }

        if (this.currentRoleKey() === 'CLIENT_ADMIN') {
            cards.push({ label: 'Negocio', copy: 'Ajusta ticket, fiscalidad y datos operativos del local.', icon: 'pi pi-cog', route: '/client/settings' });
        }

        return cards;
    }

    getHeroSummary(): string {
        const appointmentCount = this.appointmentCount();
        const overdueCount = this.overdueCount();
        if (appointmentCount === 0 && overdueCount === 0) {
            return this.t('dashboard.hero_summary_empty');
        }
        return this.t('dashboard.hero_summary_active')
            .replace('{appointments}', String(appointmentCount))
            .replace('{overdue}', String(overdueCount));
    }

    goTo(route: string): void {
        this.router.navigate([route]);
    }

    getCurrentPlanName(): string {
        const tenant = this.currentTenant();
        if (tenant?.subscription_plan?.display_name || tenant?.subscription_plan?.name || tenant?.plan_type) {
            return getSubscriptionPlanLabel(
                tenant?.subscription_plan?.display_name,
                tenant?.subscription_plan?.name,
                tenant?.plan_type
            );
        }

        const status = this.subscriptionStatus();
        if (status?.plan_display) {
            return getSubscriptionPlanLabel(status.plan_display);
        }

        try {
            const tenant = JSON.parse(localStorage.getItem('tenant') || '{}');
            return getSubscriptionPlanLabel(
                tenant?.subscription_plan?.display_name,
                tenant?.subscription_plan?.name,
                tenant?.plan_type,
                'Plan activo'
            );
        } catch {
            return 'Plan activo';
        }
    }

    getSubscriptionCopy(subscription: any): string {
        const status = String(subscription?.current_status || '').toLowerCase();
        const graceDays = Number(subscription?.days_in_grace || 0);

        if (status === 'active') {
            return 'Tu suscripción está activa y lista para seguir operando con normalidad.';
        }

        if (graceDays > 0) {
            return `Tu suscripción está en gracia. Te quedan ${graceDays} día(s) para renovarla.`;
        }

        if (status === 'trial') {
            return 'Estás operando en período de prueba. Puedes revisar planes y actualizar cuando quieras.';
        }

        return 'Revisa tu suscripción actual y actualiza el plan si necesitas más capacidad.';
    }

    getSubscriptionStatusLine(subscription: any): string {
        const status = String(subscription?.current_status || '').toLowerCase();
        const graceDays = Number(subscription?.days_in_grace || 0);

        if (status === 'active') {
            return 'Activo';
        }

        if (graceDays > 0) {
            return `En gracia: ${graceDays} día(s)`;
        }

        if (status === 'trial') {
            return 'Prueba activa';
        }

        return 'Revisar suscripción';
    }

    canAccessFeature(feature: string): boolean {
        return this.trialService.canAccessFeature(feature);
    }

    showAdminWidgets(): boolean {
        const role = this.currentUser()?.role;
        return role === 'CLIENT_ADMIN' || role === 'Manager';
    }

    private canLoadAppointments(): boolean {
        const role = this.currentUser()?.role;
        return role === 'CLIENT_ADMIN' || role === 'CLIENT_STAFF' || role === 'Cajera' || role === 'Manager' || role === 'Estilista';
    }

    private loadSubscriptionStatus(): void {
        this.subscription.add(
            this.subscriptionService.getSubscriptionStatus().subscribe({
                next: (status) => this.subscriptionStatus.set(status),
                error: () => this.subscriptionStatus.set(null)
            })
        );
    }

    private loadCurrentTenant(): void {
        this.subscription.add(
            this.tenantService.getCurrentTenant().subscribe({
                next: (tenant) => this.currentTenant.set(tenant),
                error: () => this.currentTenant.set(null)
            })
        );
    }

    private playNotificationSound(): void {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.07, audioContext.currentTime);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.18);
        } catch {
        }
    }

    t(key: string): string {
        return this.localeService.t(key as any);
    }

    private buildTodayAppointmentsDetail(appointments: any[]): string {
        const maxItems = 3;
        const lines = appointments.slice(0, maxItems).map((apt) => {
            const time = this.localeService.formatTime(apt.date_time);
            const client = apt.client_name || `Cliente #${apt.client}`;
            const service = apt.service_name || 'Servicio no especificado';
            return `• ${time} - ${client} - ${service}`;
        });

        if (appointments.length > maxItems) {
            lines.push(this.t('dashboard.notifications.more').replace('{count}', String(appointments.length - maxItems)));
        } else {
            lines.push(this.t('dashboard.notifications.view_full_agenda'));
        }

        return lines.join('\n');
    }
}
