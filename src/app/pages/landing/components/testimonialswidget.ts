import { Component, OnDestroy, OnInit } from '@angular/core';
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
                        Testimonios
                    </div>
                    <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                        Lo que dicen nuestros <span class="text-indigo-600">clientes</span>
                    </h2>
                    <p class="text-lg text-slate-600 dark:text-slate-300 max-w-4xl mx-auto">
                        Negocios que usan Auron para organizar mejor su operacion diaria.
                    </p>
                </div>

                <div class="mb-16">
                    <p-carousel [value]="testimonials" [numVisible]="1" [numScroll]="1" [circular]="true" [autoplayInterval]="5000" [showIndicators]="true" [showNavigators]="true" class="testimonial-carousel">
                        <ng-template pTemplate="item" let-testimonial>
                            <div class="px-4">
                                <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-12 border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto">
                                    <div class="flex justify-center mb-8">
                                        <div class="flex space-x-1">
                                            <i *ngFor="let star of getStars(testimonial.rating)" class="pi pi-star-fill text-yellow-500 text-2xl"></i>
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
                                            <div class="text-xs text-slate-400 mt-1">Cliente activo</div>
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
                            <div class="text-4xl font-bold text-green-600 mb-2">340+</div>
                            <div class="text-slate-600 dark:text-slate-400 font-medium">Barberias activas</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold text-blue-600 mb-2">2,800+</div>
                            <div class="text-slate-600 dark:text-slate-400 font-medium">Usuarios registrados</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold text-purple-600 mb-2">4.8</div>
                            <div class="text-slate-600 dark:text-slate-400 font-medium">Valoracion promedio</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold text-orange-600 mb-2">98%</div>
                            <div class="text-slate-600 dark:text-slate-400 font-medium">Satisfaccion reportada</div>
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
            name: 'Carlos Martinez',
            position: 'Dueno',
            company: 'Barberia Elite, Santo Domingo',
            avatar: 'CM',
            rating: 5,
            text: 'Antes perdiamos mucho tiempo cerrando comisiones y revisando ventas. Con Auron el equipo trabaja con mas orden y tenemos mucha mas claridad al cierre.'
        },
        {
            id: 2,
            name: 'Maria Rodriguez',
            position: 'Gerente',
            company: 'Salon Glamour, Santiago',
            avatar: 'MR',
            rating: 5,
            text: 'Lo que mas valoramos es poder revisar la operacion del dia desde el celular. Eso nos da visibilidad sin depender de estar siempre en el local.'
        },
        {
            id: 3,
            name: 'Jose Garcia',
            position: 'Propietario',
            company: 'Barbershop Moderno, La Vega',
            avatar: 'JG',
            rating: 5,
            text: 'La agenda y los recordatorios nos ayudaron a ordenar mejor el dia. El negocio se siente mas controlado y el equipo trabaja con menos friccion.'
        },
        {
            id: 4,
            name: 'Ana Lopez',
            position: 'Directora',
            company: 'Cadena de salones Bella',
            avatar: 'AL',
            rating: 5,
            text: 'Cuando manejas varios locales, tener una sola vista del negocio cambia todo. Ahora podemos comparar rendimiento y detectar problemas mucho mas rapido.'
        }
    ];

    ngOnInit() {}
    ngOnDestroy() {}

    getStars(rating: number): number[] {
        return Array(rating).fill(0);
    }
}
