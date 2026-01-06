import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { Router, ActivatedRoute } from '@angular/router';
import { SubscriptionService } from '../../../core/services/subscription/subscription.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CardModule, InputTextModule],
  templateUrl: './checkout.html',
  styles: [`
    .checkout-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .checkout-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .checkout-header h1 {
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }

    .checkout-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .plan-summary {
      background: var(--surface-card);
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid var(--surface-border);
    }

    .plan-summary h3 {
      margin-top: 0;
      color: var(--text-color);
    }

    .plan-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--surface-border);
    }

    .plan-name {
      font-size: 1.2rem;
      font-weight: 600;
    }

    .plan-price {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary-color);
    }

    .plan-features {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .payment-form {
      background: var(--surface-card);
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid var(--surface-border);
    }

    .payment-form h3 {
      margin-top: 0;
      color: var(--text-color);
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-color);
    }

    .form-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
    }

    .payment-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .payment-actions button {
      flex: 1;
    }

    .security-info {
      display: flex;
      justify-content: center;
      gap: 2rem;
      padding: 1rem;
      background: var(--surface-50);
      border-radius: 8px;
    }

    .security-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-color-secondary);
    }

    @media (max-width: 768px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }

      .security-info {
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  selectedPlan: any = null;
  processing = false;

  paymentData = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private subscriptionService: SubscriptionService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // Get plan from route state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;

    if (state?.['plan']) {
      this.selectedPlan = state['plan'];
    } else {
      // Try to get from history state
      const historyState = history.state;
      if (historyState?.plan) {
        this.selectedPlan = historyState.plan;
      } else {
        setTimeout(() => {
          this.router.navigate(['/client/payment']);
        }, 100);
      }
    }
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    if (formattedValue.length > 19) {
      formattedValue = formattedValue.substring(0, 19);
    }
    this.paymentData.cardNumber = formattedValue;
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.paymentData.expiryDate = value;
  }

  processPayment() {
    if (!this.selectedPlan) return;

    this.processing = true;

    this.messageService.add({
      severity: 'info',
      summary: 'Procesando pago',
      detail: 'Validando información de pago...'
    });

    // Simulate payment processing
    setTimeout(() => {
      this.subscriptionService.renewSubscription(this.selectedPlan.id).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Pago exitoso',
            detail: 'Tu suscripción ha sido activada'
          });

          setTimeout(() => {
            this.router.navigate(['/client/dashboard']);
          }, 2000);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error en el pago',
            detail: error?.error?.message || 'Error al procesar el pago'
          });
          this.processing = false;
        }
      });
    }, 2000);
  }

  goBack() {
    this.router.navigate(['/client/payment']);
  }
}
