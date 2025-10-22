import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnimationService } from '../../../shared/services/animation.service';
import { LandingService, SubscriptionPlan, PaginatedResponse } from '../../../shared/services/landing.service';

@Component({
    selector: 'pricing-widget',
    standalone: true,
    imports: [ButtonModule, RippleModule, RouterModule, CommonModule],
    templateUrl: './pricingwidget.html',
    styleUrls: ['./pricingwidget.scss']
})
export class PricingWidget implements OnInit, OnDestroy {
    plans: SubscriptionPlan[] = [];
    isRealData = false;

    constructor(
        private router: Router,
        private animationService: AnimationService,
        private landingService: LandingService
    ) {}

    ngOnInit() {
        this.loadPlans();
    }

    loadPlans() {
        this.landingService.getSubscriptionPlans().subscribe({
            next: (response: PaginatedResponse<SubscriptionPlan>) => {
                // Filtrar solo los 3 planes principales para marketing
                const featuredPlans = ['basic', 'standard', 'premium'];
                this.plans = response.results
                    .filter(p => p.is_active && featuredPlans.includes(p.name))
                    .sort((a, b) => featuredPlans.indexOf(a.name) - featuredPlans.indexOf(b.name));
                this.isRealData = true;
            },
            error: (error) => {
                // Datos de fallback solo con los 3 planes principales
                this.plans = [
                    { id: 2, name: 'basic', price: '49.99', max_employees: 5, is_active: true } as SubscriptionPlan,
                    { id: 3, name: 'standard', price: '49.99', max_employees: 10, is_active: true } as SubscriptionPlan,
                    { id: 4, name: 'premium', price: '79.99', max_employees: 25, is_active: true } as SubscriptionPlan
                ];
                this.isRealData = false;
            }
        });
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

    getPlanFeatures(plan: SubscriptionPlan): string[] {
        // Usar features_list del backend si está disponible
        if (plan.features_list && plan.features_list.length > 0) {
            const employeeText = plan.max_employees === 0 ? 'Empleados ilimitados' : `Hasta ${plan.max_employees} empleados`;
            return [employeeText, ...plan.features_list];
        }
        
        // Features de fallback basadas en el diseño original
        const features: { [key: string]: string[] } = {
            'free': ['Funciones básicas', 'Gestión simple', 'Soporte comunidad'],
            'basic': [`Hasta ${plan.max_employees} empleados`, 'Gestión de citas', 'Reportes básicos'],
            'standard': [`Hasta ${plan.max_employees} empleados`, '20 citas/día', 'Gestión de citas', 'Reportes básicos', 'Soporte prioritario'],
            'premium': [`Hasta ${plan.max_employees} empleados`, 'Reportes avanzados', 'Multi-ubicación', 'Soporte prioritario'],
            'enterprise': ['Empleados ilimitados', 'Citas ilimitadas', 'Multi-ubicación', 'API personalizada', 'Soporte dedicado 24/7']
        };
        return features[plan.name] || ['Funciones básicas'];
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
            return 'bg-gradient-to-r from-yellow-400 to-orange-500 border-0 text-black hover:from-yellow-500 hover:to-orange-600';
        }
        return 'bg-white/20 border-2 border-white/30 text-white hover:bg-white/30';
    }
    
    isPopularPlan(name: string): boolean {
        return name === 'standard';
    }
    
    showGuarantee(name: string): boolean {
        return name !== 'free';
    }
    
    selectPlan(planName: string, price: number) {
        console.log('🎩 [PRICING] Plan seleccionado:', { plan: planName, price });
        console.log('🔄 [PRICING] Navegando a registro con parámetros...');
        this.router.navigate(['/auth/register'], {
            queryParams: { plan: planName.toLowerCase(), price: price }
        });
    }
    
    contactEnterprise() {
        console.log('🏢 [PRICING] Contacto empresarial solicitado');
        // Scroll to contact section or open contact modal
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            console.log('📍 [PRICING] Scrolling a sección de contacto');
            contactSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.log('📧 [PRICING] Abriendo email de contacto');
            // Fallback: navigate to contact page or open email
            window.location.href = 'mailto:ventas@auron-suite.com?subject=Consulta Plan Empresarial';
        }
    }
}