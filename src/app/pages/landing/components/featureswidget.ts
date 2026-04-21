import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MicroAnimationService } from './micro-animation.service';

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule],
    template: `
        <div id="features">
            <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-8">
                <div class="rounded-4xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 lg:p-10 shadow-[0_28px_90px_-56px_rgba(15,23,42,0.35)]">
                    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                        <div>
                            <div class="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-4 py-2 text-sm font-semibold mb-5">
                                <i class="pi pi-sparkles"></i>
                                Software conectado para el negocio
                            </div>
                            <h3 class="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
                                Todo el flujo diario del negocio en un solo sistema
                            </h3>
                            <p class="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                                Auron conecta software para salones, agenda barberia, mostrador, clientes y reportes para que el equipo trabaje con menos friccion y mas claridad.
                            </p>
                        </div>

                        <div class="grid grid-cols-2 gap-3 min-w-60">
                            <div class="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-4">
                                <div class="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-2">Agenda barberia</div>
                                <div class="text-2xl font-black text-slate-900 dark:text-white">1 vista</div>
                                <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">reservas y seguimiento</div>
                            </div>
                            <div class="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-4">
                                <div class="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-2">POS barberia</div>
                                <div class="text-2xl font-black text-slate-900 dark:text-white">Caja</div>
                                <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">servicios, productos y cobros</div>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-4xl border border-slate-200 dark:border-slate-700 bg-slate-950 mb-6 overflow-hidden shadow-[0_30px_90px_-58px_rgba(15,23,42,0.55)]">
                        <img
                            src="assets/demo/auron-mockups-grid-dark.png"
                            alt="Vista ilustrada de agenda, POS, clientes y panel movil de Auron Suite"
                            class="w-full h-auto object-cover"
                        />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-6">
                            <div class="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-5">
                                <i class="pi pi-fw pi-dollar text-2xl! text-emerald-600"></i>
                            </div>
                            <h4 class="text-xl font-semibold text-slate-900 dark:text-white mb-3">Comisiones y caja mas claras</h4>
                            <p class="text-slate-600 dark:text-slate-300 mb-4">Menos cierres manuales, menos cuentas por fuera del sistema y mejor control sobre lo que produce cada empleado.</p>
                            <div class="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">Menos tiempo en calculos repetitivos</div>
                        </div>

                        <div class="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-6">
                            <div class="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-5">
                                <i class="pi pi-fw pi-calendar text-2xl! text-purple-600"></i>
                            </div>
                            <h4 class="text-xl font-semibold text-slate-900 dark:text-white mb-3">Agenda con menos ausencias</h4>
                            <p class="text-slate-600 dark:text-slate-300 mb-4">Recordatorios, disponibilidad y seguimiento desde una sola vista para que el dia no dependa de mensajes sueltos.</p>
                            <div class="text-purple-600 dark:text-purple-400 text-sm font-semibold">Agenda centralizada y recordatorios</div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    <div class="rounded-4xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-7 shadow-[0_24px_80px_-54px_rgba(15,23,42,0.28)]">
                        <div class="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-5">
                            <i class="pi pi-fw pi-shield text-2xl! text-blue-600"></i>
                        </div>
                        <h4 class="text-xl font-semibold text-slate-900 dark:text-white mb-3">Datos aislados por negocio</h4>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">Cada negocio opera con su propia informacion para que clientes, ventas y reportes no se mezclen con otros negocios.</p>
                        <div class="text-sm text-blue-600 dark:text-blue-400 font-semibold">Control de acceso y operacion separada</div>
                    </div>

                    <div class="rounded-4xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-7 shadow-[0_24px_80px_-54px_rgba(15,23,42,0.28)]">
                        <div class="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-5">
                            <i class="pi pi-fw pi-chart-line text-2xl! text-indigo-600"></i>
                        </div>
                        <h4 class="text-xl font-semibold text-slate-900 dark:text-white mb-3">Reportes para decidir mejor</h4>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">Visualiza rendimiento, ventas, stock y actividad del equipo para tomar decisiones con datos del sistema.</p>
                        <div class="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">Lectura rapida del negocio</div>
                    </div>

                    <div class="rounded-4xl border border-slate-200 dark:border-slate-800 bg-linear-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 p-7 shadow-[0_24px_80px_-54px_rgba(15,23,42,0.28)] dark:shadow-[0_30px_90px_-50px_rgba(15,23,42,0.8)]">
                        <div class="w-14 h-14 bg-sky-100 dark:bg-white/10 rounded-2xl flex items-center justify-center mb-5">
                            <i class="pi pi-fw pi-box text-2xl! text-sky-600 dark:text-sky-300"></i>
                        </div>
                        <h4 class="text-xl text-slate-900 dark:text-white font-semibold mb-3">Inventario, servicios y productos conectados</h4>
                        <p class="text-slate-600 dark:text-white/75 mb-5">Lo que vendes, lo que agendas y lo que sale del stock puede vivir dentro de una misma operacion.</p>
                        <div class="inline-flex items-center rounded-full bg-sky-100 text-sky-700 dark:bg-white/10 dark:text-sky-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
                            Menos sistemas sueltos
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class FeaturesWidget implements OnInit, OnDestroy {
    constructor(private microAnimation: MicroAnimationService) {}

    ngOnInit() {
        setTimeout(() => this.microAnimation.initTitleAnimations(), 100);
    }

    ngOnDestroy() {
        this.microAnimation.destroy();
    }
}
