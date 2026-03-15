import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section class="border-b border-slate-200 bg-white/92 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/92">
        <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 lg:px-8">
          <a routerLink="/" class="text-sm font-semibold tracking-[0.22em] text-indigo-600 uppercase">Auron Suite</a>
          <a routerLink="/" class="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            Volver al inicio
          </a>
        </div>
      </section>

      <main class="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-16">
        <div class="rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_-52px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900">
          <div class="border-b border-slate-200 px-8 py-10 dark:border-slate-800 lg:px-12">
            <span class="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              Acerca de
            </span>
            <h1 class="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white lg:text-5xl">
              Una plataforma pensada para la operación diaria del negocio
            </h1>
            <p class="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Auron Suite es un sistema web para barberías, salones y negocios de cuidado personal que necesitan ordenar citas,
              ventas, clientes, equipo e inventario desde un solo lugar.
            </p>
          </div>

          <div class="grid gap-10 px-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
            <section class="space-y-8">
              <div>
                <h2 class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Qué hacemos</h2>
                <p class="mt-3 leading-7 text-slate-700 dark:text-slate-300">
                  Diseñamos herramientas para que el negocio tenga mejor visibilidad operativa. El enfoque del producto está en
                  agenda, caja, control comercial, comisiones, reportes y administración de varias sucursales cuando aplica.
                </p>
              </div>

              <div>
                <h2 class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Cómo entendemos el producto</h2>
                <p class="mt-3 leading-7 text-slate-700 dark:text-slate-300">
                  No buscamos prometer más de lo que el sistema puede sostener. La prioridad es que cada módulo sea útil,
                  entendible para el equipo y coherente con el plan contratado.
                </p>
              </div>

              <div>
                <h2 class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">A quién va dirigido</h2>
                <p class="mt-3 leading-7 text-slate-700 dark:text-slate-300">
                  Auron Suite está orientado a negocios que quieren dejar atrás libretas, hojas de cálculo dispersas y procesos
                  manuales repetitivos. Puede servir tanto a equipos pequeños como a operaciones con varias ubicaciones.
                </p>
              </div>
            </section>

            <aside class="space-y-5">
              <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
                <h3 class="text-lg font-semibold text-slate-950 dark:text-white">Principios del producto</h3>
                <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <li class="flex gap-3">
                    <span class="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                    Operación clara antes que complejidad innecesaria.
                  </li>
                  <li class="flex gap-3">
                    <span class="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                    Información del negocio separada por tenant.
                  </li>
                  <li class="flex gap-3">
                    <span class="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                    Funciones comerciales alineadas con la realidad del sistema.
                  </li>
                  <li class="flex gap-3">
                    <span class="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                    Enfoque web para trabajar desde escritorio o móvil.
                  </li>
                </ul>
              </div>

              <div class="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 class="text-lg font-semibold text-slate-950 dark:text-white">Contacto general</h3>
                <div class="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <p>Consultas comerciales: auronsuite.soporte@gmail.com</p>
                  <p>Soporte general: auronsuite.soporte@gmail.com</p>
                  <p>Información corporativa: auronsuite.soporte@gmail.com</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  `
})
export class AboutComponent {}
