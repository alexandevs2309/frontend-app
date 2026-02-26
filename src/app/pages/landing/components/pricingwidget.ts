import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnimationService } from '../../../shared/services/animation.service';
import { LandingPublicService, PublicPlan } from '../../../core/services/landing-public.service';

@Component({
    selector: 'pricing-widget',
    standalone: true,
    imports: [ButtonModule, RippleModule, RouterModule, CommonModule],
    templateUrl: './pricingwidget.html',
    styleUrls: ['./pricingwidget.scss']
})
export class PricingWidget implements OnInit, OnDestroy {
    plans: PublicPlan[] = [];

    constructor(
        private router: Router,
        private animationService: AnimationService,
        private landingService: LandingPublicService
    ) {}

    ngOnInit() {
        // Datos estáticos - render instantáneo, sin HTTP calls
        this.plans = this.landingService.getPlans();
    }

    ngOnDestroy() {
        this.animationService.destroy();
    }

    getPlanDisplayName(name: string): string {
        const names: { [key: string]: string } = {
            'free': 'Free',
            'basic': 'Basic',
            'standard': 'Standard',
            'premium': 'Premium',
            'enterprise': 'Enterprise'
        };
        return names[name] || name.charAt(0).toUpperCase() + name.slice(1);
    }

    getPlanButtonText(name: string): string {
        const texts: { [key: string]: string } = {
            'free': 'Comenzar Gratis',
            'basic': 'Elegir Plan',
            'standard': 'Elegir Plan',
            'premium': 'Elegir Plan',
            'enterprise': 'Contactar Ventas'
        };
        return texts[name] || 'Elegir Plan';
    }

    getPlanFeatures(plan: PublicPlan): string[] {
        return plan.features;
    }
    
    getPlanDescription(name: string): string {
        const descriptions: { [key: string]: string } = {
            'free': 'Prueba sin compromiso',
            'basic': 'Para barberías pequeñas',
            'standard': 'Para barberías en crecimiento',
            'premium': 'Para barberías establecidas',
            'enterprise': 'Para cadenas grandes'
        };
        return descriptions[name] || 'Plan personalizado';
    }
    
    getPlanIcon(name: string): string {
        const icons: { [key: string]: string } = {
            'free': 'pi pi-gift',
            'basic': 'pi pi-home',
            'standard': 'pi pi-star',
            'premium': 'pi pi-crown',
            'enterprise': 'pi pi-building'
        };
        return icons[name] || 'pi pi-star';
    }
    
    getPlanButtonClass(name: string): string {
        if (this.isPopularPlan(name)) {
            return 'bg-linear-to-r from-yellow-400 to-orange-500 border-0 text-black hover:from-yellow-500 hover:to-orange-600';
        }
        return 'bg-white/20 border-2 border-white/30 text-white hover:bg-white/30';
    }
    
    isPopularPlan(name: string): boolean {
        const plan = this.plans.find(p => p.name === name);
        return plan?.popular || false;
    }
    
    showGuarantee(name: string): boolean {
        return name !== 'free';
    }
    
    selectPlan(planName: string, price: number) {
        this.router.navigate(['/auth/register'], {
            queryParams: { plan: planName.toLowerCase(), price: price }
        });
    }
    
    contactEnterprise() {
        // Scroll to contact section or open contact modal
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Fallback: navigate to contact page or open email
            window.location.href = 'mailto:ventas@auron-suite.com?subject=Consulta Plan Empresarial';
        }
    }
}