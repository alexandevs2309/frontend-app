import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth/auth.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { getHttpErrorMessage } from '../../core/utils/http-error-message';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonModule, PasswordModule, ToastModule],
    providers: [MessageService],
    templateUrl: './reset-password.component.html'
})
export class ResetPassword implements OnInit {
    resetForm: FormGroup;
    isLoading = signal(false);
    token: string = '';
    uid: string = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        public appConfig: AppConfigService,
        private messageService: MessageService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.resetForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit() {
        // Backend sends: /reset-password/{uid}/{token}/
        const uid = this.route.snapshot.params['uid'] || '';
        this.uid = uid;
        this.token = this.route.snapshot.params['token'] || '';
        
        if (!uid || !this.token) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Token inválido o expirado'
            });
            setTimeout(() => this.router.navigate(['/auth/forgot-password']), 2000);
        }
    }

    passwordMatchValidator(form: FormGroup) {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');
        return password && confirmPassword && password.value === confirmPassword.value
            ? null
            : { passwordMismatch: true };
    }

    get password() {
        return this.resetForm.get('password')!;
    }

    get confirmPassword() {
        return this.resetForm.get('confirmPassword')!;
    }

    onSubmit() {
        if (this.resetForm.invalid) return;

        this.isLoading.set(true);
        const { password } = this.resetForm.value;

        this.authService.confirmPasswordReset(this.uid, this.token, password).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Contraseña actualizada',
                    detail: 'Tu contraseña ha sido restablecida exitosamente'
                });
                setTimeout(() => this.router.navigate(['/auth/login']), 2000);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: getHttpErrorMessage(error, 'No se pudo restablecer la contrasena')
                });
                this.isLoading.set(false);
            }
        });
    }
}
