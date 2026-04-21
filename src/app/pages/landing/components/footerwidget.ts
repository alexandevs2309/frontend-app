import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AppConfigService } from '../../../core/services/app-config.service';

@Component({
    selector: 'footer-widget',
    standalone: true,
    imports: [RouterModule, CommonModule, ButtonModule, RippleModule],
    template: `
        <footer class="bg-slate-950 py-24 lg:py-32 relative overflow-hidden">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.1),transparent_20%)]"></div>
            <div class="max-w-7xl mx-auto px-6 lg:px-8">
                <div class="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
                    <div class="lg:col-span-1">
                        <div class="flex items-center mb-6">
                            <div class="flex items-center justify-center rounded-2xl bg-white px-2.5 py-2 border border-white/60 shadow-sm mr-4">
                                <img src="assets/logos/iso-auron.jpg" [alt]="appConfig.platformName()" class="h-9 w-9 object-contain rounded-xl" />
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold text-white">{{ appConfig.platformName() }}</h3>
                                <div class="text-xs uppercase tracking-[0.22em] text-slate-500">Salon Management</div>
                            </div>
                        </div>
                        <p class="text-slate-300 mb-6 leading-relaxed">
                            Plataforma para ordenar citas, ventas, clientes e inventario en barberias y negocios de cuidado personal.
                        </p>

                        <div class="flex space-x-4">
                            <a [attr.href]="'mailto:' + appConfig.supportEmail()" class="inline-flex">
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
                            <li><a (click)="scrollToSection('testimonials')" class="text-slate-300 hover:text-white transition-colors cursor-pointer">Beneficios</a></li>
                            <li><a routerLink="/auth/register" class="text-slate-300 hover:text-white transition-colors">Crear cuenta</a></li>
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
                            <li><a [attr.href]="'mailto:' + appConfig.supportEmail()" class="text-slate-300 hover:text-white transition-colors">{{ appConfig.supportEmail() }}</a></li>
                            <li *ngIf="appConfig.platformDomain()"><a [attr.href]="appConfig.publicSiteUrl()" class="text-slate-300 hover:text-white transition-colors">{{ appConfig.platformDomain() }}</a></li>
                            <li><span class="text-slate-300">Santo Domingo, República Dominicana</span></li>
                            <li><span class="text-slate-300">Respuesta comercial por email</span></li>
                            <li><a routerLink="/auth/register" class="text-slate-300 hover:text-white transition-colors">Crear cuenta</a></li>
                        </ul>
                    </div>
                </div>

                <div class="relative z-10 bg-linear-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-[2rem] p-8 mb-12 border border-slate-800 shadow-[0_28px_90px_-56px_rgba(15,23,42,0.8)]">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h4 class="text-2xl font-bold text-white mb-4">Lleva tu barberia o salon a una operacion mas ordenada</h4>
                            <p class="text-slate-300">
                                Si estas buscando un software para barberias y salones que te ayude a vender mejor, ahorrar tiempo y controlar tu operacion, este es el momento para empezar.
                            </p>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <a [attr.href]="getSalesContactHref()" class="sm:flex-1">
                                <button pButton pRipple label="Hablar con ventas" class="w-full bg-indigo-600! text-white! font-semibold! px-6! py-3! hover:bg-indigo-700! border-0!"></button>
                            </a>
                            <a routerLink="/auth/register" class="sm:flex-1">
                                <button pButton pRipple label="Crear cuenta" class="w-full bg-slate-700! text-white! font-semibold! px-6! py-3! hover:bg-slate-600! border border-slate-600!"></button>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="relative z-10 border-t border-slate-800 pt-8">
                    <div class="flex flex-col lg:flex-row justify-between items-center gap-6">
                        <div class="text-slate-400 text-center lg:text-left">
                            <p>&copy; {{ currentYear }} {{ appConfig.platformName() }}. Todos los derechos reservados.</p>
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
    currentYear = new Date().getFullYear();

    constructor(public appConfig: AppConfigService) {}

    getSalesContactHref(): string {
        return `mailto:${this.appConfig.supportEmail()}?subject=${encodeURIComponent(`Consulta sobre ${this.appConfig.platformName()}`)}`;
    }

    scrollToSection(sectionId: string) {
        const element = document.querySelector(`[data-section="${sectionId}"]`) || document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}
