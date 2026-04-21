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
        <section #heroSection class="relative overflow-hidden pt-40 pb-24 lg:pt-44 lg:pb-32" style="--gradient-color-1: #1e1b4b; --gradient-color-2: #312e81; --gradient-color-3: #0f172a;">
            <div class="absolute inset-0 bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900"></div>
            <div class="absolute inset-0 opacity-95 bg-[radial-gradient(circle_at_14%_18%,rgba(56,189,248,0.18),transparent_20%),radial-gradient(circle_at_85%_14%,rgba(168,85,247,0.26),transparent_26%),radial-gradient(circle_at_54%_82%,rgba(99,102,241,0.2),transparent_28%)]"></div>
            <div class="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_16%,transparent_84%,rgba(15,23,42,0.22))]"></div>

            <div class="absolute inset-0 pointer-events-none">
                <div class="absolute top-24 right-[8%] w-80 h-80 bg-fuchsia-500/12 rounded-full blur-3xl"></div>
                <div class="absolute top-32 left-[6%] w-72 h-72 bg-sky-400/12 rounded-full blur-3xl"></div>
                <div class="absolute bottom-16 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            <div class="max-w-[92rem] mx-auto px-6 lg:px-10 relative z-10">
                <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] gap-14 xl:gap-20 items-center">
                    <div class="text-center lg:text-left">
                        <div class="mb-6 fade-in-up flex justify-center lg:justify-start">
                            <div class="inline-flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-md shadow-lg shadow-slate-950/20">
                                <img src="assets/logos/iso-auron.jpg" alt="Auron Suite" class="h-11 w-11 object-contain rounded-2xl" />
                                <div class="text-left">
                                    <div class="text-[0.68rem] uppercase tracking-[0.22em] text-white/55 font-semibold">Salon Management</div>
                                    <div class="text-white text-xl lg:text-2xl font-black tracking-tight">Auron Suite</div>
                                </div>
                            </div>
                        </div>

                        <div class="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-semibold mb-6 fade-in-up shadow-lg shadow-indigo-950/20 border border-white/10">
                            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Software para barberias, salones y operaciones multi-sucursal
                        </div>

                        <h1 class="text-5xl lg:text-[5.3rem] font-black leading-[0.98] tracking-[-0.055em] text-white mb-6 fade-in-up max-w-[14ch] mx-auto lg:mx-0">
                            <span class="block text-white">Software para</span>
                            <span class="block mt-2 text-white">barberias y salones</span>
                            <span class="text-sky-300 block">que ordena tu operacion</span>
                        </h1>

                        <p class="text-lg lg:text-[1.24rem] text-white/90 leading-relaxed mb-8 fade-in-up max-w-[38rem] mx-auto lg:mx-0">
                            Auron Suite unifica agenda de barberia, POS de barberia, clientes, comisiones e inventario para que atiendas mejor, ahorres tiempo y vendas con mas control.
                            <span class="text-white/75 block mt-3 text-base lg:text-lg">
                                Ideal para negocios que quieren dejar atras WhatsApp, libretas y cierres manuales sin complicar al equipo.
                            </span>
                        </p>

                        <div class="space-y-3 mb-8 fade-in-up max-w-[38rem] mx-auto lg:mx-0">
                            <div class="flex items-center text-white/90 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                                <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 shrink-0">
                                    <i class="pi pi-check text-white text-xs font-bold"></i>
                                </div>
                                <span class="font-medium text-sm lg:text-base">Agenda para barberia y salon desde una sola vista</span>
                            </div>
                            <div class="flex items-center text-white/90 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                                <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 shrink-0">
                                    <i class="pi pi-check text-white text-xs font-bold"></i>
                                </div>
                                <span class="font-medium text-sm lg:text-base">Caja, POS barberia y comisiones sin procesos manuales</span>
                            </div>
                            <div class="flex items-center text-white/90 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                                <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 shrink-0">
                                    <i class="pi pi-check text-white text-xs font-bold"></i>
                                </div>
                                <span class="font-medium text-sm lg:text-base">Reportes e inventario para tomar decisiones con mas claridad</span>
                            </div>
                        </div>

                        <div class="fade-in-up mb-8">
                            <div class="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                                <button pButton routerLink="/auth/register" class="bg-white! text-indigo-700! px-8! py-4! text-lg! font-bold! rounded-full! hover:bg-slate-100! shadow-2xl! hover:shadow-3xl! transform! hover:-translate-y-1! transition-all! w-full! sm:w-auto!">
                                    <span class="block">Crear cuenta</span>
                                    <span class="block text-sm font-normal opacity-90">Empieza a ordenar tu negocio hoy</span>
                                </button>
                                <button pButton type="button" (click)="openVideoModal()" class="bg-white/8! text-white! border! border-white/15! px-7! py-4! text-base! font-semibold! rounded-full! backdrop-blur-md! hover:bg-white/12! w-full! sm:w-auto!">
                                    <span class="inline-flex items-center gap-2">
                                        Ver demostracion
                                        <i class="pi pi-play-circle"></i>
                                    </span>
                                </button>
                            </div>
                            <div class="mt-4 text-center sm:text-left text-sm text-white/70">
                                Menos tiempo en tareas repetitivas y mas visibilidad para crecer con orden.
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white/80 fade-in-up max-w-lg mx-auto lg:mx-0">
                            <div class="rounded-2xl border border-white/10 bg-white/6 backdrop-blur-md px-4 py-4 text-left">
                                <div class="text-xs uppercase tracking-[0.22em] text-white/55 mb-2">Negocios activos</div>
                                <div class="text-2xl font-black text-white">{{ metrics?.activeTenants ?? 165 }}</div>
                                <div class="text-sm text-white/70 mt-1">operando con la plataforma</div>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-white/6 backdrop-blur-md px-4 py-4 text-left">
                                <div class="text-xs uppercase tracking-[0.22em] text-white/55 mb-2">Cuentas creadas</div>
                                <div class="text-2xl font-black text-white">{{ metrics?.totalTenants ?? 180 }}</div>
                                <div class="text-sm text-white/70 mt-1">espacios listos para escalar</div>
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center justify-center lg:justify-start text-xs text-white/70 mt-6 gap-y-2 fade-in-up">
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

                    <div class="fade-in-up relative lg:pl-4 xl:pl-10">
                        <div class="absolute -top-5 right-8 rounded-full border border-white/15 bg-white/8 backdrop-blur-md px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/75">
                            Vista previa del sistema
                        </div>

                        <div class="relative rounded-4xl border border-white/14 bg-white/10 p-3 shadow-[0_38px_120px_-52px_rgba(15,23,42,0.9)] backdrop-blur-2xl max-w-2xl mx-auto">
                            <div class="rounded-[1.6rem] border border-white/10 bg-slate-950/85 overflow-hidden">
                                <img src="assets/demo/auron-marketing-showcase.png" alt="Mockup ilustrado del ecosistema Auron Suite" class="w-full h-auto object-cover" />
                            </div>
                        </div>

                        <div class="hidden 2xl:block absolute -right-3 top-1/2 -translate-y-1/2 w-44 rounded-[1.7rem] border border-white/14 bg-slate-950/88 p-2.5 shadow-2xl">
                            <img src="assets/demo/auron-mobile-dashboard-2.png" alt="Vista movil ilustrada de Auron Suite" class="w-full h-auto object-contain rounded-[1.2rem]" />
                        </div>

                        <div class="hidden 2xl:block absolute -left-2 bottom-10 rounded-3xl border border-white/14 bg-white/10 backdrop-blur-xl px-4 py-4 shadow-2xl">
                            <div class="flex items-center gap-3">
                                <div class="w-11 h-11 rounded-2xl bg-emerald-500/18 flex items-center justify-center text-emerald-300">
                                    <i class="pi pi-whatsapp text-lg"></i>
                                </div>
                                <div>
                                    <div class="text-sm font-semibold text-white">Recordatorios y seguimiento</div>
                                    <div class="text-xs text-white/70">Menos ausencias y mejor puntualidad</div>
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
