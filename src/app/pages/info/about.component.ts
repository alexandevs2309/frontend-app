import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">Sobre Nosotros</h1>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nuestra Misión</h2>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                Revolucionar la gestión de barberías y salones de belleza mediante tecnología innovadora 
                que simplifica operaciones y maximiza ganancias.
              </p>
              
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nuestra Visión</h2>
              <p class="text-gray-600 dark:text-gray-300">
                Ser la plataforma SaaS líder mundial para la industria de la belleza y cuidado personal.
              </p>
            </div>
            
            <div class="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">¿Por qué BarberPro?</h3>
              <ul class="space-y-3 text-gray-600 dark:text-gray-300">
                <li class="flex items-center">
                  <i class="pi pi-check-circle text-green-500 mr-3"></i>
                  Más de 5 años de experiencia
                </li>
                <li class="flex items-center">
                  <i class="pi pi-check-circle text-green-500 mr-3"></i>
                  500+ clientes satisfechos
                </li>
                <li class="flex items-center">
                  <i class="pi pi-check-circle text-green-500 mr-3"></i>
                  Soporte 24/7 en español
                </li>
                <li class="flex items-center">
                  <i class="pi pi-check-circle text-green-500 mr-3"></i>
                  Actualizaciones constantes
                </li>
              </ul>
            </div>
          </div>
          
          <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <a routerLink="/" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AboutComponent {}