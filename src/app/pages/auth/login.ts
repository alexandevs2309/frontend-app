import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService, LoginResponse } from '../../core/services/auth/auth.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { LocaleService } from '../../core/services/locale/locale.service';
import { roleKey } from '../../core/utils/role-normalizer';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        PasswordModule,
        ReactiveFormsModule,
        RouterModule,
        RippleModule,
        ToastModule,
        AppFloatingConfigurator
    ],
    styleUrls: ['./register.component.scss'],
    providers: [MessageService],
    templateUrl: './login.component.html'
})
export class Login implements OnInit {
    loginForm!: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        public appConfig: AppConfigService,
        private router: Router,
        private messageService: MessageService,
        private localeService: LocaleService
    ) {}

    ngOnInit(): void {
        // ✅ Redirigir si ya está autenticado
        this.authService.isAuthenticated$.subscribe(isAuth => {
            if (isAuth) {
                const currentUser = this.authService.getCurrentUser();
                const userRole = currentUser?.role;
                this.redirectUser(userRole || '');
            }
        });

        // Inicializa el formulario reactivo
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            rememberMe: [false]
        });

        // ✅ Carga datos guardados si existen
        const savedEmail = localStorage.getItem('rememberedEmail');
        const rememberFlag = localStorage.getItem('rememberMe') === 'true';

        if (savedEmail && rememberFlag) {
            this.loginForm.patchValue({
                email: savedEmail,
                rememberMe: true
            });
        }
    }

    get email() {
        return this.loginForm.get('email')!;
    }

    get password() {
        return this.loginForm.get('password')!;
    }

    onLogin(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            this.messageService.add({ 
                severity: 'warn', 
                summary: this.t('auth.login.incomplete_form'), 
                detail: this.t('auth.login.complete_required_fields') 
            });
            return;
        }

        const { email, password, rememberMe } = this.loginForm.value;
        this.isLoading = true;

        this.authService.loginSecure({ email, password }).subscribe({
            next: (response: LoginResponse | any) => {
                this.isLoading = false;
                
                // Guardar email si RememberMe está activo
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberedEmail');
                    localStorage.removeItem('rememberMe');
                }

                // Redirigir usando el rol de la respuesta directamente
                const userRole = response.user?.role || 'CLIENT_ADMIN';
                this.redirectUser(userRole);
            },
            error: (error) => {
                this.isLoading = false;
                let message = error.error?.detail || error.error?.message || this.t('auth.login.invalid_credentials');
                if (!message && error.error && typeof error.error === 'object') {
                    const firstKey = Object.keys(error.error)[0];
                    const firstVal = error.error[firstKey];
                    if (Array.isArray(firstVal) && firstVal.length > 0) {
                        message = firstVal[0];
                    } else if (typeof firstVal === 'string') {
                        message = firstVal;
                    }
                }
                this.messageService.add({ 
                    severity: 'error', 
                    summary: this.t('auth.login.auth_error'), 
                    detail: message,
                    life: 4000
                });
            }
        });
    }

    private redirectUser(role: string): void {
        if (roleKey(role) === 'SUPER_ADMIN') {
            this.router.navigate(['/admin/dashboard']);
        } else {
            this.router.navigate(['/client/dashboard']).then(
                () => {},
                () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.t('auth.login.auth_error'),
                        detail: 'No se pudo completar la navegacion al panel.',
                        life: 4000
                    });
                }
            );
        }
    }

    t(key: string): string {
        return this.localeService.t(key as any);
    }
}
