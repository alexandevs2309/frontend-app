import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { MicroAnimationService } from './micro-animation.service';
import { LandingPublicService, PublicMetrics } from '../../../core/services/landing-public.service';

@Component({
    selector: 'hero-widget',
    standalone: true,
    imports: [ButtonModule, RouterModule],
    template: `
        <section #heroSection class="min-h-screen flex items-center py-24 lg:py-32 relative overflow-hidden transform -skew-y-3" style="--gradient-color-1: #1e1b4b; --gradient-color-2: #312e81; --gradient-color-3: #0f172a;">
            <div class="absolute inset-0 bg-linear-to-br from-indigo-950 via-indigo-900 to-slate-900"></div>
            <div class="absolute inset-0 opacity-90 bg-[radial-gradient(circle_at_16%_18%,rgba(56,189,248,0.22),transparent_24%),radial-gradient(circle_at_84%_14%,rgba(99,102,241,0.28),transparent_28%),radial-gradient(circle_at_50%_82%,rgba(14,165,233,0.18),transparent_30%)]"></div>

            <div class="absolute inset-0">
                <div class="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div class="absolute bottom-20 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
            </div>

            <div class="max-w-max mx-auto px-6 lg:px-8 relative z-10 transform skew-y-3">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div class="text-center lg:text-left">
                        <div class="inline-flex items-center px-4 py-2 bg-white/15 backdrop-blur-md rounded-full text-white/90 text-sm font-semibold mb-6 fade-in-up shadow-lg shadow-indigo-950/20">
                            Software de gestion para barberias y salones
                        </div>

                        <h1 class="text-5xl lg:text-7xl font-black leading-[0.92] tracking-[-0.05em] text-white mb-6 fade-in-up">
                            <span class="block">Gestiona tu barberia</span>
                            <span class="block mt-2">con orden y control</span>
                            <span class="text-sky-300 block">profesional</span>
                        </h1>

                        <p class="text-xl lg:text-2xl text-white/95 leading-relaxed mb-8 fade-in-up">
                            Organiza citas, ventas, comisiones e inventario en un solo sistema.
                            <span class="text-white/90 block mt-3">
                                Pensado para negocios pequenos y operaciones con varias sucursales.
                            </span>
                        </p>

                        <div class="space-y-3 mb-8 fade-in-up">
                            <div class="flex items-center text-white/90">
                                <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 shrink-0">
                                    <i class="pi pi-check text-white text-xs font-bold"></i>
                                </div>
                                <span class="font-medium">Agenda digital para ordenar reservas y operacion diaria</span>
                            </div>
                            <div class="flex items-center text-white/90">
                                <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 shrink-0">
                                    <i class="pi pi-check text-white text-xs font-bold"></i>
                                </div>
                                <span class="font-medium">Control de ventas, caja y comisiones por empleado</span>
                            </div>
                            <div class="flex items-center text-white/90">
                                <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 shrink-0">
                                    <i class="pi pi-check text-white text-xs font-bold"></i>
                                </div>
                                <span class="font-medium">Reportes para tomar decisiones con datos reales</span>
                            </div>
                        </div>

                        <div class="fade-in-up mb-8">
                            <button pButton routerLink="/auth/register" class="bg-white! text-indigo-700! px-8! py-4! text-lg! font-bold! rounded-full! hover:bg-slate-100! shadow-2xl! hover:shadow-3xl! transform! hover:-translate-y-1! transition-all! w-full! sm:w-auto!">
                                <span class="block">Empezar prueba</span>
                                <span class="block text-sm font-normal opacity-90">Sin configuracion complicada</span>
                            </button>
                            <div class="mt-4 text-center sm:text-left">
                                <a (click)="openVideoModal()" class="text-white/90 hover:text-white text-sm font-medium cursor-pointer inline-flex items-center">
                                    Ver demostracion del sistema
                                    <i class="pi pi-arrow-right ml-2 text-xs"></i>
                                </a>
                            </div>
                        </div>

                        <div class="flex flex-col sm:flex-row items-center gap-6 text-white/80 fade-in-up">
                            <div class="flex items-center">
                                <div class="flex -space-x-2">
                                    <div class="w-8 h-8 bg-indigo-600 rounded-full border-2 border-white"></div>
                                    <div class="w-8 h-8 bg-indigo-600 opacity-80 rounded-full border-2 border-white"></div>
                                    <div class="w-8 h-8 bg-indigo-600 opacity-60 rounded-full border-2 border-white"></div>
                                    <div class="w-8 h-8 bg-indigo-600 opacity-40 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">+</div>
                                </div>
                                <span class="ml-3 font-medium">
                                    @if (metrics) {
                                        {{ metrics.activeTenants }} negocios activos
                                    } @else {
                                        Operacion lista para crecer
                                    }
                                </span>
                            </div>
                            <div class="flex items-center">
                                <i class="pi pi-chart-line text-sky-300 mr-2"></i>
                                <span class="font-medium">
                                    @if (metrics) {
                                        {{ metrics.totalTenants }} cuentas registradas
                                    } @else {
                                        Planes claros y escalables
                                    }
                                </span>
                            </div>
                        </div>

                        <div class="flex items-center text-xs text-white/70 mt-6 fade-in-up">
                            <i class="pi pi-shield-check mr-2"></i>
                            <span>Datos protegidos</span>
                            <span class="mx-2">•</span>
                            <i class="pi pi-comments mr-2"></i>
                            <span>Soporte por canales digitales</span>
                            <span class="mx-2">•</span>
                            <i class="pi pi-check mr-2"></i>
                            <span>Cambia de plan cuando lo necesites</span>
                        </div>
                    </div>

                    <div class="fade-in-up">
                        @if (!metrics) {
                            <div class="mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/80 text-sm text-center">
                                Vista previa del sistema
                            </div>
                        }
                        <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-500">
                            <div class="grid grid-cols-2 gap-6 lg:gap-8 mb-6">
                                <div class="bg-white/15 backdrop-blur-sm rounded-xl p-6 lg:p-8">
                                    <h4 class="text-white/70 text-xs uppercase tracking-wide mb-2">Ventas de hoy</h4>
                                    <div class="text-white text-2xl font-black font-mono">$2,847</div>
                                </div>
                                <div class="bg-white/15 backdrop-blur-sm rounded-xl p-6 lg:p-8">
                                    <h4 class="text-white/70 text-xs uppercase tracking-wide mb-2">Citas activas</h4>
                                    <div class="text-white text-2xl font-black font-mono">24</div>
                                </div>
                                <div class="bg-white/15 backdrop-blur-sm rounded-xl p-6 lg:p-8">
                                    <h4 class="text-white/70 text-xs uppercase tracking-wide mb-2">Ocupacion</h4>
                                    <div class="text-white text-2xl font-black font-mono">87%</div>
                                </div>
                                <div class="bg-white/15 backdrop-blur-sm rounded-xl p-6 lg:p-8">
                                    <h4 class="text-white/70 text-xs uppercase tracking-wide mb-2">Clientes nuevos</h4>
                                    <div class="text-white text-2xl font-black font-mono">12</div>
                                </div>
                            </div>

                            <div class="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                                <div class="flex items-end gap-2 h-24">
                                    <div class="flex-1 bg-linear-to-t from-indigo-600 to-sky-400 rounded-t" style="height: 60%;"></div>
                                    <div class="flex-1 bg-linear-to-t from-indigo-600 to-sky-400 rounded-t" style="height: 80%;"></div>
                                    <div class="flex-1 bg-linear-to-t from-indigo-600 to-sky-400 rounded-t" style="height: 95%;"></div>
                                    <div class="flex-1 bg-linear-to-t from-indigo-600 to-sky-400 rounded-t" style="height: 70%;"></div>
                                    <div class="flex-1 bg-linear-to-t from-indigo-600 to-sky-400 rounded-t" style="height: 100%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `
})
export class HeroWidget implements OnInit, OnDestroy {
    metrics: PublicMetrics | null = null;

    constructor(private landingService: LandingPublicService, private microAnimation: MicroAnimationService) {}

    ngOnInit() {
        this.loadMetrics();
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => this.microAnimation.initTitleAnimations());
        } else {
            setTimeout(() => this.microAnimation.initTitleAnimations(), 100);
        }
    }

    ngOnDestroy() {
        this.microAnimation.destroy();
    }

    openVideoModal() {
        const event = new CustomEvent('openVideoModal');
        window.dispatchEvent(event);
    }

    private loadMetrics() {
        this.metrics = this.landingService.getMetrics();
    }
}
