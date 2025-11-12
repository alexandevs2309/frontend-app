import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TopbarWidget } from './components/topbarwidget.component';
import { HeroWidget } from './components/herowidget';
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
        <div class="bg-surface-0 dark:bg-surface-900">
            <div id="home" class="landing-wrapper">
                <topbar-widget class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static" />
                <hero-widget (openVideoModal)="showVideoModal = true" />
                <features-widget />
                <testimonials-widget />
                <highlights-widget />
                <pricing-widget />
                <footer-widget />

            </div>
        </div>
        <video-modal [(visible)]="showVideoModal"></video-modal>
        <p-scrollTop [threshold]="300" styleClass="!right-6 !bg-linear-to-r !from-blue-500 !to-purple-600 !border-0 !w-12 !h-12 shadow-lg hover:!scale-110 !transition-all !duration-300" pTooltip="Volver arriba" tooltipPosition="left">
            <i class="pi pi-chevron-up !text-xl text-white"></i>
        </p-scrollTop>
    `
})
export class Landing {
    showVideoModal = false;
}
