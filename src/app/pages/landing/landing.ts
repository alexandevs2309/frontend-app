import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ScrollTopModule } from 'primeng/scrolltop';
import { TooltipModule } from 'primeng/tooltip';
import { TopbarWidget } from './components/topbar-widget.component';
import { HeroWidget } from './components/herowidget-modern';
import { FeaturesWidget } from './components/featureswidget';
import { TestimonialsWidget } from './components/testimonialswidget';
import { HighlightsWidget } from './components/highlightswidget';
import { PricingWidget } from './components/pricingwidget';
import { FooterWidget } from './components/footerwidget';
import { VideoModal } from './components/video-modal';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [
        RouterModule,
        TopbarWidget,
        HeroWidget,
        FeaturesWidget,
        TestimonialsWidget,
        HighlightsWidget,
        PricingWidget,
        FooterWidget,
        VideoModal,
        ScrollTopModule,
        TooltipModule,
        RippleModule,
        StyleClassModule,
        ButtonModule,
        DividerModule
    ],
    template: `
        <div class="bg-white dark:bg-slate-900">
            <div id="home" class="landing-wrapper">
                <topbar-widget />
                <hero-widget />

                <div class="bg-slate-950 py-20 lg:py-28 relative overflow-hidden" data-section="problem">
                    <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.12),transparent_20%),radial-gradient(circle_at_85%_18%,rgba(99,102,241,0.18),transparent_24%)]"></div>
                    <div class="max-w-[92rem] mx-auto px-6 lg:px-8 relative z-10">
                        <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-8 items-start">
                            <div>
                                <span class="inline-block px-4 py-2 bg-white/8 text-sky-300 rounded-full font-semibold text-sm mb-6 uppercase tracking-wide">El problema</span>
                                <h2 class="text-4xl lg:text-5xl font-black text-white mb-6">Cuando la operacion depende de WhatsApp, libretas y memoria, el negocio pierde tiempo y ventas.</h2>
                                <p class="text-lg text-slate-300 max-w-2xl">
                                    Muchas barberias y salones trabajan sin un software para barberias que conecte agenda, caja y equipo. Eso genera citas perdidas, cierres manuales, poca visibilidad y una experiencia menos profesional para el cliente.
                                </p>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="rounded-3xl border border-white/10 bg-white/6 p-6">
                                    <h3 class="text-xl font-semibold text-white mb-3">Agenda dispersa</h3>
                                    <p class="text-slate-300">Citas por chat, llamadas y notas sueltas que hacen dificil mantener una agenda barberia clara y reducir ausencias.</p>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-white/6 p-6">
                                    <h3 class="text-xl font-semibold text-white mb-3">Caja sin control</h3>
                                    <p class="text-slate-300">Ventas, comisiones y productos se registran por separado, lo que complica cobrar bien y operar un POS barberia con control.</p>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-white/6 p-6">
                                    <h3 class="text-xl font-semibold text-white mb-3">Poca visibilidad</h3>
                                    <p class="text-slate-300">No saber que servicio vende mas, que empleado produce mejor o que productos faltan frena decisiones importantes.</p>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-white/6 p-6">
                                    <h3 class="text-xl font-semibold text-white mb-3">Crecimiento desordenado</h3>
                                    <p class="text-slate-300">Cuando el negocio crece, seguir operando con procesos manuales hace mas dificil escalar con calidad.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-50 dark:bg-slate-900 py-20 lg:py-32 relative overflow-hidden transform -skew-y-2" data-section="features">
                    <div class="relative z-10 transform skew-y-2">
                        <div class="max-w-[92rem] mx-auto px-6 lg:px-8">
                            <div class="text-center mb-20">
                                <span class="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full font-semibold text-sm mb-6 uppercase tracking-wide">La solucion</span>
                                <h2 class="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">Un software para barberias y salones hecho para vender mas y operar mejor.</h2>
                                <p class="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">Cada modulo resuelve una parte critica del negocio: agenda, POS, clientes, comisiones, inventario y reportes desde un mismo sistema.</p>
                            </div>
                            <features-widget />
                        </div>
                    </div>
                </div>

                <div class="bg-linear-to-br from-indigo-900 via-indigo-800 to-slate-900 py-20 lg:py-32 relative overflow-hidden transform -skew-y-3" data-section="highlights">
                    <div class="relative z-10 transform skew-y-3">
                        <highlights-widget />
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-900 py-20 lg:py-32 relative overflow-hidden transform -skew-y-1" data-section="testimonials">
                    <div class="relative z-10 transform skew-y-1">
                        <testimonials-widget />
                    </div>
                </div>

                <div class="bg-slate-50 dark:bg-slate-800 py-20 lg:py-32 relative overflow-hidden" data-section="pricing">
                    <div class="relative z-10">
                        <pricing-widget />
                    </div>
                </div>

                <footer-widget />
            </div>
        </div>
        <video-modal [(visible)]="showVideoModal"></video-modal>
        <p-scrollTop [threshold]="300" styleClass="!right-6 !bg-linear-to-r !from-indigo-600 !to-sky-500 !border-0 !w-12 !h-12 shadow-lg hover:!scale-110 !transition-all !duration-300" pTooltip="Volver arriba" tooltipPosition="left">
            <i class="pi pi-chevron-up text-xl! text-white"></i>
        </p-scrollTop>
    `
})
export class Landing implements OnInit, OnDestroy {
    showVideoModal = false;
    private readonly openVideoModalHandler = () => {
        this.showVideoModal = true;
    };

    ngOnInit() {
        window.addEventListener('openVideoModal', this.openVideoModalHandler);
    }

    ngOnDestroy() {
        window.removeEventListener('openVideoModal', this.openVideoModalHandler);
    }
}
