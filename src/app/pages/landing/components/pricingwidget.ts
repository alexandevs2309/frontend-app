import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Router } from '@angular/router';

@Component({
    selector: 'pricing-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule],
    template: `
        <div id="pricing" class="py-20 px-6 lg:px-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
            <!-- Animated Background -->
            <div class="absolute inset-0">
                <div class="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
                <div class="absolute bottom-20 right-10 w-24 h-24 bg-white/5 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
                <div class="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full animate-pulse" style="animation-delay: 2s;"></div>
            </div>
            
            <div class="relative z-10">
                <div class="text-center mb-16">
                    <span class="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                        💎 Planes y Precios
                    </span>
                    <h2 class="text-4xl lg:text-6xl font-bold text-white mb-6">
                        Elige el plan perfecto para
                        <span class="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">tu barbería</span>
                    </h2>
                    <p class="text-xl text-white/80 max-w-3xl mx-auto">
                        Comienza gratis y escala según crezca tu negocio. Todos los planes incluyen soporte 24/7.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    <!-- Plan Free -->
                    <div class="relative transform hover:scale-105 transition-all duration-500 animate-fade-in-up">
                        <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 h-full flex flex-col">
                            <div class="text-center mb-8">
                                <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center">
                                    <i class="pi pi-gift text-2xl text-white"></i>
                                </div>
                                <h3 class="text-2xl font-bold text-white mb-2">Free</h3>
                                <div class="mb-4">
                                    <span class="text-5xl font-bold text-white">$0</span>
                                    <span class="text-white/60 ml-2">/ mes</span>
                                </div>
                                <p class="text-white/80 text-sm">Prueba sin compromiso</p>
                            </div>
                            
                            <div class="flex-grow mb-8">
                                <ul class="space-y-4">
                                    <li class="flex items-center text-white/90">
                                        <i class="pi pi-check-circle text-green-400 mr-3"></i>
                                        <span>Funciones básicas</span>
                                    </li>
                                    <li class="flex items-center text-white/90">
                                        <i class="pi pi-check-circle text-green-400 mr-3"></i>
                                        <span>Gestión simple</span>
                                    </li>
                                    <li class="flex items-center text-white/90">
                                        <i class="pi pi-check-circle text-green-400 mr-3"></i>
                                        <span>Soporte comunidad</span>
                                    </li>
                                    <li class="flex items-center text-white/90">
                                        <i class="pi pi-times-circle text-red-400 mr-3"></i>
                                        <span class="line-through opacity-60">Reportes avanzados</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <button pButton pRipple 
                                    label="Comenzar Gratis"
                                    (click)="selectPlan('free', 0)"
                                    class="bg-white/20 border-2 border-white/30 text-white hover:bg-white/30 w-full py-4 text-lg font-bold transition-all duration-300"
                                    [rounded]="true">
                            </button>
                        </div>
                    </div>

                    <!-- Plan Standard -->
                    <div class="relative transform hover:scale-105 transition-all duration-500 lg:-mt-8 animate-fade-in-up" style="animation-delay: 0.2s;">
                        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                            <span class="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-bold">
                                🔥 MÁS POPULAR
                            </span>
                        </div>
                        
                        <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 h-full flex flex-col ring-4 ring-yellow-400/50">
                            <div class="text-center mb-8">
                                <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center">
                                    <i class="pi pi-star text-2xl text-white"></i>
                                </div>
                                <h3 class="text-2xl font-bold text-white mb-2">Standard</h3>
                                <div class="mb-4">
                                    <span class="text-5xl font-bold text-white">$49</span>
                                    <span class="text-white/60 ml-2">/ mes</span>
                                </div>
                                <p class="text-white/80 text-sm">Para barberías en crecimiento</p>
                            </div>
                            
                            <div class="flex-grow mb-8">
                                <ul class="space-y-4">
                                    <li class="flex items-center text-white/90">
                                        <i class="pi pi-check-circle text-green-400 mr-3"></i>
                                        <span>Hasta 10 empleados</span>
                                    </li>
                                    <li class="flex items-center text-white/90">
                                        <i class="pi pi-check-circle text-green-400 mr-3"></i>
                                        <span>20 citas/día</span>
                                    </li>
                                    <li class="flex items-center text-white/90">
                                        <i class="pi pi-check-circle text-green-400 mr-3"></i>
                                        <span>Gestión de citas</span>
                                    </li>
                                    <li class="flex items-center text-white/90">
                                        <i class="pi pi-check-circle text-green-400 mr-3"></i>
                                        <span>Reportes básicos</span>
                                    </li>
                                    <li class="flex items-center text-white/90">
                                        <i class="pi pi-check-circle text-green-400 mr-3"></i>
                                        <span>Soporte prioritario</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <button pButton pRipple 
                                    label="Elegir Plan"
                                    (click)="selectPlan('standard', 49)"
                                    class="bg-gradient-to-r from-yellow-400 to-orange-500 border-0 text-black hover:from-yellow-500 hover:to-orange-600 w-full py-4 text-lg font-bold transition-all duration-300"
                                    [rounded]="true">
                            </button>
                            
                            <div class="text-center mt-4">
                                <span class="text-white/60 text-xs">
                                    <i class="pi pi-shield-check mr-1"></i>
                                    Garantía de 30 días
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Plan Enterprise -->
                    <div class="relative transform hover:scale-105 transition-all duration-500 animate-fade-in-up" style="animation-delay: 0.4s;">
                        <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 h-full flex flex-col">
                            <div class="text-center mb-8">
                                <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center">
                                    <i class="pi pi-building text-2xl text-white"></i>
                                </div>
                                <h3 class="text-2xl font-bold text-white mb-2">Enterprise</h3>
                                <div class="mb-4">
                                    <span class="text-5xl font-bold text-white">$149</span>
                                    <span class="text-white/60 ml-2">/ mes</span>
                                </div>
                                <p class="text-white/80 text-sm">Para cadenas grandes</p>
                            </div>
                            
                            <div class="flex-grow mb-8">
                                <ul class="space-y-4">
                                    <li class="flex items-center text-white/90">
                                        <i class="pi pi-check-circle text-green-400 mr-3"></i>
                                        <span>Empleados ilimitados</span>
                                    </li>
                                    <li class="flex items-center text-white/90">
                                        <i class="pi pi-check-circle text-green-400 mr-3"></i>
                                        <span>Citas ilimitadas</span>
                                    </li>
                                    <li class="flex items-center text-white/90">
                                        <i class="pi pi-check-circle text-green-400 mr-3"></i>
                                        <span>Multi-ubicación</span>
                                    </li>
                                    <li class="flex items-center text-white/90">
                                        <i class="pi pi-check-circle text-green-400 mr-3"></i>
                                        <span>API personalizada</span>
                                    </li>
                                    <li class="flex items-center text-white/90">
                                        <i class="pi pi-check-circle text-green-400 mr-3"></i>
                                        <span>Soporte dedicado 24/7</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <button pButton pRipple 
                                    label="Contactar Ventas"
                                    (click)="selectPlan('enterprise', 149)"
                                    class="bg-white/20 border-2 border-white/30 text-white hover:bg-white/30 w-full py-4 text-lg font-bold transition-all duration-300"
                                    [rounded]="true">
                            </button>
                            
                            <div class="text-center mt-4">
                                <span class="text-white/60 text-xs">
                                    <i class="pi pi-shield-check mr-1"></i>
                                    Garantía de 30 días
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- FAQ Section -->
                <div class="mt-20 text-center">
                    <h3 class="text-2xl font-bold text-white mb-8">¿Preguntas frecuentes?</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                            <h4 class="text-white font-bold mb-2">¿Puedo cambiar de plan?</h4>
                            <p class="text-white/80 text-sm">Sí, puedes actualizar o degradar tu plan en cualquier momento desde tu panel de control.</p>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                            <h4 class="text-white font-bold mb-2">¿Hay período de prueba?</h4>
                            <p class="text-white/80 text-sm">Todos los planes pagos incluyen 14 días de prueba gratuita. No se requiere tarjeta de crédito.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes fade-in-up {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .animate-fade-in-up {
                animation: fade-in-up 0.8s ease-out;
            }
        </style>
    `
})
export class PricingWidget implements OnInit {
    
    constructor(private router: Router) {}
    
    ngOnInit() {
        // Component initialization
    }
    
    selectPlan(planName: string, price: number) {
        this.router.navigate(['/auth/register'], {
            queryParams: { plan: planName.toLowerCase(), price: price }
        });
    }
}