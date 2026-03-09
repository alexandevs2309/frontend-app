import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth/auth.service';
import { environment } from '../../../environments/environment';
import { LocaleService } from '../../core/services/locale/locale.service';
import { getHttpErrorMessage } from '../../core/utils/http-error-message';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonModule, InputTextModule, ToastModule],
    providers: [MessageService],
    templateUrl: './forgot-password.component.html'
})
export class ForgotPassword {
    forgotForm: FormGroup;
    isLoading = signal(false);
    emailSent = signal(false);
    platformName = environment.appName;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private messageService: MessageService,
        private router: Router,
        private localeService: LocaleService
    ) {
        this.forgotForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    get email() {
        return this.forgotForm.get('email')!;
    }

    onSubmit() {
        if (this.forgotForm.invalid) return;

        this.isLoading.set(true);
        const email = this.forgotForm.value.email;

        this.authService.requestPasswordReset(email).subscribe({
            next: () => {
                this.emailSent.set(true);
                this.messageService.add({
                    severity: 'success',
                    summary: this.t('auth.forgot.email_sent'),
                    detail: this.t('auth.forgot.check_inbox')
                });
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: this.t('common.error'),
                    detail: getHttpErrorMessage(error, this.t('auth.forgot.could_not_send'))
                });
                this.isLoading.set(false);
            },
            complete: () => this.isLoading.set(false)
        });
    }

    backToLogin() {
        this.router.navigate(['/auth/login']);
    }

    t(key: string): string {
        return this.localeService.t(key as any);
    }
}
