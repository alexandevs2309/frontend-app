import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';
import { TrialService, TrialStatus } from '../../../core/services/trial.service';
import { SubscriptionService } from '../../../core/services/subscription/subscription.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, DividerModule],
  template: `
    <div class="payment-container">
      <div class="payment-header">
        <h1>Actualizar Suscripción</h1>
        <p>Tu prueba gratuita ha terminado. Elige un plan para continuar.</p>
      </div>

      <div class="plans-grid" *ngIf="!loading">
        <p-card *ngFor="let plan of plans"
                [ngClass]="{'recommended': plan.recommended}"
                class="plan-card">
          <ng-template pTemplate="header">
            <div class="plan-header">
              <h3>{{ plan.get_name_display || plan.name }}</h3>
              <div class="plan-price">
                <span class="currency">$</span>
                <span class="amount">{{ plan.price }}</span>
                <span class="period">/mes</span>
              </div>
            </div>
          </ng-template>

          <div class="plan-features">
            <ul>
              <li *ngFor="let feature of plan.features">
                <i class="pi pi-check text-green-500"></i>
                {{ feature }}
              </li>
            </ul>
          </div>

          <ng-template pTemplate="footer">
            <button pButton
                    [label]="plan.recommended ? 'Elegir Plan Recomendado' : 'Elegir Plan'"
                    [class]="plan.recommended ? 'p-button-success w-full' : 'p-button-outlined w-full'"
                    (click)="selectPlan(plan)">
            </button>
          </ng-template>
        </p-card>
      </div>

      <div *ngIf="loading" class="text-center p-4">
        <i class="pi pi-spinner pi-spin" style="font-size: 2rem"></i>
        <p>Cargando planes...</p>
      </div>

      <div class="payment-info">
        <p><i class="pi pi-shield text-green-500"></i> Pago seguro con Stripe</p>
        <p><i class="pi pi-refresh text-blue-500"></i> Cancela en cualquier momento</p>
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .payment-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .payment-header h1 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .plan-card {
      position: relative;
    }

    .plan-card.recommended {
      border: 2px solid var(--primary-color);
      transform: scale(1.05);
    }

    .plan-card.recommended::before {
      content: 'Recomendado';
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary-color);
      color: white;
      padding: 0.25rem 1rem;
      border-radius: 1rem;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .plan-header {
      text-align: center;
      padding: 1rem;
    }

    .plan-header h3 {
      margin: 0 0 1rem 0;
      color: var(--text-color);
    }

    .plan-price {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 0.25rem;
    }

    .currency {
      font-size: 1.2rem;
      color: var(--text-color-secondary);
    }

    .amount {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--primary-color);
    }

    .period {
      color: var(--text-color-secondary);
    }

    .plan-features ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .plan-features li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .payment-info {
      text-align: center;
      margin-top: 2rem;
      color: var(--text-color-secondary);
    }

    .payment-info p {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
  `]
})
export class PaymentComponent implements OnInit {
  trialStatus: TrialStatus | null = null;
  plans: any[] = [];
  loading = false;

  constructor(
    private trialService: TrialService,
    private subscriptionService: SubscriptionService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.trialStatus = this.trialService.getCurrentTrialStatus();
    this.loadPlans();
  }

  loadPlans() {
    console.log('💰 [PAYMENT] Cargando planes disponibles');
    this.loading = true;
    this.subscriptionService.getPlans().subscribe({
      next: (data: any) => {
        console.log('✅ [PAYMENT] Planes recibidos:', data);
        const allPlans = Array.isArray(data) ? data : (data.results || []);
        // Filter out free plan and add recommended flag
        this.plans = allPlans
          .filter((plan: any) => plan.name !== 'free')
          .map((plan: any, index: number) => ({
            ...plan,
            recommended: plan.name === 'standard',
            features: this.getFeaturesList(plan.features)
          }));
        console.log('📊 [PAYMENT] Planes procesados:', this.plans);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ [PAYMENT] Error al cargar planes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los planes'
        });
        this.loading = false;
      }
    });
  }

  getFeaturesList(features: any): string[] {
    if (!features || typeof features !== 'object') return [];

    const featureNames: { [key: string]: string } = {
      'appointments': 'Gestión de Citas',
      'basic_reports': 'Reportes Básicos',
      'inventory': 'Gestión de Inventario',
      'advanced_reports': 'Reportes Avanzados',
      'multi_location': 'Múltiples Ubicaciones',
      'api_access': 'Acceso a API',
      'custom_branding': 'Marca Personalizada',
      'priority_support': 'Soporte Prioritario'
    };

    return Object.entries(features)
      .filter(([key, value]) => value === true)
      .map(([key]) => featureNames[key] || key);
  }

  selectPlan(plan: any) {
    console.log('🎯 [PAYMENT] Plan seleccionado:', plan);
    // Navigate to checkout with selected plan
    this.router.navigate(['/client/checkout'], {
      state: { plan: plan }
    });
  }
}
