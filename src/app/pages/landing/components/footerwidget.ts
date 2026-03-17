import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'footer-widget',
    standalone: true,
    imports: [RouterModule, CommonModule, ButtonModule, RippleModule , DatePipe],
    template: `
        <footer class="bg-slate-900 dark:bg-slate-950 py-24 lg:py-32">
            <div class="max-w-7xl mx-auto px-6 lg:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
                    <div class="lg:col-span-1">
                        <div class="flex items-center mb-6">
                            <div class="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mr-4">
                                <span class="text-white font-bold text-xl">A</span>
                            </div>
                            <h3 class="text-2xl font-bold text-white">Auron Suite</h3>
                        </div>
                        <p class="text-slate-300 mb-6 leading-relaxed">
                            Plataforma para ordenar citas, ventas, clientes e inventario en barberias y negocios de cuidado personal.
                        </p>

                        <div class="flex space-x-4">
                            <a href="mailto:contacto@auron-suite.com" class="inline-flex">
                                <button pButton pRipple icon="pi pi-envelope" [rounded]="true" [text]="true" class="text-slate-400! hover:text-sky-400! transition-colors!" aria-label="Correo"></button>
                            </a>
                            <a routerLink="/auth/register" class="inline-flex">
                                <button pButton pRipple icon="pi pi-user-plus" [rounded]="true" [text]="true" class="text-slate-400 hover:!text-indigo-300! transition-colors!" aria-label="Crear cuenta"></button>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-lg font-semibold text-white mb-6">Producto</h4>
                        <ul class="space-y-4">
                            <li><a (click)="scrollToSection('features')" class="text-slate-300 hover:text-white transition-colors cursor-pointer">Funciones</a></li>
                            <li><a (click)="scrollToSection('pricing')" class="text-slate-300 hover:text-white transition-colors cursor-pointer">Planes</a></li>
                            <li><a (click)="scrollToSection('testimonials')" class="text-slate-300 hover:text-white transition-colors cursor-pointer">Resultados</a></li>
                            <li><a routerLink="/auth/register" class="text-slate-300 hover:text-white transition-colors">Empezar prueba</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="text-lg font-semibold text-white mb-6">Recursos</h4>
                        <ul class="space-y-4">
                            <li><a routerLink="/about" class="text-slate-300 hover:text-white transition-colors">Acerca de</a></li>
                            <li><a routerLink="/privacy" class="text-slate-300 hover:text-white transition-colors">Privacidad</a></li>
                            <li><a routerLink="/terms" class="text-slate-300 hover:text-white transition-colors">Terminos</a></li>
                            <li><a routerLink="/cookies" class="text-slate-300 hover:text-white transition-colors">Cookies</a></li>
                            <li><a routerLink="/billing" class="text-slate-300 hover:text-white transition-colors">Facturacion</a></li>
                            <li><a routerLink="/acceptable-use" class="text-slate-300 hover:text-white transition-colors">Uso aceptable</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="text-lg font-semibold text-white mb-6">Contacto</h4>
                        <ul class="space-y-4">
                            <li><a href="mailto:contacto@auron-suite.com" class="text-slate-300 hover:text-white transition-colors">contacto@auron-suite.com</a></li>
                            <li><span class="text-slate-300">Santo Domingo, República Dominicana</span></li>
                            <li><span class="text-slate-300">Respuesta comercial por email</span></li>
                            <li><a routerLink="/auth/register" class="text-slate-300 hover:text-white transition-colors">Crear cuenta</a></li>
                        </ul>
                    </div>
                </div>

                <div class="bg-slate-800 dark:bg-slate-900 rounded-2xl p-8 mb-12 border border-slate-700">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h4 class="text-2xl font-bold text-white mb-4">¿Quieres evaluar Auron-Suite?</h4>
                            <p class="text-slate-300">
                                Si estas revisando opciones para tu negocio, podemos orientarte por email sobre planes, implementacion y alcance actual del sistema.
                            </p>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <a href="mailto:contacto@auron-suite.com?subject=Consulta%20sobre%20Auron-Suite" class="sm:flex-1">
                                <button pButton pRipple label="Escribir a ventas" class="w-full bg-indigo-600! text-white! font-semibold! px-6! py-3! hover:bg-indigo-700! border-0!"></button>
                            </a>
                            <a routerLink="/auth/register" class="sm:flex-1">
                                <button pButton pRipple label="Crear cuenta" class="w-full bg-slate-700! text-white! font-semibold! px-6! py-3! hover:bg-slate-600! border border-slate-600!"></button>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="border-t border-slate-700 pt-8">
                    <div class="flex flex-col lg:flex-row justify-between items-center gap-6">
                        <div class="text-slate-400 text-center lg:text-left">
                            <p>&copy; {{fechaActual() | date:'yyyy'}} Auron Suite. Todos los derechos reservados.</p>
                            <p class="text-sm mt-1">Construido para negocios que necesitan mas orden operativo.</p>
                        </div>

                        <div class="flex flex-wrap gap-6 text-sm">
                            <a routerLink="/terms" class="text-slate-400 hover:text-white transition-colors">Terminos</a>
                            <a routerLink="/privacy" class="text-slate-400 hover:text-white transition-colors">Privacidad</a>
                            <a routerLink="/cookies" class="text-slate-400 hover:text-white transition-colors">Cookies</a>
                            <a routerLink="/billing" class="text-slate-400 hover:text-white transition-colors">Facturacion</a>
                            <a routerLink="/acceptable-use" class="text-slate-400 hover:text-white transition-colors">Uso aceptable</a>
                            <a routerLink="/dpa" class="text-slate-400 hover:text-white transition-colors">DPA</a>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    `
})
export class FooterWidget {

    
        fechaActual = signal(new Date());

    constructor(public router: Router) {
        setInterval(() => {
            this.fechaActual.set(new Date());
        }, 1000);
    }

    scrollToSection(sectionId: string) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }



}
