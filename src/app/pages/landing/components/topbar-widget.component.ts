import { Component, input, computed } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { LayoutService } from '../../../layout/service/layout.service';

@Component({
    selector: 'topbar-widget',
    imports: [RouterModule, StyleClassModule, ButtonModule, RippleModule],
    template: `
        <nav class="fixed top-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg z-50 border-b border-slate-200/50 dark:border-slate-700/50">
            <div class="container mx-auto px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <!-- Logo -->
                    <a class="flex items-center space-x-3" href="#" routerLink="/landing">
                        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold text-sm">A</span>
                        </div>
                        <span class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Auron Suite</span>
                    </a>

                    <!-- Desktop Navigation -->
                    <div class="hidden lg:flex items-center space-x-8">
                        <nav class="flex space-x-8">
                            <a (click)="scrollToSection('features')" 
                               class="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer transition-colors">
                                Características
                            </a>
                            <a (click)="scrollToSection('testimonials')" 
                               class="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer transition-colors">
                                Testimonios
                            </a>
                            <a (click)="scrollToSection('pricing')" 
                               class="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer transition-colors">
                                Precios
                            </a>
                        </nav>
                        
                    

                        <div class="flex items-center space-x-4">
                            <p-button type="button" (onClick)="toggleDarkMode()" [rounded]="true" [icon]="isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'" severity="secondary" />

                            <button pButton 
                                    routerLink="/auth/register"
                                    label="Empezar gratis"
                                    class="bg-indigo-600! text-white! hover:bg-indigo-700! border-0! px-5! py-2! rounded-lg! font-medium! text-sm! transition-colors!">
                            </button>
                        </div>
                    </div>

                    <!-- Mobile menu button -->
                    <button pButton [text]="true" [rounded]="true" pRipple 
                            (click)="toggleMobileMenu()"
                            class="hidden! lg:block text-slate-600! dark:text-slate-300!">
                        <i class="pi pi-bars text-xl!"></i>
                    </button>
                </div>
                
                <!-- Mobile menu -->
                <div [class.hidden]="!mobileMenuOpen" class="lg:hidden">
                    <div class="px-6 py-4 space-y-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                        <a (click)="scrollToSection('features')" 
                           class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer py-2">
                            Características
                        </a>
                        <a (click)="scrollToSection('testimonials')" 
                           class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer py-2">
                            Testimonios
                        </a>
                        <a (click)="scrollToSection('pricing')" 
                           class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer py-2">
                            Precios
                        </a>
                        <div class="pt-3 border-t border-slate-200 dark:border-slate-700">
                            <button pButton 
                                    routerLink="/auth/register"
                                    label="Empezar gratis"
                                    class="w-full bg-indigo-600! text-white! hover:bg-indigo-700! border-0! py-3! rounded-lg! font-medium!">
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

    constructor(public router: Router, public LayoutService: LayoutService) {}

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

       float = input<boolean>(true);

    isDarkTheme = computed(() => this.LayoutService.layoutConfig().darkTheme);

    toggleDarkMode() {
        this.LayoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
