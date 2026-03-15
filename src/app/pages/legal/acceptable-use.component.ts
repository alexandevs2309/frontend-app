import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-acceptable-use',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
            <div class="mx-auto max-w-5xl space-y-8">
                <section class="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_28px_90px_-50px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/75">
                    <a
                        routerLink="/"
                        class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                        Auron-Suite
                    </a>
                    <h1 class="mt-5 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Política de Uso Aceptable
                    </h1>
                    <p class="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                        Esta política establece las reglas mínimas de comportamiento y uso permitido para proteger la seguridad,
                        estabilidad y operación legítima de Auron-Suite como plataforma SaaS de gestión empresarial.
                    </p>
                    <div class="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>Última actualización: {{ currentDate }}</span>
                        <span>Producto: Auron-Suite</span>
                        <span>Operador: Auron Technologies SRL</span>
                    </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">1. Actividades prohibidas</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Queda prohibido utilizar Auron-Suite para acceder sin autorización a cuentas, datos o recursos del sistema,
                        eludir límites de plan, vulnerar medidas de seguridad, distribuir malware, enviar spam o ejecutar cualquier
                        actividad ilícita, engañosa o contraria a la buena fe comercial.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">2. Uso fraudulento</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        No se permite utilizar el servicio para manipular cobros, identidades, reportes, reservas, inventario,
                        permisos de acceso o registros operativos de forma engañosa, simulada o no autorizada. También se prohíbe
                        suplantar a terceros o usar credenciales ajenas sin permiso.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">3. Uso abusivo del sistema</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Se considera uso abusivo cualquier conducta que degrade el rendimiento del servicio, afecte la experiencia de
                        otros clientes o intente explotar el sistema por encima de los límites razonables de operación. Esto incluye
                        automatizaciones abusivas, scraping no autorizado, reverse engineering, intentos de carga masiva no prevista o
                        el uso de bots para eludir restricciones técnicas.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">4. Violación de derechos de terceros</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El cliente no podrá utilizar la plataforma para infringir derechos de privacidad, protección de datos,
                        propiedad intelectual, imagen, reputación o cualquier otro derecho de terceros. Cada negocio es responsable
                        de contar con base legítima para cargar y tratar la información de sus propios clientes, empleados y contactos.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">5. Consecuencias del incumplimiento</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El incumplimiento de esta política puede dar lugar a advertencias, limitaciones de acceso, suspensión
                        temporal, cancelación de la cuenta, retención de funciones o terminación del servicio, según la gravedad del
                        caso y sin perjuicio de otras acciones contractuales o legales que correspondan.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">6. Contacto</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Esta política forma parte del marco contractual de Auron-Suite, operado por Auron Technologies SRL desde
                        Santo Domingo, República Dominicana. Para consultas relacionadas con el uso permitido del servicio, puede escribir
                        a
                        <a
                            href="mailto:contacto@auron-suite.com"
                            class="font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
                        >
                            contacto@auron-suite.com
                        </a>.
                    </p>
                </section>
            </div>
        </div>
    `
})
export class AcceptableUseComponent {
    readonly currentDate = '14 de marzo de 2026';
}
