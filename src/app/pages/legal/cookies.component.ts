import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen surface-ground py-12 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="surface-card rounded-lg shadow-lg p-8">
          <h1 class="text-3xl font-bold text-color mb-8">Política de Cookies</h1>
          
          <div class="prose max-w-none">
            <p class="text-color-secondary mb-6">Última actualización: {{ currentDate }}</p>
            
            <h2>1. ¿Qué son las Cookies?</h2>
            <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web.</p>
            
            <h2>2. Tipos de Cookies que Utilizamos</h2>
            <ul>
              <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento del sitio</li>
              <li><strong>Cookies de Rendimiento:</strong> Nos ayudan a entender cómo interactúa con el sitio</li>
              <li><strong>Cookies de Funcionalidad:</strong> Recuerdan sus preferencias</li>
            </ul>
            
            <h2>3. Propósito de las Cookies</h2>
            <p>Utilizamos cookies para mejorar su experiencia, recordar sus preferencias y analizar el uso del sitio.</p>
            
            <h2>4. Control de Cookies</h2>
            <p>Puede controlar y eliminar cookies a través de la configuración de su navegador.</p>
            
            <h2>5. Cookies de Terceros</h2>
            <p>Algunos servicios de terceros pueden establecer cookies en nuestro sitio para proporcionar funcionalidades adicionales.</p>
            
            <h2>6. Cambios en esta Política</h2>
            <p>Podemos actualizar esta política de cookies ocasionalmente para reflejar cambios en nuestras prácticas.</p>
            
            <h2>7. Contacto</h2>
            <p>Para preguntas sobre cookies, contáctenos en: info@barberpro.com</p>
          </div>
          
          <div class="mt-8 pt-8 border-t surface-border">
            <a routerLink="/" class="text-primary hover:text-primary-emphasis">
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CookiesComponent {
  currentDate = new Date().toLocaleDateString('es-ES');
}