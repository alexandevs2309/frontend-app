import { AppFloatingConfigurator } from './../../layout/component/app.floatingconfigurator';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    StepsModule,
    AppFloatingConfigurator,
    CardModule,
    ToastModule
  ],
  providers: [MessageService],
   templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']

})
export class Register implements OnInit {
  selectedPlan: string = '';
  selectedPrice: number = 0;
  isLoading: boolean = false;
  currentStep: number = 0;

  steps = [
    { label: 'Negocio', icon: 'pi pi-building' },
    { label: 'Propietario', icon: 'pi pi-user' },
    { label: 'Finalizar', icon: 'pi pi-check' }
  ];

  // Step 1: Plan Selection
  planData = {
    selectedPlan: '',
    selectedPrice: 0
  };

  // Step 2: Business Info
  businessData = {
    businessName: '',
    businessType: 'barberia',
    address: '',
    phone: ''
  };

  // Step 3: Owner Info
  ownerData = {
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  // Validation states
  validation = {
    emailValid: false,
    emailTouched: false,
    phoneValid: false,
    phoneTouched: false,
    emailExists: false,
    checkingEmail: false
  };

  // Field completion tracking
  fieldCompletion = {
    step0: 0,
    step1: 0,
    step2: 0
  };

  // Auto-save indicator
  autoSaveStatus: 'saved' | 'saving' | 'idle' = 'idle';
  private saveTimeout: any;

  // A/B Testing for CTA button
  ctaVariant: 'A' | 'B' | 'C' = 'A';
  ctaTexts = {
    A: '¡Comenzar Prueba Gratuita!',
    B: '¡Activar Mi Barbería Ahora!',
    C: '¡Iniciar Prueba de 7 Días!'
  };

  // Step 3: Payment
  paymentData = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    billingAddress: ''
  };

  // Step 4: Terms
  termsData = {
    acceptTerms: false,
    acceptMarketing: false
  };

  plans = [
    { name: 'free', price: 0, features: ['1 empleado', 'Funciones básicas', 'Soporte email'] },
    { name: 'basic', price: 19, features: ['3 empleados', 'Reportes básicos', 'Soporte email'] },
    { name: 'standard', price: 49, features: ['10 empleados', 'POS completo', 'Reportes avanzados', 'Soporte prioritario'] },
    { name: 'premium', price: 99, features: ['25 empleados', 'API completa', 'Soporte 24/7', 'Personalización'] },
    { name: 'enterprise', price: 199, features: ['Empleados ilimitados', 'Multi-sucursales', 'Soporte dedicado', 'Personalización completa'] }
  ];

