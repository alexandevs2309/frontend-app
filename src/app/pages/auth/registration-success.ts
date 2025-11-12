import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-registration-success',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule],
  template: `
    <div class="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-green-900 dark:to-emerald-900 flex items-center justify-center p-4">
      <div class="max-w-2xl w-full">
        <!-- Success Card -->
        <div class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">

          <!-- Header -->
          <div class="bg-linear-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
            <div class="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <i class="pi pi-check text-4xl"></i>
            </div>
            <h1 class="text-3xl font-bold mb-2">¡Cuenta Creada Exitosamente! 🎉</h1>
            <p class="text-green-100">Tu barbería {{ businessName }} está lista para usar</p>
          </div>

          <!-- Content -->
          <div class="p-8">

            <!-- Email Sent Info -->
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-envelope text-white text-xl"></i>
                </div>
                <div class="flex-1">
                  <h3 class="font-bold text-blue-900 dark:text-blue-100 mb-2">📧 Email Enviado</h3>
                  <p class="text-blue-700 dark:text-blue-300 mb-3">
                    Hemos enviado tus credenciales de acceso a:
                  </p>
                  <div class="bg-white/80 dark:bg-slate-800/80 rounded-lg p-3 font-mono text-sm">
                    <strong>{{ email }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Account Details -->
            <div class="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 mb-6">
              <h3 class="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <i class="pi pi-info-circle text-blue-500 mr-2"></i>
                Detalles de tu Cuenta
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-slate-700 rounded-lg p-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400">Barbería</div>
                  <div class="font-semibold">{{ businessName }}</div>
                </div>
                <div class="bg-white dark:bg-slate-700 rounded-lg p-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400">Plan</div>
                  <div class="font-semibold">{{ planName }} - \${{ planPrice }}/mes</div>
                </div>
                <div class="bg-white dark:bg-slate-700 rounded-lg p-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400">Email</div>
                  <div class="font-semibold">{{ email }}</div>
                </div>
                <div class="bg-white dark:bg-slate-700 rounded-lg p-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400">Estado</div>
                  <div class="font-semibold text-green-600">Trial 7 días</div>
                </div>
              </div>
            </div>

            <!-- Email Content Preview -->
            <div class="bg-linear-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 mb-6">
              <h3 class="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <i class="pi pi-eye text-purple-500 mr-2"></i>
                Vista Previa del Email Enviado
              </h3>
              <div class="bg-white dark:bg-slate-900 rounded-lg p-4 border-l-4 border-green-500 font-mono text-sm">
                <div class="text-center mb-4">
                  <strong>🎉 ¡BIENVENIDO A AURON-SUITE! 🎉</strong>
                </div>
                <div class="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>Barbería:</strong> {{ businessName }}</p>
                  <p><strong>Plan:</strong> {{ planName }}</p>
                  <p><strong>Email:</strong> {{ email }}</p>
                  <p><strong>Contraseña:</strong> [Generada automáticamente]</p>
                  <p><strong>Acceso:</strong> http://localhost:4200/auth/login</p>
                </div>
              </div>
            </div>

            <!-- Next Steps -->
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
              <h3 class="font-bold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center">
                <i class="pi pi-lightbulb text-yellow-500 mr-2"></i>
                Próximos Pasos
              </h3>
              <ol class="space-y-2 text-yellow-800 dark:text-yellow-200">
                <li class="flex items-start">
                  <span class="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                  Revisa tu email y copia las credenciales
                </li>
                <li class="flex items-start">
                  <span class="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                  Inicia sesión con las credenciales recibidas
                </li>
                <li class="flex items-start">
                  <span class="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                  Cambia tu contraseña por una personalizada
                </li>
                <li class="flex items-start">
                  <span class="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                  Configura tu barbería y comienza a usar el sistema
                </li>
              </ol>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-4">
              <button pButton
                      label="Ir a Iniciar Sesión"
                      icon="pi pi-sign-in"
                      class="flex-1 !bg-green-600 !border-green-600 !text-white"
                      (click)="goToLogin()">
              </button>
              <button pButton
                      label="¿No recibiste el email?"
                      icon="pi pi-question-circle"
                      severity="secondary"
                      class="flex-1"
                      (click)="showEmailHelp()">
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class RegistrationSuccess implements OnInit {
  businessName: string = '';
  email: string = '';
  planName: string = '';
  planPrice: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.businessName = params['businessName'] || 'Tu Barbería';
      this.email = params['email'] || '';
      this.planName = params['planName'] || 'Plan';
      this.planPrice = params['planPrice'] || 0;
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login'], {
      queryParams: {
        email: this.email,
        message: 'check_email'
      }
    });
  }

  showEmailHelp() {
    alert(`Si no recibiste el email en ${this.email}:\n\n1. Revisa tu carpeta de SPAM\n2. Verifica que el email esté escrito correctamente\n3. Contacta soporte: soporte@auron-suite.com`);
  }
}
