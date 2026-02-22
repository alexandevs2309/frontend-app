import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { MicroAnimationService } from './micro-animation.service';
import { LandingPublicService, PublicMetrics } from '../../../core/services/landing-public.service';

declare var Gradient: any;

@Component({
    selector: 'hero-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RouterModule],
    template: `
        <section #heroSection class="min-h-screen flex items-center py-24 lg:py-32 relative overflow-hidden transform -skew-y-3" 
                 style="--gradient-color-1: #1e1b4b; --gradient-color-2: #312e81; --gradient-color-3: #5b21b6;">
            <canvas #gradientCanvas id="gradient-canvas" class="absolute inset-0 w-full h-full"></canvas>
            <div #fallbackGradient class="absolute inset-0 bg-linear-to-br from-indigo-950 via-indigo-900 to-purple-800"></div>
            
            <div class="absolute inset-0">
                <div class="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div class="absolute bottom-20 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
            </div>
            
            <div class=" max-w-max mx-auto px-6 lg:px-8 relative z-10 transform skew-y-3">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div class="text-center lg:text-left">
                        <div class="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-semibold mb-6 fade-in-up">
                            Usado por más de 340 barberías en República Dominicana
                        </div>
                        
                       <h1 class="text-5xl lg:text-7xl font-black leading-tight text-white mb-6 fade-in-up">
                            <span class="block">Gestiona tu barbería</span>
                            <span class="block mt-2">con orden y control</span>
                            <span class="text-white block">profesional</span>
                        </h1>
                        
                        <p class="text-xl lg:text-2xl text-white/95 leading-relaxed mb-8 fade-in-up">
                            Sistema completo para automatizar citas, controlar comisiones de empleados y tomar decisiones con reportes en tiempo real.
                            <span class="text-white/90 block mt-3">
                                Diseñado para barberías desde 1 hasta 50+ empleados, con o sin múltiples sucursales.
                            </span>
                        </p>
                        
                        <div class="space-y-3 mb-8 fade-in-up">
                            <div class="flex items-center text-white/90">
                                <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 shrink-0">
                                    <i class="pi pi-check text-white text-xs font-bold"></i>
                                </div>
                                <span class="font-medium">Agenda digital con recordatorios automáticos</span>
                            </div>
                            <div class="flex items-center text-white/90">
                                <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 shrink-0">
                                    <i class="pi pi-check text-white text-xs font-bold"></i>
                                </div>
                                <span class="font-medium">Control de comisiones y pagos por empleado</span>
                            </div>
                            <div class="flex items-center text-white/90">
                                <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 shrink-0">
                                    <i class="pi pi-check text-white text-xs font-bold"></i>
                                </div>
                                <span class="font-medium">Reportes de ventas e inventario en tiempo real</span>
                            </div>
                        </div>
                        
                        <div class="fade-in-up mb-8">
                            <button pButton
                                    routerLink="/auth/register"
                                    class="bg-white! text-indigo-600! px-8! py-4! text-lg! font-bold! rounded-full! hover:bg-gray-100! shadow-2xl! hover:shadow-3xl! transform! hover:-translate-y-1! transition-all! w-full! sm:w-auto!">
                                <span class="block">Probar gratis 14 días</span>
                                <span class="block text-sm font-normal opacity-90">Sin tarjeta de crédito</span>
                            </button>
                            <div class="mt-4 text-center sm:text-left">
                                <a (click)="openVideoModal()" class="text-white/90 hover:text-white text-sm font-medium cursor-pointer inline-flex items-center">
                                    Ver demostración del sistema
                                    <i class="pi pi-arrow-right ml-2 text-xs"></i>
                                </a>
                            </div>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row items-center gap-6 text-white/80 fade-in-up">
                            <div class="flex items-center">
                                <div class="flex -space-x-2">
                                    <div class="w-8 h-8 bg-indigo-600 rounded-full border-2 border-white"></div>
                                    <div class="w-8 h-8 bg-indigo-600 opacity-80 rounded-full border-2 border-white"></div>
                                    <div class="w-8 h-8 bg-indigo-600 opacity-60 rounded-full border-2 border-white"></div>
                                    <div class="w-8 h-8 bg-indigo-600 opacity-40 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">+</div>
                                </div>
                                <span class="ml-3 font-medium">340+ barberías activas</span>
                            </div>
                            <div class="flex items-center">
                                <div class="flex text-amber-400 mr-2">
                                    <i class="pi pi-star-fill"></i>
                                    <i class="pi pi-star-fill"></i>
                                    <i class="pi pi-star-fill"></i>
                                    <i class="pi pi-star-fill"></i>
                                    <i class="pi pi-star-fill"></i>
                                </div>
                                <span class="font-medium">4.8/5 opiniones verificadas</span>
                            </div>
                        </div>
                        
                        <div class="flex items-center text-xs text-white/70 mt-6 fade-in-up">
                            <i class="pi pi-shield-check mr-2"></i>
                            <span>Datos seguros</span>
                            <span class="mx-2">•</span>
                            <i class="pi pi-comments mr-2"></i>
                            <span>Soporte 24/7</span>
                            <span class="mx-2">•</span>
                            <i class="pi pi-check mr-2"></i>
                            <span>Cancela cuando quieras</span>
                        </div>
                    </div>

                    <div class="fade-in-up">
                        <div *ngIf="!metrics" class="mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/80 text-sm text-center">
                            Vista previa del sistema
                        </div>
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
                                    <div class="flex-1 bg-linear-to-t from-indigo-600 to-indigo-400 rounded-t" style="height: 60%;"></div>
                                    <div class="flex-1 bg-linear-to-t from-indigo-600 to-indigo-400 rounded-t" style="height: 80%;"></div>
                                    <div class="flex-1 bg-linear-to-t from-indigo-600 to-indigo-400 rounded-t" style="height: 95%;"></div>
                                    <div class="flex-1 bg-linear-to-t from-indigo-600 to-indigo-400 rounded-t" style="height: 70%;"></div>
                                    <div class="flex-1 bg-linear-to-t from-indigo-600 to-indigo-400 rounded-t" style="height: 100%;"></div>
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
    
    metrics: PublicMetrics | null = null;
    private gradient: any;
    private observer: IntersectionObserver | null = null;
    private isInViewport = false;
    private animationId: number = 0;
    private lastFrameTime = 0;
    private readonly frameInterval = 1000 / 30;

    constructor(private landingService: LandingPublicService, private microAnimation: MicroAnimationService) {}

    ngOnInit() {
        this.loadMetrics();
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => this.microAnimation.initTitleAnimations());
        } else {
            setTimeout(() => this.microAnimation.initTitleAnimations(), 100);
        }
    }

    ngAfterViewInit() {
        this.setupIntersectionObserver();
        
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => this.initGradient(), { timeout: 3000 });
        } else {
            setTimeout(() => this.initGradient(), 2000);
        }
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
                            this.startAnimation();
                        } else {
                            if (this.animationId) {
                                cancelAnimationFrame(this.animationId);
                                this.animationId = 0;
                            }
                        }
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        this.observer.observe(this.heroSection.nativeElement);
    }

    private initGradient() {
        if (window.innerWidth < 1024) {
            this.showFallback();
            return;
        }
        
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
            
            if (!this.prefersReducedMotion() && this.isInViewport) {
                this.startAnimation();
            }
            
            this.fallbackGradient.nativeElement.style.display = 'none';
        } catch (error) {
            this.showFallback();
        }
    }

    private startAnimation() {
        if (!this.gradient || this.animationId) return;

        const animate = (currentTime: number) => {
            if (!this.isInViewport || !this.gradient) {
                this.animationId = 0;
                return;
            }
            
            this.gradient.animate(currentTime);
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
        const element = document.getElementById('features');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    openVideoModal() {
        // Emitir evento para abrir el modal de video
        const event = new CustomEvent('openVideoModal');
        window.dispatchEvent(event);
    }

    private loadMetrics() {
        // Datos estáticos - render instantáneo, sin HTTP calls
        this.metrics = this.landingService.getMetrics();
    }
}