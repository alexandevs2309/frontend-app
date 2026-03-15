import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-privacy',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_100%)] px-4 py-10 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
            <div class="mx-auto max-w-5xl space-y-8">
                <section class="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_28px_90px_-50px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/75">
                    <a
                        routerLink="/"
                        class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <span class="h-2 w-2 rounded-full bg-cyan-500"></span>
                        Auron-Suite
                    </a>
                    <h1 class="mt-5 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Política de Privacidad
                    </h1>
                    <p class="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                        Esta política explica cómo Auron Technologies SRL recopila, utiliza, conserva y protege datos personales
                        relacionados con el uso de Auron-Suite.
                    </p>
                    <div class="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>Última actualización: {{ currentDate }}</span>
                        <span>Producto: Auron-Suite</span>
                        <span>Operador: Auron Technologies SRL</span>
                    </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">1. Alcance y categorías de interesados</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Esta política aplica al tratamiento de datos relacionado con el sitio público, el registro de cuentas, el uso
                        operativo de Auron-Suite y las comunicaciones de soporte o preventa. En el contexto del servicio pueden
                        existir dos categorías principales de interesados: usuarios del negocio cliente, que acceden y operan la
                        plataforma, y clientes finales del negocio, cuyos datos son gestionados por el propio negocio dentro del
                        sistema.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">2. Datos recopilados</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Podemos tratar datos de identificación y contacto de titulares de cuenta, usuarios autorizados, empleados,
                        clientes finales, datos operativos de citas, ventas, reportes, inventario, logs técnicos, información de
                        soporte, datos de facturación y referencias necesarias para pagos procesados por Stripe.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">3. Finalidades y bases de tratamiento</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Los datos se utilizan para prestar el servicio, autenticar usuarios, gestionar suscripciones, procesar pagos,
                        enviar notificaciones operativas por email, responder solicitudes de soporte, mejorar seguridad y rendimiento,
                        así como cumplir obligaciones contractuales y legítimas derivadas de la operación del SaaS.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">4. Roles sobre los datos</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Respecto de los datos de usuarios del negocio cliente y de sus clientes finales cargados en la plataforma, el
                        negocio cliente actúa como responsable de dichos datos dentro de su operación y Auron Technologies SRL actúa
                        como proveedor tecnológico y Data Processor en la medida prevista por el DPA. Respecto de datos de contacto,
                        suscripción, soporte o preventa recabados directamente por la operadora, Auron Technologies SRL actúa como
                        responsable del tratamiento.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">5. Conservación de datos</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Los datos de cuenta y suscripción se conservarán mientras exista una relación activa y por el tiempo razonable
                        posterior necesario para soporte, auditoría, defensa contractual o cumplimiento de obligaciones. Los datos
                        operativos del cliente permanecerán disponibles mientras el servicio esté activo o hasta que el cliente
                        solicite su eliminación, sujeto a tiempos razonables de exportación, cierre y depuración. Los logs técnicos y
                        registros de seguridad podrán conservarse por períodos adicionales compatibles con necesidades legítimas de
                        estabilidad, trazabilidad y prevención de fraude. Las copias de respaldo podrán persistir temporalmente y ser
                        eliminadas de forma diferida en ciclos internos de backup.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">6. Proveedores y transferencias internacionales</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron Technologies SRL puede utilizar proveedores de infraestructura, correo electrónico, pagos, monitoreo o
                        seguridad para operar el servicio. Algunos de estos proveedores pueden encontrarse fuera de la jurisdicción
                        local, lo que puede implicar transferencias internacionales de datos. En tales casos, la operadora procurará
                        utilizar mecanismos contractuales y medidas razonables de protección acordes con la naturaleza del servicio.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">7. Seguridad de la información</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Se aplican medidas técnicas y organizativas razonables, incluyendo autenticación, control de acceso,
                        segregación lógica por cliente, monitoreo de actividad y medidas proporcionadas al riesgo para proteger la
                        confidencialidad, integridad y disponibilidad de la información tratada.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">8. Derechos y solicitudes</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Los titulares pueden solicitar acceso, actualización, corrección o eliminación de sus datos cuando corresponda.
                        Cuando la solicitud se refiera a datos gestionados por un negocio cliente dentro de su operación, la misma
                        deberá ser canalizada principalmente a través de dicho negocio, sin perjuicio de la asistencia razonable que
                        pueda brindar Auron Technologies SRL en su calidad de proveedor tecnológico.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">9. Datos de menores y cambios</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron-Suite no está diseñado específicamente para menores de edad. Si un negocio cliente gestiona datos de
                        menores dentro de su propia operación, será responsable de contar con la legitimación correspondiente. Esta
                        política podrá actualizarse para reflejar cambios legales, operativos o técnicos relevantes.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">10. Contacto</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron-Suite es operado por Auron Technologies SRL desde Santo Domingo, República Dominicana. Para consultas de
                        privacidad o tratamiento de datos, puede escribir a
                        <a
                            href="mailto:contacto@auron-suite.com"
                            class="font-semibold text-cyan-600 transition hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
                        >
                            contacto@auron-suite.com
                        </a>.
                    </p>
                </section>
            </div>
        </div>
    `
})
export class PrivacyComponent {
    readonly currentDate = '14 de marzo de 2026';
}
