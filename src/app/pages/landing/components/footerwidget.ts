import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'footer-widget',
    standalone: true,
    imports: [RouterModule, CommonModule, ButtonModule, RippleModule],
    template: `
        <footer class="bg-slate-900 dark:bg-slate-950 py-24 lg:py-32">
            <div class="max-w-7xl mx-auto px-6 lg:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
                    <!-- Brand Section -->
                    <div class="lg:col-span-1">
                        <div class="flex items-center mb-6">
                            <div class="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mr-4">
                                <span class="text-white font-bold text-xl">A</span>
                            </div>
                            <h3 class="text-2xl font-bold text-white">Auron Suite</h3>
                        </div>
                        <p class="text-slate-300 mb-6 leading-relaxed">
                            La plataforma SaaS más completa para la gestión profesional de peluquerías y salones de belleza.
                        </p>
                        
                        <!-- Social Links -->
                        <div class="flex space-x-4">
                            <button pButton pRipple 
                                    icon="pi pi-twitter" 
                                    [rounded]="true" 
                                    [text]="true"
                                    class="!text-slate-400 hover:!text-blue-400 !transition-colors">
                            </button>
                            <button pButton pRipple 
                                    icon="pi pi-facebook" 
                                    [rounded]="true" 
                                    [text]="true"
                                    class="!text-slate-400 hover:!text-blue-500 !transition-colors">
                            </button>
                            <button pButton pRipple 
                                    icon="pi pi-linkedin" 
                                    [rounded]="true" 
                                    [text]="true"
                                    class="!text-slate-400 hover:!text-blue-600 !transition-colors">
                            </button>
                            <button pButton pRipple 
                                    icon="pi pi-github" 
                                    [rounded]="true" 
                                    [text]="true"
                                    class="!text-slate-400 hover:!text-white !transition-colors">
                            </button>
                        </div>
                    </div>

                    <!-- Product Section -->
                    <div>
                        <h4 class="text-lg font-semibold text-white mb-6">Producto</h4>
                        <ul class="space-y-4">
                            <li>
                                <a (click)="scrollToSection('features')" 
                                   class="text-slate-300 hover:text-white transition-colors cursor-pointer">
                                    Características
                                </a>
                            </li>
                            <li>
                                <a (click)="scrollToSection('pricing')" 
                                   class="text-slate-300 hover:text-white transition-colors cursor-pointer">
                                    Precios
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-slate-300 hover:text-white transition-colors">
                                    Integraciones
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-slate-300 hover:text-white transition-colors">
                                    API
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-slate-300 hover:text-white transition-colors">
                                    Seguridad
                                </a>
                            </li>
                        </ul>
                    </div>

                    <!-- Company Section -->
                    <div>
                        <h4 class="text-lg font-semibold text-white mb-6">Empresa</h4>
                        <ul class="space-y-4">
                            <li>
                                <a href="#" class="text-slate-300 hover:text-white transition-colors">
                                    Acerca de
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-slate-300 hover:text-white transition-colors">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-slate-300 hover:text-white transition-colors">
                                    Carreras
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-slate-300 hover:text-white transition-colors">
                                    Prensa
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-slate-300 hover:text-white transition-colors">
                                    Contacto
                                </a>
                            </li>
                        </ul>
                    </div>

                    <!-- Support Section -->
                    <div>
                        <h4 class="text-lg font-semibold text-white mb-6">Soporte</h4>
                        <ul class="space-y-4">
                            <li>
                                <a href="#" class="text-slate-300 hover:text-white transition-colors">
                                    Centro de Ayuda
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-slate-300 hover:text-white transition-colors">
                                    Documentación
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-slate-300 hover:text-white transition-colors">
                                    Tutoriales
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-slate-300 hover:text-white transition-colors">
                                    Estado del Sistema
                                </a>
                            </li>
                            <li>
                                <a routerLink="/auth/register" class="text-slate-300 hover:text-white transition-colors">
                                    Empezar Gratis
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Newsletter Section -->
                <div class="bg-slate-800 dark:bg-slate-900 rounded-lg p-8 mb-12 border border-slate-700">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h4 class="text-2xl font-bold text-white mb-4">
                                Mantente actualizado
                            </h4>
                            <p class="text-slate-300">
                                Recibe las últimas noticias, actualizaciones y consejos para tu barbería.
                            </p>
                        </div>
                        <div class="flex gap-4">
                            <input 
                                type="email" 
                                placeholder="tu@email.com"
                                class="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors">
                            <button pButton pRipple 
                                    label="Suscribirse" 
                                    class="!bg-indigo-600 !text-white !font-semibold !px-6 !py-3 hover:!bg-indigo-700 !border-0">
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Bottom Section -->
                <div class="border-t border-slate-700 pt-8">
                    <div class="flex flex-col lg:flex-row justify-between items-center gap-6">
                        <div class="text-slate-400 text-center lg:text-left">
                            <p>&copy; 2025 Auron Suite. Todos los derechos reservados.</p>
                            <p class="text-sm mt-1">Desarrollado con ❤️ para peluquerías profesionales</p>
                        </div>
                        
                        <div class="flex flex-wrap gap-6 text-sm">
                            <a href="#" class="text-slate-400 hover:text-white transition-colors">
                                Términos de Servicio
                            </a>
                            <a href="#" class="text-slate-400 hover:text-white transition-colors">
                                Política de Privacidad
                            </a>
                            <a href="#" class="text-slate-400 hover:text-white transition-colors">
                                Cookies
                            </a>
                            <a href="#" class="text-slate-400 hover:text-white transition-colors">
                                GDPR
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Trust Badges -->
                <div class="mt-12 text-center">
                    <div class="flex justify-center items-center gap-8 flex-wrap">
                        <div class="flex items-center gap-2 text-slate-400">
                            <i class="pi pi-shield text-green-500"></i>
                            <span class="text-sm">SSL Seguro</span>
                        </div>
                        <div class="flex items-center gap-2 text-slate-400">
                            <i class="pi pi-verified text-blue-500"></i>
                            <span class="text-sm">GDPR Compliant</span>
                        </div>
                        <div class="flex items-center gap-2 text-slate-400">
                            <i class="pi pi-cloud text-purple-500"></i>
                            <span class="text-sm">Cloud Hosting</span>
                        </div>
                        <div class="flex items-center gap-2 text-slate-400">
                            <i class="pi pi-clock text-orange-500"></i>
                            <span class="text-sm">99.9% Uptime</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    `
})
export class FooterWidget {
    constructor(public router: Router) {}

    scrollToSection(sectionId: string) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
}