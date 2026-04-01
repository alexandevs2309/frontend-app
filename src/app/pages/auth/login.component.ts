import { Component, OnInit, computed } from '@angular/core';
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
import { AuthService, LoginResponse } from '../../core/services/auth/auth.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { LocaleService } from '../../core/services/locale/locale.service';
import { roleKey } from '../../core/utils/role-normalizer';
import { getHttpErrorMessage } from '../../core/utils/http-error-message';
import { LayoutService } from '../../layout/service/layout.service';

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
        ToastModule
    ],
    styleUrls: ['./register.component.scss'],
    providers: [MessageService],
    templateUrl: './login.component.html'
})
export class Login implements OnInit {
    loginForm!: FormGroup;
    isLoading = false;
    requiresMfa = false;
    pendingMfaEmail: string | null = null;
    pendingMfaTenantSubdomain: string | null = null;
    public readonly isDarkTheme = computed(() => this.layoutService.layoutConfig().darkTheme);

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        public appConfig: AppConfigService,
        private router: Router,
        private messageService: MessageService,
        private localeService: LocaleService,
        public layoutService: LayoutService
    ) {}

    ngOnInit(): void {
        this.authService.isAuthenticated$.subscribe(isAuth => {
            if (isAuth) {
                const currentUser = this.authService.getCurrentUser();
                const userRole = currentUser?.role;
                this.redirectUser(userRole || '');
            }
        });

        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            mfaCode: [''],
            rememberMe: [false]
        });

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

    get mfaCode() {
        return this.loginForm.get('mfaCode')!;
    }

    onLogin(): void {
        if (this.requiresMfa) {
            this.onVerifyMfa();
            return;
        }

        this.syncAutofilledCredentials();

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
        const normalizedEmail = (email || '').trim().toLowerCase();
        this.isLoading = true;

        this.authService.loginSecure({ email: normalizedEmail, password }).subscribe({
            next: (response: LoginResponse | any) => {
                this.isLoading = false;

                if (response?.requires_mfa) {
                    this.requiresMfa = true;
                    this.pendingMfaEmail = response.email || normalizedEmail;
                    this.pendingMfaTenantSubdomain = response.tenant?.subdomain || null;
                    this.mfaCode.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
                    this.mfaCode.reset('');
                    this.mfaCode.updateValueAndValidity();
                    this.password.disable();
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Verificacion requerida',
                        detail: response.detail || 'Ingresa tu codigo MFA para completar el acceso.',
                        life: 4000
                    });
                    return;
                }

                this.persistRememberMe(normalizedEmail);
                const userRole = response.user?.role || 'CLIENT_ADMIN';
                this.redirectUser(userRole);
            },
            error: (error) => {
                this.isLoading = false;
                let message = getHttpErrorMessage(error, this.t('auth.login.invalid_credentials'));
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

    private syncAutofilledCredentials(): void {
        const emailInput = document.getElementById('email1') as HTMLInputElement | null;
        const passwordInput = document.getElementById('password1') as HTMLInputElement | null;

        const emailValue = emailInput?.value?.trim() ?? '';
        const passwordValue = passwordInput?.value ?? '';

        if (emailValue && emailValue !== this.email.value) {
            this.email.setValue(emailValue);
        }

        if (passwordValue && passwordValue !== this.password.value) {
            this.password.setValue(passwordValue);
        }
    }

    onVerifyMfa(): void {
        if (!this.pendingMfaEmail) {
            this.resetMfaState();
            return;
        }

        if (this.mfaCode.invalid) {
            this.mfaCode.markAsTouched();
            this.messageService.add({
                severity: 'warn',
                summary: 'Codigo requerido',
                detail: 'Ingresa un codigo MFA valido de 6 digitos.',
                life: 3000
            });
            return;
        }

        this.isLoading = true;
        this.authService.verifyLoginMfa({
            email: this.pendingMfaEmail,
            code: this.mfaCode.value,
            tenant_subdomain: this.pendingMfaTenantSubdomain || undefined
        }).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.persistRememberMe(this.pendingMfaEmail);
                this.resetMfaState();
                const userRole = response.user?.role || 'CLIENT_ADMIN';
                this.redirectUser(userRole);
            },
            error: (error) => {
                this.isLoading = false;
                const message = getHttpErrorMessage(error, 'No se pudo verificar el codigo MFA.');
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de verificacion',
                    detail: message,
                    life: 4000
                });
            }
        });
    }

    cancelMfa(): void {
        this.resetMfaState(true);
    }

    private resetMfaState(resetPassword = false): void {
        this.requiresMfa = false;
        this.pendingMfaEmail = null;
        this.pendingMfaTenantSubdomain = null;
        this.mfaCode.clearValidators();
        this.mfaCode.reset('');
        this.mfaCode.updateValueAndValidity();
        this.password.enable();
        if (resetPassword) {
            this.password.reset('');
        }
    }

    private persistRememberMe(email: string | null): void {
        if (this.loginForm.get('rememberMe')?.value && email) {
            localStorage.setItem('rememberedEmail', email);
            localStorage.setItem('rememberMe', 'true');
            return;
        }

        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
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

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
