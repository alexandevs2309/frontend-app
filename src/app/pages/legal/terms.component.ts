import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Términos de Servicio</h1>
          
          <div class="prose dark:prose-invert max-w-none">
            <p class="text-gray-600 dark:text-gray-300 mb-6">Última actualización: {{ currentDate }}</p>
            
            <h2>1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar BarberPro, usted acepta estar sujeto a estos términos de servicio.</p>
            
            <h2>2. Descripción del Servicio</h2>
            <p>BarberPro es una plataforma SaaS para la gestión integral de barberías y salones de belleza.</p>
            
            <h2>3. Registro y Cuenta</h2>
            <p>Para utilizar nuestros servicios, debe crear una cuenta proporcionando información precisa y completa.</p>
            
            <h2>4. Uso Aceptable</h2>
            <p>Se compromete a utilizar el servicio únicamente para fines legítimos y de acuerdo con estos términos.</p>
            
            <h2>5. Privacidad y Datos</h2>
            <p>Su privacidad es importante para nosotros. Consulte nuestra Política de Privacidad para obtener información sobre cómo recopilamos y utilizamos sus datos.</p>
            
            <h2>6. Pagos y Facturación</h2>
            <p>Los pagos se procesan de forma segura. Los precios pueden cambiar con previo aviso de 30 días.</p>
            
            <h2>7. Limitación de Responsabilidad</h2>
            <p>BarberPro no será responsable de daños indirectos, incidentales o consecuentes.</p>
            
            <h2>8. Contacto</h2>
            <p>Para preguntas sobre estos términos, contáctenos en: info@barberpro.com</p>
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
export class TermsComponent {
  currentDate = new Date().toLocaleDateString('es-ES');
}