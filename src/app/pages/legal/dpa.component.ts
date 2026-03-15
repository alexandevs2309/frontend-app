import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-dpa',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.12),_transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.16),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
            <div class="mx-auto max-w-5xl space-y-8">
                <section class="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_28px_90px_-50px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/75">
                    <a
                        routerLink="/"
                        class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <span class="h-2 w-2 rounded-full bg-fuchsia-500"></span>
                        Auron-Suite
                    </a>
                    <h1 class="mt-5 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Data Processing Agreement (DPA)
                    </h1>
                    <p class="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                        Este acuerdo regula el tratamiento de datos personales realizado por Auron Technologies SRL, operadora de
                        Auron-Suite, cuando presta servicios SaaS por cuenta del negocio cliente.
                    </p>
                    <div class="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>Última actualización: {{ currentDate }}</span>
                        <span>Producto: Auron-Suite</span>
                        <span>Operador: Auron Technologies SRL</span>
                    </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">1. Roles de las partes</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Para los datos personales ingresados en Auron-Suite, el negocio cliente actúa como Data Controller y Auron
                        Technologies SRL, operadora de la plataforma, actúa como Data Processor.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">2. Objeto y alcance</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Este DPA cubre el tratamiento necesario para alojar, organizar, consultar, proteger, respaldar y poner a
                        disposición del cliente los datos personales gestionados dentro del servicio, incluyendo información de
                        usuarios del negocio, empleados, clientes finales, citas, ventas y comunicaciones operativas.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">3. Instrucciones documentadas</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron Technologies SRL tratará los datos personales únicamente conforme a las instrucciones documentadas del
                        cliente, en la medida necesaria para prestar el servicio, salvo obligación legal o requerimiento competente en
                        contrario.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">4. Medidas de seguridad y confidencialidad</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron Technologies SRL aplicará medidas técnicas y organizativas razonables para proteger los datos
                        personales, incluyendo control de acceso, autenticación, separación lógica entre clientes, registros de
                        actividad, protección de credenciales y medidas proporcionales al riesgo del servicio. El personal autorizado
                        estará sujeto a obligaciones de confidencialidad adecuadas.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">5. Subprocesadores</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Auron Technologies SRL podrá utilizar subprocesadores para hosting, correo electrónico, pagos, monitoreo,
                        soporte técnico o infraestructura relacionada. Cuando existan cambios materiales en subprocesadores relevantes,
                        dichos cambios podrán notificarse al cliente por medios razonables, incluyendo el sitio web, el panel o
                        comunicaciones operativas.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">6. Transferencias internacionales</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Cuando el tratamiento implique transferencias internacionales derivadas del uso de proveedores tecnológicos,
                        Auron Technologies SRL procurará implementar salvaguardas contractuales u organizativas razonables conforme a
                        la naturaleza del servicio y de los proveedores utilizados.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">7. Incidentes de seguridad y asistencia al cliente</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        En caso de incidentes de seguridad que afecten datos personales tratados por cuenta del cliente, Auron
                        Technologies SRL notificará sin demora indebida al cliente una vez tenga conocimiento razonable del incidente.
                        También brindará asistencia razonable para responder solicitudes de derechos de titulares, investigaciones o
                        requerimientos vinculados con el tratamiento realizado a través de la plataforma.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">8. Eliminación, devolución y backups</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Al finalizar la relación contractual, Auron Technologies SRL podrá eliminar o devolver los datos personales
                        tratados por cuenta del cliente, salvo obligación legal o necesidad operativa legítima de conservarlos por un
                        período adicional. Determinadas copias de respaldo podrán persistir temporalmente en ciclos de backup y serán
                        depuradas de forma diferida en plazos razonables según la arquitectura del servicio.
                    </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/85">
                    <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">9. Contacto</h2>
                    <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        Para consultas relacionadas con este Data Processing Agreement, subprocesadores o tratamiento de datos por
                        cuenta del cliente, puede escribir a
                        <a
                            href="mailto:contacto@auron-suite.com"
                            class="font-semibold text-fuchsia-600 transition hover:text-fuchsia-500 dark:text-fuchsia-400 dark:hover:text-fuchsia-300"
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
export class DpaComponent {
    readonly currentDate = '14 de marzo de 2026';
}
