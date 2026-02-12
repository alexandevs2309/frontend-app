import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';
import { LandingService, SaasMetrics } from '../../../shared/services/landing.service';
import { MicroAnimationService } from './micro-animation.service';

declare var Gradient: any;

@Component({
    selector: 'hero-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule, RouterModule],
    template: `
        <section #heroSection class="min-h-screen flex items-center py-24 lg:py-32 relative overflow-hidden transform -skew-y-3" 
                 style="--gradient-color-1: #4f46e5; --gradient-color-2: #7c3aed; --gradient-color-3: #ec4899; --gradient-color-4: #f59e0b;">
            <canvas #gradientCanvas id="gradient-canvas" class="absolute inset-0 w-full h-full"></canvas>
            <div #fallbackGradient class="absolute inset-0 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
            
            <div class="absolute inset-0">
                <div class="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div class="absolute bottom-20 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
            </div>
            
            <div class="container mx-auto px-6 lg:px-8 relative z-10 transform skew-y-3">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div class="text-center lg:text-left">
                        <div class="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-semibold mb-6 fade-in-up">
                            <span class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            +1,847 barberías ya dominan el juego
                        </div>
                        
                        <h1 class="text-5xl lg:text-7xl font-black leading-tight text-white mb-6 fade-in-up">
                            <span class="block">DOMINA tu</span>
                            <span class="bg-linear-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent block">BARBERÍA</span>
                            <span class="block mt-2">como un verdadero BOSS</span>
                        </h1>
                        
                        <p class="text-xl lg:text-2xl text-white/95 leading-relaxed mb-8 fade-in-up font-medium">
                            <span class="text-yellow-300 font-bold">⚡ Bro, olvida el Excel.</span> Auron Suite automatiza TODO: 
                            citas, cash, comisiones, inventario. 
                            <span class="text-green-300 font-bold">Los barberos serios aumentan sus ingresos 40% garantizado.</span>
                        </p>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 fade-in-up">
                            <div class="flex items-center text-white/90">
                                <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                    <i class="pi pi-check text-white text-xs font-bold"></i>
                                </div>
                                <span class="font-semibold">Cero dinero perdido</span>
                            </div>
                            <div class="flex items-center text-white/90">
                                <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                    <i class="pi pi-check text-white text-xs font-bold"></i>
                                </div>
                                <span class="font-semibold">Empleados que rinden</span>
                            </div>
                            <div class="flex items-center text-white/90">
                                <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                    <i class="pi pi-check text-white text-xs font-bold"></i>
                                </div>
                                <span class="font-semibold">Clientes que regresan</span>
                            </div>
                            <div class="flex items-center text-white/90">
                                <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                    <i class="pi pi-check text-white text-xs font-bold"></i>
                                </div>
                                <span class="font-semibold">Control total 24/7</span>
                            </div>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row gap-4 mb-8 fade-in-up">
                            <button pButton pRipple
                                    routerLink="/auth/register"
                                    label="🔥 SÍ, QUIERO DOMINAR - 14 DÍAS GRATIS"
                                    class="bg-white! text-indigo-600! px-8! py-5! text-lg! font-black! rounded-full! hover:bg-gray-100! shadow-2xl! hover:shadow-3xl! transform! hover:-translate-y-1! transition-all! uppercase! tracking-wide!">
                            </button>
                            <button pButton pRipple
                                    (click)="scrollToDemo()"
                                    label="🎥 Ver el sistema en acción (2 min)"
                                    [outlined]="true"
                                    class="border-2! border-white/40! text-white! px-8! py-5! text-lg! font-bold! rounded-full! hover:bg-white/10! backdrop-blur-sm! transform! hover:-translate-y-1! transition-all!">
                            </button>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row items-center gap-6 text-white/80 fade-in-up">
                            <div class="flex items-center">
                                <div class="flex -space-x-2">
                                    <div class="w-8 h-8 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full border-2 border-white"></div>
                                    <div class="w-8 h-8 bg-linear-to-r from-green-500 to-emerald-500 rounded-full border-2 border-white"></div>
                                    <div class="w-8 h-8 bg-linear-to-r from-purple-500 to-violet-500 rounded-full border-2 border-white"></div>
                                    <div class="w-8 h-8 bg-linear-to-r from-yellow-500 to-orange-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">+</div>
                                </div>
                                <span class="ml-3 font-semibold">1,847 barberos exitosos</span>
                            </div>
                            <div class="flex items-center">
                                <div class="flex text-yellow-400 mr-2">
                                    <i class="pi pi-star-fill"></i>
                                    <i class="pi pi-star-fill"></i>
                                    <i class="pi pi-star-fill"></i>
                                    <i class="pi pi-star-fill"></i>
                                    <i class="pi pi-star-fill"></i>
                                </div>
                                <span class="font-semibold">4.9/5 (1,247 reseñas)</span>
                            </div>
                        </div>
                        
                        <div class="flex items-center text-xs text-white/70 mt-6 fade-in-up">
                            <div class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            <span>🔒 Datos seguros • 📊 Última actualización: hace 2h • 🌍 Soporte 24/7</span>
                        </div>
                    </div>

                    <div class="fade-in-up">
                        <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-500">
                            <div class="grid grid-cols-2 gap-6 lg:gap-8 mb-6">
                                <div class="bg-white/15 backdrop-blur-sm rounded-xl p-6 lg:p-8">
                                    <h4 class="text-white/70 text-xs uppercase tracking-wide mb-2">Ganancias Hoy</h4>
                                    <div class="text-white text-2xl font-black font-mono">$2,847</div>
                                </div>
                                <div class="bg-white/15 backdrop-blur-sm rounded-xl p-6 lg:p-8">
                                    <h4 class="text-white/70 text-xs uppercase tracking-wide mb-2">Citas Activas</h4>
                                    <div class="text-white text-2xl font-black font-mono">24</div>
                                </div>
                                <div class="bg-white/15 backdrop-blur-sm rounded-xl p-6 lg:p-8">
                                    <h4 class="text-white/70 text-xs uppercase tracking-wide mb-2">Tasa Ocupación</h4>
                                    <div class="text-white text-2xl font-black font-mono">87%</div>
                                </div>
                                <div class="bg-white/15 backdrop-blur-sm rounded-xl p-6 lg:p-8">
                                    <h4 class="text-white/70 text-xs uppercase tracking-wide mb-2">Clientes Nuevos</h4>
                                    <div class="text-white text-2xl font-black font-mono">12</div>
                                </div>
                            </div>
                            
                            <div class="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                                <div class="flex items-end gap-2 h-24">
                                    <div class="flex-1 bg-linear-to-t from-yellow-400 to-orange-500 rounded-t" style="height: 60%;"></div>
                                    <div class="flex-1 bg-linear-to-t from-yellow-400 to-orange-500 rounded-t" style="height: 80%;"></div>
                                    <div class="flex-1 bg-linear-to-t from-yellow-400 to-orange-500 rounded-t" style="height: 95%;"></div>
                                    <div class="flex-1 bg-linear-to-t from-yellow-400 to-orange-500 rounded-t" style="height: 70%;"></div>
                                    <div class="flex-1 bg-linear-to-t from-yellow-400 to-orange-500 rounded-t" style="height: 100%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `
})
export class HeroWidget implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('gradientCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('heroSection', { static: true }) heroSection!: ElementRef<HTMLElement>;
    @ViewChild('fallbackGradient', { static: true }) fallbackGradient!: ElementRef<HTMLElement>;
    
    metrics: SaasMetrics | null = null;
    private gradient: any;
    private observer: IntersectionObserver | null = null;
    private isInViewport = false;
    private animationId: number = 0;
    private lastFrameTime = 0;
    private readonly frameInterval = 1000 / 30;

    constructor(private landingService: LandingService, private microAnimation: MicroAnimationService) {}

    ngOnInit() {
        this.loadMetrics();
        setTimeout(() => this.microAnimation.initTitleAnimations(), 100);
    }

    ngAfterViewInit() {
        this.setupIntersectionObserver();
        this.initGradient();
    }

    ngOnDestroy() {
        this.microAnimation.destroy();
        this.cleanup();
    }

    private setupIntersectionObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    this.isInViewport = entry.isIntersecting;
                    if (this.gradient) {
                        if (this.isInViewport) {
                            this.gradient.play();
                        } else {
                            this.gradient.pause();
                        }
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        this.observer.observe(this.heroSection.nativeElement);
    }

    private initGradient() {
        if (this.isWebGLSupported() && !this.prefersReducedMotion()) {
            this.loadStripeGradient();
        } else {
            this.showFallback();
        }
    }

    private loadStripeGradient() {
        if (typeof Gradient === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://www.stripe.com/img/v3/home/gradient.js';
            script.onload = () => this.createGradient();
            script.onerror = () => this.showFallback();
            document.head.appendChild(script);
        } else {
            this.createGradient();
        }
    }

    private createGradient() {
        try {
            this.gradient = new Gradient();
            this.gradient.initGradient('#gradient-canvas');
            
            if (!this.prefersReducedMotion()) {
                this.startAnimation();
            }
            
            this.fallbackGradient.nativeElement.style.display = 'none';
        } catch (error) {
            this.showFallback();
        }
    }

    private startAnimation() {
        const animate = (currentTime: number) => {
            if (currentTime - this.lastFrameTime >= this.frameInterval) {
                if (this.isInViewport && this.gradient) {
                    this.gradient.animate(currentTime);
                }
                this.lastFrameTime = currentTime;
            }
            this.animationId = requestAnimationFrame(animate);
        };
        this.animationId = requestAnimationFrame(animate);
    }

    private showFallback() {
        this.canvas.nativeElement.style.display = 'none';
        this.fallbackGradient.nativeElement.style.display = 'block';
    }

    private isWebGLSupported(): boolean {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                     (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch {
            return false;
        }
    }

    private prefersReducedMotion(): boolean {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    private cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = 0;
        }
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        if (this.gradient) {
            this.gradient = null;
        }
    }

    scrollToDemo() {
        const element = document.getElementById('demo');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    private loadMetrics() {
        this.landingService.getSaasMetrics().subscribe({
            next: (metrics) => this.metrics = metrics,
            error: () => this.metrics = null
        });
    }
}