import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppConfigService } from '../../core/services/app-config.service';
import { PublicPageTopbarComponent } from '../../shared/components/public-page-topbar.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, PublicPageTopbarComponent],
  template: `
    <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_36%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_55%,#f8fafc_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
      <app-public-page-topbar />

      <main class="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
        <div class="overflow-hidden rounded-[36px] border border-white/70 bg-white/88 shadow-[0_32px_120px_-55px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/78">
          <div class="border-b border-slate-200/80 px-8 py-10 dark:border-slate-800 lg:px-12">
            <span class="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
              Acerca de
            </span>
            <h1 class="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white lg:text-5xl">
              Una plataforma construida para que la operación diaria no dependa del caos
            </h1>
            <p class="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
              {{ appConfig.platformName() }} es un sistema web para barberías, salones y negocios de cuidado personal que necesitan ordenar citas,
              ventas, clientes, equipo e inventario desde un solo lugar.
            </p>
            <div class="mt-8 grid gap-4 md:grid-cols-3">
              <article
                *ngFor="let pillar of valuePillars"
                class="rounded-3xl border border-sky-100 bg-sky-50/80 p-5 shadow-[0_20px_50px_-40px_rgba(14,165,233,0.45)] dark:border-sky-500/20 dark:bg-sky-500/10"
              >
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">Pilar</p>
                <h2 class="mt-3 text-lg font-semibold text-slate-950 dark:text-white">{{ pillar.title }}</h2>
                <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ pillar.description }}</p>
              </article>
            </div>
          </div>

          <div class="grid gap-10 px-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-12">
            <section class="space-y-8">
              <div class="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.24)] dark:border-slate-800 dark:bg-slate-900/85">
                <h2 class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Qué hacemos</h2>
                <p class="mt-3 leading-7 text-slate-700 dark:text-slate-300">
                  Diseñamos herramientas para que el negocio tenga mejor visibilidad operativa. El enfoque del producto está en
                  agenda, caja, control comercial, comisiones, reportes y administración de varias sucursales cuando aplica.
                </p>
                <div class="mt-5 grid gap-3 sm:grid-cols-2">
                  <div
                    *ngFor="let block of capabilityBlocks"
                    class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300"
                  >
                    {{ block }}
                  </div>
                </div>
              </div>

              <div class="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.24)] dark:border-slate-800 dark:bg-slate-900/85">
                <h2 class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Cómo entendemos el producto</h2>
                <p class="mt-3 leading-7 text-slate-700 dark:text-slate-300">
                  No buscamos prometer más de lo que el sistema puede sostener. La prioridad es que cada módulo sea útil,
                  entendible para el equipo y coherente con el plan contratado.
                </p>
                <p class="mt-4 leading-7 text-slate-700 dark:text-slate-300">
                  Eso significa priorizar estabilidad, claridad operativa, separación por tenant y una experiencia que acompañe al
                  negocio real en vez de llenarlo de funciones decorativas o difíciles de mantener.
                </p>
              </div>

              <div class="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.24)] dark:border-slate-800 dark:bg-slate-900/85">
                <h2 class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">A quién va dirigido</h2>
                <p class="mt-3 leading-7 text-slate-700 dark:text-slate-300">
                  {{ appConfig.platformName() }} está orientado a negocios que quieren dejar atrás libretas, hojas de cálculo dispersas y procesos
                  manuales repetitivos. Puede servir tanto a equipos pequeños como a operaciones con varias ubicaciones.
                </p>
                <p class="mt-4 leading-7 text-slate-700 dark:text-slate-300">
                  Funciona especialmente bien para equipos que necesitan controlar citas, caja, comisiones, inventario y reportes
                  sin perder trazabilidad ni depender de demasiadas herramientas separadas.
                </p>
              </div>
            </section>

            <aside class="space-y-5">
              <div class="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.55)] dark:border-slate-700">
                <h3 class="text-lg font-semibold text-slate-950 dark:text-white">Principios del producto</h3>
                <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  <li class="flex gap-3">
                    <span class="mt-1 h-2 w-2 rounded-full bg-sky-400"></span>
                    Operación clara antes que complejidad innecesaria.
                  </li>
                  <li class="flex gap-3">
                    <span class="mt-1 h-2 w-2 rounded-full bg-sky-400"></span>
                    Información del negocio separada por tenant.
                  </li>
                  <li class="flex gap-3">
                    <span class="mt-1 h-2 w-2 rounded-full bg-sky-400"></span>
                    Funciones comerciales alineadas con la realidad del sistema.
                  </li>
                  <li class="flex gap-3">
                    <span class="mt-1 h-2 w-2 rounded-full bg-sky-400"></span>
                    Enfoque web para trabajar desde escritorio o móvil.
                  </li>
                </ul>
              </div>

              <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.24)] dark:border-slate-800 dark:bg-slate-900/85">
                <h3 class="text-lg font-semibold text-slate-950 dark:text-white">Contacto general</h3>
                <div class="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    <p class="font-semibold text-slate-950 dark:text-white">Consultas comerciales y soporte</p>
                    <a [attr.href]="'mailto:' + appConfig.supportEmail()" class="mt-1 inline-block text-sky-700 transition hover:text-sky-600 dark:text-sky-300 dark:hover:text-sky-200">
                      {{ appConfig.supportEmail() }}
                    </a>
                  </div>
                  <div *ngIf="appConfig.platformDomain()">
                    <p class="font-semibold text-slate-950 dark:text-white">Sitio público</p>
                    <p class="mt-1">{{ appConfig.platformDomain() }}</p>
                  </div>
                  <div>
                    <p class="font-semibold text-slate-950 dark:text-white">Base operativa</p>
                    <p class="mt-1">Santo Domingo, República Dominicana</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  `
})
export class AboutComponent {
  readonly valuePillars = [
    {
      title: 'Operacion centralizada',
      description: 'Agenda, clientes, caja, inventario, reportes y administracion en una sola superficie operativa.'
    },
    {
      title: 'Realismo funcional',
      description: 'El producto se diseña para sostener procesos reales del negocio, no solo para verse bien en una demo.'
    },
    {
      title: 'Escala por tenant',
      description: 'La informacion del negocio se mantiene separada y el crecimiento por sucursal o equipo no rompe la base operativa.'
    }
  ];

  readonly capabilityBlocks = [
    'Agenda, citas y seguimiento diario del equipo.',
    'Caja, ventas, comisiones y visibilidad comercial.',
    'Inventario, catalogo de servicios y control de productos.',
    'Reportes, supervision administrativa y operacion multi-sucursal cuando aplica.'
  ];

  constructor(public appConfig: AppConfigService) {}
}
