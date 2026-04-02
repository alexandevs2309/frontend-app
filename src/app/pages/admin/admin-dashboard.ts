import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';
import { SaasStatsWidget } from '../dashboard/components/saas-stats-widget';
import { NotificationsWidget } from '../dashboard/components/notificationswidget';
import { Subscription, interval } from 'rxjs';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, SaasStatsWidget, NotificationsWidget],
    template: `
        @if (currentUser(); as user) {
            <section class="mb-8 overflow-hidden rounded-[2rem] border border-surface-200/70 bg-surface-0 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.45)] dark:border-surface-800 dark:bg-surface-900">
                <div class="relative overflow-hidden px-8 py-8 lg:px-10 lg:py-10">
                    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.16),_transparent_38%),linear-gradient(135deg,_rgba(15,23,42,0.04),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.16),_transparent_36%),linear-gradient(135deg,_rgba(15,23,42,0.92),_rgba(30,41,59,0.86))]"></div>
                    <div class="relative grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)] lg:items-start">
                        <div>
                            <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-surface-200 bg-surface-50/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-surface-600 dark:border-surface-700 dark:bg-surface-800/80 dark:text-surface-300">
                                <i class="pi pi-crown text-[0.7rem] text-primary"></i>
                                Control Global SaaS
                            </div>
                            <div class="mb-4 flex items-start gap-4">
                                <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-900 text-white shadow-lg shadow-surface-900/10 dark:bg-surface-0 dark:text-surface-900">
                                    <i class="pi pi-sparkles text-2xl"></i>
                                </div>
                                <div>
                                    <h1 class="max-w-3xl text-3xl font-semibold tracking-tight text-surface-950 dark:text-surface-0 lg:text-4xl">
                                        Workspace overview para {{ user.full_name }}
                                    </h1>
                                    <p class="mt-3 max-w-2xl text-base leading-7 text-surface-600 dark:text-surface-300">
                                        Supervisa tenants, ingresos, incidencias y salud operativa desde un mismo centro de control.
                                    </p>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-3 text-sm">
                                <div class="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white/80 px-3 py-2 text-surface-700 dark:border-surface-700 dark:bg-surface-800/80 dark:text-surface-200">
                                    <i class="pi pi-shield text-primary"></i>
                                    {{ getRoleDisplayName(user.role) }}
                                </div>
                                <div class="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white/80 px-3 py-2 text-surface-700 dark:border-surface-700 dark:bg-surface-800/80 dark:text-surface-200">
                                    <i class="pi pi-calendar text-primary"></i>
                                    {{ getCurrentDate() }}
                                </div>
                                <div class="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white/80 px-3 py-2 text-surface-700 dark:border-surface-700 dark:bg-surface-800/80 dark:text-surface-200">
                                    <i class="pi pi-clock text-primary"></i>
                                    {{ getCurrentTime() }}
                                </div>
                            </div>
                        </div>
                        <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                            <article class="rounded-3xl border border-surface-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-surface-700 dark:bg-surface-800/80">
                                <div class="text-xs font-semibold uppercase tracking-[0.24em] text-surface-500 dark:text-surface-400">Tenants</div>
                                <div class="mt-3 text-3xl font-semibold text-surface-950 dark:text-surface-0">Visibilidad total</div>
                                <p class="mt-2 text-sm leading-6 text-surface-600 dark:text-surface-300">
                                    Cambios de plan, suspensiones y soporte sin salir del panel global.
                                </p>
                            </article>
                            <article class="rounded-3xl border border-surface-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-surface-700 dark:bg-surface-800/80">
                                <div class="text-xs font-semibold uppercase tracking-[0.24em] text-surface-500 dark:text-surface-400">Revenue</div>
                                <div class="mt-3 text-3xl font-semibold text-surface-950 dark:text-surface-0">Seguimiento vivo</div>
                                <p class="mt-2 text-sm leading-6 text-surface-600 dark:text-surface-300">
                                    Pagos, churn y alertas financieras concentradas en un solo ritmo operativo.
                                </p>
                            </article>
                            <article class="rounded-3xl border border-surface-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-surface-700 dark:bg-surface-800/80">
                                <div class="text-xs font-semibold uppercase tracking-[0.24em] text-surface-500 dark:text-surface-400">Soporte</div>
                                <div class="mt-3 text-3xl font-semibold text-surface-950 dark:text-surface-0">Respuesta rápida</div>
                                <p class="mt-2 text-sm leading-6 text-surface-600 dark:text-surface-300">
                                    Incidentes, diagnósticos y salud del sistema listos para actuar sin fricción.
                                </p>
                            </article>
                        </div>
                    </div>
                </div>
            </section>

            <div class="grid grid-cols-12 gap-8">
                <div class="col-span-12">
                    <div class="mb-4 flex items-center justify-between">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-surface-500 dark:text-surface-400">Resumen ejecutivo</p>
                            <h2 class="mt-2 text-2xl font-semibold text-surface-950 dark:text-surface-0">Panorama actual del negocio</h2>
                        </div>
                        <div class="hidden rounded-full border border-surface-200 bg-surface-0 px-3 py-2 text-sm text-surface-600 shadow-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 md:inline-flex md:items-center md:gap-2">
                            <i class="pi pi-pulse text-primary"></i>
                            Actualizado en tiempo real
                        </div>
                    </div>
                </div>
                <app-saas-stats-widget class="contents" />
                <div class="col-span-12 xl:col-span-6">
                    <div class="rounded-[1.75rem] border border-surface-200 bg-surface-0 p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.5)] dark:border-surface-800 dark:bg-surface-900">
                        <div class="mb-4 flex items-center justify-between">
                            <div>
                                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-surface-500 dark:text-surface-400">Actividad</p>
                                <h3 class="mt-2 text-xl font-semibold text-surface-950 dark:text-surface-0">Centro de notificaciones</h3>
                            </div>
                            <span class="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-surface-50 px-3 py-1.5 text-xs font-medium text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
                                <i class="pi pi-bell text-primary"></i>
                                Operación reciente
                            </span>
                        </div>
                        <app-notifications-widget />
                    </div>
                </div>
            </div>
        }
    `
})
export class AdminDashboard implements OnInit, OnDestroy {
    currentUser = signal<any>(null);
    currentTime = signal(new Date());
    private subscription = new Subscription();

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.subscription.add(
            this.authService.currentUser$.subscribe(user => {
                this.currentUser.set(user);
            })
        );
        this.subscription.add(
            interval(60000).subscribe(() => this.currentTime.set(new Date()))
        );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private readonly roleNames = {
        'SUPER_ADMIN': 'Super Administrador',
        'CLIENT_ADMIN': 'Administrador de Peluquería',
        'CLIENT_STAFF': 'Empleado'
    } as const;

    getRoleDisplayName(role: string): string {
        return this.roleNames[role as keyof typeof this.roleNames] || role;
    }

    getCurrentDate(): string {
        return this.currentTime().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    getCurrentTime(): string {
        return this.currentTime().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
}
