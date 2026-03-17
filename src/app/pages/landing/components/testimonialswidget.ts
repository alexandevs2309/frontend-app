import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CarouselModule } from 'primeng/carousel';
import { LandingPublicService, PublicMetrics } from '../../../core/services/landing-public.service';

interface Testimonial {
    id: number;
    name: string;
    position: string;
    company: string;
    avatar: string;
    rating: number;
    text: string;
}

@Component({
    selector: 'testimonials-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule, CarouselModule],
    template: `
        <section id="testimonials">
            <div class="max-w-7xl mx-auto px-6 lg:px-8">
                <div class="text-center mb-20">
                    <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 mb-4">
                        Casos de uso
                    </div>
                    <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                        Perfiles de negocio que <span class="text-indigo-600">encajan bien</span>
                    </h2>
                    <p class="text-lg text-slate-600 dark:text-slate-300 max-w-4xl mx-auto">
                        Ejemplos de operaciones que suelen beneficiarse de agenda, caja, inventario y control multi-sucursal.
                    </p>
                </div>

                <div class="mb-16">
                    <p-carousel [value]="testimonials" [numVisible]="1" [numScroll]="1" [circular]="true" [autoplayInterval]="5000" [showIndicators]="true" [showNavigators]="true" class="testimonial-carousel">
                        <ng-template pTemplate="item" let-testimonial>
                            <div class="px-4">
                                <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-12 border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto">
                                    <div class="flex justify-center mb-8">
                                        <div class="flex space-x-1">
                                            @for (star of getStars(testimonial.rating); track $index) {
                                                <i class="pi pi-star-fill text-yellow-500 text-2xl"></i>
                                            }
                                        </div>
                                    </div>

                                    <blockquote class="text-2xl lg:text-3xl font-medium text-slate-900 dark:text-white mb-8 leading-relaxed text-center">
                                        "{{ testimonial.text }}"
                                    </blockquote>

                                    <div class="flex items-center justify-center space-x-6">
                                        <div class="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl bg-indigo-600">
                                            {{ testimonial.avatar }}
                                        </div>
                                        <div class="text-center">
                                            <div class="text-2xl font-bold text-slate-900 dark:text-white">{{ testimonial.name }}</div>
                                            <div class="text-lg text-slate-600 dark:text-slate-400">{{ testimonial.position }}</div>
                                            <div class="text-base text-slate-500 dark:text-slate-500">{{ testimonial.company }}</div>
                                            <div class="text-xs text-slate-400 mt-1">Escenario representativo</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ng-template>
                    </p-carousel>
                </div>

                <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-12 border border-slate-200 dark:border-slate-700">
                    <div class="text-center mb-12">
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Senales de adopcion</h3>
                        <p class="text-lg text-slate-600 dark:text-slate-300">Indicadores de uso del ecosistema</p>
                    </div>

                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div class="text-center">
                            <div class="text-4xl font-bold text-green-600 mb-2">{{ metrics?.totalTenants ?? 180 }}</div>
                            <div class="text-slate-600 dark:text-slate-400 font-medium">Negocios registrados</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold text-blue-600 mb-2">{{ metrics?.activeTenants ?? 165 }}</div>
                            <div class="text-slate-600 dark:text-slate-400 font-medium">Negocios activos</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold text-purple-600 mb-2">{{ metrics?.growthRate ?? 25 }}%</div>
                            <div class="text-slate-600 dark:text-slate-400 font-medium">Crecimiento estimado</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold text-orange-600 mb-2">{{ metrics?.churnRate ?? 2.5 }}%</div>
                            <div class="text-slate-600 dark:text-slate-400 font-medium">Rotacion reportada</div>
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
    metrics: PublicMetrics | null = null;
    testimonials: Testimonial[] = [
        {
            id: 1,
            name: 'Barbería de barrio',
            position: 'Operación pequeña',
            company: '1 local, equipo reducido',
            avatar: 'BB',
            rating: 5,
            text: 'Ideal para negocios que necesitan ordenar agenda, ventas y caja sin complicar la operación diaria.'
        },
        {
            id: 2,
            name: 'Salón en crecimiento',
            position: 'Gestión operativa',
            company: 'Equipo mixto y más demanda',
            avatar: 'SC',
            rating: 5,
            text: 'Funciona bien cuando ya hay varios empleados y se vuelve importante controlar reportes, inventario y flujo de caja.'
        },
        {
            id: 3,
            name: 'Negocio con inventario',
            position: 'Control comercial',
            company: 'Ventas, productos y seguimiento',
            avatar: 'NI',
            rating: 5,
            text: 'Aporta más valor cuando el negocio ya quiere combinar reservas, clientes frecuentes y control de productos desde un mismo lugar.'
        },
        {
            id: 4,
            name: 'Operación multi-sucursal',
            position: 'Visión consolidada',
            company: 'Varios locales y supervisión central',
            avatar: 'MS',
            rating: 5,
            text: 'Encaja especialmente bien cuando hace falta comparar rendimiento entre sucursales y mantener orden operativo en varios puntos.'
        }
    ];

    constructor(private landingService: LandingPublicService) {}

    ngOnInit() {
        this.metrics = this.landingService.getMetrics();
    }
    ngOnDestroy() {}

    getStars(rating: number): number[] {
        return Array(rating).fill(0);
    }
}
