import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnimationService } from '../../../shared/services/animation.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule],
    template: `
        <div id="features" class="py-20 px-6 lg:px-20 relative overflow-hidden bg-surface-0 dark:bg-surface-900">
            
            <!-- Background decoration -->
            <div class="absolute inset-0 opacity-10 dark:opacity-20">
                <div class="absolute top-20 left-10 w-72 h-72 bg-linear-to-r from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
                <div class="absolute bottom-20 right-10 w-96 h-96 bg-linear-to-r from-yellow-400 to-orange-500 rounded-full blur-3xl"></div>
            </div>

            <div class="relative z-10">
                <div class="w-full text-center mb-16 animate-on-scroll" data-direction="top">
                        <span class="inline-block px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full text-sm mb-4">
                            💎 Características Premium
                        </span>

                        <h2 class="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                            Potencia tu <span class="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Barbería</span>
                        </h2>

                        <p class="text-xl text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">

                            Auron-Suite incluye todas las herramientas que necesitas para gestionar tu negocio de manera profesional y eficiente.
                        </p>
                        </div>


                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    <!-- Feature 1: Ganancias por Quincena -->
                    <div class="group animate-on-scroll" data-direction="left">
                        <div class="glass-effect rounded-2xl p-8 h-full hover:scale-105 transition-all duration-300 border border-white/20 shadow-xl">
                            <div class="flex items-center justify-center w-16 h-16 bg-linear-to-r from-green-400 to-emerald-500 rounded-2xl mb-6 group-hover:rotate-12 transition-transform duration-300">
                                <i class="pi pi-fw pi-dollar !text-3xl text-white"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ganancias por Quincena</h3>
                            <p class="text-gray-600 dark:text-gray-300 mb-4">
                                Sistema automático que registra y notifica las ganancias de cada empleado por quincena en tiempo real.
                            </p>
                            <div class="flex items-center text-green-600 font-semibold">
                                <i class="pi pi-check-circle mr-2"></i>
                                <span>Notificaciones automáticas</span>
                            </div>
                        </div>
                    </div>

                    <!-- Feature 2: Multitenancy -->
                    <div class="group animate-on-scroll" data-direction="top">
                        <div class="glass-effect rounded-2xl p-8 h-full hover:scale-105 transition-all duration-300 border border-white/20 shadow-xl">
                            <div class="flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-400 to-cyan-500 rounded-2xl mb-6 group-hover:rotate-12 transition-transform duration-300">
                                <i class="pi pi-fw pi-building !text-3xl text-white"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Multitenancy Avanzado</h3>
                            <p class="text-gray-600 dark:text-gray-300 mb-4">
                                Cada peluquería tiene su propio espacio aislado con datos completamente separados y seguros.
                            </p>
                            <div class="flex items-center text-blue-600 font-semibold">
                                <i class="pi pi-shield mr-2"></i>
                                <span>Datos 100% aislados</span>
                            </div>
                        </div>
                    </div>

                    <!-- Feature 3: Gestión de Citas -->
                    <div class="group animate-on-scroll" data-direction="right">
                        <div class="glass-effect rounded-2xl p-8 h-full hover:scale-105 transition-all duration-300 border border-white/20 shadow-xl">
                            <div class="flex items-center justify-center w-16 h-16 bg-linear-to-r from-purple-400 to-pink-500 rounded-2xl mb-6 group-hover:rotate-12 transition-transform duration-300">
                                <i class="pi pi-fw pi-calendar !text-3xl text-white"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Gestión Inteligente de Citas</h3>
                            <p class="text-gray-600 dark:text-gray-300 mb-4">
                                Sistema avanzado de reservas con validación en tiempo real y notificaciones automáticas.
                            </p>
                            <div class="flex items-center text-purple-600 font-semibold">
                                <i class="pi pi-clock mr-2"></i>
                                <span>Tiempo real</span>
                            </div>
                        </div>
                    </div>

                    <!-- Feature 4: POS Integrado -->
                    <div class="group animate-on-scroll" data-direction="left">
                        <div class="glass-effect rounded-2xl p-8 h-full hover:scale-105 transition-all duration-300 border border-white/20 shadow-xl">
                            <div class="flex items-center justify-center w-16 h-16 bg-linear-to-r from-orange-400 to-red-500 rounded-2xl mb-6 group-hover:rotate-12 transition-transform duration-300">
                                <i class="pi pi-fw pi-shopping-cart !text-3xl text-white"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">POS Integrado</h3>
                            <p class="text-gray-600 dark:text-gray-300 mb-4">
                                Punto de venta completo con facturación, inventario y reportes de ventas integrados.
                            </p>
                            <div class="flex items-center text-orange-600 font-semibold">
                                <i class="pi pi-credit-card mr-2"></i>
                                <span>Pagos múltiples</span>
                            </div>
                        </div>
                    </div>

                    <!-- Feature 5: Analytics en Tiempo Real -->
                    <div class="group animate-on-scroll" data-direction="bottom">
                        <div class="glass-effect rounded-2xl p-8 h-full hover:scale-105 transition-all duration-300 border border-white/20 shadow-xl">
                            <div class="flex items-center justify-center w-16 h-16 bg-linear-to-r from-indigo-400 to-blue-500 rounded-2xl mb-6 group-hover:rotate-12 transition-transform duration-300">
                                <i class="pi pi-fw pi-chart-line !text-3xl text-white"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Analytics Avanzados</h3>
                            <p class="text-gray-600 dark:text-gray-300 mb-4">
                                Dashboards interactivos con métricas en tiempo real y reportes exportables.
                            </p>
                            <div class="flex items-center text-indigo-600 font-semibold">
                                <i class="pi pi-chart-bar mr-2"></i>
                                <span>Reportes automáticos</span>
                            </div>
                        </div>
                    </div>

                    <!-- Feature 6: Seguridad Empresarial -->
                    <div class="group animate-on-scroll" data-direction="right">
                        <div class="glass-effect rounded-2xl p-8 h-full hover:scale-105 transition-all duration-300 border border-white/20 shadow-xl">
                            <div class="flex items-center justify-center w-16 h-16 bg-linear-to-r from-red-400 to-pink-500 rounded-2xl mb-6 group-hover:rotate-12 transition-transform duration-300">
                                <i class="pi pi-fw pi-lock !text-3xl text-white"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Seguridad Empresarial</h3>
                            <p class="text-gray-600 dark:text-gray-300 mb-4">
                                Autenticación JWT, roles granulares, auditoría completa y backup automático.
                            </p>
                            <div class="flex items-center text-red-600 font-semibold">
                                <i class="pi pi-verified mr-2"></i>
                                <span>Certificado SSL</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.4s ease, transform 0.4s ease;
            will-change: opacity, transform;
        }
        .animate-slide-in-left { animation: slideInFromLeft 1s ease forwards; }
        .animate-slide-in-right { animation: slideInFromRight 1s ease forwards; }
        .animate-slide-in-top { animation: slideInFromTop 1s ease forwards; }
        .animate-slide-in-bottom { animation: slideInFromBottom 1s ease forwards; }
        @keyframes slideInFromLeft {
            0% { opacity: 0; transform: translateX(-100px) scale(0.8); }
            100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideInFromRight {
            0% { opacity: 0; transform: translateX(100px) scale(0.8); }
            100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideInFromTop {
            0% { opacity: 0; transform: translateY(-100px) scale(0.8); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideInFromBottom {
            0% { opacity: 0; transform: translateY(100px) scale(0.8); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
    `]
})
export class FeaturesWidget implements OnInit, OnDestroy {
    constructor(private animationService: AnimationService) {}

    ngOnInit() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement;
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                    el.style.willChange = 'auto';
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    }

    ngOnDestroy() {
        this.animationService.destroy();
    }
}