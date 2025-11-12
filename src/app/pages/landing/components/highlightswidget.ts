import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AnimationService } from '../../../shared/services/animation.service';

@Component({
    selector: 'highlights-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule],
    template: `
        <div id="highlights" class="py-20 px-6 lg:px-20 relative overflow-hidden"
             style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);">

            <!-- Background decoration -->
            <div class="absolute inset-0 opacity-30">
                <div class="absolute top-32 left-16 w-96 h-96 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full blur-3xl"></div>
                <div class="absolute bottom-32 right-16 w-80 h-80 bg-linear-to-r from-purple-400 to-pink-500 rounded-full blur-3xl"></div>
            </div>

            <div class="relative z-10">
                <div class="text-center mb-20 animate-on-scroll" data-direction="top">
                    <span class="inline-block px-4 py-2 bg-linear-to-r from-cyan-400 to-blue-500 text-black font-semibold rounded-full text-sm mb-4">⚡ Potencia Total</span>
                    <h2 class="text-5xl lg:text-6xl font-bold text-white mb-6">
                        Funciona en <span class="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Cualquier Lugar</span>
                    </h2>
                    <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                        Auron-Suite está optimizado para funcionar perfectamente en todos los dispositivos y plataformas.
                    </p>
                </div>

                <!-- Mobile First Section -->
                <div class="grid grid-cols-12 gap-12 items-center mb-32">
                    <div class="col-span-12 lg:col-span-6 order-2 lg:order-1 animate-on-scroll" data-direction="left">
                        <div class="relative">
                            <!-- Mobile mockup -->
                            <div class="relative mx-auto w-80 h-96 bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-2 shadow-2xl">
                                <!-- Phone frame -->
                                <div class="w-full h-full bg-black rounded-3xl overflow-hidden relative">
                                    <!-- Notch -->
                                    <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>

                                    <!-- Screen content -->
                                    <div class="pt-8 px-4 h-full bg-linear-to-br from-blue-900 to-purple-900">
                                        <!-- Header -->
                                        <div class="flex items-center justify-between mb-6">
                                            <div class="text-white font-bold">Auron-Suite</div>
                                            <div class="w-8 h-8 bg-white/20 rounded-full"></div>
                                        </div>

                                        <!-- Stats cards -->
                                        <div class="space-y-4">
                                            <div class="glass-effect rounded-xl p-4">
                                                <div class="text-white text-sm">Ganancias Hoy</div>
                                                <div class="text-green-400 font-bold text-xl">$847</div>
                                            </div>
                                            <div class="glass-effect rounded-xl p-4">
                                                <div class="text-white text-sm">Próxima Cita</div>
                                                <div class="text-blue-400 font-bold">15:30</div>
                                            </div>
                                            <div class="glass-effect rounded-xl p-4">
                                                <div class="text-white text-sm">Empleados Activos</div>
                                                <div class="text-purple-400 font-bold">6/8</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Floating elements -->
                                <div class="absolute -top-4 -right-4 glass-effect rounded-xl p-3 animate-bounce" style="animation-delay: 0.5s;">
                                    <div class="text-xl">📱</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-span-12 lg:col-span-6 order-1 lg:order-2 animate-on-scroll" data-direction="right">
                        <div class="glass-effect rounded-3xl p-8 border border-white/20">
                            <div class="flex items-center justify-center w-20 h-20 bg-linear-to-r from-cyan-400 to-blue-500 rounded-3xl mb-8">
                                <i class="pi pi-fw pi-mobile !text-4xl text-black"></i>
                            </div>
                            <h3 class="text-4xl font-bold text-white mb-6">Optimizado para Móviles</h3>
                            <p class="text-xl text-gray-300 mb-8 leading-relaxed">
                                Gestiona tu barbería desde cualquier lugar. La app móvil de Auron-Suite te permite
                                controlar citas, ver ganancias y gestionar empleados desde tu smartphone.
                            </p>

                            <div class="space-y-4">
                                <div class="flex items-center text-gray-300">
                                    <i class="pi pi-check-circle text-cyan-400 mr-4 text-xl"></i>
                                    <span class="text-lg">Interfaz táctil optimizada</span>
                                </div>
                                <div class="flex items-center text-gray-300">
                                    <i class="pi pi-check-circle text-cyan-400 mr-4 text-xl"></i>
                                    <span class="text-lg">Notificaciones push en tiempo real</span>
                                </div>
                                <div class="flex items-center text-gray-300">
                                    <i class="pi pi-check-circle text-cyan-400 mr-4 text-xl"></i>
                                    <span class="text-lg">Funciona offline</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Desktop Power Section -->
                <div class="grid grid-cols-12 gap-12 items-center">
                    <div class="col-span-12 lg:col-span-6 animate-on-scroll" data-direction="left">
                        <div class="glass-effect rounded-3xl p-8 border border-white/20">
                            <div class="flex items-center justify-center w-20 h-20 bg-linear-to-r from-purple-400 to-pink-500 rounded-3xl mb-8">
                                <i class="pi pi-fw pi-desktop !text-4xl text-white"></i>
                            </div>
                            <h3 class="text-4xl font-bold text-white mb-6">Potencia de Escritorio</h3>
                            <p class="text-xl text-gray-300 mb-8 leading-relaxed">
                                Aprovecha al máximo las capacidades de Auron-Suite en tu computadora.
                                Dashboards avanzados, reportes detallados y gestión completa de tu negocio.
                            </p>

                            <div class="space-y-4">
                                <div class="flex items-center text-gray-300">
                                    <i class="pi pi-check-circle text-purple-400 mr-4 text-xl"></i>
                                    <span class="text-lg">Dashboards interactivos</span>
                                </div>
                                <div class="flex items-center text-gray-300">
                                    <i class="pi pi-check-circle text-purple-400 mr-4 text-xl"></i>
                                    <span class="text-lg">Reportes exportables</span>
                                </div>
                                <div class="flex items-center text-gray-300">
                                    <i class="pi pi-check-circle text-purple-400 mr-4 text-xl"></i>
                                    <span class="text-lg">Gestión masiva de datos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-span-12 lg:col-span-6 animate-on-scroll" data-direction="right">
                        <div class="relative">
                            <!-- Desktop mockup -->
                            <div class="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-4 shadow-2xl">
                                <!-- Monitor frame -->
                                <div class="bg-black rounded-xl overflow-hidden">
                                    <!-- Screen content -->
                                    <div class="h-80 bg-linear-to-br from-gray-900 to-black p-6">
                                        <!-- Browser bar -->
                                        <div class="flex items-center gap-2 mb-4">
                                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <div class="ml-4 text-gray-400 text-sm">auron-suite.com/dashboard</div>
                                        </div>

                                        <!-- Dashboard content -->
                                        <div class="grid grid-cols-3 gap-4 mb-4">
                                            <div class="glass-effect rounded p-3">
                                                <div class="text-gray-400 text-xs">Ventas</div>
                                                <div class="text-green-400 font-bold">$12,847</div>
                                            </div>
                                            <div class="glass-effect rounded p-3">
                                                <div class="text-gray-400 text-xs">Citas</div>
                                                <div class="text-blue-400 font-bold">156</div>
                                            </div>
                                            <div class="glass-effect rounded p-3">
                                                <div class="text-gray-400 text-xs">Empleados</div>
                                                <div class="text-purple-400 font-bold">24</div>
                                            </div>
                                        </div>

                                        <!-- Chart area -->
                                        <div class="glass-effect rounded-lg h-32 flex items-center justify-center">
                                            <div class="text-gray-400 text-sm">📈 Analytics Avanzados</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Monitor stand -->
                                <div class="w-16 h-4 bg-gray-700 mx-auto mt-2 rounded-b"></div>
                                <div class="w-24 h-2 bg-gray-600 mx-auto rounded"></div>
                            </div>

                            <!-- Floating elements -->
                            <div class="absolute -top-6 -left-6 glass-effect rounded-xl p-3 animate-bounce" style="animation-delay: 1s;">
                                <div class="text-xl">💻</div>
                            </div>
                            <div class="absolute -bottom-4 -right-4 glass-effect rounded-xl p-3 animate-bounce" style="animation-delay: 1.5s;">
                                <div class="text-xl">📊</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Performance Stats -->
                <div class="mt-32 animate-on-scroll" data-direction="bottom">
                    <div class="glass-effect rounded-3xl p-12 border border-white/20">
                        <div class="text-center mb-12">
                            <h3 class="text-4xl font-bold text-white mb-4">Rendimiento Excepcional</h3>
                            <p class="text-xl text-gray-300">Optimizado para velocidad y confiabilidad</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div class="text-center">
                                <div class="text-5xl font-bold text-cyan-400 mb-2">< 2s</div>
                                <div class="text-gray-300">Tiempo de carga</div>
                            </div>
                            <div class="text-center">
                                <div class="text-5xl font-bold text-green-400 mb-2">99.9%</div>
                                <div class="text-gray-300">Uptime garantizado</div>
                            </div>
                            <div class="text-center">
                                <div class="text-5xl font-bold text-purple-400 mb-2">24/7</div>
                                <div class="text-gray-300">Monitoreo activo</div>
                            </div>
                            <div class="text-center">
                                <div class="text-5xl font-bold text-yellow-400 mb-2">SSL</div>
                                <div class="text-gray-300">Seguridad total</div>
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
            transform: translateY(20px) scale(0.95);
            transition: all 0.6s ease;
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
export class HighlightsWidget implements OnInit, OnDestroy {
    constructor(private animationService: AnimationService) {}

    ngOnInit() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement;
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0) scale(1)';
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
