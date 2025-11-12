import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CarouselModule } from 'primeng/carousel';
import { AnimationService } from '../../../shared/services/animation.service';

interface Testimonial {
    id: number;
    name: string;
    position: string;
    company: string;
    avatar: string;
    rating: number;
    text: string;
    color: string;
}

@Component({
    selector: 'testimonials-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule, CarouselModule],
    template: `
        <div id="testimonials" class="py-20 px-6 lg:px-20 bg-surface-50 dark:bg-surface-800 relative overflow-hidden">
            
            <!-- Background decoration -->
            <div class="absolute inset-0 opacity-10 dark:opacity-20">
                <div class="absolute top-16 right-20 w-80 h-80 bg-linear-to-r from-green-400 to-blue-500 rounded-full blur-3xl"></div>
                <div class="absolute bottom-16 left-20 w-96 h-96 bg-linear-to-r from-purple-400 to-pink-500 rounded-full blur-3xl"></div>
            </div>

            <div class="relative z-10">
                <div class="text-center mb-16 animate-on-scroll" data-direction="top">
                    <span class="inline-block px-4 py-2 bg-linear-to-r from-green-500 to-blue-600 text-white font-semibold rounded-full text-sm mb-4">⭐ Testimonios</span>
                    <h2 class="text-5xl lg:text-6xl font-bold text-surface-900 dark:text-white mb-6">
                        Lo que dicen nuestros <span class="bg-linear-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Clientes</span>
                    </h2>
                    <p class="text-xl text-surface-600 dark:text-surface-300 max-w-3xl mx-auto">
                        Miles de peluquerías confían en Auron-Suite para gestionar su negocio de manera profesional.
                    </p>
                </div>

                <!-- Testimonials Carousel -->
                <div class="mb-16 animate-on-scroll" data-direction="bottom">
                    <p-carousel 
                        [value]="testimonials" 
                        [numVisible]="1" 
                        [numScroll]="1" 
                        [circular]="true"
                        [autoplayInterval]="5000"
                        [showIndicators]="true"
                        [showNavigators]="true"
                        class="testimonial-carousel">
                        
                        <ng-template pTemplate="item" let-testimonial>
                            <div class="px-4">
                                <div class="glass-effect rounded-3xl p-12 border border-white/20 shadow-xl max-w-4xl mx-auto">
                                    <!-- Stars -->
                                    <div class="flex justify-center mb-8">
                                        <div class="flex space-x-1">
                                            <i *ngFor="let star of getStars(testimonial.rating)" 
                                               class="pi pi-star-fill text-yellow-400 text-2xl"></i>
                                        </div>
                                    </div>
                                    
                                    <!-- Quote -->
                                    <blockquote class="text-2xl lg:text-3xl font-medium text-surface-900 dark:text-white mb-8 leading-relaxed text-center">
                                        "{{ testimonial.text }}"
                                    </blockquote>
                                    
                                    <!-- Author -->
                                    <div class="flex items-center justify-center space-x-6">
                                        <div class="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                                             [ngStyle]="{'background': testimonial.color}">
                                            {{ testimonial.avatar }}
                                        </div>
                                        <div class="text-center">
                                            <div class="text-2xl font-bold text-surface-900 dark:text-white">{{ testimonial.name }}</div>
                                            <div class="text-lg text-surface-600 dark:text-surface-300">{{ testimonial.position }}</div>
                                            <div class="text-base text-surface-500 dark:text-surface-400">{{ testimonial.company }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ng-template>
                    </p-carousel>
                </div>

                <!-- Stats Section -->
                <div class="glass-effect rounded-3xl p-12 border border-white/20 shadow-2xl">
                    <div class="text-center mb-12">
                        <h3 class="text-4xl font-bold text-surface-900 dark:text-white mb-4">Números que Hablan</h3>
                        <p class="text-xl text-surface-600 dark:text-surface-300">La confianza de miles de profesionales</p>
                    </div>
                    
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div class="text-center animate-on-scroll" data-direction="left">
                            <div class="text-5xl font-bold text-green-500 mb-2 counter" data-target="500">0</div>
                            <div class="text-surface-600 dark:text-surface-300 font-semibold">Peluquerías Activas</div>
                        </div>
                        <div class="text-center animate-on-scroll" data-direction="top">
                            <div class="text-5xl font-bold text-blue-500 mb-2 counter" data-target="15000">0</div>
                            <div class="text-surface-600 dark:text-surface-300 font-semibold">Empleados Registrados</div>
                        </div>
                        <div class="text-center animate-on-scroll" data-direction="bottom">
                            <div class="text-5xl font-bold text-purple-500 mb-2">4.9</div>
                            <div class="text-surface-600 dark:text-surface-300 font-semibold">Rating Promedio</div>
                        </div>
                        <div class="text-center animate-on-scroll" data-direction="right">
                            <div class="text-5xl font-bold text-orange-500 mb-2">99.9%</div>
                            <div class="text-surface-600 dark:text-surface-300 font-semibold">Satisfacción</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        ::ng-deep .testimonial-carousel .p-carousel-indicators {
            padding: 1rem 0;
        }
        
        ::ng-deep .testimonial-carousel .p-carousel-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin: 0 0.5rem;
            background-color: rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
        }
        
        ::ng-deep .testimonial-carousel .p-carousel-indicator.p-highlight {
            background: linear-gradient(45deg, #10b981, #3b82f6);
            transform: scale(1.2);
        }
        
        ::ng-deep .testimonial-carousel .p-carousel-prev,
        ::ng-deep .testimonial-carousel .p-carousel-next {
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            transition: all 0.3s ease;
        }
        
        ::ng-deep .testimonial-carousel .p-carousel-prev:hover,
        ::ng-deep .testimonial-carousel .p-carousel-next:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
        }
    `]
})
export class TestimonialsWidget implements OnInit, OnDestroy {
    testimonials: Testimonial[] = [
        {
            id: 1,
            name: 'Carlos Martínez',
            position: 'Dueño',
            company: 'Barbería Elite',
            avatar: 'CM',
            rating: 5,
            text: 'Auron-Suite transformó completamente la gestión de mi barbería. El sistema de ganancias por quincena mantiene a mis empleados motivados y el multitenancy nos da la seguridad que necesitamos.',
            color: 'linear-gradient(45deg, #3b82f6, #8b5cf6)'
        },
        {
            id: 2,
            name: 'María Rodríguez',
            position: 'Gerente',
            company: 'Salón de Belleza Glamour',
            avatar: 'MR',
            rating: 5,
            text: 'La facilidad de uso es increíble. Mis empleados aprendieron a usar el sistema en menos de una hora. Los reportes automáticos me ahorran horas de trabajo cada semana.',
            color: 'linear-gradient(45deg, #10b981, #06b6d4)'
        },
        {
            id: 3,
            name: 'José García',
            position: 'Propietario',
            company: 'Barbershop Moderno',
            avatar: 'JG',
            rating: 5,
            text: 'El POS integrado y los analytics en tiempo real han revolucionado mi negocio. Ahora puedo tomar decisiones basadas en datos reales y mis ventas han aumentado un 40%.',
            color: 'linear-gradient(45deg, #f59e0b, #ef4444)'
        },
        {
            id: 4,
            name: 'Ana López',
            position: 'Directora',
            company: 'Cadena de Salones Bella',
            avatar: 'AL',
            rating: 5,
            text: 'Gestionar múltiples sucursales nunca fue tan fácil. El multitenancy nos permite tener todo centralizado pero con datos completamente separados. Excelente seguridad.',
            color: 'linear-gradient(45deg, #8b5cf6, #ec4899)'
        }
    ];

    constructor(private animationService: AnimationService) {}

    ngOnInit() {
        this.animationService.initScrollAnimations();
        
        // Intersection Observer para contadores
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('.counter');
                    counters.forEach(counter => this.animateCounter(counter as HTMLElement));
                }
            });
        });

        setTimeout(() => {
            const statsSection = document.querySelector('#testimonials .glass-effect:last-child');
            if (statsSection) observer.observe(statsSection);
        }, 100);
    }

    ngOnDestroy() {
        this.animationService.destroy();
    }

    getStars(rating: number): number[] {
        return Array(rating).fill(0);
    }

    private animateCounter(element: HTMLElement) {
        const target = parseInt(element.getAttribute('data-target') || '0');
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    }
}