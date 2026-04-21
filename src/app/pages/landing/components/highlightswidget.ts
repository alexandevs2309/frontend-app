import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'highlights-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule],
    template: `
        <section class="max-w-[92rem] mx-auto px-6 lg:px-8">
            <div class="text-center mb-20">
                <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/10 text-white mb-4">
                    Beneficios para crecer con orden
                </div>
                <h2 class="text-4xl lg:text-5xl font-bold text-white mb-6">
                    Beneficios que se <span class="text-sky-300">notan en el dia a dia</span>
                </h2>
                <p class="text-lg text-slate-300 max-w-4xl mx-auto">
                    Auron esta pensado para que barberias y salones ganen tiempo, control y una experiencia mas profesional para el cliente.
                </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                <div class="order-2 lg:order-1">
                    <div class="relative mx-auto max-w-[21rem]">
                        <div class="rounded-[2rem] border border-white/10 bg-white/6 p-3 backdrop-blur-xl shadow-[0_28px_90px_-54px_rgba(15,23,42,0.8)]">
                            <img src="assets/demo/auron-mobile-dashboard-1.png" alt="Mockup movil ilustrado de Auron Suite" class="w-full h-auto object-contain rounded-[1.5rem]" />
                        </div>
                    </div>
                </div>

                <div class="order-1 lg:order-2">
                    <div class="bg-slate-50/95 dark:bg-slate-800 rounded-[2rem] p-8 lg:p-10 border border-slate-200/80 dark:border-slate-700/80 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.28)]">
                        <div class="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-8">
                            <i class="pi pi-fw pi-mobile text-4xl! text-indigo-600"></i>
                        </div>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-6">Controla el negocio desde tu celular</h3>
                        <p class="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                            Revisa citas, ventas y actividad del negocio desde cualquier lugar sin depender solo del escritorio ni de llamadas para confirmar todo.
                        </p>

                        <div class="space-y-4">
                            <div class="flex items-center text-slate-700 dark:text-slate-300">
                                <i class="pi pi-check-circle text-indigo-600 mr-4 text-lg"></i>
                                <span>Interfaz tactil optimizada</span>
                            </div>
                            <div class="flex items-center text-slate-700 dark:text-slate-300">
                                <i class="pi pi-check-circle text-indigo-600 mr-4 text-lg"></i>
                                <span>Consulta rapida de citas, ventas y caja</span>
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
                    <div class="bg-slate-50/95 dark:bg-slate-800 rounded-[2rem] p-8 lg:p-10 border border-slate-200/80 dark:border-slate-700/80 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.28)]">
                        <div class="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-8">
                            <i class="pi pi-fw pi-desktop text-4xl! text-indigo-600"></i>
                        </div>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-6">Mas visibilidad para administrar mejor</h3>
                        <p class="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                            En escritorio tienes una vista mas completa para revisar reportes, configuraciones y flujos con mayor detalle sin perder tiempo entre herramientas separadas.
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
                        <div class="rounded-[2rem] border border-white/10 bg-white/6 p-3 backdrop-blur-xl shadow-[0_28px_90px_-54px_rgba(15,23,42,0.8)]">
                            <img src="assets/demo/auron-mockups-grid-light.png" alt="Mockups ilustrados de agenda, clientes, inventario y reportes" class="w-full h-auto object-contain rounded-[1.5rem]" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-slate-50/95 dark:bg-slate-800 rounded-[2rem] p-10 lg:p-12 border border-slate-200/80 dark:border-slate-700/80 shadow-[0_28px_90px_-58px_rgba(15,23,42,0.32)]">
                <div class="text-center mb-12">
                    <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Pensado para el ritmo real del negocio</h3>
                    <p class="text-lg text-slate-600 dark:text-slate-300">Menos vueltas, mejor visibilidad y una operacion mas comoda para el equipo.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-6 text-center">
                        <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <i class="pi pi-calendar text-indigo-600 text-xl"></i>
                        </div>
                        <div class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Agenda y ventas</div>
                        <div class="text-sm text-slate-600 dark:text-slate-300">Consulta lo importante sin cambiar entre varias pantallas ni depender de mensajes sueltos.</div>
                    </div>
                    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-6 text-center">
                        <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <i class="pi pi-users text-emerald-600 text-xl"></i>
                        </div>
                        <div class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Trabajo en equipo</div>
                        <div class="text-sm text-slate-600 dark:text-slate-300">Cada rol puede seguir el flujo diario con menos friccion operativa y menos errores.</div>
                    </div>
                    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-6 text-center">
                        <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                            <i class="pi pi-mobile text-sky-600 text-xl"></i>
                        </div>
                        <div class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Acceso flexible</div>
                        <div class="text-sm text-slate-600 dark:text-slate-300">Funciona bien tanto en mostrador como en escritorio o desde el celular.</div>
                    </div>
                    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-6 text-center">
                        <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <i class="pi pi-chart-line text-orange-600 text-xl"></i>
                        </div>
                        <div class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Control diario</div>
                        <div class="text-sm text-slate-600 dark:text-slate-300">Mas claridad para revisar actividad, clientes, ingresos y decisiones del negocio.</div>
                    </div>
                </div>
            </div>
        </section>
    `
})
export class HighlightsWidget {}
