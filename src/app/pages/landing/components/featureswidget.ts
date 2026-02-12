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
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Ganancias por Quincena</h3>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">
                            Sistema automático que registra y notifica las ganancias de cada empleado por quincena en tiempo real.
                        </p>
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center text-green-600 dark:text-green-400 font-medium text-sm">
                                <i class="pi pi-check-circle mr-2"></i>
                                <span>Notificaciones automáticas</span>
                            </div>
                            <span class="text-xs text-slate-400">Usado por 89% de clientes</span>
                        </div>
                    </div>

                    <!-- Feature 2: Multitenancy -->
                    <div class="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                        <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                            <i class="pi pi-fw pi-building text-3xl! text-blue-600"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Multitenancy Avanzado</h3>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">
                            Cada peluquería tiene su propio espacio aislado con datos completamente separados y seguros.
                        </p>
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                                <i class="pi pi-shield mr-2"></i>
                                <span>Datos 100% aislados</span>
                            </div>
                            <span class="text-xs text-slate-400">ISO 27001</span>
                        </div>
                    </div>

                    <!-- Feature 3: Gestión de Citas -->
                    <div class="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                        <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-6">
                            <i class="pi pi-fw pi-calendar text-3xl! text-purple-600"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Gestión Inteligente de Citas</h3>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">
                            Sistema avanzado de reservas con validación en tiempo real y notificaciones automáticas.
                        </p>
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center text-purple-600 dark:text-purple-400 font-medium text-sm">
                                <i class="pi pi-clock mr-2"></i>
                                <span>Tiempo real</span>
                            </div>
                            <span class="text-xs text-slate-400">< 200ms</span>
                        </div>
                    </div>

                    <!-- Feature 4: POS Integrado -->
                    <div class="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                        <div class="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-6">
                            <i class="pi pi-fw pi-shopping-cart text-3xl! text-orange-600"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">POS Integrado</h3>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">
                            Punto de venta completo con facturación, inventario y reportes de ventas integrados.
                        </p>
                        <div class="flex items-center text-orange-600 dark:text-orange-400 font-medium text-sm">
                            <i class="pi pi-credit-card mr-2"></i>
                            <span>Pagos múltiples</span>
                        </div>
                    </div>

                    <!-- Feature 5: Analytics en Tiempo Real -->
                    <div class="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                        <div class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-6">
                            <i class="pi pi-fw pi-chart-line text-3xl! text-indigo-600"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Analytics Avanzados</h3>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">
                            Dashboards interactivos con métricas en tiempo real y reportes exportables.
                        </p>
                        <div class="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                            <i class="pi pi-chart-bar mr-2"></i>
                            <span>Reportes automáticos</span>
                        </div>
                    </div>

                    <!-- Feature 6: Seguridad Empresarial -->
                    <div class="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-6">
                            <i class="pi pi-fw pi-lock text-3xl! text-red-600"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Seguridad Empresarial</h3>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">
                            Autenticación JWT, roles granulares, auditoría completa y backup automático.
                        </p>
                        <div class="flex items-center text-red-600 dark:text-red-400 font-medium text-sm">
                            <i class="pi pi-verified mr-2"></i>
                            <span>Certificado SSL</span>
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