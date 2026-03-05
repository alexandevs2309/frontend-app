import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, PasswordModule, CardModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast />
        <div class="password-page p-4 md:p-6">
            <section class="password-hero mb-6">
                <div class="flex items-center gap-4">
                    <div class="hero-icon">
                        <i class="pi pi-shield text-white text-2xl"></i>
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold mb-1">Cambiar contraseña</h1>
                        <p class="hero-subtitle">{{ userName }} • Refuerza la seguridad de tu cuenta</p>
                    </div>
                </div>
            </section>

            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div class="xl:col-span-2">
                    <p-card>
                        <div class="space-y-5">
                            <div>
                                <h2 class="section-title">Actualización de credenciales</h2>
                                <p class="section-subtitle">Usa una contraseña robusta y única para tu cuenta.</p>
                            </div>

                            <div>
                                <label class="block font-medium mb-2">Contraseña actual</label>
                                <p-password
                                    [(ngModel)]="currentPassword"
                                    [feedback]="false"
                                    [toggleMask]="true"
                                    styleClass="w-full"
                                    inputStyleClass="w-full"
                                ></p-password>
                            </div>

                            <div>
                                <label class="block font-medium mb-2">Nueva contraseña</label>
                                <p-password
                                    [(ngModel)]="newPassword"
                                    [toggleMask]="true"
                                    styleClass="w-full"
                                    inputStyleClass="w-full"
                                ></p-password>
                            </div>

                            <div>
                                <label class="block font-medium mb-2">Confirmar nueva contraseña</label>
                                <p-password
                                    [(ngModel)]="confirmPassword"
                                    [feedback]="false"
                                    [toggleMask]="true"
                                    styleClass="w-full"
                                    inputStyleClass="w-full"
                                ></p-password>
                                @if (confirmPassword.length > 0 && newPassword !== confirmPassword) {
                                    <small class="text-red-500 mt-2 block">Las contraseñas no coinciden.</small>
                                }
                            </div>

                            <div class="flex justify-end">
                                <button
                                    pButton
                                    label="Cambiar contraseña"
                                    icon="pi pi-key"
                                    (click)="changePassword()"
                                    [loading]="saving()"
                                    [disabled]="!isValid()"
                                ></button>
                            </div>
                        </div>
                    </p-card>
                </div>

                <div class="space-y-6">
                    <p-card>
                        <div class="space-y-3">
                            <h3 class="section-title !mb-0">Checklist de seguridad</h3>
                            <div class="check-row" [class.ok]="newPassword.length >= 8">
                                <i class="pi" [ngClass]="newPassword.length >= 8 ? 'pi-check-circle' : 'pi-circle'"></i>
                                <span>Mínimo 8 caracteres</span>
                            </div>
                            <div class="check-row" [class.ok]="hasUppercase()">
                                <i class="pi" [ngClass]="hasUppercase() ? 'pi-check-circle' : 'pi-circle'"></i>
                                <span>Al menos una mayúscula</span>
                            </div>
                            <div class="check-row" [class.ok]="hasNumber()">
                                <i class="pi" [ngClass]="hasNumber() ? 'pi-check-circle' : 'pi-circle'"></i>
                                <span>Al menos un número</span>
                            </div>
                            <div class="check-row" [class.ok]="newPassword === confirmPassword && confirmPassword.length > 0">
                                <i class="pi" [ngClass]="newPassword === confirmPassword && confirmPassword.length > 0 ? 'pi-check-circle' : 'pi-circle'"></i>
                                <span>Confirmación coincide</span>
                            </div>
                        </div>
                    </p-card>

                    <p-card>
                        <div class="space-y-2">
                            <h3 class="section-title !mb-0">Recomendación</h3>
                            <p class="section-subtitle">No reutilices esta contraseña en otros servicios. Si sospechas actividad extraña, cámbiala de inmediato.</p>
                        </div>
                    </p-card>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .password-page {
            background: linear-gradient(180deg, rgba(14,165,233,0.08) 0%, rgba(14,165,233,0.02) 35%, transparent 100%);
            min-height: calc(100vh - 7rem);
            border-radius: 1rem;
        }

        .password-hero {
            border: 1px solid var(--surface-border);
            background: var(--surface-card);
            border-radius: 1rem;
            padding: 1.25rem;
        }

        .hero-icon {
            width: 3rem;
            height: 3rem;
            border-radius: 0.75rem;
            background: linear-gradient(135deg, #4f46e5, #0ea5e9);
            display: grid;
            place-items: center;
        }

        .hero-subtitle {
            margin: 0;
            color: var(--text-color-secondary);
        }

        .section-title {
            margin: 0 0 0.25rem;
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--text-color);
        }

        .section-subtitle {
            margin: 0;
            color: var(--text-color-secondary);
            font-size: 0.92rem;
        }

        .check-row {
            display: flex;
            gap: 0.55rem;
            align-items: center;
            color: var(--text-color-secondary);
            font-size: 0.92rem;
        }

        .check-row.ok {
            color: #16a34a;
        }
    `]
})
export class ChangePasswordComponent implements OnInit {
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    saving = signal(false);
    userName = 'Usuario';

    constructor(
        private messageService: MessageService,
        private http: HttpClient,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        const user = this.authService.getCurrentUser();
        this.userName = user?.full_name || user?.email || 'Usuario';
    }

    isValid(): boolean {
        return this.currentPassword.length > 0 &&
               this.newPassword.length >= 8 &&
               this.hasUppercase() &&
               this.hasNumber() &&
               this.newPassword === this.confirmPassword;
    }

    hasUppercase(): boolean {
        return /[A-Z]/.test(this.newPassword);
    }

    hasNumber(): boolean {
        return /\d/.test(this.newPassword);
    }

    changePassword() {
        if (!this.isValid()) return;

        this.saving.set(true);
        const url = `${environment.apiUrl}/auth/change-password/`;

        this.http.put(url, {
            old_password: this.currentPassword,
            new_password: this.newPassword
        }).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Contraseña actualizada correctamente'
                });
                this.currentPassword = '';
                this.newPassword = '';
                this.confirmPassword = '';
                this.saving.set(false);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.old_password?.[0] || err.error?.detail || 'Error al cambiar contraseña'
                });
                this.saving.set(false);
            }
        });
    }
}
