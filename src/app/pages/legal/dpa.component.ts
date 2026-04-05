import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppConfigService } from '../../core/services/app-config.service';
import { PublicPageTopbarComponent } from '../../shared/components/public-page-topbar.component';

@Component({
    selector: 'app-dpa',
    standalone: true,
    imports: [CommonModule, RouterLink, PublicPageTopbarComponent],
    template: `
        <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.12),_transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.16),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
            <app-public-page-topbar />
            <div class="mx-auto max-w-6xl space-y-8">
                <section class="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_28px_90px_-50px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/75">
                    <a
                        routerLink="/"
                        class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <span class="h-2 w-2 rounded-full bg-fuchsia-500"></span>
                        {{ appConfig.platformName() }}
                    </a>
                    <h1 class="mt-5 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Data Processing Agreement (DPA)
                    </h1>
                    <p class="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                        Este acuerdo regula el tratamiento de datos personales realizado por Auron Technologies IERL, operadora de
                        {{ appConfig.platformName() }}, cuando presta servicios SaaS por cuenta del negocio cliente.
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
                            class="rounded-3xl border border-fuchsia-100 bg-fuchsia-50/80 p-5 shadow-[0_20px_50px_-40px_rgba(192,38,211,0.45)] dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10"
                        >
                            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-700 dark:text-fuchsia-300">Punto clave</p>
                            <h2 class="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{{ card.title }}</h2>
                            <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ card.description }}</p>
                        </article>
                    </div>
                </section>

                <section class="grid gap-6 lg:grid-cols-[1.35fr,0.95fr]">
                    <article class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                        <p class="text-sm font-semibold uppercase tracking-[0.26em] text-fuchsia-600 dark:text-fuchsia-300">Marco operativo</p>
                        <h2 class="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">Este DPA aterriza cómo se procesan los datos del cliente dentro del SaaS</h2>
                        <div class="mt-6 space-y-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                            <p>El cliente decide la finalidad y legitimación de los datos que incorpora a la plataforma; Auron presta la infraestructura y el procesamiento técnico necesario para operar el servicio.</p>
                            <p>El tratamiento cubre almacenamiento, consulta, respaldo, soporte, restauración y otras operaciones estrictamente vinculadas al funcionamiento contratado.</p>
                            <p>Las obligaciones de seguridad, incidentes, subprocesadores y cierre de datos deben leerse junto con la Política de Privacidad y los Términos de Servicio.</p>
                        </div>
                    </article>
                    <article class="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-slate-100 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.55)] dark:border-slate-700">
                        <p class="text-sm font-semibold uppercase tracking-[0.26em] text-fuchsia-300">Distribución de responsabilidades</p>
                        <ul class="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                            <li>El cliente define qué datos carga, con qué base legal y durante cuánto tiempo los necesita.</li>
                            <li>Auron procesa esos datos para alojarlos, protegerlos y ponerlos a disposición dentro del servicio.</li>
                            <li>Los proveedores externos actúan como subprocesadores en la medida en que soporten infraestructura, pagos, mensajería o almacenamiento.</li>
                            <li>Los backups y medidas de contención pueden implicar persistencia temporal aun después de una baja operativa.</li>
                        </ul>
                    </article>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">1. Roles de las partes</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Para los datos personales ingresados en Auron-Suite, el negocio cliente actúa como Data Controller y Auron
                        Technologies IERL, operadora de la plataforma, actúa como Data Processor.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Cuando Auron trate datos propios de preventa, soporte, facturación o cumplimiento regulatorio, lo hará bajo su
                        propio rol de responsable según corresponda y fuera del alcance específico de este DPA.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">2. Objeto y alcance</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Este DPA cubre el tratamiento necesario para alojar, organizar, consultar, proteger, respaldar y poner a
                        disposición del cliente los datos personales gestionados dentro del servicio, incluyendo información de
                        usuarios del negocio, empleados, clientes finales, citas, ventas y comunicaciones operativas.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Las operaciones de tratamiento cubiertas pueden incluir almacenamiento, consulta, modificación, exportación,
                        respaldo, restauración, supresión y soporte técnico limitado, siempre en la medida necesaria para operar la
                        plataforma y conforme a la configuración contratada por el cliente.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">3. Instrucciones documentadas</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron Technologies IERL tratará los datos personales únicamente conforme a las instrucciones documentadas del
                        cliente, en la medida necesaria para prestar el servicio, salvo obligación legal o requerimiento competente en
                        contrario.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Se consideran instrucciones documentadas, entre otras, la configuración funcional del servicio, las acciones
                        ejecutadas por usuarios autorizados del cliente, los tickets o solicitudes de soporte verificables y las
                        condiciones técnicas del plan contratado.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">4. Medidas de seguridad y confidencialidad</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron Technologies IERL aplicará medidas técnicas y organizativas razonables para proteger los datos
                        personales, incluyendo control de acceso, autenticación, separación lógica entre clientes, registros de
                        actividad, protección de credenciales y medidas proporcionales al riesgo del servicio. El personal autorizado
                        estará sujeto a obligaciones de confidencialidad adecuadas.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Estas medidas pueden comprender controles por rol, cookies seguras de autenticación, bitácoras de auditoría,
                        verificación de integridad operativa, segregación por tenant y ciclos internos de respaldo para continuidad del
                        servicio.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron podrá ajustar estas medidas de forma evolutiva cuando sea necesario para responder a cambios técnicos,
                        riesgos emergentes, requisitos operativos o hallazgos razonables de seguridad.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">5. Subprocesadores</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron Technologies IERL podrá utilizar subprocesadores para hosting, correo electrónico, pagos, monitoreo,
                        soporte técnico o infraestructura relacionada. Cuando existan cambios materiales en subprocesadores relevantes,
                        dichos cambios podrán notificarse al cliente por medios razonables, incluyendo el sitio web, el panel o
                        comunicaciones operativas.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Según las integraciones activadas, esto puede incluir proveedores para correo transaccional, pasarelas de pago,
                        almacenamiento de archivos, mensajería y servicios cloud. El uso de cada subprocesador se limita a la
                        funcionalidad técnica necesaria y queda sujeto a obligaciones de confidencialidad y seguridad razonables.
                    </p>
                    <div class="mt-5 rounded-2xl border border-fuchsia-100 bg-fuchsia-50/80 p-5 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10">
                        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-700 dark:text-fuchsia-300">Categorías típicas</p>
                        <ul class="mt-4 grid gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300 md:grid-cols-2">
                            <li>Infraestructura y hosting.</li>
                            <li>Procesamiento de pagos y suscripciones.</li>
                            <li>Correo transaccional o mensajería.</li>
                            <li>Almacenamiento de archivos y backups.</li>
                        </ul>
                    </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">6. Transferencias internacionales</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Cuando el tratamiento implique transferencias internacionales derivadas del uso de proveedores tecnológicos,
                        Auron Technologies IERL procurará implementar salvaguardas contractuales u organizativas razonables conforme a
                        la naturaleza del servicio y de los proveedores utilizados.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El cliente reconoce que el uso de un SaaS moderno puede implicar procesamiento transfronterizo por proveedores
                        cloud o de infraestructura y acepta que dichas transferencias formen parte de la operativa normal del servicio,
                        siempre dentro de un marco razonable de protección.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">7. Incidentes de seguridad y asistencia al cliente</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        En caso de incidentes de seguridad que afecten datos personales tratados por cuenta del cliente, Auron
                        Technologies IERL notificará sin demora indebida al cliente una vez tenga conocimiento razonable del incidente.
                        También brindará asistencia razonable para responder solicitudes de derechos de titulares, investigaciones o
                        requerimientos vinculados con el tratamiento realizado a través de la plataforma.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Dicha notificación incluirá, cuando sea razonablemente posible, la naturaleza del incidente, las categorías de
                        datos potencialmente afectadas, las medidas de contención adoptadas y las acciones de seguimiento sugeridas al
                        cliente como responsable del tratamiento.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">8. Eliminación, devolución y backups</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Al finalizar la relación contractual, Auron Technologies IERL podrá eliminar o devolver los datos personales
                        tratados por cuenta del cliente, salvo obligación legal o necesidad operativa legítima de conservarlos por un
                        período adicional. Determinadas copias de respaldo podrán persistir temporalmente en ciclos de backup y serán
                        depuradas de forma diferida en plazos razonables según la arquitectura del servicio.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        La devolución de datos estará sujeta a viabilidad técnica razonable, al estado de la suscripción y a que el
                        cliente solicite la extracción dentro del periodo operativo habilitado para cierre o transición.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">9. Contacto</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Para consultas relacionadas con este Data Processing Agreement, subprocesadores o tratamiento de datos por
                        cuenta del cliente, puede escribir a
                        <a
                            [attr.href]="'mailto:' + appConfig.supportEmail()"
                            class="font-semibold text-fuchsia-600 transition hover:text-fuchsia-500 dark:text-fuchsia-400 dark:hover:text-fuchsia-300"
                        >
                            {{ appConfig.supportEmail() }}
                        </a>.
                        Auron-Suite es operado por Auron Technologies IERL desde Santo Domingo, República Dominicana.
                    </p>
                </section>
            </div>
        </div>
    `
})
export class DpaComponent {
    readonly currentDate = new Intl.DateTimeFormat('es-DO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());

    readonly summaryCards = [
        {
            title: 'Rol de Auron',
            description: 'Processor de los datos operativos que el cliente carga y administra dentro de la plataforma.'
        },
        {
            title: 'Instrucciones',
            description: 'Tratamiento limitado a la prestacion del SaaS, soporte razonable y obligaciones legales aplicables.'
        },
        {
            title: 'Seguridad',
            description: 'Controles de acceso, segregacion por tenant, auditoria y medidas proporcionales al riesgo del servicio.'
        },
        {
            title: 'Cierre y backup',
            description: 'Los datos pueden devolverse o eliminarse al cierre, con persistencia temporal de backups segun ciclos internos.'
        }
    ];

    constructor(public appConfig: AppConfigService) {}
}
