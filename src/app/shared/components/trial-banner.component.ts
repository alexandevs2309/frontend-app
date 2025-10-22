import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { TrialService, TrialStatus } from '../../core/services/trial.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-trial-banner',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div *ngIf="shouldShowBanner" 
         class="trial-banner"
         [ngClass]="{
           'trial-warning': daysRemaining <= 3 && daysRemaining > 0,
           'trial-expired': daysRemaining <= 0,
           'trial-active': daysRemaining > 3
         }">
      
      <!-- Trial Activo -->
      <div *ngIf="daysRemaining > 0" class="banner-content">
        <div class="banner-icon">
          <i class="pi pi-clock" *ngIf="daysRemaining > 3"></i>
          <i class="pi pi-exclamation-triangle" *ngIf="daysRemaining <= 3"></i>
        </div>
        <div class="banner-text">
          <span class="banner-title">Prueba Gratuita</span>
          <span class="banner-message">
            Te quedan <strong>{{daysRemaining}} días</strong> de prueba gratuita
          </span>
        </div>
        <button pButton 
                type="button" 
                label="Actualizar Plan" 
                class="p-button-sm"
                (click)="upgradeNow()">
        </button>
      </div>

      <!-- Trial Expirado -->
      <div *ngIf="daysRemaining <= 0" class="banner-content">
        <div class="banner-icon">
          <i class="pi pi-times-circle"></i>
        </div>
        <div class="banner-text">
          <span class="banner-title">Prueba Expirada</span>
          <span class="banner-message">
            Tu prueba gratuita ha terminado. Actualiza para continuar.
          </span>
        </div>
        <button pButton 
                type="button" 
                label="Actualizar Ahora" 
                class="p-button-sm p-button-danger"
                (click)="upgradeNow()">
        </button>
      </div>
    </div>
  `,
  styles: [`
    .trial-banner {
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 12px 20px;
      border-bottom: 1px solid #e0e0e0;
      transition: all 0.3s ease;
    }

    .trial-active {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      color: #1565c0;
    }

    .trial-warning {
      background: linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%);
      color: #e65100;
    }

    .trial-expired {
      background: linear-gradient(135deg, #ffebee 0%, #ef5350 100%);
      color: #c62828;
    }

    .banner-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
    }

    .banner-icon {
      font-size: 1.2rem;
      margin-right: 12px;
    }

    .banner-text {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .banner-title {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .banner-message {
      font-size: 0.85rem;
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .banner-content {
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }
      
      .banner-icon {
        margin-right: 0;
      }
    }
  `]
})
export class TrialBannerComponent implements OnInit, OnDestroy {
  trialStatus: TrialStatus | null = null;
  daysRemaining: number = 0;
  shouldShowBanner: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private trialService: TrialService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.trialService.trialStatus$.subscribe(status => {
        this.trialStatus = status;
        this.updateBannerState();
      })
    );

    // Cargar estado inicial
    this.trialService.loadTrialStatus();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private updateBannerState() {
    if (!this.trialStatus) {
      this.shouldShowBanner = false;
      return;
    }

    this.daysRemaining = this.trialStatus.trial_days_remaining || 0;
    
    // Mostrar banner solo si está en trial
    this.shouldShowBanner = this.trialStatus.is_trial;
  }

  upgradeNow() {
    this.router.navigate(['/client/payment']);
  }
}