import { Component, OnInit, OnDestroy } from '@angular/core';
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
                    <!-- Feature 1: Ganancias por Quincena -->
                    <div class="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                        <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-6">
                            <i class="pi pi-fw pi-dollar text-3xl! text-green-600"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Cálculo Automático de Comisiones</h3>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">
                            El sistema calcula y notifica las ganancias de cada empleado automáticamente cada quincena. Sin Excel, sin errores, sin discusiones.
                        </p>
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center text-green-600 dark:text-green-400 font-medium text-sm">
                                <i class="pi pi-check-circle mr-2"></i>
                                <span>Ahorra 2-3 horas por quincena</span>
                            </div>
                        </div>
                    </div>

                    <!-- Feature 2: Seguridad de Datos -->
                    <div class="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                        <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                            <i class="pi pi-fw pi-shield text-3xl! text-blue-600"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Datos Protegidos y Privados</h3>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">
                            Tu información está completamente separada de otras barberías. Nadie más puede acceder a tus clientes, ventas o reportes.
                        </p>
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                                <i class="pi pi-lock mr-2"></i>
                                <span>Encriptación bancaria</span>
                            </div>
                            <span class="text-xs text-slate-400">Respaldos diarios</span>
                        </div>
                    </div>

                    <!-- Feature 3: Gestión de Citas -->
                    <div class="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                        <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-6">
                            <i class="pi pi-fw pi-calendar text-3xl! text-purple-600"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recordatorios Automáticos</h3>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">
                            Tus clientes reciben recordatorios por WhatsApp/SMS 24h antes de su cita. Reduce cancelaciones y citas perdidas notablemente.
                        </p>
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center text-purple-600 dark:text-purple-400 font-medium text-sm">
                                <i class="pi pi-bell mr-2"></i>
                                <span>Menos citas perdidas</span>
                            </div>
                            <span class="text-xs text-slate-400">WhatsApp/SMS</span>
                        </div>
                    </div>

                    <!-- Feature 4: POS Integrado -->
                    <div class="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                        <div class="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-6">
                            <i class="pi pi-fw pi-shopping-cart text-3xl! text-orange-600"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Punto de Venta Integrado</h3>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">
                            Registra ventas, servicios y productos en segundos. Reportes automáticos al final del día. Adiós a Excel y cuadernos.
                        </p>
                        <div class="flex items-center text-orange-600 dark:text-orange-400 font-medium text-sm">
                            <i class="pi pi-credit-card mr-2"></i>
                            <span>Múltiples métodos de pago</span>
                        </div>
                    </div>

                    <!-- Feature 5: Reportes en Tiempo Real -->
                    <div class="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                        <div class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-6">
                            <i class="pi pi-fw pi-chart-line text-3xl! text-indigo-600"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Reportes Visuales</h3>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">
                            Ve qué servicios generan más ingresos, qué empleados venden más, y en qué horarios tienes más demanda. Todo en tiempo real.
                        </p>
                        <div class="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                            <i class="pi pi-chart-bar mr-2"></i>
                            <span>Exportables a Excel/PDF</span>
                        </div>
                    </div>

                    <!-- Feature 6: Control de Inventario -->
                    <div class="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-6">
                            <i class="pi pi-fw pi-box text-3xl! text-red-600"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Control de Inventario</h3>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">
                            Alertas cuando un producto está por agotarse. Historial completo de entradas y salidas. Evita pérdidas por productos vencidos.
                        </p>
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