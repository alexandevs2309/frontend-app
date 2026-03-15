import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { BarbershopSettingsService } from '../../../shared/services/barbershop-settings.service';

@Component({
    selector: 'app-help',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, AccordionModule, InputTextModule, ButtonModule],
    template: `
        <div class="help-page p-4 md:p-6">
            <section class="help-hero mb-6">
                <div class="flex items-center gap-4">
                    <div class="hero-icon">
                        <i class="pi pi-question-circle text-white text-2xl"></i>
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold mb-1">Centro de ayuda</h1>
                        <p class="hero-subtitle">Resuelve dudas rápidas sobre ventas, citas, empleados y configuración.</p>
                    </div>
                </div>
            </section>

            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div class="xl:col-span-2">
                    <p-card>
                        <div class="space-y-4">
                            <div>
                                <h2 class="section-title">Preguntas frecuentes</h2>
                                <p class="section-subtitle">Busca por palabra clave o abre una categoría.</p>
                            </div>

                            <div>
                                <input
                                    pInputText
                                    type="text"
                                    class="w-full"
                                    placeholder="Buscar: venta, cita, empleado, reporte..."
                                    [(ngModel)]="searchTerm"
                                />
                            </div>

                            @if (filteredFaqs().length > 0) {
                                <p-accordion>
                                    @for (faq of filteredFaqs(); track faq.title; let i = $index) {
                                        <p-accordion-panel [value]="i.toString()">
                                            <p-accordion-header>{{ faq.title }}</p-accordion-header>
                                            <p-accordion-content>
                                                <p class="m-0">{{ faq.content }}</p>
                                            </p-accordion-content>
                                        </p-accordion-panel>
                                    }
                                </p-accordion>
                            } @else {
                                <div class="empty-state">
                                    <i class="pi pi-search text-xl"></i>
                                    <p class="m-0">No encontramos resultados para "{{ searchTerm }}".</p>
                                </div>
                            }
                        </div>
                    </p-card>
                </div>

                <div class="space-y-6">
                    <p-card>
                        <div class="space-y-3">
                            <h3 class="section-title !mb-0">Accesos rápidos</h3>
                            <button pButton class="w-full p-button-outlined" icon="pi pi-shopping-cart" label="Ir a POS" (click)="go('/client/pos')"></button>
                            <button pButton class="w-full p-button-outlined" icon="pi pi-calendar" label="Ir a Citas" (click)="go('/client/appointments')"></button>
                            <button pButton class="w-full p-button-secondary p-button-outlined" icon="pi pi-cog" label="Ir a Configuración" (click)="go('/client/settings')"></button>
                        </div>
                    </p-card>

                    <p-card>
                        <div class="space-y-3">
                            <h3 class="section-title !mb-0">Soporte</h3>
                            <p class="section-subtitle">Si no encuentras la respuesta, contáctanos:</p>
                            <div class="support-item">
                                <i class="pi pi-envelope"></i>
                                <span>{{ supportEmail() }}</span>
                            </div>
                            <div class="support-item">
                                <i class="pi pi-phone"></i>
                                <span>{{ supportPhone() }}</span>
                            </div>
                            <div class="support-item">
                                <i class="pi pi-clock"></i>
                                <span>Lunes a Viernes, 9:00 AM - 6:00 PM</span>
                            </div>
                        </div>
                    </p-card>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .help-page {
            background: linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 35%, transparent 100%);
            min-height: calc(100vh - 7rem);
            border-radius: 1rem;
        }

        .help-hero {
            border: 1px solid var(--surface-border);
            background: var(--surface-card);
            border-radius: 1rem;
            padding: 1.25rem;
        }

        .hero-icon {
            width: 3rem;
            height: 3rem;
            border-radius: 0.75rem;
            background: linear-gradient(135deg, #4f46e5, #06b6d4);
            display: grid;
            place-items: center;
        }

        .hero-subtitle {
            margin: 0;
            color: var(--text-color-secondary);
        }

        .section-title {
            margin: 0 0 0.25rem;
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--text-color);
        }

        .section-subtitle {
            margin: 0;
            color: var(--text-color-secondary);
            font-size: 0.92rem;
        }

        .empty-state {
            border: 1px dashed var(--surface-border);
            border-radius: 0.75rem;
            padding: 1rem;
            display: flex;
            gap: 0.75rem;
            align-items: center;
            color: var(--text-color-secondary);
        }

        .support-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-color);
            font-size: 0.92rem;
        }
    `]
})
export class HelpComponent {
    searchTerm = '';

