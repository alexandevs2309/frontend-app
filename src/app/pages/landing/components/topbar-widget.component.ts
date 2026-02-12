import { Component } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'topbar-widget',
    imports: [RouterModule, StyleClassModule, ButtonModule, RippleModule, AppFloatingConfigurator],
    template: `
        <nav class="fixed top-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg z-50 border-b border-slate-200/50 dark:border-slate-700/50">
            <div class="max-w-7xl mx-auto px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <!-- Logo con gradiente -->
                    <a class="flex items-center" href="#" routerLink="/landing">
                        <span class="text-2xl font-black bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mr-2">💈</span>
                        <span class="text-xl font-black bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">Auron Suite</span>
                    </a>

                    <!-- Desktop Navigation -->
                    <div class="hidden lg:flex items-center space-x-8">
                        <nav class="flex space-x-8">
                            <a (click)="scrollToSection('features')" 
                               class="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer transition-colors">
                                Características
                            </a>
                            <a (click)="scrollToSection('highlights')" 
                               class="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer transition-colors">
                                Inteligencia
                            </a>
                            <a (click)="scrollToSection('testimonials')" 
                               class="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer transition-colors">
                                Testimonios
                            </a>
                            <a (click)="scrollToSection('pricing')" 
                               class="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer transition-colors">
                                Precios
                            </a>
                        </nav>
                        
                        <div class="flex items-center space-x-4">
                            <app-floating-configurator [float]="false" />
                            <button pButton 
                                    routerLink="/auth/register"
                                    label="Probar Gratis"
                                    class="!bg-linear-to-r !from-indigo-600 !to-purple-600 !text-white hover:!from-indigo-700 hover:!to-purple-700 !border-0 !px-6 !py-2 !rounded-full !font-semibold !shadow-lg hover:!shadow-xl !transform hover:!-translate-y-0.5 !transition-all">
                            </button>
                        </div>
                    </div>

                    <!-- Mobile menu button -->
                    <button pButton [text]="true" [rounded]="true" pRipple 
                            (click)="toggleMobileMenu()"
                            class="lg:!hidden !text-slate-600 dark:!text-slate-300">
                        <i class="pi pi-bars !text-xl"></i>
                    </button>
                </div>
                
                <!-- Mobile menu -->
                <div [class.hidden]="!mobileMenuOpen" class="lg:hidden">
                    <div class="px-6 py-4 space-y-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                        <a (click)="scrollToSection('features')" 
                           class="block text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer py-2">
                            Características
                        </a>
                        <a (click)="scrollToSection('highlights')" 
                           class="block text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer py-2">
                            Inteligencia
                        </a>
                        <a (click)="scrollToSection('testimonials')" 
                           class="block text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer py-2">
                            Testimonios
                        </a>
                        <a (click)="scrollToSection('pricing')" 
                           class="block text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer py-2">
                            Precios
                        </a>
                        <div class="pt-3 border-t border-slate-200 dark:border-slate-700">
                            <button pButton 
                                    routerLink="/auth/register"
                                    label="Probar Gratis"
                                    class="w-full !bg-linear-to-r !from-indigo-600 !to-purple-600 !text-white !border-0 !py-3 !rounded-full !font-semibold">
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    `,
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class TopbarWidget {
    mobileMenuOpen = false;

    constructor(public router: Router) {}

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    scrollToSection(sectionId: string) {
        const element = document.querySelector(`[data-section="${sectionId}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        this.mobileMenuOpen = false; // Cerrar menú al navegar
    }
}
