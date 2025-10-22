import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';
import { TrialService, TrialStatus } from '../../core/services/trial.service';
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

      <div class="plans-grid">
        <p-card *ngFor="let plan of plans" 
                [ngClass]="{'recommended': plan.recommended}"
                class="plan-card">
          <ng-template pTemplate="header">
            <div class="plan-header">
              <h3>{{ plan.name }}</h3>
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
  
  plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      recommended: false,
      features: [
        'Hasta 2 empleados',
        'Gestión básica de citas',
        'Reportes básicos',
        'Soporte por email'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 59,
      recommended: true,
      features: [
        'Hasta 10 empleados',
        'Gestión avanzada de citas',
        'Sistema POS completo',
        'Reportes avanzados',
        'Inventario',
        'Soporte prioritario'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99,
      recommended: false,
      features: [
        'Empleados ilimitados',
        'Múltiples ubicaciones',
        'API personalizada',
        'Reportes personalizados',
        'Soporte 24/7',
        'Gerente de cuenta dedicado'
      ]
    }
  ];

  constructor(
    private trialService: TrialService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.trialStatus = this.trialService.getCurrentTrialStatus();
  }

  selectPlan(plan: any) {
    // Simulate Stripe integration
    this.messageService.add({
      severity: 'info',
      summary: 'Procesando pago',
      detail: `Redirigiendo a Stripe para el plan ${plan.name}...`
    });

    // Simulate payment processing
    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Pago exitoso',
        detail: 'Tu suscripción ha sido activada'
      });
      
      // Reload trial status and redirect to dashboard
      this.trialService.loadTrialStatus();
      this.router.navigate(['/client/dashboard']);
    }, 2000);
  }
}