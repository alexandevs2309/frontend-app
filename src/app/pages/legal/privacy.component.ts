import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen surface-ground py-12 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="surface-card rounded-lg shadow-lg p-8">
          <h1 class="text-3xl font-bold text-color mb-8">Política de Privacidad</h1>
          
          <div class="prose max-w-none">
            <p class="text-color-secondary mb-6">Última actualización: {{ currentDate }}</p>
            
            <h2>1. Información que Recopilamos</h2>
            <p>Recopilamos información que usted nos proporciona directamente, como cuando crea una cuenta o se comunica con nosotros.</p>
            
            <h2>2. Cómo Utilizamos su Información</h2>
            <p>Utilizamos la información para proporcionar, mantener y mejorar nuestros servicios.</p>
            
            <h2>3. Compartir Información</h2>
            <p>No vendemos, alquilamos ni compartimos su información personal con terceros para fines comerciales.</p>
            
            <h2>4. Seguridad de Datos</h2>
            <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información.</p>
            
            <h2>5. Sus Derechos</h2>
            <p>Tiene derecho a acceder, actualizar o eliminar su información personal.</p>
            
            <h2>6. Cookies</h2>
            <p>Utilizamos cookies para mejorar su experiencia. Consulte nuestra Política de Cookies para más detalles.</p>
            
            <h2>7. Cambios a esta Política</h2>
            <p>Podemos actualizar esta política ocasionalmente. Le notificaremos sobre cambios significativos.</p>
            
            <h2>8. Contacto</h2>
            <p>Para preguntas sobre privacidad, contáctenos en: privacy@barberpro.com</p>
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
export class PrivacyComponent {
  currentDate = new Date().toLocaleDateString('es-ES');
}