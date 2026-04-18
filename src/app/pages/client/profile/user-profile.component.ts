import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../core/services/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { SubscriptionService } from '../../../core/services/subscription/subscription.service';
import { TenantService } from '../../../core/services/tenant/tenant.service';
import { getSubscriptionPlanLabel } from '../../../core/utils/subscription-plan-label';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, InputOtpModule, CardModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast />
        <div class="profile-page p-4 md:p-6">
            <section class="profile-hero mb-6">
                <div class="profile-hero__left">
                    <div class="profile-avatar" [class.has-image]="!!getProfileImageUrl()">
                        @if (getProfileImageUrl(); as imageUrl) {
                            <img [src]="imageUrl" alt="Foto de perfil" />
                        } @else {
                            <span>{{ getInitials(user.full_name || user.email) }}</span>
                        }
                    </div>

                    <div class="profile-identity">
                        <h1 class="text-3xl font-bold mb-1">Mi Cuenta</h1>
                        <p class="profile-name">{{ user.full_name || 'Usuario sin nombre' }}</p>
                        <p class="profile-meta">
                            {{ getRoleDisplayName(user.role) }}
                            <span class="mx-2">•</span>
                            Miembro desde {{ formatDate(user.date_joined) }}
                        </p>
                        <div class="mt-3">
                            <input #avatarInput type="file" accept="image/*" class="hidden" (change)="onAvatarSelected($event)" />
                            <button pButton type="button" class="p-button-sm p-button-outlined" icon="pi pi-camera" label="Cambiar foto" (click)="avatarInput.click()" [loading]="uploadingAvatar()"></button>
                        </div>
                    </div>
                </div>

                <div class="profile-hero__right">
                    <div class="stat-chip">
                        <i class="pi pi-verified text-green-500"></i>
                        <div>
                            <p class="stat-label">Estado de cuenta</p>
                            <p class="stat-value">{{ user.is_active === false ? 'Inactiva' : 'Activa' }}</p>
                        </div>
                    </div>
                    <div class="stat-chip">
                        <i class="pi pi-users text-indigo-500"></i>
                        <div>
                            <p class="stat-label">Roles asignados</p>
                            <p class="stat-value">{{ (user.roles?.length || 0) > 0 ? user.roles.length : 1 }}</p>
                        </div>
                    </div>
                </div>
            </section>

            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div class="xl:col-span-2">
                    <p-card>
                        <div class="space-y-6">
                            <div>
                                <h2 class="section-title">Información personal</h2>
                                <p class="section-subtitle">Actualiza tus datos básicos para mantener tu perfil al día.</p>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block font-medium mb-2">Nombre completo</label>
                                    <input pInputText [(ngModel)]="user.full_name" class="w-full" />
                                </div>

                                <div>
                                    <label class="block font-medium mb-2">Email</label>
                                    <input pInputText [(ngModel)]="user.email" type="email" class="w-full" />
                                </div>

                                <div>
                                    <label class="block font-medium mb-2">Teléfono</label>
                                    <input pInputText [(ngModel)]="user.phone" class="w-full" />
                                </div>

                                <div>
                                    <label class="block font-medium mb-2">Rol</label>
                                    <input pInputText [value]="getRoleDisplayName(user.role)" [disabled]="true" class="w-full" />
                                </div>
                            </div>

                            <div class="flex justify-end">
                                <button
                                    pButton
                                    label="Guardar cambios"
                                    icon="pi pi-save"
                                    (click)="saveProfile()"
                                    [loading]="saving()"
                                ></button>
                            </div>
                        </div>
                    </p-card>
                </div>

                <div class="space-y-6">
                    <p-card>
                        <div class="space-y-3">
                            <h3 class="section-title !mb-0">Resumen de cuenta</h3>
                            <div class="summary-row">
                                <span>ID de usuario</span>
                                <strong>#{{ user.id || 'N/A' }}</strong>
                            </div>
                            <div class="summary-row">
                                <span>Tenant</span>
                                <strong>{{ getTenantDisplay() }}</strong>
                            </div>
                            <div class="summary-row">
                                <span>Fecha de registro</span>
                                <strong>{{ formatDate(user.date_joined) }}</strong>
                            </div>
                            <div class="summary-row">
                                <span>Foto de perfil</span>
                                <strong>{{ getProfileImageUrl() ? 'Configurada' : 'No configurada' }}</strong>
                            </div>
                            <div class="summary-row">
                                <span>MFA</span>
                                <strong>{{ user.mfa_enabled ? 'Activo' : 'No configurado' }}</strong>
                            </div>
                        </div>
                    </p-card>

                    <p-card>
                        <div class="space-y-3">
                            <h3 class="section-title !mb-0">Plan actual</h3>
                            <div class="summary-row">
                                <span>Plan</span>
                                <strong>{{ getCurrentPlanName() }}</strong>
                            </div>
                            <div class="summary-row">
                                <span>Estado</span>
                                <strong>{{ getCurrentPlanStatusText() }}</strong>
                            </div>
                            <p class="section-subtitle">{{ getCurrentPlanCopy() }}</p>
                            <button pButton class="w-full p-button-outlined" icon="pi pi-credit-card" label="Ver planes y actualizar" (click)="goToPayment()"></button>
                        </div>
                    </p-card>

                    <p-card>
                        <div class="space-y-4">
                            <div>
                                <h3 class="section-title !mb-0">Autenticación multifactor</h3>
                                <p class="section-subtitle">Protege tu cuenta con un código adicional desde Google Authenticator, Authy o apps compatibles.</p>
                            </div>

                            @if (user.mfa_enabled) {
                                <div class="mfa-status mfa-status--active">
                                    <i class="pi pi-shield"></i>
                                    <div>
                                        <strong>MFA activo</strong>
                                        <p>Tu cuenta ya requiere un código adicional al iniciar sesión.</p>
                                    </div>
                                </div>

                                @if (!showDisableMfa) {
                                    <button
                                        pButton
                                        type="button"
                                        class="w-full p-button-outlined"
                                        icon="pi pi-lock-open"
                                        label="Desactivar MFA"
                                        (click)="openDisableMfa()"
                                    ></button>
                                }

                                @if (showDisableMfa) {
                                    <div class="mfa-panel">
                                        <div class="mfa-steps">
                                            <p><strong>1.</strong> Abre tu app autenticadora actual.</p>
                                            <p><strong>2.</strong> Ingresa un código válido para confirmar la desactivación.</p>
                                        </div>

                                        <div>
                                            <label class="block font-medium mb-2">Código actual</label>
                                            <p-inputotp [(ngModel)]="disableMfaCode" [length]="6" styleClass="w-full justify-center">
                                                <ng-template #input let-token let-events="events" let-index="index">
                                                    <input
                                                        type="text"
                                                        inputmode="numeric"
                                                        autocomplete="one-time-code"
                                                        [maxLength]="1"
                                                        (input)="events.input($event)"
                                                        (keydown)="events.keydown($event)"
                                                        [attr.value]="token"
                                                        class="mfa-otp-input"
                                                    />
                                                      <div *ngIf="index === 3" class="mfa-otp-separator">
                                                        <i class="pi pi-minus"></i>
                                                      </div>
                                                </ng-template>
                                            </p-inputotp>
                                        </div>

                                        <div class="flex gap-3">
                                            <button
                                                pButton
                                                class="flex-1"
                                                icon="pi pi-lock-open"
                                                label="Confirmar desactivación"
                                                (click)="disableMfa()"
                                                [loading]="disablingMfa()"
                                                [disabled]="!isValidDisableMfaCode()"
                                            ></button>
                                            <button
                                                pButton
                                                type="button"
                                                class="p-button-outlined"
                                                icon="pi pi-times"
                                                label="Cancelar"
                                                (click)="cancelDisableMfa()"
                                                [disabled]="disablingMfa()"
                                            ></button>
                                        </div>
                                    </div>
                                }
                            } @else {
                                <div class="mfa-status">
                                    <i class="pi pi-mobile"></i>
                                    <div>
                                        <strong>MFA no configurado</strong>
                                        <p>Puedes activarlo en menos de un minuto desde esta misma pantalla.</p>
                                    </div>
                                </div>

                                @if (!mfaQrCode) {
                                    <button
                                        pButton
                                        class="w-full"
                                        icon="pi pi-qrcode"
                                        label="Activar MFA"
                                        (click)="startMfaSetup()"
                                        [loading]="settingUpMfa()"
                                    ></button>
                                }

                                @if (mfaQrCode) {
                                    <div class="mfa-panel">
                                        <div class="mfa-steps">
                                            <p><strong>1.</strong> Escanea este QR con tu app autenticadora.</p>
                                            <p><strong>2.</strong> Si lo prefieres, usa la clave manual mostrada abajo.</p>
                                            <p><strong>3.</strong> Ingresa el código de 6 dígitos para confirmar.</p>
                                        </div>

                                        <div class="mfa-qr-wrap">
                                            <img class="mfa-qr" [src]="'data:image/png;base64,' + mfaQrCode" alt="QR de configuración MFA" />
                                        </div>

                                        <div class="mfa-secret-box">
                                            <span>Clave manual</span>
                                            <code>{{ mfaSecret }}</code>
                                        </div>

                                        <div>
                                            <label class="block font-medium mb-2">Código MFA</label>
                                            <p-inputotp [(ngModel)]="mfaCode" [length]="6" styleClass="w-full justify-center">
                                                <ng-template #input let-token let-events="events" let-index="index">
                                                    <input
                                                        type="text"
                                                        inputmode="numeric"
                                                        autocomplete="one-time-code"
                                                        [maxLength]="1"
                                                        (input)="events.input($event)"
                                                        (keydown)="events.keydown($event)"
                                                        [attr.value]="token"
                                                        class="mfa-otp-input"
                                                    />
                                                      <div *ngIf="index === 3" class="mfa-otp-separator">
                                                        <i class="pi pi-minus"></i>
                                                      </div>
                                                </ng-template>
                                            </p-inputotp>
                                        </div>

                                        <div class="flex gap-3">
                                            <button
                                                pButton
                                                class="flex-1"
                                                icon="pi pi-check"
                                                label="Confirmar"
                                                (click)="confirmMfaSetup()"
                                                [loading]="verifyingMfa()"
                                                [disabled]="!isValidMfaCode()"
                                            ></button>
                                            <button
                                                pButton
                                                type="button"
                                                class="p-button-outlined"
                                                icon="pi pi-times"
                                                label="Cancelar"
                                                (click)="resetMfaSetup()"
                                                [disabled]="verifyingMfa()"
                                            ></button>
                                        </div>
                                    </div>
                                }
                            }
                        </div>
                    </p-card>

                    <p-card>
                        <div class="space-y-3">
                            <h3 class="section-title !mb-0">Acciones rápidas</h3>
                            <button pButton class="w-full p-button-outlined" icon="pi pi-key" label="Cambiar contraseña" (click)="goToChangePassword()"></button>
                            <button pButton class="w-full p-button-secondary p-button-outlined" icon="pi pi-question-circle" label="Centro de ayuda" (click)="goToHelp()"></button>
                        </div>
                    </p-card>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .profile-page {
            background: linear-gradient(180deg, rgba(79,70,229,0.06) 0%, rgba(79,70,229,0.02) 35%, transparent 100%);
            min-height: calc(100vh - 7rem);
            border-radius: 1rem;
        }

        .profile-hero {
            border: 1px solid var(--surface-border);
            background: var(--surface-card);
            border-radius: 1rem;
            padding: 1.25rem;
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .profile-hero__left {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .profile-avatar {
            width: 4.5rem;
            height: 4.5rem;
            border-radius: 999px;
            background: linear-gradient(135deg, #4f46e5, #0ea5e9);
            color: #fff;
            display: grid;
            place-items: center;
            font-weight: 700;
            font-size: 1.1rem;
            overflow: hidden;
            flex-shrink: 0;
        }

        .profile-avatar.has-image {
            background: transparent;
        }

        .profile-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .profile-name {
            font-weight: 600;
            font-size: 1.05rem;
            margin: 0;
            color: var(--text-color);
        }

        .profile-meta {
            margin: 0.25rem 0 0;
            color: var(--text-color-secondary);
            font-size: 0.92rem;
        }

        .profile-hero__right {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.75rem;
            min-width: 280px;
        }

        .stat-chip {
            border: 1px solid var(--surface-border);
            border-radius: 0.75rem;
            padding: 0.75rem;
            display: flex;
            gap: 0.6rem;
            align-items: center;
            background: var(--surface-ground);
        }

        .stat-label {
            margin: 0;
            color: var(--text-color-secondary);
            font-size: 0.78rem;
        }

        .stat-value {
            margin: 0.15rem 0 0;
            color: var(--text-color);
            font-weight: 600;
            font-size: 0.95rem;
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
            font-size: 0.9rem;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            align-items: center;
            padding: 0.6rem 0;
            border-bottom: 1px dashed var(--surface-border);
        }

        .summary-row:last-child {
            border-bottom: 0;
            padding-bottom: 0;
        }

        .mfa-status {
            display: flex;
            gap: 0.75rem;
            align-items: flex-start;
            padding: 0.9rem;
            border-radius: 0.9rem;
            border: 1px solid var(--surface-border);
            background: var(--surface-ground);
        }

        .mfa-status i {
            margin-top: 0.15rem;
            color: #0f766e;
        }

        .mfa-status strong,
        .mfa-status p {
            display: block;
            margin: 0;
        }

        .mfa-status p {
            color: var(--text-color-secondary);
            font-size: 0.9rem;
            margin-top: 0.2rem;
        }

        .mfa-status--active {
            border-color: rgba(22, 163, 74, 0.25);
            background: rgba(22, 163, 74, 0.08);
        }

        .mfa-panel {
            display: grid;
            gap: 1rem;
            padding-top: 0.25rem;
        }

        .mfa-steps {
            display: grid;
            gap: 0.35rem;
            color: var(--text-color-secondary);
            font-size: 0.92rem;
        }

        .mfa-steps p {
            margin: 0;
        }

        .mfa-qr-wrap {
            display: flex;
            justify-content: center;
            padding: 1rem;
            border-radius: 1rem;
            background: #ffffff;
            border: 1px solid var(--surface-border);
        }

        .mfa-qr {
            width: 12rem;
            height: 12rem;
            object-fit: contain;
        }

        .mfa-secret-box {
            display: grid;
            gap: 0.35rem;
            padding: 0.85rem 1rem;
            border-radius: 0.9rem;
            border: 1px dashed var(--surface-border);
            background: var(--surface-ground);
        }

        .mfa-secret-box span {
            color: var(--text-color-secondary);
            font-size: 0.85rem;
        }

        .mfa-secret-box code {
            word-break: break-all;
            font-size: 0.92rem;
            color: var(--text-color);
        }

        .mfa-otp-input {
            width: 2.75rem;
            height: 3.25rem;
            text-align: center;
            font-size: 1.15rem;
            font-weight: 700;
            border-radius: 0.9rem;
            border: 1px solid var(--surface-border);
            background: var(--surface-card);
            color: var(--text-color);
            outline: none;
            transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
        }

        .mfa-otp-input:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 0.2rem color-mix(in srgb, var(--primary-color) 18%, transparent);
            transform: translateY(-1px);
        }

        .mfa-otp-separator {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 0.5rem;
            color: var(--text-color-secondary);
        }

        @media (max-width: 767px) {
            .profile-hero__right {
                grid-template-columns: 1fr;
                min-width: 100%;
            }
        }
    `]
})
export class UserProfileComponent implements OnInit {
    user: any = {
        id: null,
        full_name: '',
        email: '',
        phone: '',
        role: '',
        is_active: true,
        mfa_enabled: false,
        roles: [],
        tenant_id: null,
        date_joined: null
    };
    saving = signal(false);
    uploadingAvatar = signal(false);
    settingUpMfa = signal(false);
    verifyingMfa = signal(false);
    disablingMfa = signal(false);
    mfaQrCode: string | null = null;
    mfaSecret: string | null = null;
    mfaCode = '';
    showDisableMfa = false;
    disableMfaCode = '';
    subscriptionStatus: any = null;
    currentTenant: any = null;

    constructor(
        private authService: AuthService,
        private messageService: MessageService,
        private http: HttpClient,
        private router: Router,
        private subscriptionService: SubscriptionService,
        private tenantService: TenantService
    ) {}

    ngOnInit() {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
            this.user = { ...currentUser };
            this.loadFullProfile();
        }
        this.loadSubscriptionStatus();
        this.loadCurrentTenant();
    }

    loadFullProfile(): void {
        if (!this.user?.id) return;

        const url = `${environment.apiUrl}/auth/users/${this.user.id}/`;
        this.http.get<any>(url).subscribe({
            next: (profile) => {
                this.user = {
                    ...this.user,
                    ...profile,
                    tenant_id: profile?.tenant ?? this.user?.tenant_id ?? null
                };
                this.authService.patchCurrentUser(this.user);
            },
            error: () => {
                // fallback silencioso a datos de sesión
            }
        });
    }

    saveProfile() {
        this.saving.set(true);
        const url = `${environment.apiUrl}/auth/users/${this.user.id}/`;
        
        this.http.patch(url, {
            full_name: this.user.full_name,
            email: this.user.email,
            phone: this.user.phone
        }).subscribe({
            next: (updated: any) => {
                this.user = {
                    ...this.user,
                    ...updated,
                    tenant_id: updated?.tenant ?? this.user?.tenant_id ?? null
                };
                this.authService.patchCurrentUser(this.user);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Perfil actualizado correctamente'
                });
                this.saving.set(false);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.error || 'Error al actualizar perfil'
                });
                this.saving.set(false);
            }
        });
    }

    onAvatarSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        this.uploadingAvatar.set(true);
        const url = `${environment.apiUrl}/auth/users/me/avatar/`;
        this.http.post<any>(url, formData).subscribe({
            next: (response) => {
                this.user = {
                    ...this.user,
                    avatar_url: response?.avatar_url || null
                };
                this.authService.patchCurrentUser(this.user);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Foto de perfil actualizada'
                });
                this.uploadingAvatar.set(false);
                input.value = '';
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err?.error?.error || 'No se pudo actualizar la foto de perfil'
                });
                this.uploadingAvatar.set(false);
                input.value = '';
            }
        });
    }

    getInitials(value: string): string {
        if (!value) return 'U';
        const parts = value.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
        return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
    }

    getRoleDisplayName(role: string): string {
        const roleMap: Record<string, string> = {
            SUPER_ADMIN: 'Super Administrador',
            CLIENT_ADMIN: 'Administrador',
            CLIENT_STAFF: 'Empleado',
            Manager: 'Manager',
            Cajera: 'Cajera',
            Estilista: 'Estilista'
        };
        return roleMap[role] || role || 'Sin rol';
    }

    getProfileImageUrl(): string | null {
        const rawUrl = this.user?.avatar_url || this.user?.profile_image || this.user?.photo || null;
        if (!rawUrl) return null;
        if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

        const apiOrigin = new URL(environment.apiUrl).origin;
        return rawUrl.startsWith('/') ? `${apiOrigin}${rawUrl}` : `${apiOrigin}/${rawUrl}`;
    }

    getTenantDisplay(): string {
        const tenantName = this.user?.tenant_name;
        if (tenantName) return tenantName;

        const tenantId = this.user?.tenant_id;
        if (tenantId) {
            const localTenantName = (() => {
                try {
                    return JSON.parse(localStorage.getItem('tenant') || '{}')?.name;
                } catch {
                    return null;
                }
            })();
            return localTenantName || `#${tenantId}`;
        }

        return 'N/A';
    }

    formatDate(value: string | null | undefined): string {
        if (!value) return 'No disponible';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'No disponible';
        return new Intl.DateTimeFormat('es-DO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    }

    goToChangePassword(): void {
        this.router.navigate(['/client/change-password']);
    }

    goToHelp(): void {
        this.router.navigate(['/client/help']);
    }

    goToPayment(): void {
        this.router.navigate(['/client/payment']);
    }

    getCurrentPlanName(): string {
        if (this.currentTenant?.subscription_plan?.display_name || this.currentTenant?.subscription_plan?.name || this.currentTenant?.plan_type) {
            return getSubscriptionPlanLabel(
                this.currentTenant?.subscription_plan?.display_name,
                this.currentTenant?.subscription_plan?.name,
                this.currentTenant?.plan_type
            );
        }

        if (this.subscriptionStatus?.plan_display) {
            return getSubscriptionPlanLabel(this.subscriptionStatus.plan_display);
        }

        try {
            const tenant = JSON.parse(localStorage.getItem('tenant') || '{}');
            return getSubscriptionPlanLabel(
                tenant?.subscription_plan?.display_name,
                tenant?.subscription_plan?.name,
                tenant?.plan_type,
                'Plan activo'
            );
        } catch {
            return 'Plan activo';
        }
    }

    getCurrentPlanStatusText(): string {
        const status = String(this.subscriptionStatus?.current_status || '').toLowerCase();
        const graceDays = Number(this.subscriptionStatus?.days_in_grace || 0);

        if (status === 'active') return 'Activo';
        if (graceDays > 0) return `Gracia (${graceDays} día(s))`;
        if (status === 'trial') return 'Prueba';
        if (status) return status;
        return 'No disponible';
    }

    getCurrentPlanCopy(): string {
        const status = String(this.subscriptionStatus?.current_status || '').toLowerCase();
        const graceDays = Number(this.subscriptionStatus?.days_in_grace || 0);

        if (status === 'active') {
            return 'Tu suscripción está al día. Si necesitas más capacidad o funciones, puedes actualizar cuando quieras.';
        }

        if (graceDays > 0) {
            return `Tu suscripción está en período de gracia. Te quedan ${graceDays} día(s) para renovarla o actualizarla.`;
        }

        if (status === 'trial') {
            return 'Estás en período de prueba. Revisa los planes disponibles para elegir el que mejor acompañe tu operación.';
        }

        return 'Puedes revisar tus planes disponibles y actualizar tu suscripción desde aquí.';
    }

    startMfaSetup(): void {
        this.settingUpMfa.set(true);
        this.authService.setupMfa().subscribe({
            next: (response) => {
                this.mfaQrCode = response.qr_code;
                this.mfaSecret = response.secret;
                this.mfaCode = '';
                this.showDisableMfa = false;
                this.disableMfaCode = '';
                this.settingUpMfa.set(false);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Escanea el QR',
                    detail: 'Abre tu app autenticadora y confirma el código de 6 dígitos.'
                });
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err?.error?.error || 'No se pudo iniciar la configuración de MFA'
                });
                this.settingUpMfa.set(false);
            }
        });
    }

    confirmMfaSetup(): void {
        if (!this.isValidMfaCode()) return;

        this.verifyingMfa.set(true);
        this.authService.verifyMfa({ code: this.mfaCode.trim() }).subscribe({
            next: () => {
                this.user = { ...this.user, mfa_enabled: true };
                this.authService.patchCurrentUser({ mfa_enabled: true } as any);
                this.resetMfaSetup();
                this.verifyingMfa.set(false);
                this.messageService.add({
                    severity: 'success',
                    summary: 'MFA activado',
                    detail: 'Tu cuenta ahora solicitará un código adicional al iniciar sesión.'
                });
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Código inválido',
                    detail: err?.error?.error || 'No se pudo verificar el código MFA'
                });
                this.verifyingMfa.set(false);
            }
        });
    }

    resetMfaSetup(): void {
        this.mfaQrCode = null;
        this.mfaSecret = null;
        this.mfaCode = '';
    }

    isValidMfaCode(): boolean {
        return /^\d{6}$/.test(this.mfaCode.trim());
    }

    openDisableMfa(): void {
        this.showDisableMfa = true;
        this.disableMfaCode = '';
    }

    cancelDisableMfa(): void {
        this.showDisableMfa = false;
        this.disableMfaCode = '';
    }

    disableMfa(): void {
        if (!this.isValidDisableMfaCode()) return;

        this.disablingMfa.set(true);
        this.authService.disableMfa({ code: this.disableMfaCode.trim() }).subscribe({
            next: () => {
                this.user = { ...this.user, mfa_enabled: false };
                this.authService.patchCurrentUser({ mfa_enabled: false } as any);
                this.cancelDisableMfa();
                this.resetMfaSetup();
                this.disablingMfa.set(false);
                this.messageService.add({
                    severity: 'success',
                    summary: 'MFA desactivado',
                    detail: 'Tu cuenta ya no pedirá el código adicional al iniciar sesión.'
                });
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'No se pudo desactivar',
                    detail: err?.error?.error || 'No se pudo desactivar MFA'
                });
                this.disablingMfa.set(false);
            }
        });
    }

    isValidDisableMfaCode(): boolean {
        return /^\d{6}$/.test(this.disableMfaCode.trim());
    }

    private loadSubscriptionStatus(): void {
        this.subscriptionService.getSubscriptionStatus().subscribe({
            next: (status) => {
                this.subscriptionStatus = status;
            },
            error: () => {
                this.subscriptionStatus = null;
            }
        });
    }

    private loadCurrentTenant(): void {
        this.tenantService.getCurrentTenant().subscribe({
            next: (tenant) => {
                this.currentTenant = tenant;
            },
            error: () => {
                this.currentTenant = null;
            }
        });
    }
}
