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
        <footer class="bg-gradient-to-b from-gray-900 to-black py-20 px-6 lg:px-20 relative overflow-hidden">
            <!-- Background decoration -->
            <div class="absolute inset-0 opacity-20">
                <div class="absolute top-10 left-20 w-64 h-64 bg-linear-to-r from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
                <div class="absolute bottom-10 right-20 w-80 h-80 bg-linear-to-r from-yellow-400 to-orange-500 rounded-full blur-3xl"></div>
            </div>

            <div class="relative z-10">
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
                    <!-- Brand Section -->
                    <div class="lg:col-span-1">
                        <div class="flex items-center mb-6">
                            <!-- Auron-Suite Logo -->
                            <div class="w-12 h-12 bg-linear-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                                <span class="text-black font-bold text-xl">A</span>
                            </div>
                            <h3 class="text-3xl font-bold text-white">Auron-Suite</h3>
                        </div>
                        <p class="text-gray-300 mb-6 leading-relaxed">
                            La plataforma SaaS más completa para la gestión profesional de peluquerías y salones de belleza.
                        </p>
                        
                        <!-- Social Links -->
                        <div class="flex space-x-4">
                            <button pButton pRipple 
                                    icon="pi pi-twitter" 
                                    [rounded]="true" 
                                    [text]="true"
                                    class="!text-gray-400 hover:!text-blue-400 !transition-colors !duration-300">
                            </button>
                            <button pButton pRipple 
                                    icon="pi pi-facebook" 
                                    [rounded]="true" 
                                    [text]="true"
                                    class="!text-gray-400 hover:!text-blue-600 !transition-colors !duration-300">
                            </button>
                            <button pButton pRipple 
                                    icon="pi pi-linkedin" 
                                    [rounded]="true" 
                                    [text]="true"
                                    class="!text-gray-400 hover:!text-blue-500 !transition-colors !duration-300">
                            </button>
                            <button pButton pRipple 
                                    icon="pi pi-github" 
                                    [rounded]="true" 
                                    [text]="true"
                                    class="!text-gray-400 hover:!text-white !transition-colors !duration-300">
                            </button>
                        </div>
                    </div>

                    <!-- Product Section -->
                    <div>
                        <h4 class="text-xl font-bold text-white mb-6">Producto</h4>
                        <ul class="space-y-4">
                            <li>
                                <a (click)="scrollToSection('features')" 
                                   class="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer">
                                    Características
                                </a>
                            </li>
                            <li>
                                <a (click)="scrollToSection('pricing')" 
                                   class="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer">
                                    Precios
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-300">
                                    Integraciones
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-300">
                                    API
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-300">
                                    Seguridad
                                </a>
                            </li>
                        </ul>
                    </div>

                    <!-- Company Section -->
                    <div>
                        <h4 class="text-xl font-bold text-white mb-6">Empresa</h4>
                        <ul class="space-y-4">
                            <li>
                                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-300">
                                    Acerca de
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-300">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-300">
                                    Carreras
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-300">
                                    Prensa
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-300">
                                    Contacto
                                </a>
                            </li>
                        </ul>
                    </div>

                    <!-- Support Section -->
                    <div>
                        <h4 class="text-xl font-bold text-white mb-6">Soporte</h4>
                        <ul class="space-y-4">
                            <li>
                                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-300">
                                    Centro de Ayuda
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-300">
                                    Documentación
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-300">
                                    Tutoriales
                                </a>
                            </li>
                            <li>
                                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-300">
                                    Estado del Sistema
                                </a>
                            </li>
                            <li>
                                <a routerLink="/auth/register" class="text-gray-300 hover:text-white transition-colors duration-300">
                                    Empezar Gratis
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Newsletter Section -->
                <div class="glass-effect rounded-2xl p-8 mb-12 border border-white/20">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h4 class="text-2xl font-bold text-white mb-4">
                                Mantente actualizado
                            </h4>
                            <p class="text-gray-300">
                                Recibe las últimas noticias, actualizaciones y consejos para tu barbería.
                            </p>
                        </div>
                        <div class="flex gap-4">
                            <input 
                                type="email" 
                                placeholder="tu@email.com"
                                class="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors duration-300">
                            <button pButton pRipple 
                                    label="Suscribirse" 
                                    class="!bg-linear-to-r !from-yellow-400 !to-orange-500 !text-black !font-bold !px-6 !py-3 !rounded-xl hover:!scale-105 !transition-all !duration-300">
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Bottom Section -->
                <div class="border-t border-gray-700 pt-8">
                    <div class="flex flex-col lg:flex-row justify-between items-center gap-6">
                        <div class="text-gray-400 text-center lg:text-left">
                            <p>&copy; 2025 Auron-Suite. Todos los derechos reservados.</p>
                            <p class="text-sm mt-1">Desarrollado con ❤️ para peluquerías profesionales</p>
                        </div>
                        
                        <div class="flex flex-wrap gap-6 text-sm">
                            <a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">
                                Términos de Servicio
                            </a>
                            <a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">
                                Política de Privacidad
                            </a>
                            <a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">
                                Cookies
                            </a>
                            <a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">
                                GDPR
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Trust Badges -->
                <div class="mt-12 text-center">
                    <div class="flex justify-center items-center gap-8 flex-wrap">
                        <div class="flex items-center gap-2 text-gray-400">
                            <i class="pi pi-shield text-green-400"></i>
                            <span class="text-sm">SSL Seguro</span>
                        </div>
                        <div class="flex items-center gap-2 text-gray-400">
                            <i class="pi pi-verified text-blue-400"></i>
                            <span class="text-sm">GDPR Compliant</span>
                        </div>
                        <div class="flex items-center gap-2 text-gray-400">
                            <i class="pi pi-cloud text-purple-400"></i>
                            <span class="text-sm">Cloud Hosting</span>
                        </div>
                        <div class="flex items-center gap-2 text-gray-400">
                            <i class="pi pi-clock text-yellow-400"></i>
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