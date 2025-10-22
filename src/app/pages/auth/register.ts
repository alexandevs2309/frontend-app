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
    private router: Router, 
    private route: ActivatedRoute,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    console.log('🚀 [REGISTER] Iniciando componente de registro');
    this.route.queryParams.subscribe(params => {
      console.log('📋 [REGISTER] Query params recibidos:', params);
      if (params['plan']) {
        this.planData.selectedPlan = params['plan'];
        this.planData.selectedPrice = +params['price'] || 0;
        console.log('✅ [REGISTER] Plan seleccionado desde landing:', {
          plan: this.planData.selectedPlan,
          price: this.planData.selectedPrice
        });
      } else {
        // Default plan if no plan selected
        this.planData.selectedPlan = 'free';
        this.planData.selectedPrice = 0;
        console.log('⚠️ [REGISTER] No hay plan en URL, usando plan por defecto: free');
      }
    });
  }

  selectPlan(plan: any) {
    this.planData.selectedPlan = plan.name;
    this.planData.selectedPrice = plan.price;
  }

  nextStep() {
    if (this.currentStep < 2) {
      console.log(`➡️ [REGISTER] Avanzando al paso ${this.currentStep + 1}`);
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 0: return !!(this.businessData.businessName && this.businessData.phone);
      case 1: return !!(this.ownerData.ownerName && this.ownerData.email);
      case 2: return this.termsData.acceptTerms;
      default: return false;
    }
  }

  onSubmit() {
    if (!this.termsData.acceptTerms) {
      console.log('❌ [REGISTER] Términos no aceptados');
      return;
    }

    console.log('🔄 [REGISTER] Iniciando proceso de registro...');
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
}