    faqs = [
        {
            title: '¿Cómo registrar una venta?',
            content: 'Abre POS desde el menú. 1) Selecciona servicios/productos. 2) Asigna cliente (o cliente general) y empleado. 3) Revisa cantidades, descuentos e impuestos antes de cobrar. 4) Elige método de pago y confirma. Si no te deja procesar, valida que caja esté abierta y que tengas permisos de venta.'
        },
        {
            title: '¿Cómo agregar empleados?',
            content: 'Ve a Empleados > Nuevo empleado. Completa nombre, correo, rol y datos de contacto. Si deseas acceso al sistema, asegúrate de crear/ligar usuario con rol correcto. Recomendado: validar teléfono y correo antes de guardar para evitar duplicados y problemas de acceso.'
        },
        {
            title: '¿Cómo gestionar citas?',
            content: 'En Citas puedes crear, reprogramar y cancelar reservas. Flujo sugerido: 1) Selecciona cliente. 2) Elige servicio. 3) Asigna empleado disponible. 4) Confirma fecha/hora. Al editar, revisa solapamientos para evitar dobles reservas. Si cancelas, agrega motivo para trazabilidad.'
        },
        {
            title: '¿Cómo generar reportes?',
            content: 'Abre Reportes y elige el tipo (ventas, servicios, empleados, etc.). Define rango de fechas y filtros por sucursal/empleado si aplica. Genera y valida: total bruto, descuentos y neto. Consejo: usa períodos fijos (semanal/mensual) para comparar rendimiento con consistencia.'
        },
        {
            title: '¿Cómo configurar mi barbería?',
            content: 'En Configuración puedes actualizar datos del negocio, horarios, moneda y ajustes POS. Cambios sensibles (como moneda) pueden impactar reportes y ventas existentes; confirma antes de guardar. Después de cambios importantes, realiza una prueba rápida en POS para verificar que todo quedó correcto.'
        },
        {
            title: '¿Cómo cambio mi contraseña?',
            content: 'Desde Mi cuenta > Cambiar contraseña. Ingresa tu contraseña actual y luego una nueva con mínimo 8 caracteres, mayúscula y número. Evita usar datos obvios (nombre, teléfono, fecha). Si olvidaste tu clave, usa "Olvidé mi contraseña" en la pantalla de login.'
        },
        {
            title: '¿Qué hago si no veo un módulo del menú?',
            content: 'Generalmente es por permisos de rol. Verifica tu rol en Mi cuenta y confirma con el administrador qué módulos deberías tener. Si cambiaste rol recientemente, cierra sesión y vuelve a entrar para refrescar permisos.'
        },
        {
            title: '¿Qué revisar si algo falla al guardar?',
            content: '1) Revisa campos obligatorios y formato (email, teléfono, horas). 2) Confirma conexión a internet y sesión activa. 3) Intenta nuevamente. Si persiste, comparte con soporte: módulo, acción, hora del error y captura de pantalla.'
        }
    ];

    constructor(
        private router: Router,
        private barbershopSettings: BarbershopSettingsService
    ) {}

    filteredFaqs() {
        const term = this.searchTerm.trim().toLowerCase();
        if (!term) return this.faqs;
        return this.faqs.filter(
            (faq) => faq.title.toLowerCase().includes(term) || faq.content.toLowerCase().includes(term)
        );
    }

    go(route: string): void {
        this.router.navigate([route]);
    }

    supportEmail(): string {
        return this.barbershopSettings.settings()?.contact?.email || 'auronsuite.soporte@gmail.com';
    }

    supportPhone(): string {
        return this.barbershopSettings.settings()?.contact?.phone || '+1 (809) 000-0000';
    }
}
