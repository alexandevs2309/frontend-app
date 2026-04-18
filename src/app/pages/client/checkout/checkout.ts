import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router, ActivatedRoute } from '@angular/router';
import { SubscriptionService } from '../../../core/services/subscription/subscription.service';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../environments/environment';

declare const Stripe: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CardModule],
  templateUrl: './checkout.html',
  styles: [``]
})
export class CheckoutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardElementHost') cardElementHost?: ElementRef<HTMLDivElement>;

  selectedPlan: any = null;
  processing = false;
  selectedMonths = 1;
  monthOptions = [1, 3, 6, 12];
  enableAutoRenew = false;
  stripeReady = false;
  stripeLoading = false;
  cardError = '';
  private stripe: any = null;
  private elements: any = null;
  private cardElement: any = null;
  private stripeScriptPromise: Promise<void> | null = null;

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

  async ngAfterViewInit() {
    await this.initializeStripe();
  }

  ngOnDestroy() {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
  }

  async processPayment() {
    if (!this.selectedPlan) {
      return;
    }

    if (!this.stripe || !this.cardElement) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Pago no disponible',
        detail: 'El formulario seguro de Stripe aún no está listo.'
      });
      return;
    }

    this.cardError = '';
    this.processing = true;

    this.messageService.add({
      severity: 'info',
      summary: 'Procesando pago',
      detail: 'Generando método de pago seguro con Stripe...'
    });

    try {
      const { paymentMethod, error } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.cardElement,
        billing_details: {
          name: this.selectedPlan?.get_name_display || this.selectedPlan?.name || 'Suscripción Auron-Suite'
        }
      });

      if (error || !paymentMethod?.id) {
        this.cardError = error?.message || 'No se pudo validar la tarjeta.';
        this.processing = false;
        return;
      }

      const months = this.enableAutoRenew ? 1 : this.selectedMonths;
      this.subscriptionService.renewSubscription(this.selectedPlan.id, paymentMethod.id, months, this.enableAutoRenew).subscribe({
        next: async (response) => {
          if (response?.requires_action && response?.client_secret) {
            this.messageService.add({
              severity: 'info',
              summary: 'Autenticación requerida',
              detail: 'Confirma el pago con tu banco para finalizar la suscripción.'
            });

            try {
              const { error: actionError, paymentIntent } = await this.stripe.confirmCardPayment(response.client_secret, {
                return_url: `${window.location.origin}/client/payment`
              });

              if (actionError || !paymentIntent) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Autenticación fallida',
                  detail: actionError?.message || 'No se pudo completar la autenticación 3D Secure.'
                });
                this.processing = false;
                return;
              }

              if (paymentIntent.status !== 'succeeded') {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Pago pendiente',
                  detail: `Estado actual: ${paymentIntent.status}`
                });
                this.processing = false;
                return;
              }

              this.subscriptionService
                .renewSubscription(this.selectedPlan.id, null, months, this.enableAutoRenew, paymentIntent.id)
                .subscribe({
                  next: (finalResponse) => this.handleSuccess(finalResponse),
                  error: (finalError) => this.handleError(finalError)
                });
              return;
            } catch {
              this.messageService.add({
                severity: 'error',
                summary: 'Error inesperado',
                detail: 'Error al confirmar 3D Secure.'
              });
              this.processing = false;
              return;
            }
          }

          this.handleSuccess(response);
        },
        error: (error) => this.handleError(error)
      });
    } catch {
      this.cardError = 'No se pudo iniciar el pago con Stripe.';
      this.processing = false;
    }
  }

  goBack() {
    this.router.navigate(['/client/payment']);
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterShortcut(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName?.toLowerCase();
    if (tag === 'textarea' || this.processing) {
      return;
    }

    if (tag !== 'button') {
      event.preventDefault();
      this.processPayment();
    }
  }

  getTotalAmount(): number {
    const planPrice = Number(this.selectedPlan?.price || 0);
    const months = this.enableAutoRenew ? 1 : this.selectedMonths;
    return Number((planPrice * months).toFixed(2));
  }

  private handleSuccess(response: any) {
    this.processing = false;
    this.messageService.add({
      severity: 'success',
      summary: this.enableAutoRenew ? 'Suscripción automática activada' : 'Pago exitoso',
      detail: `Tu suscripción ha sido activada hasta ${new Date(response?.access_until || Date.now()).toLocaleDateString('es-DO')}`
    });

    setTimeout(() => {
      this.router.navigate(['/client/dashboard']);
    }, 2000);
  }

  private handleError(error: any) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error en el pago',
      detail: error?.error?.message || 'Error al procesar el pago'
    });
    this.processing = false;
  }

  private async initializeStripe(): Promise<void> {
    if (!this.selectedPlan || !this.cardElementHost) {
      return;
    }

    this.stripeLoading = true;

    try {
      await this.loadStripeScript();

      if (typeof Stripe === 'undefined' || !environment.stripePublishableKey) {
        throw new Error('Stripe.js no está disponible');
      }

      this.stripe = Stripe(environment.stripePublishableKey);
      this.elements = this.stripe.elements();
      this.cardElement = this.elements.create('card', {
        hidePostalCode: true,
        style: {
          base: {
            color: '#0f172a',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            '::placeholder': {
              color: '#64748b'
            }
          },
          invalid: {
            color: '#dc2626',
            iconColor: '#dc2626'
          }
        }
      });

      this.cardElement.mount(this.cardElementHost.nativeElement);
      this.cardElement.on('change', (event: any) => {
        this.cardError = event?.error?.message || '';
      });

      this.stripeReady = true;
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Stripe no disponible',
        detail: 'No se pudo cargar el formulario seguro de pago.'
      });
    } finally {
      this.stripeLoading = false;
    }
  }

  private loadStripeScript(): Promise<void> {
    if (typeof Stripe !== 'undefined') {
      return Promise.resolve();
    }

    if (this.stripeScriptPromise) {
      return this.stripeScriptPromise;
    }

    this.stripeScriptPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector('script[data-stripe-js="true"]') as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Stripe.js failed to load')), { once: true });
        return;
      }

      const STRIPE_SCRIPT_URL = 'https://js.stripe.com/v3/';
      const script = document.createElement('script');
      script.src = STRIPE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.dataset['stripeJs'] = 'true';
      script.onload = () => {
        if (!window.hasOwnProperty('Stripe')) {
          reject(new Error('Stripe.js loaded but Stripe global not found'));
          return;
        }
        resolve();
      };
      script.onerror = () => reject(new Error('Stripe.js failed to load'));
      document.head.appendChild(script);
    });

    return this.stripeScriptPromise;
  }
}
