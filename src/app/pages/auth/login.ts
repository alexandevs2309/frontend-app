import { Component, OnInit, signal } from '@angular/core';
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
import { AuthService } from '../../core/services/auth/auth.service';
import { SettingsService } from '../../core/services/settings.service';

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
    providers: [MessageService],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">💈 {{platformName()}}</div>
                            <span class="text-muted-color font-medium">Inicia sesión para continuar</span>
                        </div>

                        <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input
                                pInputText
                                id="email1"
                                type="text"
                                placeholder="Email address"
                                class="w-full md:w-120 mb-8"
                                formControlName="email"
                            />
                            <small *ngIf="email.invalid && email.touched" class="text-red-500">Email requerido</small>

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password
                                id="password1"
                                formControlName="password"
                                placeholder="Password"
                                [toggleMask]="true"
                                styleClass="mb-4"
                                [fluid]="true"
                                [feedback]="false"
                            ></p-password>
                            <small *ngIf="password.invalid && password.touched" class="text-red-500">Contraseña requerida</small>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox formControlName="rememberMe" id="rememberme1" binary class="mr-2"></p-checkbox>
                                    <label for="rememberme1">Remember me</label>
                                </div>
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Forgot password?</span>
                            </div>

                            <p-button label="Sign In" styleClass="w-full" [loading]="isLoading" type="submit"></p-button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <p-toast />
    `
})
export class Login implements OnInit {
    loginForm!: FormGroup;
    isLoading = false;
    platformName = signal('BarberSaaS');

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        private settingsService: SettingsService
    ) {}

    ngOnInit(): void {
        // Cargar nombre de la plataforma
        this.settingsService.getSettings().subscribe({
            next: (settings) => {
                this.platformName.set(settings.platform_name || 'BarberSaaS');
            },
            error: () => {
                this.platformName.set('BarberSaaS');
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
            return;
        }

        const { email, password, rememberMe } = this.loginForm.value;
        this.isLoading = true;

        this.authService.login({ email, password }).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: '¡Bienvenido!' });

                // ✅ Guarda email si RememberMe está activo
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberedEmail');
                    localStorage.removeItem('rememberMe');
                }

                setTimeout(() => {
                    this.redirectUser(response.user.role);
                }, 100);
            },
            error: (error) => {
                this.isLoading = false;
                const message = error.error?.message || 'Credenciales inválidas';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
            }
        });
    }

    private redirectUser(role: string): void {
        switch (role) {
            case 'SuperAdmin':
                this.router.navigate(['/admin/dashboard']);
                break;
            case 'ClientAdmin':
            case 'ClientStaff':
                this.router.navigate(['/client/dashboard']);
                break;
            default:
                this.router.navigate(['/auth/login']);
        }
    }
}
