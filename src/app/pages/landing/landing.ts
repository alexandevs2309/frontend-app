import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TopbarWidget } from './components/topbar-widget.component';
import { HeroWidget } from './components/herowidget-modern';
import { FeaturesWidget } from './components/featureswidget';
import { TestimonialsWidget } from './components/testimonialswidget';
import { HighlightsWidget } from './components/highlightswidget';
import { PricingWidget } from './components/pricingwidget';
import { FooterWidget } from './components/footerwidget';
import { VideoModal } from './components/video-modal';
import { ScrollTopModule } from 'primeng/scrolltop';
import { TooltipModule } from 'primeng/tooltip';
import { HttpClientModule } from '@angular/common/http';

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
        DividerModule, 
        HttpClientModule
    ],
    template: `
        <div class="bg-white dark:bg-slate-900">
            <div id="home" class="landing-wrapper">
                <topbar-widget />
                
                <!-- Hero moderno -->
                <hero-widget />
                
                <!-- Features con fondo blanco -->
                <div class="bg-fixed bg-cover bg-center bg-[url('/assets/images/landing/7.png')] py-20 lg:py-32 relative overflow-hidden transform -skew-y-2" data-section="features">
                    <div class="absolute inset-0 bg-white/75 dark:bg-slate-900/75"></div>
                    <div class="relative z-10 transform skew-y-2">
                        <div class="container mx-auto px-6 lg:px-8">
                            <div class="text-center mb-20">
                                <span class="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full font-semibold text-sm mb-6 uppercase tracking-wide">Potencia Total</span>
                                <h2 class="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">Todo lo que necesitas.<br>Nada que sobre.</h2>
                                <p class="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">Cada módulo fue diseñado para resolver problemas reales de salones de belleza, desde la agenda hasta las finanzas.</p>
                            </div>
                            <features-widget />
                        </div>
                    </div>
                </div>
                
                <!-- AI Section con fondo oscuro -->
                <div class="bg-fixed bg-cover bg-center bg-[url('/assets/images/landing/9.png')] py-20 lg:py-32 relative overflow-hidden transform -skew-y-3" data-section="highlights">
                    <div class="absolute inset-0 bg-slate-900/70"></div>
                    <div class="relative z-10 transform skew-y-3">
                        <highlights-widget />
                    </div>
                </div>
                
                <!-- Testimonials con fondo claro -->
                <div class="bg-fixed bg-cover bg-center bg-[url('/assets/images/landing/5.png')] py-20 lg:py-32 relative overflow-hidden transform -skew-y-1" data-section="testimonials">
                    <div class="absolute inset-0 bg-slate-50/75 dark:bg-slate-800/75"></div>
                    <div class="relative z-10 transform skew-y-1">
                        <testimonials-widget />
                    </div>
                </div>
                
                <!-- Pricing con fondo claro -->
                <div class="bg-slate-100 dark:bg-slate-800 py-20 lg:py-32 relative overflow-hidden transform -skew-y-2" data-section="pricing">
                    <div class="relative z-10 transform skew-y-2">
                        <pricing-widget />
                    </div>
                </div>
                
                <!-- Footer -->
                <footer-widget />

            </div>
        </div>
        <video-modal [(visible)]="showVideoModal"></video-modal>
        <p-scrollTop [threshold]="300" styleClass="!right-6 !bg-linear-to-r !from-indigo-600 !to-purple-600 !border-0 !w-12 !h-12 shadow-lg hover:!scale-110 !transition-all !duration-300" pTooltip="Volver arriba" tooltipPosition="left">
            <i class="pi pi-chevron-up !text-xl text-white"></i>
        </p-scrollTop>
    `
})
export class Landing implements OnInit {
    showVideoModal = false;

    ngOnInit() {
        window.addEventListener('openVideoModal', () => {
            this.showVideoModal = true;
        });
    }
}
