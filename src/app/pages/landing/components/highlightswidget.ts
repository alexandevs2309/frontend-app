import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'highlights-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule],
    template: `
        <section class="container mx-auto px-6 lg:px-8">
            <div class="text-center mb-20">
                <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/10 text-white mb-4">
                    ⚡ Inteligencia Artificial
                </div>
                <h2 class="text-4xl lg:text-5xl font-bold text-white mb-6">
                    IA que <span class="text-yellow-400">Potencia</span> tu Negocio
                </h2>
                <p class="text-lg text-slate-300 max-w-4xl mx-auto">
                    Auron Suite integra inteligencia artificial para optimizar operaciones y maximizar ganancias.
                </p>
            </div>

                <!-- Mobile First Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                    <div class="order-2 lg:order-1">
                        <div class="relative mx-auto w-80 h-96">
                            <!-- Mobile mockup -->
                            <div class="bg-slate-800 rounded-3xl p-2 shadow-xl">
                                <div class="w-full h-full bg-slate-900 rounded-3xl overflow-hidden relative">
                                    <!-- Notch -->
                                    <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10"></div>
                                    
                                    <!-- Screen content -->
                                    <div class="pt-8 px-4 h-full bg-linear-to-br from-indigo-600 to-purple-600">
                                        <!-- Header -->
                                        <div class="flex items-center justify-between mb-6">
                                            <div class="text-white font-bold">Auron Suite</div>
                                            <div class="w-8 h-8 bg-white/20 rounded-full"></div>
                                        </div>

                                        <!-- Stats cards -->
                                        <div class="space-y-4">
                                            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                                <div class="text-white text-sm">Ganancias Hoy</div>
                                                <div class="text-green-300 font-bold text-xl">$847</div>
                                            </div>
                                            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                                <div class="text-white text-sm">Próxima Cita</div>
                                                <div class="text-blue-300 font-bold">15:30</div>
                                            </div>
                                            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                                <div class="text-white text-sm">Empleados Activos</div>
                                                <div class="text-purple-300 font-bold">6/8</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="order-1 lg:order-2">
                        <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
                            <div class="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-8">
                                <i class="pi pi-fw pi-mobile text-4xl! text-indigo-600"></i>
                            </div>
                            <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-6">Optimizado para Móviles</h3>
                            <p class="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                                Gestiona tu barbería desde cualquier lugar. La app móvil de Auron Suite te permite
                                controlar citas, ver ganancias y gestionar empleados desde tu smartphone.
                            </p>

                            <div class="space-y-4">
                                <div class="flex items-center text-slate-700 dark:text-slate-300">
                                    <i class="pi pi-check-circle text-indigo-600 mr-4 text-lg"></i>
                                    <span>Interfaz táctil optimizada</span>
                                </div>
                                <div class="flex items-center text-slate-700 dark:text-slate-300">
                                    <i class="pi pi-check-circle text-indigo-600 mr-4 text-lg"></i>
                                    <span>Notificaciones push en tiempo real</span>
                                </div>
                                <div class="flex items-center text-slate-700 dark:text-slate-300">
                                    <i class="pi pi-check-circle text-indigo-600 mr-4 text-lg"></i>
                                    <span>Funciona offline</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Desktop Power Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
                            <div class="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-8">
                                <i class="pi pi-fw pi-desktop text-4xl! text-indigo-600"></i>
                            </div>
                            <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-6">Potencia de Escritorio</h3>
                            <p class="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                                Aprovecha al máximo las capacidades de Auron Suite en tu computadora.
                                Dashboards avanzados, reportes detallados y gestión completa de tu negocio.
                            </p>

                            <div class="space-y-4">
                                <div class="flex items-center text-slate-700 dark:text-slate-300">
                                    <i class="pi pi-check-circle text-indigo-600 mr-4 text-lg"></i>
                                    <span>Dashboards interactivos</span>
                                </div>
                                <div class="flex items-center text-slate-700 dark:text-slate-300">
                                    <i class="pi pi-check-circle text-indigo-600 mr-4 text-lg"></i>
                                    <span>Reportes exportables</span>
                                </div>
                                <div class="flex items-center text-slate-700 dark:text-slate-300">
                                    <i class="pi pi-check-circle text-indigo-600 mr-4 text-lg"></i>
                                    <span>Gestión masiva de datos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="relative">
                            <!-- Desktop mockup -->
                            <div class="bg-slate-800 rounded-lg p-4 shadow-xl">
                                <div class="bg-slate-900 rounded-lg overflow-hidden">
                                    <!-- Screen content -->
                                    <div class="h-80 bg-linear-to-br from-slate-800 to-slate-900 p-6">
                                        <!-- Browser bar -->
                                        <div class="flex items-center gap-2 mb-4">
                                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <div class="ml-4 text-slate-400 text-sm">auron-suite.com/dashboard</div>
                                        </div>

                                        <!-- Dashboard content -->
                                        <div class="grid grid-cols-3 gap-4 mb-4">
                                            <div class="bg-slate-700/50 rounded p-3 border border-slate-600">
                                                <div class="text-slate-400 text-xs">Ventas</div>
                                                <div class="text-green-400 font-bold">$12,847</div>
                                            </div>
                                            <div class="bg-slate-700/50 rounded p-3 border border-slate-600">
                                                <div class="text-slate-400 text-xs">Citas</div>
                                                <div class="text-blue-400 font-bold">156</div>
                                            </div>
                                            <div class="bg-slate-700/50 rounded p-3 border border-slate-600">
                                                <div class="text-slate-400 text-xs">Empleados</div>
                                                <div class="text-purple-400 font-bold">24</div>
                                            </div>
                                        </div>

                                        <!-- Chart area -->
                                        <div class="bg-slate-700/50 rounded-lg h-32 flex items-center justify-center border border-slate-600">
                                            <div class="text-slate-400 text-sm">📈 Analytics Avanzados</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Monitor stand -->
                                <div class="w-16 h-4 bg-slate-700 mx-auto mt-2 rounded-b"></div>
                                <div class="w-24 h-2 bg-slate-600 mx-auto rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Performance Stats -->
                <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-12 border border-slate-200 dark:border-slate-700">
                    <div class="text-center mb-12">
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Rendimiento Excepcional</h3>
                        <p class="text-lg text-slate-600 dark:text-slate-300">Optimizado para velocidad y confiabilidad</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div class="text-center">
                            <div class="text-4xl font-bold text-indigo-600 mb-2">< 2s</div>
                            <div class="text-slate-600 dark:text-slate-300">Tiempo de carga</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold text-green-600 mb-2">99.9%</div>
                            <div class="text-slate-600 dark:text-slate-300">Uptime garantizado</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                            <div class="text-slate-600 dark:text-slate-300">Monitoreo activo</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold text-orange-600 mb-2">SSL</div>
                            <div class="text-slate-600 dark:text-slate-300">Seguridad total</div>
                        </div>
                    </div>
                </div>
        </section>
    `
})
export class HighlightsWidget {}