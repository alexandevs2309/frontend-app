import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-terms',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
            <div class="mx-auto max-w-5xl space-y-8">
                <section class="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_28px_90px_-50px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/75">
                    <a
                        routerLink="/"
                        class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <span class="h-2 w-2 rounded-full bg-sky-500"></span>
                        Auron-Suite
                    </a>
                    <h1 class="mt-5 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Términos de Servicio
                    </h1>
                    <p class="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                        Estos términos regulan el acceso y uso de Auron-Suite como plataforma SaaS para la gestión de peluquerías,
                        barberías y salones de belleza.
                    </p>
                    <div class="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>Última actualización: {{ currentDate }}</span>
                        <span>Producto: Auron-Suite</span>
                        <span>Operador: Auron Technologies SRL</span>
                    </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">1. Introducción y aceptación</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Al registrarse, acceder o utilizar Auron-Suite, el cliente acepta estos Términos de Servicio y declara que
                        cuenta con capacidad suficiente para obligarse en nombre propio o de la organización que representa.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">2. Uso permitido del servicio</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El servicio deberá utilizarse exclusivamente para fines empresariales legítimos relacionados con la gestión de
                        clientes, empleados, citas, ventas, inventario, reportes y operaciones asociadas al negocio del cliente.
                        Queda prohibido usar la plataforma para actividades ilícitas, fraudulentas, abusivas o que afecten la
                        seguridad, disponibilidad o integridad del sistema.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">3. Registro de cuenta y credenciales</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El cliente es responsable de proporcionar información veraz, completa y actualizada, así como de mantener la
                        confidencialidad de sus credenciales y las de sus usuarios autorizados. Toda actividad realizada desde la
                        cuenta se presumirá autorizada por el cliente, salvo prueba en contrario.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">4. Suscripciones, facturación y renovaciones</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El acceso a Auron-Suite puede requerir la contratación de planes mensuales, trimestrales o anuales. Los pagos
                        se procesan mediante Stripe y, salvo indicación contraria, las suscripciones se renuevan automáticamente por
                        un período equivalente al originalmente contratado.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">5. Datos del cliente y Data Processing Agreement</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Los datos ingresados por el cliente o por sus usuarios en la plataforma siguen siendo responsabilidad del
                        cliente correspondiente. En relación con dichos datos, el negocio cliente actúa como Data Controller y Auron
                        Technologies SRL, operadora de Auron-Suite, actúa como Data Processor conforme al DPA aplicable y a la
                        Política de Privacidad publicada.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">6. Exportación de datos al finalizar la suscripción</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Antes de la terminación definitiva del servicio, el cliente podrá solicitar la exportación razonable de sus
                        datos en un formato compatible con la operación del sistema, siempre que ello sea técnicamente posible y se
                        encuentre al día en sus obligaciones económicas. La conservación posterior y eliminación diferida de copias de
                        respaldo se regirá por la Política de Privacidad y el DPA.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">7. Disponibilidad del servicio</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron-Suite se ofrece bajo un modelo SaaS y puede verse sujeto a mantenimiento programado, actualizaciones,
                        incidentes técnicos, fallas de terceros o interrupciones razonables necesarias para proteger la seguridad y
                        continuidad del sistema. Auron Technologies SRL procurará mantener una operación estable, pero no garantiza
                        disponibilidad absoluta e ininterrumpida salvo pacto expreso por escrito.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">8. Propiedad intelectual</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        La plataforma, su código, diseño, interfaces, documentación, marcas, elementos visuales y demás activos
                        relacionados con el servicio son propiedad de Auron Technologies SRL o de sus licenciantes. El cliente recibe
                        únicamente una licencia limitada, no exclusiva, revocable e intransferible para utilizar el servicio conforme
                        a estos términos.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">9. Suspensión o terminación</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron Technologies SRL podrá suspender o terminar el acceso al servicio por incumplimiento contractual, falta
                        de pago, riesgos de seguridad, uso fraudulento, requerimientos legales o cualquier circunstancia que comprometa
                        la integridad del sistema o de terceros.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">10. Limitación de responsabilidad e indemnización</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        En la medida permitida por la normativa aplicable, Auron Technologies SRL no será responsable por daños
                        indirectos, lucro cesante, pérdida de datos, interrupciones del negocio o perjuicios derivados del uso
                        indebido del servicio, fallas de proveedores externos o eventos fuera de su control razonable. El cliente se
                        obliga a indemnizar a la operadora por reclamaciones derivadas de su uso indebido del servicio o de datos
                        cargados sin base legítima.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">11. Fuerza mayor</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Ninguna de las partes será responsable por incumplimientos causados por eventos de fuerza mayor o situaciones
                        fuera de su control razonable, incluyendo fallas generales de telecomunicaciones, incidentes de infraestructura,
                        desastres naturales, actos de autoridad, conflictos laborales o eventos equivalentes que afecten la prestación
                        del servicio.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">12. Ley aplicable y foro competente</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Estos términos se interpretarán conforme a la legislación de la República Dominicana. Cualquier controversia
                        relacionada con el uso del servicio, en la medida en que no pueda resolverse de forma amistosa, será sometida
                        a la jurisdicción de los tribunales competentes de la República Dominicana.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">13. Contacto</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron-Suite es operado por Auron Technologies SRL desde Santo Domingo, República Dominicana. Para consultas
                        legales, contractuales o relacionadas con estos términos, puede escribir a
                        <a
                            href="mailto:contacto@auron-suite.com"
                            class="font-semibold text-sky-600 transition hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
                        >
                            contacto@auron-suite.com
                        </a>.
                    </p>
                </section>
            </div>
        </div>
    `
})
export class TermsComponent {
    readonly currentDate = '14 de marzo de 2026';
}
