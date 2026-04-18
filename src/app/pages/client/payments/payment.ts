import { Component, HostListener, OnInit } from '@angular/core';
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
    <div class="plans-shell">
      <div class="plans-header">
        <div>
          <div class="plans-header__eyebrow">Suscripción</div>
          <h1 class="plans-header__title">Elige tu plan y sigue operando</h1>
          <p class="plans-header__copy">Mantén el flujo simple: selecciona un plan, entra al checkout y activa el cobro seguro.</p>
        </div>
        <div class="plans-header__trust" *ngIf="getRecommendedPlan() as recommended">
          <div class="plans-header__trust-card">
            <span class="plans-header__trust-label">Recomendado</span>
            <strong>{{ recommended.get_name_display || recommended.name }}</strong>
            <span>{{ recommended.price }}/mes</span>
            <button pButton label="Elegir recomendado" icon="pi pi-arrow-right" class="p-button-success w-full" (click)="selectPlan(recommended)"></button>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="plans-loading">
        <i class="pi pi-spin pi-spinner"></i> Cargando planes...
      </div>

      <div *ngIf="!loading" class="plans-list">
        <div *ngFor="let plan of plans" class="plan-row" [class.plan-row--recommended]="plan.recommended" (click)="selectPlan(plan)">
          <div class="plan-row__left">
            <div class="plan-row__name">{{ plan.get_name_display || plan.name }}</div>
            <div class="plan-row__helper">{{ plan.recommended ? 'Opción más directa para la mayoría de negocios.' : 'Alternativa disponible si este nivel encaja mejor con tu operación.' }}</div>
            <div class="plan-row__features">
              <span *ngFor="let f of plan.features" class="plan-row__feature">
                <i class="pi pi-check"></i> {{ f }}
              </span>
            </div>
          </div>
          <div class="plan-row__right">
            <div class="plan-row__price">
              <strong>{{ plan.price }}</strong><span>/mes</span>
            </div>
            <button pButton
              [label]="plan.recommended ? 'Elegir — Recomendado' : 'Elegir plan'"
              [class]="plan.recommended ? 'p-button-success' : 'p-button-outlined'"
              (click)="selectPlan(plan); $event.stopPropagation()">
            </button>
          </div>
        </div>
      </div>
    </div>

    <style>
    .plans-shell { max-width: 720px; margin: 0 auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

    .plans-header { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(16rem, 0.85fr); align-items: stretch; gap: 1rem; }
    .plans-header__eyebrow { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-color-secondary); }
    .plans-header__title { font-size: clamp(2rem, 5vw, 3.1rem); line-height: 0.98; font-weight: 900; color: var(--text-color); margin: 0.3rem 0 0.75rem; }
    .plans-header__copy { margin: 0; max-width: 34rem; color: var(--text-color-secondary); line-height: 1.55; }
    .plans-header__trust { display: flex; }
    .plans-header__trust-card {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      padding: 1.15rem;
      border-radius: 1rem;
      background: #0f172a;
      color: #e2e8f0;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
    }
    .plans-header__trust-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: #94a3b8; }
    .plans-header__trust-card strong { font-size: 1.45rem; line-height: 1.05; }

    .plans-loading { display: flex; align-items: center; gap: 0.5rem; color: var(--text-color-secondary); padding: 2rem; justify-content: center; }

    .plans-list { display: flex; flex-direction: column; gap: 0.5rem; }

    .plan-row {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
      padding: 1rem 1.25rem;
      border: 1px solid var(--surface-border);
      background: var(--surface-card);
      border-radius: 0.85rem;
      cursor: pointer;
      transition: border-color 120ms, box-shadow 120ms;
    }

    .plan-row:hover { border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }

    .plan-row--recommended {
      border-color: #10b981;
      box-shadow: 0 0 0 1px #10b981;
    }

    .plan-row__left { flex: 1; min-width: 0; }
    .plan-row__name { font-size: 1rem; font-weight: 700; color: var(--text-color); margin-bottom: 0.4rem; }
    .plan-row__helper { font-size: 0.82rem; color: var(--text-color-secondary); margin-bottom: 0.55rem; }
    .plan-row__features { display: flex; flex-wrap: wrap; gap: 0.35rem 0.75rem; }
    .plan-row__feature { font-size: 0.78rem; color: var(--text-color-secondary); display: flex; align-items: center; gap: 0.25rem; }
    .plan-row__feature .pi-check { color: #10b981; font-size: 0.7rem; }

    .plan-row__right { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
    .plan-row__price { text-align: right; }
    .plan-row__price strong { font-size: 1.4rem; font-weight: 800; color: var(--text-color); }
    .plan-row__price span { font-size: 0.82rem; color: var(--text-color-secondary); }

    @media (max-width: 860px) {
      .plans-header { grid-template-columns: 1fr; }
    }
    </style>
  `
})
export class PaymentComponent implements OnInit {
  trialStatus: TrialStatus | null = null;
  plans: any[] = [];
  loading = false;
  recommendedPlanNameFromState: string | null = null;

  constructor(
    private trialService: TrialService,
    private subscriptionService: SubscriptionService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.trialStatus = this.trialService.getCurrentTrialStatus();
    this.recommendedPlanNameFromState = history.state?.recommendedPlanName || null;
    this.loadPlans();
  }

  loadPlans() {
    
    this.loading = true;
    this.subscriptionService.getPlans().subscribe({
      next: (data: any) => {
        
        const allPlans = Array.isArray(data) ? data : (data.results || []);
        // Filter out free plan and add recommended flag
        this.plans = allPlans
          .filter((plan: any) => plan.name !== 'free')
          .map((plan: any, index: number) => ({
            ...plan,
            recommended: this.isRecommendedPlan(plan),
            features: this.getFeaturesList(plan.features)
          }));
        
        this.loading = false;
      },
      error: (error: any) => {
        
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
      'role_permissions': 'Permisos avanzados por rol',
      'api_access': 'Acceso a API',
      'custom_branding': 'Marca Personalizada',
      'priority_support': 'Soporte Prioritario'
    };

    return Object.entries(features)
      .filter(([key, value]) => value === true)
      .map(([key]) => featureNames[key] || key);
  }

  selectPlan(plan: any) {
    
    // Navigate to checkout with selected plan
    this.router.navigate(['/client/checkout'], {
      state: { plan: plan }
    });
  }

  getRecommendedPlan(): any | null {
    return this.plans.find((plan) => plan.recommended) || this.plans[0] || null;
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterShortcut(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || this.loading) {
      return;
    }

    const recommended = this.getRecommendedPlan();
    if (recommended) {
      event.preventDefault();
      this.selectPlan(recommended);
    }
  }

  private isRecommendedPlan(plan: any): boolean {
    const normalizedRecommended = String(this.recommendedPlanNameFromState || '').trim().toLowerCase();
    const normalizedPlanName = String(plan?.name || '').trim().toLowerCase();
    const normalizedDisplayName = String(plan?.get_name_display || '').trim().toLowerCase();

    if (normalizedRecommended) {
      return normalizedPlanName === normalizedRecommended || normalizedDisplayName === normalizedRecommended;
    }

    return normalizedPlanName === 'standard';
  }
}
