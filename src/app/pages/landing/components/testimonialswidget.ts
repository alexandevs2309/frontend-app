import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CarouselModule } from 'primeng/carousel';

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
        <section id="testimonials">
            <div class="container mx-auto px-6 lg:px-8">
                <div class="text-center mb-20">
                    <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 mb-4">
                        ⭐ Testimonios
                    </div>
                    <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                        Lo que dicen nuestros <span class="text-indigo-600">Clientes</span>
                    </h2>
                    <p class="text-lg text-slate-600 dark:text-slate-300 max-w-4xl mx-auto">
                        Más de 340 peluquerías confían en Auron Suite para gestionar su negocio.
                    </p>
                </div>

                <!-- Testimonials Carousel -->
                <div class="mb-16">
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
                                <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-12 border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto">
                                    <!-- Stars -->
                                    <div class="flex justify-center mb-8">
                                        <div class="flex space-x-1">
                                            <i *ngFor="let star of getStars(testimonial.rating)" 
                                               class="pi pi-star-fill text-yellow-500 text-2xl"></i>
                                        </div>
                                    </div>
                                    
                                    <!-- Quote -->
                                    <blockquote class="text-2xl lg:text-3xl font-medium text-slate-900 dark:text-white mb-8 leading-relaxed text-center">
                                        "{{ testimonial.text }}"
                                    </blockquote>
                                    
                                    <!-- Author -->
                                    <div class="flex items-center justify-center space-x-6">
                                        <div class="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl bg-indigo-600">
                                            {{ testimonial.avatar }}
                                        </div>
                                        <div class="text-center">
                                            <div class="text-2xl font-bold text-slate-900 dark:text-white">{{ testimonial.name }}</div>
                                            <div class="text-lg text-slate-600 dark:text-slate-400">{{ testimonial.position }}</div>
                                            <div class="text-base text-slate-500 dark:text-slate-500">{{ testimonial.company }}</div>
                                            <div class="text-xs text-slate-400 mt-1">Cliente desde 2023</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ng-template>
                    </p-carousel>
                </div>

                <!-- Stats Section -->
                <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-12 border border-slate-200 dark:border-slate-700">
                    <div class="text-center mb-12">
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Números que Hablan</h3>
                        <p class="text-lg text-slate-600 dark:text-slate-300">La confianza de miles de profesionales</p>
                    </div>
                    
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div class="text-center">
                            <div class="text-4xl font-bold text-green-600 mb-2 counter" data-target="500">342</div>
                            <div class="text-slate-600 dark:text-slate-400 font-medium">Peluquerías Activas</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold text-blue-600 mb-2 counter" data-target="15000">2,847</div>
                            <div class="text-slate-600 dark:text-slate-400 font-medium">Empleados Registrados</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold text-purple-600 mb-2">4.9</div>
                            <div class="text-slate-600 dark:text-slate-400 font-medium">Rating Promedio</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold text-orange-600 mb-2">99.9%</div>
                            <div class="text-slate-600 dark:text-slate-400 font-medium">Satisfacción</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
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
            background-color: rgba(148, 163, 184, 0.4);
            transition: all 0.3s ease;
        }
        
        ::ng-deep .testimonial-carousel .p-carousel-indicator.p-highlight {
            background-color: rgb(79, 70, 229);
            transform: scale(1.2);
        }
        
        ::ng-deep .testimonial-carousel .p-carousel-prev,
        ::ng-deep .testimonial-carousel .p-carousel-next {
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            background-color: rgb(248, 250, 252);
            border: 1px solid rgb(226, 232, 240);
            color: rgb(71, 85, 105);
            transition: all 0.3s ease;
        }
        
        ::ng-deep .p-dark .testimonial-carousel .p-carousel-prev,
        ::ng-deep .p-dark .testimonial-carousel .p-carousel-next {
            background-color: rgb(30, 41, 59);
            border-color: rgb(71, 85, 105);
            color: rgb(203, 213, 225);
        }
        
        ::ng-deep .testimonial-carousel .p-carousel-prev:hover,
        ::ng-deep .testimonial-carousel .p-carousel-next:hover {
            background-color: rgb(226, 232, 240);
            transform: scale(1.1);
        }
        
        ::ng-deep .p-dark .testimonial-carousel .p-carousel-prev:hover,
        ::ng-deep .p-dark .testimonial-carousel .p-carousel-next:hover {
            background-color: rgb(51, 65, 85);
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
            text: 'Auron Suite transformó completamente la gestión de mi barbería. El sistema de ganancias por quincena mantiene a mis empleados motivados y el multitenancy nos da la seguridad que necesitamos.',
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

    ngOnInit() {}

    ngOnDestroy() {}

    getStars(rating: number): number[] {
        return Array(rating).fill(0);
    }
}