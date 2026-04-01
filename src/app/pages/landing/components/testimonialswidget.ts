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
    text: string;
    fit: string;
}

@Component({
    selector: 'testimonials-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule, CarouselModule],
    template: `
        <section id="testimonials">
            <div class="max-w-[92rem] mx-auto px-6 lg:px-8">
                <div class="text-center mb-20">
                    <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 mb-4">
                        Escenarios ideales
                    </div>
                    <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                        Donde <span class="text-indigo-600">Auron aporta mas valor</span>
                    </h2>
                    <p class="text-lg text-slate-600 dark:text-slate-300 max-w-4xl mx-auto">
                        En vez de vender humo, aqui te mostramos los escenarios donde la plataforma suele aportar mas valor operativo hoy.
                    </p>
                </div>

                <div class="mb-16">
                    <p-carousel [value]="testimonials" [numVisible]="1" [numScroll]="1" [circular]="true" [autoplayInterval]="5000" [showIndicators]="true" [showNavigators]="true" class="testimonial-carousel">
                        <ng-template pTemplate="item" let-testimonial>
                            <div class="px-4">
                                <div class="bg-white dark:bg-slate-900 rounded-[2rem] p-10 lg:p-12 border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto shadow-[0_24px_90px_-58px_rgba(15,23,42,0.3)]">
                                    <div class="flex justify-center mb-8">
                                        <div class="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-4 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                            <i class="pi pi-briefcase"></i>
                                            {{ testimonial.fit }}
                                        </div>
                                    </div>

                                    <div class="text-2xl lg:text-3xl font-medium text-slate-900 dark:text-white mb-8 leading-relaxed text-center tracking-tight">
                                        {{ testimonial.text }}
                                    </div>

                                    <div class="flex items-center justify-center space-x-6">
                                        <div class="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl bg-indigo-600">
                                            {{ testimonial.avatar }}
                                        </div>
                                        <div class="text-center">
                                            <div class="text-2xl font-bold text-slate-900 dark:text-white">{{ testimonial.name }}</div>
                                            <div class="text-lg text-slate-600 dark:text-slate-400">{{ testimonial.position }}</div>
                                            <div class="text-base text-slate-500 dark:text-slate-500">{{ testimonial.company }}</div>
                                            <div class="text-xs text-slate-400 mt-1 uppercase tracking-[0.18em]">Escenario representativo</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ng-template>
                    </p-carousel>
                </div>

                <div class="bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-[2rem] p-10 lg:p-12 border border-slate-200 dark:border-slate-700 shadow-[0_28px_90px_-58px_rgba(15,23,42,0.28)]">
                    <div class="text-center mb-12">
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Senales de adopcion</h3>
                        <p class="text-lg text-slate-600 dark:text-slate-300">Indicadores visibles del ecosistema y del ritmo comercial</p>
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
            text: 'Ideal para negocios que necesitan ordenar agenda, ventas y caja sin complicar la operacion diaria.',
            fit: 'Operacion simple y ordenada'
        },
        {
            id: 2,
            name: 'Salón en crecimiento',
            position: 'Gestión operativa',
            company: 'Equipo mixto y más demanda',
            avatar: 'SC',
            text: 'Funciona bien cuando ya hay varios empleados y se vuelve importante controlar reportes, inventario y flujo de caja.',
            fit: 'Mas equipo, mas control'
        },
        {
            id: 3,
            name: 'Negocio con inventario',
            position: 'Control comercial',
            company: 'Ventas, productos y seguimiento',
            avatar: 'NI',
            text: 'Aporta mas valor cuando el negocio ya quiere combinar reservas, clientes frecuentes y control de productos desde un mismo lugar.',
            fit: 'Ventas + stock + seguimiento'
        },
        {
            id: 4,
            name: 'Operación multi-sucursal',
            position: 'Visión consolidada',
            company: 'Varios locales y supervisión central',
            avatar: 'MS',
            text: 'Encaja especialmente bien cuando hace falta comparar rendimiento entre sucursales y mantener orden operativo en varios puntos.',
            fit: 'Escala con visibilidad'
        }
    ];

    constructor(private landingService: LandingPublicService) {}

    ngOnInit() {
        this.metrics = this.landingService.getMetrics();
    }
    ngOnDestroy() {}

}
