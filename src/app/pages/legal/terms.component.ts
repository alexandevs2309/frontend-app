import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen surface-ground py-12 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="surface-card rounded-lg shadow-lg p-8">
          <h1 class="text-3xl font-bold text-color mb-8">Términos de Servicio</h1>
          
          <div class="prose max-w-none">
            <p class="text-color-secondary mb-6">Última actualización: {{ currentDate }}</p>
            
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
export class TermsComponent {
  currentDate = new Date().toLocaleDateString('es-ES');
}