  constructor(
    public router: Router, 
    private route: ActivatedRoute,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    console.log('🚀 [REGISTER] Iniciando componente de registro');
    
    // A/B Testing: Randomly assign variant
    const variants: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
    this.ctaVariant = variants[Math.floor(Math.random() * variants.length)];
    console.log('🎯 [A/B TEST] Variante CTA:', this.ctaVariant, '-', this.ctaTexts[this.ctaVariant]);
    
    // Load saved data from localStorage
    this.loadSavedData();
    
    this.route.queryParams.subscribe(params => {
      console.log('📋 [REGISTER] Query params recibidos:', params);
      if (params['plan']) {
        this.planData.selectedPlan = params['plan'];
        this.planData.selectedPrice = +params['price'] || 0;
        console.log('✅ [REGISTER] Plan seleccionado desde landing:', {
          plan: this.planData.selectedPlan,
          price: this.planData.selectedPrice
        });
      } else if (!this.planData.selectedPlan) {
        // No hay plan seleccionado - redirigir a landing para elegir plan
        console.log('⚠️ [REGISTER] No hay plan seleccionado, redirigiendo a landing...');
        this.messageService.add({
          severity: 'info',
          summary: 'Selecciona un Plan',
          detail: 'Por favor selecciona un plan antes de registrarte',
          life: 4000
        });
        setTimeout(() => {
          this.router.navigate(['/landing']).then(() => {
            // Scroll to pricing section after navigation
            setTimeout(() => {
              const pricingSection = document.getElementById('pricing');
              if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          });
        }, 1000);
      }
    });
    this.updateFieldCompletion();
  }

  // Load saved registration data from localStorage
  loadSavedData() {
    try {
      const saved = localStorage.getItem('registration_draft');
      if (saved) {
        const data = JSON.parse(saved);
        const savedTime = new Date(data.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
        
        // Only load if saved within last 24 hours
        if (hoursDiff < 24) {
          this.businessData = data.businessData || this.businessData;
          this.ownerData = data.ownerData || this.ownerData;
          this.planData = data.planData || this.planData;
          this.currentStep = data.currentStep || 0;
          console.log('✅ [REGISTER] Datos recuperados de borrador');
          
          this.messageService.add({
            severity: 'info',
            summary: 'Borrador Recuperado',
            detail: 'Hemos recuperado tu progreso anterior',
            life: 4000
          });
        } else {
          localStorage.removeItem('registration_draft');
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }

  // Save registration data to localStorage
  saveData() {
    this.autoSaveStatus = 'saving';
    
    // Debounce save
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      try {
        const data = {
          businessData: this.businessData,
          ownerData: { ...this.ownerData, password: '', confirmPassword: '' }, // Don't save passwords
          planData: this.planData,
          currentStep: this.currentStep,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('registration_draft', JSON.stringify(data));
        this.autoSaveStatus = 'saved';
        
        // Reset to idle after 2 seconds
        setTimeout(() => {
          this.autoSaveStatus = 'idle';
        }, 2000);
      } catch (error) {
        console.error('Error saving data:', error);
        this.autoSaveStatus = 'idle';
      }
    }, 500);
  }

  // Real-time email validation
  validateEmail() {
    this.validation.emailTouched = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.validation.emailValid = emailRegex.test(this.ownerData.email);
    
    if (this.validation.emailValid) {
      this.checkEmailExists();
    }
    this.updateFieldCompletion();
    this.saveData();
  }

  // Check if email already exists (simulated - connect to your backend)
  checkEmailExists() {
    this.validation.checkingEmail = true;
    this.authService.checkEmailAvailability(this.ownerData.email).subscribe({
      next: (response) => {
        this.validation.emailExists = !response.available;
        this.validation.checkingEmail = false;
      },
      error: () => {
        // If API fails, assume email is available
        this.validation.emailExists = false;
        this.validation.checkingEmail = false;
      }
    });
  }

  // Real-time phone validation
  validatePhone() {
    this.validation.phoneTouched = true;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    this.validation.phoneValid = phoneRegex.test(this.businessData.phone);
    this.updateFieldCompletion();
    this.saveData();
  }

  // Update field completion percentage
  updateFieldCompletion() {
    // Step 0: Business Info
    let step0Fields = 0;
    if (this.businessData.businessName) step0Fields++;
    if (this.businessData.phone && this.validation.phoneValid) step0Fields++;
    if (this.businessData.address) step0Fields++;
    this.fieldCompletion.step0 = Math.round((step0Fields / 3) * 100);

    // Step 1: Owner Info
    let step1Fields = 0;
    if (this.ownerData.ownerName) step1Fields++;
    if (this.ownerData.email && this.validation.emailValid) step1Fields++;
    this.fieldCompletion.step1 = Math.round((step1Fields / 2) * 100);

    // Step 2: Terms
    this.fieldCompletion.step2 = this.termsData.acceptTerms ? 100 : 0;
  }

  selectPlan(plan: any) {
    this.planData.selectedPlan = plan.name;
    this.planData.selectedPrice = plan.price;
  }

  nextStep() {
    if (this.currentStep < 2) {
      console.log(`➡️ [REGISTER] Avanzando al paso ${this.currentStep + 1}`);
      
      // Analytics: Track step completion
      this.trackEvent('registration_step_completed', {
        step: this.currentStep,
        step_name: this.steps[this.currentStep].label,
        completion_percentage: this.currentStep === 0 ? this.fieldCompletion.step0 : this.fieldCompletion.step1
      });
      
      this.currentStep++;
      this.saveData();
      
      // Analytics: Track step view
      this.trackEvent('registration_step_viewed', {
        step: this.currentStep,
        step_name: this.steps[this.currentStep].label
      });
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      // Analytics: Track step back
      this.trackEvent('registration_step_back', {
        from_step: this.currentStep,
        to_step: this.currentStep - 1
      });
      
      this.currentStep--;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 0: return !!(this.businessData.businessName && this.businessData.phone && this.validation.phoneValid);
      case 1: return !!(this.ownerData.ownerName && this.ownerData.email && this.validation.emailValid && !this.validation.emailExists);
      case 2: return this.termsData.acceptTerms;
      default: return false;
    }
  }

  // Get estimated time remaining
  getEstimatedTime(): string {
    const totalSteps = 3;
    const remainingSteps = totalSteps - this.currentStep;
    const minutesPerStep = 1;
    const totalMinutes = remainingSteps * minutesPerStep;
    return totalMinutes === 1 ? '1 minuto' : `${totalMinutes} minutos`;
  }

  // Get plan display name
  getPlanDisplayName(): string {
    const planNames: any = {
      'free': 'Gratis',
      'basic': 'Básico',
      'standard': 'Estándar',
      'premium': 'Premium',
      'enterprise': 'Enterprise'
    };
    return planNames[this.planData.selectedPlan] || this.planData.selectedPlan;
  }

  onSubmit() {
    if (!this.termsData.acceptTerms) {
      console.log('❌ [REGISTER] Términos no aceptados');
      return;
    }

    console.log('🔄 [REGISTER] Iniciando proceso de registro...');
    
    // Analytics: Track registration attempt
    this.trackEvent('registration_submitted', {
      plan: this.planData.selectedPlan,
      plan_price: this.planData.selectedPrice,
      cta_variant: this.ctaVariant,
      has_address: !!this.businessData.address,
      accepts_marketing: this.termsData.acceptMarketing
    });
    
    this.isLoading = true;

    const registrationData = {
      fullName: this.ownerData.ownerName,
      email: this.ownerData.email,
      businessName: this.businessData.businessName,
      phone: this.businessData.phone,
      address: this.businessData.address,
      planType: this.planData.selectedPlan.toLowerCase()
      // password: this.ownerData.password // Backend genera contraseña automática
    };

    console.log('📤 [REGISTER] Datos enviados al backend:', registrationData);

    this.authService.registerWithPlan(registrationData).subscribe({
      next: (response) => {
        console.log('✅ [REGISTER] Respuesta exitosa del backend:', response);
        this.isLoading = false;
        
        // Analytics: Track successful registration
        this.trackEvent('registration_completed', {
          plan: this.planData.selectedPlan,
          plan_price: this.planData.selectedPrice,
          cta_variant: this.ctaVariant
        });
        
        // Clear saved draft on successful registration
        localStorage.removeItem('registration_draft');
        
        this.messageService.add({
          severity: 'success',
          summary: '¡Cuenta Creada Exitosamente!',
          detail: 'Revisa tu email para obtener tus credenciales de acceso. Te hemos enviado toda la información necesaria.',
          life: 8000
        });
        
        console.log('🔄 [REGISTER] Redirigiendo a página de confirmación...');
        setTimeout(() => {
          this.router.navigate(['/auth/registration-success'], {
            queryParams: { 
              businessName: this.businessData.businessName,
              email: this.ownerData.email,
              planName: this.planData.selectedPlan,
              planPrice: this.planData.selectedPrice
            }
          });
        }, 2000);
      },
      error: (error) => {
        console.error('❌ [REGISTER] Error del backend:', error);
        this.isLoading = false;
        
        // Analytics: Track registration error
        this.trackEvent('registration_failed', {
          plan: this.planData.selectedPlan,
          error_message: error.error?.error || 'Unknown error',
          cta_variant: this.ctaVariant
        });
        
        const message = error.error?.error || 'Error al crear la cuenta. Inténtalo de nuevo.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: message,
          life: 5000
        });
      }
    });
  }

  // Analytics tracking helper
  private trackEvent(eventName: string, properties: any = {}) {
    // Log to console for debugging
    console.log(`📊 [ANALYTICS] ${eventName}:`, properties);
    
    // TODO: Integrate with your analytics service (Google Analytics, Mixpanel, etc.)
    // Example with Google Analytics:
    // if (typeof gtag !== 'undefined') {
    //   gtag('event', eventName, properties);
    // }
    
    // Example with custom analytics service:
    // this.analyticsService.track(eventName, properties);
  }
}
