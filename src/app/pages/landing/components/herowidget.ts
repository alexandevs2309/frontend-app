import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../../shared/services/animation.service';
import { LandingService, SaasMetrics } from '../../../shared/services/landing.service';

@Component({
    selector: 'hero-widget',
    standalone: true,
    imports: [ButtonModule, RippleModule, RouterModule, CommonModule],
    template: `
        <div id="hero" class="relative min-h-screen flex items-center overflow-hidden" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); background-attachment: fixed;">
            
            <!-- Floating particles background -->
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <div *ngFor="let particle of particles; trackBy: trackByIndex" 
                     class="absolute rounded-full bg-white opacity-20 animate-pulse"
                     [style.left.%]="particle.x"
                     [style.top.%]="particle.y"
                     [style.width.px]="particle.size"
                     [style.height.px]="particle.size"
                     [style.animation-delay.s]="particle.delay">
                </div>
            </div>

            <div class="container mx-auto px-6 lg:px-20 relative z-10">
                <div class="grid grid-cols-12 gap-8 items-center">
                    <!-- Content Column -->
                    <div class="col-span-12 lg:col-span-6 text-center lg:text-left">
                        <!-- Glass morphism card -->
                        <div class="glass-effect rounded-3xl p-8 mb-8 backdrop-blur-lg border border-white/20 shadow-2xl animate-on-scroll" data-direction="left">
                            <div class="animate-fade-in-up">
                                <span class="inline-block px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-full text-sm mb-6 animate-bounce">🚀 SaaS para Peluquerías</span>
                                
                                <h1 class="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                                    <span class="block font-light text-yellow-300 animate-slide-in-left">Gestiona tu</span>
                                    <span class="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-slide-in-right">Barbería</span>
                                    <span class="block text-white animate-slide-in-left">como un Pro</span>
                                </h1>
                                
                                <p class="text-xl lg:text-2xl text-gray-200 leading-relaxed mb-8 animate-fade-in-up" style="animation-delay: 0.3s;">
                                    Auron-Suite es la plataforma SaaS completa que revoluciona la gestión de peluquerías con 
                                    <span class="text-yellow-400 font-semibold">ganancias por quincena</span>, 
                                    <span class="text-orange-400 font-semibold">multitenancy</span> y 
                                    <span class="text-red-400 font-semibold">analytics en tiempo real</span>.
                                </p>
                                
                                <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style="animation-delay: 0.6s;">
                                    <button pButton pRipple 
                                            routerLink="/auth/register"
                                            label="Prueba Gratis 7 Días" 
                                            class="!bg-gradient-to-r !from-yellow-400 !to-orange-500 !text-black !font-bold !text-lg !px-8 !py-4 !rounded-full hover:!scale-105 !transition-all !duration-300 !shadow-2xl hover:!shadow-yellow-500/50">
                                    </button>
                                    <button pButton pRipple 
                                            (click)="scrollToDemo()"
                                            label="Ver Demo" 
                                            [outlined]="true"
                                            class="!border-white !text-white !font-bold !text-lg !px-8 !py-4 !rounded-full hover:!bg-white hover:!text-gray-900 !transition-all !duration-300">
                                    </button>
                                </div>
                                
                                <!-- Stats -->
                                <div class="grid grid-cols-3 gap-4 mt-12 animate-fade-in-up" style="animation-delay: 0.9s;">
                                    <div class="text-center">
                                        <div class="text-3xl font-bold text-yellow-400">{{ metrics?.total_tenants || 0 }}+</div>
                                        <div class="text-sm text-gray-300">Peluquerías</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-3xl font-bold text-orange-400">{{ metrics?.active_tenants || 0 }}+</div>
                                        <div class="text-sm text-gray-300">Activas</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-3xl font-bold text-red-400">\${{ metrics?.mrr || 0 | number:'1.0-0' }}</div>
                                        <div class="text-sm text-gray-300">MRR</div>
                                    </div>
                                </div>
                                
                                <!-- Data Source Indicator -->
                                <div *ngIf="metrics" class="mt-4 text-center">
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs" 
                                          [ngClass]="metrics.isReal ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'">
                                        <i [class]="metrics.isReal ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle'" class="mr-1"></i>
                                        {{ metrics.isReal ? 'Datos en tiempo real' : 'Datos de demostración' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Image Column -->
                    <div class="col-span-12 lg:col-span-6 relative">
                        <div class="relative animate-float animate-on-scroll" data-direction="right">
                            <!-- Main dashboard mockup -->
                            <div class="glass-effect rounded-2xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                                <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 min-h-96">
                                    <!-- Mockup header -->
                                    <div class="flex items-center gap-2 mb-4">
                                        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div class="ml-4 text-gray-400 text-sm">Auron-Suite Dashboard</div>
                                    </div>
                                    
                                    <!-- Mockup content -->
                                    <div class="space-y-4">
                                        <div class="flex justify-between items-center">
                                            <div class="text-white font-semibold">Ganancias Hoy</div>
                                            <div class="text-green-400 font-bold text-xl">\$1,247</div>
                                        </div>
                                        <div class="bg-gray-700 rounded-lg h-32 flex items-center justify-center">
                                            <div class="text-gray-400">📊 Analytics Dashboard</div>
                                        </div>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div class="bg-gray-700 rounded p-3">
                                                <div class="text-gray-400 text-sm">Citas Hoy</div>
                                                <div class="text-white font-bold">24</div>
                                            </div>
                                            <div class="bg-gray-700 rounded p-3">
                                                <div class="text-gray-400 text-sm">Empleados</div>
                                                <div class="text-white font-bold">8</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Floating feature cards -->
                            <div class="absolute -top-8 -left-8 glass-effect rounded-xl p-4 animate-bounce" style="animation-delay: 1s;">
                                <div class="text-2xl">💰</div>
                                <div class="text-white text-sm font-semibold">Ganancias</div>
                            </div>
                            
                            <div class="absolute -bottom-4 -right-4 glass-effect rounded-xl p-4 animate-bounce" style="animation-delay: 1.5s;">
                                <div class="text-2xl">📅</div>
                                <div class="text-white text-sm font-semibold">Citas</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Scroll indicator -->
            <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div class="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                    <div class="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
                </div>
            </div>
        </div>
    `
})
export class HeroWidget implements OnInit, OnDestroy {
    @Output() openVideoModal = new EventEmitter<void>();
    particles: Array<{x: number, y: number, size: number, delay: number}> = [];
    metrics: SaasMetrics | null = null;

    constructor(
        private animationService: AnimationService,
        private landingService: LandingService
    ) {}

    ngOnInit() {
        this.generateParticles();
        this.animationService.initScrollAnimations();
        this.loadMetrics();
    }

    loadMetrics() {
        this.landingService.getSaasMetrics().subscribe({
            next: (metrics) => {
                this.metrics = { ...metrics, isReal: true };
            },
            error: () => {
                // Fallback data if API fails
                this.metrics = {
                    mrr: 15000,
                    total_tenants: 150,
                    active_tenants: 142,
                    churn_rate: 2.5,
                    growth_rate: 15.2,
                    isReal: false
                };
            }
        });
    }

    ngOnDestroy() {
        this.animationService.destroy();
    }

    generateParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 4 + 2,
                delay: Math.random() * 3
            });
        }
    }

    trackByIndex(index: number): number {
        return index;
    }

    scrollToDemo() {
        this.openVideoModal.emit();
    }
}