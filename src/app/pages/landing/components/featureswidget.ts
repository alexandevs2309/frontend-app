import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'features-widget',
    imports: [ButtonModule, RippleModule, CommonModule],
    template: `
        <div id="features" class="py-20 px-6 lg:px-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div class="text-center mb-20">
                <span class="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-medium mb-4">
                    ✨ Funcionalidades Principales
                </span>
                <h2 class="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                    Todo lo que necesitas para
                    <span class="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">gestionar tu barbería</span>
                </h2>
                <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    Desde la agenda hasta el punto de venta, pasando por el control de empleados y ganancias. Una solución completa.
                </p>
            </div>

            <!-- Feature 1: POS System -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32" #feature1>
                <div class="order-2 lg:order-1">
                    <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-500">
                        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                            <div class="flex items-center justify-between mb-6">
                                <h4 class="text-white font-bold text-lg">Sistema POS</h4>
                                <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                            
                            <div class="space-y-4">
                                <div class="bg-white/20 rounded-lg p-4">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-white/80 text-sm">Corte + Barba</span>
                                        <span class="text-white font-bold">$25.00</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-white/80 text-sm">Empleado: Carlos</span>
                                        <span class="text-green-300 text-sm">Comisión: $5.00</span>
                                    </div>
                                </div>
                                
                                <div class="bg-white/20 rounded-lg p-4">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-white/80 text-sm">Shampoo Premium</span>
                                        <span class="text-white font-bold">$8.00</span>
                                    </div>
                                    <div class="text-white/60 text-xs">Stock: 15 unidades</div>
                                </div>
                                
                                <div class="border-t border-white/20 pt-4">
                                    <div class="flex justify-between items-center">
                                        <span class="text-white font-bold">Total:</span>
                                        <span class="text-white font-bold text-xl">$33.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="order-1 lg:order-2" [class.animate-slide-in-right]="feature1Visible">
                    <div class="space-y-6">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <i class="pi pi-shopping-cart text-green-600 text-xl"></i>
                            </div>
                            <h3 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                                Sistema POS Inteligente
                            </h3>
                        </div>
                        
                        <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            Procesa ventas, calcula comisiones automáticamente y mantén control total del inventario. 
                            Cada venta genera ganancias para tus empleados al instante.
                        </p>
                        
                        <div class="space-y-4">
                            <div class="flex items-center space-x-3">
                                <i class="pi pi-check-circle text-green-500"></i>
                                <span class="text-gray-700 dark:text-gray-300">Cálculo automático de comisiones</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <i class="pi pi-check-circle text-green-500"></i>
                                <span class="text-gray-700 dark:text-gray-300">Control de inventario en tiempo real</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <i class="pi pi-check-circle text-green-500"></i>
                                <span class="text-gray-700 dark:text-gray-300">Notificaciones instantáneas a empleados</span>
                            </div>
                        </div>
                        
                        <button pButton pRipple label="Ver Demo POS" icon="pi pi-play" 
                                class="bg-green-500 border-green-500 hover:bg-green-600 px-6 py-3" [rounded]="true"></button>
                    </div>
                </div>
            </div>

            <!-- Feature 2: Appointments -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32" #feature2>
                <div [class.animate-slide-in-left]="feature2Visible">
                    <div class="space-y-6">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <i class="pi pi-calendar text-blue-600 text-xl"></i>
                            </div>
                            <h3 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                                Agenda Inteligente
                            </h3>
                        </div>
                        
                        <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            Gestiona citas, asigna empleados y optimiza tu tiempo. Los clientes pueden reservar online 
                            y recibir recordatorios automáticos.
                        </p>
                        
                        <div class="space-y-4">
                            <div class="flex items-center space-x-3">
                                <i class="pi pi-check-circle text-blue-500"></i>
                                <span class="text-gray-700 dark:text-gray-300">Reservas online 24/7</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <i class="pi pi-check-circle text-blue-500"></i>
                                <span class="text-gray-700 dark:text-gray-300">Recordatorios automáticos por SMS/Email</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <i class="pi pi-check-circle text-blue-500"></i>
                                <span class="text-gray-700 dark:text-gray-300">Asignación inteligente de empleados</span>
                            </div>
                        </div>
                        
                        <button pButton pRipple label="Ver Calendario" icon="pi pi-calendar" 
                                class="bg-blue-500 border-blue-500 hover:bg-blue-600 px-6 py-3" [rounded]="true"></button>
                    </div>
                </div>
                
                <div>
                    <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-500">
                        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                            <div class="flex items-center justify-between mb-6">
                                <h4 class="text-white font-bold text-lg">Agenda del Día</h4>
                                <span class="text-white/80 text-sm">Miércoles, 15 Ene</span>
                            </div>
                            
                            <div class="space-y-3">
                                <div class="bg-white/20 rounded-lg p-3 border-l-4 border-yellow-400">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="text-white font-medium">10:00 - Juan Pérez</span>
                                        <span class="text-yellow-300 text-sm">Confirmado</span>
                                    </div>
                                    <div class="text-white/80 text-sm">Corte + Barba • Carlos López</div>
                                </div>
                                
                                <div class="bg-white/20 rounded-lg p-3 border-l-4 border-green-400">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="text-white font-medium">11:30 - María García</span>
                                        <span class="text-green-300 text-sm">En proceso</span>
                                    </div>
                                    <div class="text-white/80 text-sm">Corte Dama • Ana Rodríguez</div>
                                </div>
                                
                                <div class="bg-white/20 rounded-lg p-3 border-l-4 border-blue-400">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="text-white font-medium">13:00 - Pedro Martín</span>
                                        <span class="text-blue-300 text-sm">Pendiente</span>
                                    </div>
                                    <div class="text-white/80 text-sm">Afeitado Clásico • Carlos López</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Feature 3: Earnings -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" #feature3>
                <div class="order-2 lg:order-1">
                    <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-500">
                        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                            <div class="flex items-center justify-between mb-6">
                                <h4 class="text-white font-bold text-lg">Ganancias Quincena</h4>
                                <div class="flex items-center space-x-2">
                                    <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span class="text-white/80 text-sm">Actualizado</span>
                                </div>
                            </div>
                            
                            <div class="space-y-4">
                                <div class="text-center mb-6">
                                    <div class="text-4xl font-bold text-white mb-2">$1,245.50</div>
                                    <div class="text-white/80">Total Quincena Actual</div>
                                </div>
                                
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center">
                                        <span class="text-white/80">Servicios (24)</span>
                                        <span class="text-white font-medium">$980.00</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-white/80">Productos (8)</span>
                                        <span class="text-white font-medium">$165.50</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-white/80">Bonos</span>
                                        <span class="text-white font-medium">$100.00</span>
                                    </div>
                                </div>
                                
                                <div class="bg-white/20 rounded-lg p-3 mt-4">
                                    <div class="text-white/80 text-sm mb-1">Próximo pago:</div>
                                    <div class="text-white font-bold">Viernes, 31 Enero</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="order-1 lg:order-2" [class.animate-slide-in-right]="feature3Visible">
                    <div class="space-y-6">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <i class="pi pi-dollar text-purple-600 text-xl"></i>
                            </div>
                            <h3 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                                Ganancias Automáticas
                            </h3>
                        </div>
                        
                        <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            Cada venta genera automáticamente las comisiones de tus empleados. Transparencia total 
                            con notificaciones en tiempo real y reportes detallados.
                        </p>
                        
                        <div class="space-y-4">
                            <div class="flex items-center space-x-3">
                                <i class="pi pi-check-circle text-purple-500"></i>
                                <span class="text-gray-700 dark:text-gray-300">Cálculo automático por quincena</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <i class="pi pi-check-circle text-purple-500"></i>
                                <span class="text-gray-700 dark:text-gray-300">Notificaciones instantáneas</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <i class="pi pi-check-circle text-purple-500"></i>
                                <span class="text-gray-700 dark:text-gray-300">Reportes detallados y exportables</span>
                            </div>
                        </div>
                        
                        <button pButton pRipple label="Ver Ganancias" icon="pi pi-chart-line" 
                                class="bg-purple-500 border-purple-500 hover:bg-purple-600 px-6 py-3" [rounded]="true"></button>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes slide-in-left {
                from {
                    opacity: 0;
                    transform: translateX(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slide-in-right {
                from {
                    opacity: 0;
                    transform: translateX(50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .animate-slide-in-left {
                animation: slide-in-left 0.8s ease-out;
            }
            
            .animate-slide-in-right {
                animation: slide-in-right 0.8s ease-out;
            }
        </style>
    `
})
export class FeaturesWidget implements OnInit {
    @ViewChild('feature1', { static: false }) feature1!: ElementRef;
    @ViewChild('feature2', { static: false }) feature2!: ElementRef;
    @ViewChild('feature3', { static: false }) feature3!: ElementRef;
    
    feature1Visible = false;
    feature2Visible = false;
    feature3Visible = false;

    ngOnInit() {
        this.setupIntersectionObserver();
    }

    private setupIntersectionObserver() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        if (target === this.feature1?.nativeElement) {
                            this.feature1Visible = true;
                        } else if (target === this.feature2?.nativeElement) {
                            this.feature2Visible = true;
                        } else if (target === this.feature3?.nativeElement) {
                            this.feature3Visible = true;
                        }
                    }
                });
            },
            { threshold: 0.3 }
        );

        setTimeout(() => {
            if (this.feature1?.nativeElement) observer.observe(this.feature1.nativeElement);
            if (this.feature2?.nativeElement) observer.observe(this.feature2.nativeElement);
            if (this.feature3?.nativeElement) observer.observe(this.feature3.nativeElement);
        }, 100);
    }
}