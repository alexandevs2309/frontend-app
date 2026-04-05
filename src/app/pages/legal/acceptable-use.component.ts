import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppConfigService } from '../../core/services/app-config.service';
import { PublicPageTopbarComponent } from '../../shared/components/public-page-topbar.component';

@Component({
    selector: 'app-acceptable-use',
    standalone: true,
    imports: [CommonModule, RouterLink, PublicPageTopbarComponent],
    template: `
        <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
            <app-public-page-topbar />
            <div class="mx-auto max-w-6xl space-y-8">
                <section class="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_28px_90px_-50px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/75">
                    <a
                        routerLink="/"
                        class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                        {{ appConfig.platformName() }}
                    </a>
                    <h1 class="mt-5 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Política de Uso Aceptable
                    </h1>
                    <p class="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                        Esta política establece las reglas mínimas de comportamiento y uso permitido para proteger la seguridad,
                        estabilidad y operación legítima de {{ appConfig.platformName() }} como plataforma SaaS de gestión empresarial.
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
                            class="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-5 shadow-[0_20px_50px_-40px_rgba(16,185,129,0.45)] dark:border-emerald-500/20 dark:bg-emerald-500/10"
                        >
                            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">Punto clave</p>
                            <h2 class="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{{ card.title }}</h2>
                            <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ card.description }}</p>
                        </article>
                    </div>
                </section>

                <section class="grid gap-6 lg:grid-cols-[1.35fr,0.95fr]">
                    <article class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                        <p class="text-sm font-semibold uppercase tracking-[0.26em] text-emerald-600 dark:text-emerald-300">Propósito</p>
                        <h2 class="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">Esta política existe para proteger la plataforma, a los clientes y a terceros</h2>
                        <div class="mt-6 space-y-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                            <p>{{ appConfig.platformName() }} es un entorno compartido de operación empresarial, por lo que no tolera conductas que comprometan seguridad, estabilidad o confianza comercial.</p>
                            <p>Las prohibiciones cubren tanto abuso técnico como fraude operativo, suplantación, explotación indebida de datos o afectación a derechos de terceros.</p>
                            <p>El enforcement puede ser inmediato si la conducta genera riesgo material para otros usuarios, para el sistema o para la relación contractual.</p>
                        </div>
                    </article>
                    <article class="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-slate-100 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.55)] dark:border-slate-700">
                        <p class="text-sm font-semibold uppercase tracking-[0.26em] text-emerald-300">Lectura práctica</p>
                        <ul class="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                            <li>No puedes usar la plataforma para saltarte límites, permisos o aislamientos.</li>
                            <li>No puedes falsear cobros, identidades, reservas, inventario o trazas operativas.</li>
                            <li>No puedes cargar datos o contenidos sin derechos, consentimiento o base legal suficiente.</li>
                            <li>Una conducta grave puede disparar suspensión inmediata sin esperar múltiples advertencias.</li>
                        </ul>
                    </article>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">1. Actividades prohibidas</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Queda prohibido utilizar Auron-Suite para acceder sin autorización a cuentas, datos o recursos del sistema,
                        eludir límites de plan, vulnerar medidas de seguridad, distribuir malware, enviar spam o ejecutar cualquier
                        actividad ilícita, engañosa o contraria a la buena fe comercial.
                    </p>
                    <div class="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">Ejemplos</p>
                        <ul class="mt-4 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            <li>Intentar acceder a datos de otro tenant o a recursos fuera del rol autorizado.</li>
                            <li>Manipular límites de plan, permisos internos o controles de seguridad.</li>
                            <li>Usar scripts, bots o herramientas para degradar el servicio o extraer datos masivamente sin autorización.</li>
                            <li>Introducir software malicioso, payloads dañinos o contenido que comprometa la infraestructura.</li>
                        </ul>
                    </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">2. Uso fraudulento</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        No se permite utilizar el servicio para manipular cobros, identidades, reportes, reservas, inventario,
                        permisos de acceso o registros operativos de forma engañosa, simulada o no autorizada. También se prohíbe
                        suplantar a terceros o usar credenciales ajenas sin permiso.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        También se considera fraude el uso del sistema para ocultar transacciones, alterar evidencia operativa, simular
                        actividad comercial inexistente o generar información falsa destinada a terceros, auditores o proveedores de
                        pago.
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
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El hecho de que una acción sea técnicamente posible no la convierte en permitida. La evaluación de abuso puede
                        considerar impacto en rendimiento, riesgo sistémico, volumen de requests, elusión de controles o afectación a
                        la experiencia de otros clientes.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">4. Violación de derechos de terceros</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El cliente no podrá utilizar la plataforma para infringir derechos de privacidad, protección de datos,
                        propiedad intelectual, imagen, reputación o cualquier otro derecho de terceros. Cada negocio es responsable
                        de contar con base legítima para cargar y tratar la información de sus propios clientes, empleados y contactos.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Esto incluye contenido, bases de datos, fotografías, marcas, mensajes, listados de clientes, documentos o
                        cualquier otro material cuya utilización dentro del servicio exija autorización, licencia o fundamento legal
                        suficiente.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">5. Consecuencias del incumplimiento</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        El incumplimiento de esta política puede dar lugar a advertencias, limitaciones de acceso, suspensión
                        temporal, cancelación de la cuenta, retención de funciones o terminación del servicio, según la gravedad del
                        caso y sin perjuicio de otras acciones contractuales o legales que correspondan.
                    </p>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron Technologies IERL podrá preservar registros técnicos, eventos de auditoría y evidencia razonable del
                        incidente para fines de investigación, defensa contractual, cooperación con autoridades o protección del
                        ecosistema del servicio.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">6. Contacto</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Esta política forma parte del marco contractual de Auron-Suite, operado por Auron Technologies IERL desde
                        Santo Domingo, República Dominicana. Para consultas relacionadas con el uso permitido del servicio, puede escribir
                        a
                        <a
                            [attr.href]="'mailto:' + appConfig.supportEmail()"
                            class="font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
                        >
                            {{ appConfig.supportEmail() }}
                        </a>.
                    </p>
                </section>
            </div>
        </div>
    `
})
export class AcceptableUseComponent {
    readonly currentDate = new Intl.DateTimeFormat('es-DO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());

    readonly summaryCards = [
        {
            title: 'Sin abuso tecnico',
            description: 'No se permite degradar el servicio, eludir limites, hacer scraping no autorizado ni interferir con otros tenants.'
        },
        {
            title: 'Sin fraude',
            description: 'Se prohíbe manipular cobros, identidades, reportes, reservas, permisos o registros de forma engañosa.'
        },
        {
            title: 'Sin infraccion de terceros',
            description: 'Cada negocio responde por la legitimidad de los datos, contenidos y derechos involucrados en su operacion.'
        },
        {
            title: 'Con enforcement',
            description: 'Las infracciones pueden terminar en advertencia, restriccion, suspension, cancelacion o accion legal.'
        }
    ];

    constructor(public appConfig: AppConfigService) {}
}
