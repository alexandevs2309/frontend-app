import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MicroAnimationService } from './micro-animation.service';

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule],
    template: `
        <div id="features">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                    <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <i class="pi pi-fw pi-dollar text-3xl! text-green-600"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Comisiones mas claras</h3>
                    <p class="text-slate-600 dark:text-slate-300 mb-4">El sistema ayuda a calcular ingresos y comisiones por empleado sin hojas de calculo ni cierres manuales repetitivos.</p>
                    <div class="flex items-center text-green-600 dark:text-green-400 font-medium text-sm">
                        <i class="pi pi-check-circle mr-2"></i>
                        <span>Menos tiempo en calculos repetitivos</span>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                    <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <i class="pi pi-fw pi-shield text-3xl! text-blue-600"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Datos aislados por negocio</h3>
                    <p class="text-slate-600 dark:text-slate-300 mb-4">Cada tenant opera con su propia informacion para que clientes, ventas y reportes no se mezclen con otros negocios.</p>
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                            <i class="pi pi-lock mr-2"></i>
                            <span>Control de acceso por entorno</span>
                        </div>
                        <span class="text-xs text-slate-400">Respaldos y monitoreo</span>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                    <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <i class="pi pi-fw pi-calendar text-3xl! text-purple-600"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recordatorios y agenda</h3>
                    <p class="text-slate-600 dark:text-slate-300 mb-4">Organiza citas, empleados y disponibilidad desde una sola vista para reducir ausencias y mejorar la operacion diaria.</p>
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center text-purple-600 dark:text-purple-400 font-medium text-sm">
                            <i class="pi pi-bell mr-2"></i>
                            <span>Menos citas perdidas</span>
                        </div>
                        <span class="text-xs text-slate-400">Agenda centralizada</span>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                    <div class="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <i class="pi pi-fw pi-shopping-cart text-3xl! text-orange-600"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Caja y ventas integradas</h3>
                    <p class="text-slate-600 dark:text-slate-300 mb-4">Registra servicios y productos desde el mismo flujo para que la operacion de mostrador no dependa de varios sistemas.</p>
                    <div class="flex items-center text-orange-600 dark:text-orange-400 font-medium text-sm">
                        <i class="pi pi-credit-card mr-2"></i>
                        <span>Ventas mas ordenadas durante el dia</span>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                    <div class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <i class="pi pi-fw pi-chart-line text-3xl! text-indigo-600"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Reportes para decidir</h3>
                    <p class="text-slate-600 dark:text-slate-300 mb-4">Visualiza que vende mas, quien produce mejor y como se mueve el negocio para tomar decisiones con datos.</p>
                    <div class="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                        <i class="pi pi-chart-bar mr-2"></i>
                        <span>Lectura rapida del rendimiento</span>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                    <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <i class="pi pi-fw pi-box text-3xl! text-red-600"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Inventario bajo control</h3>
                    <p class="text-slate-600 dark:text-slate-300 mb-4">Lleva entradas, salidas y alertas de stock para reducir faltantes y tener mejor visibilidad sobre tus productos.</p>
                    <div class="flex items-center text-red-600 dark:text-red-400 font-medium text-sm">
                        <i class="pi pi-bell mr-2"></i>
                        <span>Alertas de stock bajo</span>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class FeaturesWidget implements OnInit, OnDestroy {
    constructor(private microAnimation: MicroAnimationService) {}

    ngOnInit() {
        setTimeout(() => this.microAnimation.initTitleAnimations(), 100);
    }

    ngOnDestroy() {
        this.microAnimation.destroy();
    }
}
