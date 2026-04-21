import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { LandingPublicService, PublicPlan } from '../../../core/services/landing-public.service';
import { AnimationService } from '../../../shared/services/animation.service';
import { AppConfigService } from '../../../core/services/app-config.service';

@Component({
    selector: 'pricing-widget',
    standalone: true,
    imports: [ButtonModule, RippleModule, RouterModule, NgClass],
    templateUrl: './pricingwidget.html',
    styleUrls: ['./pricingwidget.scss']
})
export class PricingWidget implements OnInit, OnDestroy {
    plans: PublicPlan[] = [];

    constructor(
        private router: Router,
        private animationService: AnimationService,
        private landingService: LandingPublicService,
        private appConfig: AppConfigService
    ) {}

    ngOnInit() {
        this.landingService.getPlans().subscribe((plans) => {
            // Filtrar planes gratuitos - solo mostrar planes pagos con trial incluido
            this.plans = plans.filter(plan => plan.name !== 'free' && plan.name !== 'trial');
        });
    }

    ngOnDestroy() {
        this.animationService.destroy();
    }

    getPlanDisplayName(name: string): string {
        const plan = this.plans.find(p => p.name === name);
        return plan?.displayName || name.charAt(0).toUpperCase() + name.slice(1);
    }

    getPlanButtonText(name: string): string {
        const texts: { [key: string]: string } = {
            basic: 'Elegir Plan',
            standard: 'Elegir Plan',
            premium: 'Elegir Plan',
            enterprise: 'Contactar Ventas'
        };
        return texts[name] || 'Elegir Plan';
    }

    getPlanFeatures(plan: PublicPlan): string[] {
        return plan.technicalFeatures;
    }

    getPlanHighlights(plan: PublicPlan): string[] {
        return plan.highlightFeatures;
    }

    getPlanBenefits(plan: PublicPlan): string[] {
        return plan.commercialBenefits;
    }

    getPlanDescription(name: string): string {
        const descriptions: { [key: string]: string } = {
            basic: 'Para equipos pequeños - incluye 7 días de prueba gratis',
            standard: 'Para negocios en crecimiento - incluye 7 días de prueba gratis',
            premium: 'Para operaciones de mayor escala - incluye 7 días de prueba gratis',
            enterprise: 'Para cadenas grandes - incluye 7 días de prueba gratis'
        };
        return descriptions[name] || 'Plan personalizado - incluye 7 días de prueba gratis';
    }

    getPlanIcon(name: string): string {
        const icons: { [key: string]: string } = {
            basic: 'pi pi-home',
            standard: 'pi pi-star',
            premium: 'pi pi-crown',
            enterprise: 'pi pi-building'
        };
        return icons[name] || 'pi pi-star';
    }

    getCardClass(name: string): string {
        if (!this.isPopularPlan(name)) {
            return '';
        }

        return 'pricing-card--popular bg-linear-to-b from-indigo-50 via-white to-sky-50 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-900 shadow-[0_36px_110px_-48px_rgba(79,70,229,0.6)]';
    }

    isPopularPlan(name: string): boolean {
        const plan = this.plans.find(p => p.name === name);
        return plan?.popular || false;
    }

    showGuarantee(_name: string): boolean {
        return false;
    }

    selectPlan(planName: string, price: number) {
        this.router.navigate(['/auth/register'], {
            queryParams: { plan: planName.toLowerCase(), price }
        });
    }

    contactEnterprise() {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        window.location.href = `mailto:${this.appConfig.supportEmail()}?subject=${encodeURIComponent(`Consulta Plan Empresarial - ${this.appConfig.platformName()}`)}`;
    }
}
