import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'highlights-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule],
    template: `
        <section class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="text-center mb-20">
                <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/10 text-white mb-4">
                    Operacion en cualquier pantalla
                </div>
                <h2 class="text-4xl lg:text-5xl font-bold text-white mb-6">
                    Tecnologia que <span class="text-sky-300">acompaña</span> tu operacion
                </h2>
                <p class="text-lg text-slate-300 max-w-4xl mx-auto">
                    Auron esta pensado para trabajar bien tanto en el mostrador como en escritorio o desde el celular.
                </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                <div class="order-2 lg:order-1">
                    <div class="relative mx-auto w-80 h-96">
                        <div class="bg-slate-800 rounded-3xl p-2 shadow-xl">
                            <div class="w-full h-full bg-slate-900 rounded-3xl overflow-hidden relative">
                                <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10"></div>

                                <div class="pt-8 px-4 h-full bg-linear-to-br from-indigo-600 to-sky-600">
                                    <div class="flex items-center justify-between mb-6">
                                        <div class="text-white font-bold">Auron Suite</div>
                                        <div class="w-8 h-8 bg-white/20 rounded-full"></div>
                                    </div>

                                    <div class="space-y-4">
                                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                            <div class="text-white text-sm">Ventas de hoy</div>
                                            <div class="text-green-300 font-bold text-xl">$847</div>
                                        </div>
                                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                            <div class="text-white text-sm">Proxima cita</div>
                                            <div class="text-blue-300 font-bold">15:30</div>
                                        </div>
                                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                            <div class="text-white text-sm">Empleados activos</div>
                                            <div class="text-purple-300 font-bold">6/8</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="order-1 lg:order-2">
                    <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                        <div class="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-8">
                            <i class="pi pi-fw pi-mobile text-4xl! text-indigo-600"></i>
                        </div>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-6">Acceso desde tu celular</h3>
                        <p class="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                            Revisa citas, ventas y actividad del negocio desde cualquier lugar sin depender solo del escritorio.
                        </p>

                        <div class="space-y-4">
                            <div class="flex items-center text-slate-700 dark:text-slate-300">
                                <i class="pi pi-check-circle text-indigo-600 mr-4 text-lg"></i>
                                <span>Interfaz tactil optimizada</span>
                            </div>
                            <div class="flex items-center text-slate-700 dark:text-slate-300">
                                <i class="pi pi-check-circle text-indigo-600 mr-4 text-lg"></i>
                                <span>Consulta rapida de citas y ventas</span>
                            </div>
                            <div class="flex items-center text-slate-700 dark:text-slate-300">
                                <i class="pi pi-check-circle text-indigo-600 mr-4 text-lg"></i>
                                <span>Lectura comoda desde el navegador</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                <div>
                    <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                        <div class="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-8">
                            <i class="pi pi-fw pi-desktop text-4xl! text-indigo-600"></i>
                        </div>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-6">Mas espacio para administrar</h3>
                        <p class="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                            En escritorio tienes una vista mas completa para revisar reportes, configuraciones y flujos con mayor detalle.
                        </p>

                        <div class="space-y-4">
                            <div class="flex items-center text-slate-700 dark:text-slate-300">
                                <i class="pi pi-check-circle text-indigo-600 mr-4 text-lg"></i>
                                <span>Dashboards visuales</span>
                            </div>
                            <div class="flex items-center text-slate-700 dark:text-slate-300">
                                <i class="pi pi-check-circle text-indigo-600 mr-4 text-lg"></i>
                                <span>Reportes exportables</span>
                            </div>
                            <div class="flex items-center text-slate-700 dark:text-slate-300">
                                <i class="pi pi-check-circle text-indigo-600 mr-4 text-lg"></i>
                                <span>Gestion de mas datos en menos pasos</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="relative">
                        <div class="bg-slate-800 rounded-2xl p-4 shadow-xl">
                            <div class="bg-slate-900 rounded-2xl overflow-hidden">
                                <div class="h-80 bg-linear-to-br from-slate-800 to-slate-900 p-6">
                                    <div class="flex items-center gap-2 mb-4">
                                        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div class="ml-4 text-slate-400 text-sm">auron-suite.com/dashboard</div>
                                    </div>

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

                                    <div class="bg-slate-700/50 rounded-lg h-32 flex items-center justify-center border border-slate-600">
                                        <div class="text-slate-400 text-sm">Panel de analisis operativo</div>
                                    </div>
                                </div>
                            </div>

                            <div class="w-16 h-4 bg-slate-700 mx-auto mt-2 rounded-b"></div>
                            <div class="w-24 h-2 bg-slate-600 mx-auto rounded"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-12 border border-slate-200 dark:border-slate-700">
                <div class="text-center mb-12">
                    <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Pensado para el ritmo del negocio</h3>
                    <p class="text-lg text-slate-600 dark:text-slate-300">Menos vueltas, mejor visibilidad y una operacion mas comoda para el equipo.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-6 text-center">
                        <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <i class="pi pi-calendar text-indigo-600 text-xl"></i>
                        </div>
                        <div class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Agenda y ventas</div>
                        <div class="text-sm text-slate-600 dark:text-slate-300">Consulta lo importante sin cambiar entre varias pantallas.</div>
                    </div>
                    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-6 text-center">
                        <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <i class="pi pi-users text-emerald-600 text-xl"></i>
                        </div>
                        <div class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Trabajo en equipo</div>
                        <div class="text-sm text-slate-600 dark:text-slate-300">Cada rol puede seguir el flujo diario con menos friccion operativa.</div>
                    </div>
                    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-6 text-center">
                        <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                            <i class="pi pi-mobile text-sky-600 text-xl"></i>
                        </div>
                        <div class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Acceso flexible</div>
                        <div class="text-sm text-slate-600 dark:text-slate-300">Funciona mejor tanto en mostrador como en escritorio o desde el celular.</div>
                    </div>
                    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-6 text-center">
                        <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <i class="pi pi-chart-line text-orange-600 text-xl"></i>
                        </div>
                        <div class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Control diario</div>
                        <div class="text-sm text-slate-600 dark:text-slate-300">Mas claridad para revisar actividad, clientes y decisiones del negocio.</div>
                    </div>
                </div>
            </div>
        </section>
    `
})
export class HighlightsWidget {}
