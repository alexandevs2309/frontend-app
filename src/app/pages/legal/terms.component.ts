import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppConfigService } from '../../core/services/app-config.service';
import { PublicPageTopbarComponent } from '../../shared/components/public-page-topbar.component';

@Component({
    selector: 'app-terms',
    standalone: true,
    imports: [CommonModule, RouterLink, PublicPageTopbarComponent],
    template: `
        <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
            <app-public-page-topbar />
            <div class="mx-auto max-w-6xl space-y-8">
                <section class="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_28px_90px_-50px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/75">
                    <a
                        routerLink="/"
                        class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <span class="h-2 w-2 rounded-full bg-sky-500"></span>
                        {{ appConfig.platformName() }}
                    </a>
                    <h1 class="mt-5 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Términos de Servicio
                    </h1>
                    <p class="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                        Estos términos regulan el acceso y uso de {{ appConfig.platformName() }} como plataforma SaaS para la gestión de peluquerías,
                        barberías y salones de belleza.
                    </p>
                    <div class="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>Última actualización: {{ currentDate }}</span>
                        <span>Producto: {{ appConfig.platformName() }}</span>
                        <span *ngIf="appConfig.platformDomain()">Dominio: {{ appConfig.platformDomain() }}</span>
                        <span>Operador: Auron Technologies IERL</span>
                    </div>
                    <div class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <article
                            *ngFor="let card of summaryCards"
                            class="rounded-3xl border border-sky-100 bg-sky-50/80 p-5 shadow-[0_20px_50px_-40px_rgba(14,165,233,0.45)] dark:border-sky-500/20 dark:bg-sky-500/10"
                        >
                            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">Resumen</p>
                            <h2 class="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{{ card.title }}</h2>
                            <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ card.description }}</p>
                        </article>
                    </div>
                </section>

                <section class="grid gap-6 lg:grid-cols-[1.35fr,0.95fr]">
                    <article class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                        <p class="text-sm font-semibold uppercase tracking-[0.26em] text-sky-600 dark:text-sky-300">Lectura rápida</p>
                        <h2 class="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">Lo que estos términos significan en la práctica</h2>
                        <div class="mt-6 space-y-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                            <p>El cliente contrata una licencia de uso SaaS, no una cesión del software ni una promesa de disponibilidad absoluta.</p>
                            <p>El acceso al servicio depende del uso legítimo de la cuenta, del cumplimiento de pago y de que no existan riesgos relevantes de seguridad o abuso.</p>
                            <p>Los datos operativos cargados por el negocio siguen bajo responsabilidad del cliente en cuanto a legitimación, exactitud y uso frente a terceros.</p>
                        </div>
                    </article>
                    <article class="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-slate-100 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.55)] dark:border-slate-700">
                        <p class="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">Checklist legal</p>
                        <ul class="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                            <li>El cliente debe tener autoridad para contratar y para cargar los datos tratados en la plataforma.</li>
                            <li>Los planes, renovaciones y restricciones de acceso se rigen por estos términos y la política de facturación.</li>
                            <li>Las integraciones con terceros se usan bajo sus propios términos además de los de {{ appConfig.platformName() }}.</li>
                            <li>La continuidad del servicio puede verse afectada por mantenimiento, proveedores externos o medidas de contención.</li>
                        </ul>
                    </article>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">1. Introducción y aceptación</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Al registrarse, acceder o utilizar Auron-Suite, el cliente acepta estos Términos de Servicio y declara que
                        cuenta con capacidad suficiente para obligarse en nombre propio o de la organización que representa.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Si una persona crea, administra o utiliza una cuenta en nombre de una empresa, declara además que tiene
                        autorización suficiente para vincular a dicha organización respecto del plan contratado, los usuarios
                        autorizados y el tratamiento de datos derivado del uso del servicio.
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
                    <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/60">
                        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Ejemplos de uso prohibido</p>
                        <ul class="mt-4 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            <li>Intentar eludir permisos, aislamientos por tenant o controles de autenticación.</li>
                            <li>Cargar datos sin base legítima, consentimientos o facultades adecuadas frente a terceros.</li>
                            <li>Usar automatizaciones, scraping o tráfico anómalo que degraden el servicio o afecten a otros clientes.</li>
                            <li>Subir contenido ilícito, malicioso, infractor o que comprometa a terceros o a la propia plataforma.</li>
                        </ul>
                    </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">3. Registro de cuenta y credenciales</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El cliente es responsable de proporcionar información veraz, completa y actualizada, así como de mantener la
                        confidencialidad de sus credenciales y las de sus usuarios autorizados. Toda actividad realizada desde la
                        cuenta se presumirá autorizada por el cliente, salvo prueba en contrario.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El cliente deberá implementar prácticas razonables de control interno sobre altas, bajas, permisos y
                        rotación de usuarios. La plataforma puede imponer medidas técnicas de seguridad, verificación o
                        restablecimiento de sesión cuando detecte riesgo, abuso o credenciales comprometidas.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">4. Suscripciones, facturación y renovaciones</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El acceso a Auron-Suite puede requerir la contratación de planes mensuales, trimestrales o anuales. Los pagos
                        se procesan mediante Stripe y, salvo indicación contraria, las suscripciones se renuevan automáticamente por
                        un período equivalente al originalmente contratado.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Los cambios de precio, plan, ciclos, límites o beneficios podrán comunicarse con antelación razonable. La
                        falta de pago, el rechazo del cobro, el chargeback injustificado o la cancelación del medio de pago pueden
                        generar suspensión, restricción de funcionalidades, downgrade o terminación conforme a la política de
                        facturación aplicable.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">5. Datos del cliente y Data Processing Agreement</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Los datos ingresados por el cliente o por sus usuarios en la plataforma siguen siendo responsabilidad del
                        cliente correspondiente. En relación con dichos datos, el negocio cliente actúa como Data Controller y Auron
                        Technologies IERL, operadora de Auron-Suite, actúa como Data Processor conforme al DPA aplicable y a la
                        Política de Privacidad publicada.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El cliente garantiza que cuenta con base legal suficiente para recopilar, usar, almacenar y cargar en la
                        plataforma los datos de empleados, clientes finales u otros terceros, y asume la responsabilidad frente a
                        reclamaciones derivadas de datos ilícitamente obtenidos o tratados sin legitimación adecuada.
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
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        La exportación no incluye la obligación de reconstruir procesos, reformatear información a medida o mantener
                        indefinidamente un entorno inactivo. El cliente debe solicitarla dentro de un plazo razonable previo al
                        cierre definitivo de la cuenta.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">7. Disponibilidad del servicio</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron-Suite se ofrece bajo un modelo SaaS y puede verse sujeto a mantenimiento programado, actualizaciones,
                        incidentes técnicos, fallas de terceros o interrupciones razonables necesarias para proteger la seguridad y
                        continuidad del sistema. Auron Technologies IERL procurará mantener una operación estable, pero no garantiza
                        disponibilidad absoluta e ininterrumpida salvo pacto expreso por escrito.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Las ventanas de mantenimiento, medidas de contención, bloqueos preventivos, rotación de credenciales o
                        limitaciones temporales por seguridad forman parte de la operación razonable de un servicio SaaS y no se
                        considerarán incumplimiento por sí mismas cuando persigan proteger la integridad del sistema.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">8. Propiedad intelectual</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        La plataforma, su código, diseño, interfaces, documentación, marcas, elementos visuales y demás activos
                        relacionados con el servicio son propiedad de Auron Technologies IERL o de sus licenciantes. El cliente recibe
                        únicamente una licencia limitada, no exclusiva, revocable e intransferible para utilizar el servicio conforme
                        a estos términos.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">9. Suspensión o terminación</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron Technologies IERL podrá suspender o terminar el acceso al servicio por incumplimiento contractual, falta
                        de pago, riesgos de seguridad, uso fraudulento, requerimientos legales o cualquier circunstancia que comprometa
                        la integridad del sistema o de terceros.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Cuando sea razonablemente posible, la operadora procurará informar la causa general de la suspensión y
                        habilitar un canal de regularización. No obstante, podrá actuar de inmediato si existe riesgo de fraude,
                        abuso, brecha de seguridad, contenido ilícito o afectación a otros clientes.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">10. Limitación de responsabilidad e indemnización</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        En la medida permitida por la normativa aplicable, Auron Technologies IERL no será responsable por daños
                        indirectos, lucro cesante, pérdida de datos, interrupciones del negocio o perjuicios derivados del uso
                        indebido del servicio, fallas de proveedores externos o eventos fuera de su control razonable. El cliente se
                        obliga a indemnizar a la operadora por reclamaciones derivadas de su uso indebido del servicio o de datos
                        cargados sin base legítima.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Salvo dolo, fraude o supuestos en los que la ley impida limitar responsabilidad, la responsabilidad agregada
                        de Auron Technologies IERL vinculada al servicio no excederá el monto efectivamente pagado por el cliente por
                        la suscripción afectada durante los doce meses anteriores al hecho que origine la reclamación.
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
                        Auron-Suite es operado por Auron Technologies IERL desde Santo Domingo, República Dominicana. Para consultas
                        legales, contractuales o relacionadas con estos términos, puede escribir a
                        <a
                            [attr.href]="'mailto:' + appConfig.supportEmail()"
                            class="font-semibold text-sky-600 transition hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
                        >
                            {{ appConfig.supportEmail() }}
                        </a>.
                    </p>
                </section>
            </div>
        </div>
    `
})
export class TermsComponent {
    readonly currentDate = new Intl.DateTimeFormat('es-DO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());

    readonly summaryCards = [
        {
            title: 'Uso empresarial',
            description: 'La licencia cubre la operacion legitima del negocio cliente y no autoriza usos abusivos, fraudulentos o ajenos al servicio.'
        },
        {
            title: 'Suscripcion y renovacion',
            description: 'Los planes pueden renovarse automaticamente y el acceso puede restringirse si hay impago, fraude o riesgo tecnico relevante.'
        },
        {
            title: 'Datos del cliente',
            description: 'El cliente conserva la responsabilidad sobre la base legal de los datos que carga y Auron actua como proveedor tecnologico segun el DPA.'
        },
        {
            title: 'Responsabilidad',
            description: 'No se promete disponibilidad absoluta y la responsabilidad se limita razonablemente al marco contractual y legal aplicable.'
        }
    ];

    constructor(public appConfig: AppConfigService) {}
}
