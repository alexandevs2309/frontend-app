import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'hero-widget',
    imports: [ButtonModule, RippleModule, CommonModule],
    template: `
        <div #heroSection
            id="hero"
            class="relative min-h-screen flex items-center overflow-hidden"
            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
        >
            <!-- Animated Background Elements -->
            <div class="absolute inset-0 overflow-hidden">
                <div class="floating-element absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
                <div class="floating-element absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce" style="animation-delay: 1s;"></div>
                <div class="floating-element absolute bottom-40 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-bounce" style="animation-delay: 2s;"></div>
                <div class="floating-element absolute bottom-20 right-1/3 w-24 h-24 bg-white/10 rounded-full animate-bounce" style="animation-delay: 0.5s;"></div>
            </div>

            <!-- Parallax Background -->
            <div class="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 transform translate-y-0" [style.transform]="'translateY(' + parallaxOffset + 'px)'"></div>

            <div class="container mx-auto px-6 lg:px-20 relative z-10">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <!-- Content -->
                    <div class="text-center lg:text-left" [class.animate-fade-in-up]="isVisible">
                        <div class="mb-6">
                            <span class="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                                💈 Plataforma SaaS para Barberías
                            </span>
                        </div>
                        
                        <h1 class="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                            <span class="block font-light text-white/90">Gestiona tu</span>
                            <span class="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                Barbería
                            </span>
                            <span class="block">como un Pro</span>
                        </h1>
                        
                        <p class="text-xl text-white/90 leading-relaxed mb-8 max-w-2xl">
                            Sistema completo de gestión para barberías modernas. Agenda, POS, empleados, ganancias y más. 
                            <strong class="text-yellow-400">Todo en una plataforma.</strong>
                        </p>
                        
                        <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button 
                                pButton 
                                pRipple 
                                (click)="scrollToSection('pricing')"
                                label="Comenzar Gratis" 
                                icon="pi pi-arrow-right"
                                iconPos="right"
                                class="bg-gradient-to-r from-yellow-400 to-orange-500 border-0 text-black font-bold px-8 py-4 text-lg hover:scale-105 transition-transform duration-300"
                                [rounded]="true"
                            ></button>
                            
                            <button 
                                pButton 
                                pRipple 
                                (click)="scrollToSection('features')"
                                label="Ver Demo" 
                                icon="pi pi-play"
                                iconPos="left"
                                severity="secondary"
                                class="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg transition-all duration-300"
                                [rounded]="true"
                                [outlined]="true"
                            ></button>
                        </div>
                        
                        <!-- Stats -->
                        <div class="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
                            <div class="text-center">
                                <div class="text-3xl font-bold text-yellow-400 counter" [attr.data-target]="500">0</div>
                                <div class="text-white/80 text-sm">Barberías Activas</div>
                            </div>
                            <div class="text-center">
                                <div class="text-3xl font-bold text-yellow-400 counter" [attr.data-target]="10000">0</div>
                                <div class="text-white/80 text-sm">Citas Procesadas</div>
                            </div>
                            <div class="text-center">
                                <div class="text-3xl font-bold text-yellow-400 counter" [attr.data-target]="99">0</div>
                                <div class="text-white/80 text-sm">% Satisfacción</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Hero Image/Animation -->
                    <div class="relative" [class.animate-fade-in-right]="isVisible">
                        <div class="relative z-10">
                            <!-- Mockup Container -->
                            <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                                <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-inner">
                                    <!-- Fake Dashboard -->
                                    <div class="flex items-center justify-between mb-4">
                                        <div class="flex items-center space-x-2">
                                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                        </div>
                                        <div class="text-white/60 text-xs">BarberPro Dashboard</div>
                                    </div>
                                    
                                    <div class="space-y-4">
                                        <div class="grid grid-cols-2 gap-4">
                                            <div class="bg-blue-500/20 rounded-lg p-3">
                                                <div class="text-blue-400 text-xs mb-1">Citas Hoy</div>
                                                <div class="text-white font-bold text-lg">24</div>
                                            </div>
                                            <div class="bg-green-500/20 rounded-lg p-3">
                                                <div class="text-green-400 text-xs mb-1">Ventas</div>
                                                <div class="text-white font-bold text-lg">$2,450</div>
                                            </div>
                                        </div>
                                        
                                        <div class="bg-white/5 rounded-lg p-3">
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="text-white/80 text-xs">Próximas Citas</div>
                                                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            </div>
                                            <div class="space-y-2">
                                                <div class="flex justify-between text-xs">
                                                    <span class="text-white/60">10:00 - Juan Pérez</span>
                                                    <span class="text-yellow-400">Corte + Barba</span>
                                                </div>
                                                <div class="flex justify-between text-xs">
                                                    <span class="text-white/60">11:30 - Carlos López</span>
                                                    <span class="text-blue-400">Corte Clásico</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Floating Elements -->
                        <div class="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400/20 rounded-full animate-pulse"></div>
                        <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-400/20 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Scroll Indicator -->
            <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div class="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                    <div class="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
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
            
            @keyframes fade-in-right {
                from {
                    opacity: 0;
                    transform: translateX(30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .animate-fade-in-up {
                animation: fade-in-up 1s ease-out;
            }
            
            .animate-fade-in-right {
                animation: fade-in-right 1s ease-out 0.3s both;
            }
            
            .floating-element {
                animation: float 6s ease-in-out infinite;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
            }
        </style>
    `
})
export class HeroWidget implements OnInit, OnDestroy {
    @ViewChild('heroSection', { static: true }) heroSection!: ElementRef;
    
    isVisible = false;
    parallaxOffset = 0;
    private animationFrame?: number;

    constructor(private router: Router) {}

    ngOnInit() {
        setTimeout(() => {
            this.isVisible = true;
            this.startCounterAnimation();
        }, 500);
        
        this.setupParallax();
    }

    ngOnDestroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    scrollToSection(sectionId: string) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    private setupParallax() {
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            this.parallaxOffset = scrolled * 0.5;
            this.animationFrame = requestAnimationFrame(updateParallax);
        };
        updateParallax();
    }

    private startCounterAnimation() {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target') || '0');
            const increment = target / 100;
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.ceil(current).toString();
                    setTimeout(updateCounter, 20);
                } else {
                    counter.textContent = target.toString();
                }
            };
            
            setTimeout(updateCounter, 1000);
        });
    }
}
