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
import { AuthService, LoginResponse } from '../../core/services/auth/auth.service';

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
    platformName = signal('Auron-Suite');

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.platformName.set('BarberSaaS');
        
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

        this.authService.loginSecure({ email, password }).subscribe({
            next: (response: LoginResponse | any) => {
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

                // Force menu update and redirect
                setTimeout(() => {
                    this.redirectUser(response.user?.role);
                }, 500);
            },
            error: (error) => {
                this.isLoading = false;
                const message = error.error?.message || 'Credenciales inválidas';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
            }
        });
    }

    private redirectUser(role: string): void {
        // Usar setTimeout para asegurar que el estado se actualice
        setTimeout(() => {
            if (role === 'SuperAdmin') {
                this.router.navigate(['/admin/dashboard']);
            } else {
                this.router.navigate(['/client/dashboard']);
            }
        }, 100);
    }
}
