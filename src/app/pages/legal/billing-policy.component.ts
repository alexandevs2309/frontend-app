import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-billing-policy',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
            <div class="mx-auto max-w-5xl space-y-8">
                <section class="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_28px_90px_-50px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/75">
                    <a
                        routerLink="/"
                        class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
                        Auron-Suite
                    </a>
                    <h1 class="mt-5 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Política de Facturación y Suscripciones
                    </h1>
                    <p class="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                        Esta política describe cómo se gestionan los planes, cobros, renovaciones, cambios de plan y situaciones de
                        impago dentro de Auron-Suite.
                    </p>
                    <div class="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>Última actualización: {{ currentDate }}</span>
                        <span>Producto: Auron-Suite</span>
                        <span>Operador: Auron Technologies SRL</span>
                    </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">1. Planes de suscripción</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron-Suite, operado por Auron Technologies SRL, ofrece planes con ciclos mensuales, trimestrales y anuales.
                        Cada plan puede incluir límites de usuarios, empleados, sucursales y funcionalidades según la oferta vigente
                        al momento de la contratación o renovación.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">2. Cobro y renovación automática</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Las suscripciones se cobran por adelantado mediante Stripe y, salvo indicación contraria, se renuevan
                        automáticamente al final de cada ciclo por un período equivalente. El cliente autoriza el cobro recurrente con
                        el método de pago registrado mientras la suscripción permanezca activa.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">3. Cancelaciones y cambios de plan</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El cliente puede cancelar la renovación antes del siguiente vencimiento. La cancelación evita cobros futuros,
                        pero normalmente permite mantener el acceso hasta el final del período ya pagado. Los cambios de plan pueden
                        generar ajustes prorrateados o aplicarse al siguiente ciclo, según la configuración comercial y técnica
                        utilizada en Stripe.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">4. Reembolsos</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Salvo obligación legal aplicable, error de cobro comprobado o decisión comercial expresa de Auron Technologies
                        SRL, los pagos realizados no son reembolsables y no generan devoluciones proporcionales por períodos
                        parcialmente utilizados.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">5. Pagos fallidos, reintentos y período de gracia</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Cuando un cobro no pueda completarse, Stripe o la configuración de facturación asociada podrá realizar uno o
                        varios reintentos automáticos de cobro. Durante un período de gracia razonable, el cliente podrá actualizar su
                        método de pago y regularizar la cuenta sin perder inmediatamente el acceso, salvo que existan riesgos de fraude
                        o incumplimientos graves adicionales.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">6. Suspensión por impago</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Si el cliente no regulariza el pago dentro del período de gracia o tras los reintentos razonables de cobro,
                        Auron Technologies SRL podrá restringir funciones, suspender temporalmente la cuenta o desactivar el acceso
                        hasta que la situación de pago sea resuelta.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">7. Impuestos y disputas de pago</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Los importes pueden estar sujetos a impuestos, tasas o cargos aplicables. En caso de chargeback, fraude,
                        reversión o disputa de pago, Auron Technologies SRL podrá investigar el incidente, suspender temporalmente el
                        servicio y adoptar las medidas necesarias para proteger la cuenta y la operación del sistema.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">8. Contacto</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Para consultas sobre planes, cobros, renovaciones o incidencias de facturación, puede escribir a
                        <a
                            href="mailto:contacto@auron-suite.com"
                            class="font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
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
export class BillingPolicyComponent {
    readonly currentDate = '14 de marzo de 2026';
}
