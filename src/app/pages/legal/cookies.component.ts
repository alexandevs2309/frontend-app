import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-cookies',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_40%),linear-gradient(180deg,#f8fafc_0%,#fff7ed_100%)] px-4 py-10 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
            <div class="mx-auto max-w-5xl space-y-8">
                <section class="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_28px_90px_-50px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/75">
                    <a
                        routerLink="/"
                        class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                        Auron-Suite
                    </a>
                    <h1 class="mt-5 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Política de Cookies
                    </h1>
                    <p class="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                        Esta política describe el uso de cookies y tecnologías similares en el sitio público y en el panel
                        autenticado de Auron-Suite.
                    </p>
                    <div class="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>Última actualización: {{ currentDate }}</span>
                        <span>Producto: Auron-Suite</span>
                        <span>Operador: Auron Technologies SRL</span>
                    </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">1. Qué son las cookies</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Las cookies son pequeños archivos o identificadores que pueden almacenarse en el navegador o en el entorno de
                        la sesión para facilitar autenticación, seguridad, continuidad de navegación, preferencias o medición técnica
                        del funcionamiento del servicio.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">2. Sitio público y panel autenticado</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El sitio público puede utilizar cookies técnicas para navegación básica, preferencias o funcionamiento del
                        banner de consentimiento. El panel autenticado puede utilizar cookies o identificadores de sesión necesarios
                        para autenticación, seguridad de cuenta, persistencia de sesión y continuidad operativa del servicio.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">3. Cookies esenciales y funcionales</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Son aquellas necesarias para autenticación, prevención de fraude, mantenimiento de sesión, seguridad,
                        enrutamiento o funcionamiento básico de la plataforma. Estas cookies o identificadores forman parte esencial
                        del servicio y no pueden desactivarse si desea utilizar funciones críticas de la aplicación.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">4. Cookies analíticas</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        A la fecha de esta versión, Auron-Suite no utiliza cookies analíticas propias activas como parte esencial del
                        servicio público descrito en esta política. Si en el futuro se activan herramientas analíticas o de medición
                        no esenciales, esta política y el mecanismo de consentimiento correspondiente serán actualizados de forma
                        consistente.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">5. Cookies o tecnologías de terceros</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Determinados servicios de terceros integrados al producto pueden utilizar identificadores técnicos en sus
                        propios flujos, como puede ocurrir con Stripe en el procesamiento de pagos o validaciones asociadas. El uso de
                        dichos mecanismos depende de la interacción real del usuario con esos servicios y se encuentra además sujeto a
                        las políticas del proveedor correspondiente.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">6. Duración y gestión</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Algunas cookies o identificadores son de sesión y se eliminan al cerrar el navegador; otras pueden conservarse
                        temporalmente para recordar preferencias o mantener continuidad operativa. Puede gestionar o bloquear cookies
                        desde la configuración de su navegador, aunque ello podría afectar el funcionamiento de determinadas áreas del
                        servicio.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">7. Cambios y contacto</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Esta política podrá actualizarse para reflejar cambios tecnológicos, operativos o regulatorios. Para
                        consultas, puede escribir a
                        <a
                            href="mailto:contacto@auron-suite.com"
                            class="font-semibold text-amber-600 transition hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
                        >
                            contacto@auron-suite.com
                        </a>.
                        Auron-Suite es operado por Auron Technologies SRL desde Santo Domingo, República Dominicana.
                    </p>
                </section>
            </div>
        </div>
    `
})
export class CookiesComponent {
    readonly currentDate = '14 de marzo de 2026';
}
