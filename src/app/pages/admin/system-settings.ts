import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SettingsService } from '../../core/services/settings.service';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
    selector: 'app-system-settings',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, ToastModule, TabsModule, InputTextModule,
        TextareaModule, InputNumberModule, SelectModule, ButtonModule,
        CardModule, ToggleSwitchModule
    ],
    styleUrl:'./system.scss' ,
    template: `


                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-full mx-auto min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                    <!-- Header dentro de la card -->

                    <div class="p-12 border-b border-gray-200 dark:border-gray-700">
                        <h1 class="text-5xl font-bold  bg-clip-text text-transparent text-center mb-4">
                            Configuración del Sistema
                        </h1>
                        <p class="text-xl text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                            Gestiona las preferencias clave de tu aplicación de forma segura.
                        </p>
                    </div>

                    <p-tabs value="0" class="p-0">
                        <p-tablist class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <p-tab value="0" class="px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all duration-200 flex items-center gap-2">
                                <i class="pi pi-cog"></i> General
                            </p-tab>
                            <p-tab value="1" class="px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all duration-200 flex items-center gap-2">
                                <i class="pi pi-envelope"></i> Correo
                            </p-tab>
                            <p-tab value="2" class="px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all duration-200 flex items-center gap-2">
                                <i class="pi pi-credit-card"></i> Pagos
                            </p-tab>
                            <p-tab value="3" class="px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all duration-200 flex items-center gap-2">
                                <i class="pi pi-shield"></i> Seguridad
                            </p-tab>
                            <p-tab value="4" class="px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all duration-200 flex items-center gap-2">
                                <i class="pi pi-users"></i> Límites
                            </p-tab>
                            <p-tab value="5" class="px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all duration-200 flex items-center gap-2">
                                <i class="pi pi-percentage"></i> Comisiones
                            </p-tab>
                            <p-tab value="6" class="px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all duration-200 flex items-center gap-2">
                                <i class="pi pi-cog"></i> Automatización
                            </p-tab>
                        </p-tablist>
                        <p-tabpanels class="p-0">
                            <p-tabpanel value="0">
                                <div class="p-12">
                                    <form [formGroup]="generalForm" class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div class="space-y-6">
                                            <div>
                                                <label for="platform_name" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-tag text-blue-500"></i> Nombre de la Plataforma
                                                </label>
                                                <input pInputText id="platform_name" formControlName="platform_name" placeholder="Ej: BarberSaaS" />
                                            </div>
                                            <div>
                                                <label for="support_email" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-envelope text-green-500"></i> Correo de Soporte
                                                </label>
                                                <input pInputText id="support_email" formControlName="support_email" placeholder="support@miapp.com" />
                                            </div>
                                        </div>
                                        <div class="space-y-6">
                                            <div>
                                                <label for="platform_domain" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-globe text-purple-500"></i> Dominio Principal
                                                </label>
                                                <input pInputText id="platform_domain" formControlName="platform_domain" placeholder="barbersaas.com" />
                                            </div>
                                            <div class="flex items-center gap-3">
                                                <p-toggleSwitch formControlName="maintenance_mode" inputId="maintenance" />
                                                <label for="maintenance" class="text-base font-medium text-gray-700 dark:text-gray-300">Modo Mantenimiento</label>
                                            </div>
                                            <div>
                                                <label for="max_tenants" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-users text-orange-500"></i> Máximo de Tenants
                                                </label>
                                                <p-inputNumber id="max_tenants" formControlName="max_tenants" [min]="1" placeholder="100" />
                                            </div>
                                            <div>
                                                <label for="trial_days" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-calendar text-yellow-500"></i> Días de Prueba
                                                </label>
                                                <p-inputNumber id="trial_days" formControlName="trial_days" [min]="0" placeholder="7" />
                                            </div>
                                        </div>
                                        <div class="md:col-span-2 flex justify-end mt-6">
                                            <button pButton label="Guardar Cambios" icon="pi pi-save" (click)="saveGeneral()"
                                                    [loading]="saving" [disabled]="generalForm.invalid"
                                                    class="px-8 py-3 text-base bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"></button>
                                        </div>
                                    </form>
                                </div>
                            </p-tabpanel>
                            <p-tabpanel value="1">
                                <div class="p-12">
                                    <form [formGroup]="emailForm" class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div class="space-y-6">
                                            <div>
                                                <label for="smtp_host" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-server text-red-500"></i> Servidor SMTP
                                                </label>
                                                <input pInputText id="smtp_host" formControlName="smtp_host" placeholder="smtp.gmail.com" />
                                            </div>
                                            <div>
                                                <label for="smtp_port" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-lock text-indigo-500"></i> Puerto
                                                </label>
                                                <p-inputNumber id="smtp_port" formControlName="smtp_port" [min]="1" placeholder="587" />
                                            </div>
                                            <div>
                                                <label for="smtp_username" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-user text-teal-500"></i> Usuario
                                                </label>
                                                <input pInputText id="smtp_username" formControlName="smtp_username" placeholder="user@domain.com" />
                                            </div>
                                            <div>
                                                <label for="smtp_password" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-key text-pink-500"></i> Contraseña
                                                </label>
                                                <input pInputText id="smtp_password" formControlName="smtp_password" type="password" placeholder="********" />
                                            </div>
                                        </div>
                                        <div class="space-y-6">
                                            <div>
                                                <label for="from_email" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-send text-green-500"></i> Correo Remitente
                                                </label>
                                                <input pInputText id="from_email" formControlName="from_email" placeholder="no-reply@miapp.com" />
                                            </div>
                                            <div>
                                                <label for="from_name" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-id-card text-blue-500"></i> Nombre Remitente
                                                </label>
                                                <input pInputText id="from_name" formControlName="from_name" placeholder="Equipo de Soporte" />
                                            </div>
                                            <div class="flex items-center gap-3">
                                                <p-toggleSwitch formControlName="enable_notifications" inputId="email_notifications" />
                                                <label for="email_notifications" class="text-base font-medium text-gray-700 dark:text-gray-300">Habilitar Notificaciones por Correo</label>
                                            </div>
                                        </div>
                                        <div class="md:col-span-2 flex justify-between gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <button pButton label="Probar Conexión" icon="pi pi-send" (click)="testEmail()"
                                                    class="px-8 py-3 text-base border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"></button>
                                            <button pButton label="Guardar Cambios" icon="pi pi-save" (click)="saveEmail()"
                                                    [loading]="saving" [disabled]="emailForm.invalid"
                                                    class="px-8 py-3 text-base bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"></button>
                                        </div>
                                    </form>
                                </div>
                            </p-tabpanel>
                            <p-tabpanel value="2">
                                <div class="p-12">
                                    <form [formGroup]="paymentForm" class="space-y-8">
                                        <!-- Stripe Configuration -->
                                        <div class="space-y-6">
                                            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                                <i class="pi pi-credit-card text-purple-500"></i> Configuración de Stripe
                                            </h3>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label for="stripe_public_key" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                        <i class="pi pi-key text-purple-500"></i> Clave Pública de Stripe
                                                    </label>
                                                    <input pInputText id="stripe_public_key" formControlName="stripe_public_key" placeholder="pk_live_..." />
                                                </div>
                                                <div>
                                                    <label for="stripe_secret_key" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                        <i class="pi pi-lock-fill text-red-500"></i> Clave Secreta de Stripe
                                                    </label>
                                                    <input pInputText id="stripe_secret_key" formControlName="stripe_secret_key" type="password" placeholder="sk_live_..." />
                                                </div>
                                                <div>
                                                    <label for="webhook_secret" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                        <i class="pi pi-hook text-indigo-500"></i> Webhook Secret
                                                    </label>
                                                    <input pInputText id="webhook_secret" formControlName="webhook_secret" placeholder="whsec_..." />
                                                </div>
                                                <div class="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                                    <p-toggleSwitch formControlName="stripe_enabled" inputId="stripe_enabled" />
                                                    <label for="stripe_enabled" class="text-base font-medium text-gray-700 dark:text-gray-300">Habilitar Stripe</label>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- PayPal Configuration -->
                                        <div class="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-8">
                                            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                                <i class="pi pi-paypal text-blue-600"></i> Configuración de PayPal
                                            </h3>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label for="paypal_client_id" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                        <i class="pi pi-id-card text-blue-500"></i> Client ID de PayPal
                                                    </label>
                                                    <input pInputText id="paypal_client_id" formControlName="paypal_client_id" placeholder="AXxxx..." />
                                                </div>
                                                <div>
                                                    <label for="paypal_client_secret" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                        <i class="pi pi-key text-red-500"></i> Client Secret de PayPal
                                                    </label>
                                                    <input pInputText id="paypal_client_secret" formControlName="paypal_client_secret" type="password" placeholder="ELxxx..." />
                                                </div>
                                                <div class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                                    <p-toggleSwitch formControlName="paypal_enabled" inputId="paypal_enabled" />
                                                    <label for="paypal_enabled" class="text-base font-medium text-gray-700 dark:text-gray-300">Habilitar PayPal</label>
                                                </div>
                                                <div class="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                                                    <p-toggleSwitch formControlName="paypal_sandbox" inputId="paypal_sandbox" />
                                                    <label for="paypal_sandbox" class="text-base font-medium text-gray-700 dark:text-gray-300">Modo Sandbox</label>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Twilio Configuration -->
                                        <div class="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-8">
                                            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                                <i class="pi pi-mobile text-green-600"></i> Configuración de SMS (Twilio)
                                            </h3>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label for="twilio_account_sid" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                        <i class="pi pi-id-card text-green-500"></i> Account SID
                                                    </label>
                                                    <input pInputText id="twilio_account_sid" formControlName="twilio_account_sid" placeholder="ACxxx..." />
                                                </div>
                                                <div>
                                                    <label for="twilio_auth_token" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                        <i class="pi pi-key text-red-500"></i> Auth Token
                                                    </label>
                                                    <input pInputText id="twilio_auth_token" formControlName="twilio_auth_token" type="password" placeholder="xxx..." />
                                                </div>
                                                <div>
                                                    <label for="twilio_phone_number" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                        <i class="pi pi-phone text-blue-500"></i> Número de Teléfono
                                                    </label>
                                                    <input pInputText id="twilio_phone_number" formControlName="twilio_phone_number" placeholder="+1234567890" />
                                                </div>
                                                <div class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                                    <p-toggleSwitch formControlName="twilio_enabled" inputId="twilio_enabled" />
                                                    <label for="twilio_enabled" class="text-base font-medium text-gray-700 dark:text-gray-300">Habilitar SMS</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label for="currency" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-money-bill text-green-500"></i> Moneda
                                                </label>
                                                <p-select id="currency" [options]="currencyOptions" formControlName="currency"
                                                            optionLabel="label" optionValue="value" placeholder="Seleccionar moneda" />
                                            </div>
                                            <div>
                                                <label for="trial_days" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-calendar text-orange-500"></i> Días de Prueba
                                                </label>
                                                <p-inputNumber id="trial_days" formControlName="trial_days" [min]="0" placeholder="14" />
                                            </div>
                                        </div>
                                        <div class="flex justify-between gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <div class="flex gap-3">
                                                <button pButton label="Probar Stripe" icon="pi pi-credit-card" (click)="testPayment()"
                                                        class="px-6 py-3 text-sm border-2 border-purple-300 text-purple-700 rounded-xl hover:bg-purple-50 transition-all duration-200"></button>
                                                <button pButton label="Probar PayPal" icon="pi pi-paypal" (click)="testPaypal()"
                                                        class="px-6 py-3 text-sm border-2 border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-200"></button>
                                                <button pButton label="Probar SMS" icon="pi pi-mobile" (click)="testTwilio()"
                                                        class="px-6 py-3 text-sm border-2 border-green-300 text-green-700 rounded-xl hover:bg-green-50 transition-all duration-200"></button>
                                            </div>
                                            <button pButton label="Guardar Cambios" icon="pi pi-save" (click)="savePayment()"
                                                    [loading]="saving" [disabled]="paymentForm.invalid"
                                                    class="px-8 py-3 text-base bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"></button>
                                        </div>
                                    </form>
                                </div>
                            </p-tabpanel>
                            <p-tabpanel value="3">
                                <div class="p-12">
                                    <form [formGroup]="securityForm">
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div>
                                                <label for="jwt_expiry" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-clock text-blue-500"></i> Expiración JWT (min)
                                                </label>
                                                <p-inputNumber id="jwt_expiry" formControlName="jwt_expiry_minutes" [min]="5" placeholder="60" />
                                            </div>
                                            <div>
                                                <label for="max_login_attempts" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-attempt-lock text-red-500"></i> Máx. Intentos de Login
                                                </label>
                                                <p-inputNumber id="max_login_attempts" formControlName="max_login_attempts" [min]="1" placeholder="5" />
                                            </div>
                                            <div>
                                                <label for="password_min_length" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-lock text-purple-500"></i> Longitud Mín. Contraseña
                                                </label>
                                                <p-inputNumber id="password_min_length" formControlName="password_min_length" [min]="6" placeholder="8" />
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                            <div class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                                <p-toggleSwitch formControlName="require_email_verification" inputId="email_verification" />
                                                <label for="email_verification" class="text-base font-medium text-gray-700 dark:text-gray-300">Verificación de Correo Requerida</label>
                                            </div>
                                            <div class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                                <p-toggleSwitch formControlName="enable_mfa" inputId="mfa" />
                                                <label for="mfa" class="text-base font-medium text-gray-700 dark:text-gray-300">Habilitar Autenticación Multifactor</label>
                                            </div>
                                        </div>
                                        <div class="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <button pButton label="Guardar Cambios" icon="pi pi-save" (click)="saveSecurity()"
                                                    [loading]="saving" [disabled]="securityForm.invalid"
                                                    class="px-8 py-3 text-base bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"></button>
                                        </div>
                                    </form>
                                </div>
                            </p-tabpanel>
                            <p-tabpanel value="4">
                                <div class="p-12">
                                    <form [formGroup]="limitsForm">
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div>
                                                <label for="basic_max_employees" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-user text-blue-500"></i> Plan Básico - Máx. Empleados
                                                </label>
                                                <p-inputNumber id="basic_max_employees" formControlName="basic_plan_max_employees" [min]="1" placeholder="5" />
                                            </div>
                                            <div>
                                                <label for="premium_max_employees" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-users text-purple-500"></i> Plan Premium - Máx. Empleados
                                                </label>
                                                <p-inputNumber id="premium_max_employees" formControlName="premium_plan_max_employees" [min]="1" placeholder="25" />
                                            </div>
                                            <div>
                                                <label for="enterprise_max_employees" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-building text-gold-500"></i> Plan Enterprise - Máx. Empleados
                                                </label>
                                                <p-inputNumber id="enterprise_max_employees" formControlName="enterprise_plan_max_employees" [min]="1" placeholder="999" />
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                            <div>
                                                <label for="max_tenants_global" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-home text-green-500"></i> Máximo Tenants Global
                                                </label>
                                                <p-inputNumber id="max_tenants_global" formControlName="max_tenants" [min]="1" placeholder="100" />
                                            </div>
                                            <div>
                                                <label for="trial_days_global" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-calendar text-orange-500"></i> Días de Prueba Global
                                                </label>
                                                <p-inputNumber id="trial_days_global" formControlName="trial_days" [min]="0" placeholder="7" />
                                            </div>
                                        </div>
                                        <div class="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <button pButton label="Guardar Cambios" icon="pi pi-save" (click)="saveLimits()"
                                                    [loading]="saving" [disabled]="limitsForm.invalid"
                                                    class="px-8 py-3 text-base bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"></button>
                                        </div>
                                    </form>
                                </div>
                            </p-tabpanel>
                            <p-tabpanel value="5">
                                <div class="p-12">
                                    <form [formGroup]="commissionsForm">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label for="platform_commission" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-percentage text-green-500"></i> Comisión de Plataforma (%)
                                                </label>
                                                <p-inputNumber id="platform_commission" formControlName="platform_commission_rate" [min]="0" [max]="50" [minFractionDigits]="2" placeholder="5.00" />
                                                <small class="text-gray-500">Porcentaje que cobra la plataforma por transacción</small>
                                            </div>
                                            <div>
                                                <label for="default_currency_commission" class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                    <i class="pi pi-money-bill text-blue-500"></i> Moneda por Defecto
                                                </label>
                                                <p-select id="default_currency_commission" [options]="currencyOptions" formControlName="default_currency"
                                                            optionLabel="label" optionValue="value" placeholder="Seleccionar moneda" />
                                            </div>
                                        </div>
                                        <div class="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                                            <h3 class="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center gap-2">
                                                <i class="pi pi-info-circle"></i> Información sobre Comisiones
                                            </h3>
                                            <ul class="text-yellow-700 dark:text-yellow-300 space-y-2">
                                                <li>• La comisión se aplica automáticamente a todas las transacciones</li>
                                                <li>• Los tenants ven el monto neto después de comisiones</li>
                                                <li>• Cambios afectan solo nuevas transacciones</li>
                                            </ul>
                                        </div>
                                        <div class="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <button pButton label="Guardar Cambios" icon="pi pi-save" (click)="saveCommissions()"
                                                    [loading]="saving" [disabled]="commissionsForm.invalid"
                                                    class="px-8 py-3 text-base bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"></button>
                                        </div>
                                    </form>
                                </div>
                            </p-tabpanel>
                            <p-tabpanel value="6">
                                <div class="p-12">
                                    <form [formGroup]="automationForm">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                                <p-toggleSwitch formControlName="auto_suspend_expired" inputId="auto_suspend" />
                                                <div>
                                                    <label for="auto_suspend" class="text-base font-medium text-gray-700 dark:text-gray-300">Auto-suspender Vencidos</label>
                                                    <p class="text-sm text-gray-500">Suspende automáticamente tenants con pagos vencidos</p>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                                <p-toggleSwitch formControlName="email_notifications" inputId="email_auto" />
                                                <div>
                                                    <label for="email_auto" class="text-base font-medium text-gray-700 dark:text-gray-300">Notificaciones Automáticas</label>
                                                    <p class="text-sm text-gray-500">Envía recordatorios de pago y renovación</p>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                                <p-toggleSwitch formControlName="auto_upgrade_limits" inputId="auto_upgrade" />
                                                <div>
                                                    <label for="auto_upgrade" class="text-base font-medium text-gray-700 dark:text-gray-300">Auto-upgrade por Límites</label>
                                                    <p class="text-sm text-gray-500">Sugiere upgrade cuando exceden límites del plan</p>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                                <p-toggleSwitch formControlName="maintenance_mode" inputId="maintenance_auto" />
                                                <div>
                                                    <label for="maintenance_auto" class="text-base font-medium text-gray-700 dark:text-gray-300">Modo Mantenimiento</label>
                                                    <p class="text-sm text-gray-500">Bloquea acceso durante actualizaciones</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                            <h3 class="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                                                <i class="pi pi-bolt"></i> Automatización Activa
                                            </h3>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 dark:text-blue-300">
                                                <div>• Facturación mensual automática</div>
                                                <div>• Recordatorios 3 días antes del vencimiento</div>
                                                <div>• Suspensión tras 7 días de mora</div>
                                                <div>• Reactivación automática al pagar</div>
                                            </div>
                                        </div>
                                        <div class="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <button pButton label="Guardar Cambios" icon="pi pi-save" (click)="saveAutomation()"
                                                    [loading]="saving" [disabled]="automationForm.invalid"
                                                    class="px-8 py-3 text-base bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"></button>
                                        </div>
                                    </form>
                                </div>
                            </p-tabpanel>
                        </p-tabpanels>
                    </p-tabs>
                </div>

            <p-toast />

    `,
    providers: [MessageService]
})
export class SystemSettings implements OnInit {
    generalForm!: FormGroup;
    emailForm!: FormGroup;
    paymentForm!: FormGroup;
    securityForm!: FormGroup;
    limitsForm!: FormGroup;
    commissionsForm!: FormGroup;
    automationForm!: FormGroup;
    saving = false;

    currencyOptions = [
        { label: 'USD - Dólar', value: 'USD' },
        { label: 'EUR - Euro', value: 'EUR' },
        { label: 'MXN - Peso Mexicano', value: 'MXN' },
        { label: 'COP - Peso Colombiano', value: 'COP' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private settingsService: SettingsService
    ) {
        this.initForms();
    }

    ngOnInit() {
        this.loadSettings();
    }

    private initForms() {
        this.generalForm = this.fb.group({
            platform_name: ['', Validators.required],
            platform_domain: [''],
            support_email: ['', [Validators.required, Validators.email]],
            max_tenants: [100, [Validators.required, Validators.min(1)]],
            trial_days: [7, [Validators.required, Validators.min(0)]],
            maintenance_mode: [false]
        });

        this.emailForm = this.fb.group({
            smtp_host: ['', Validators.required],
            smtp_port: [587, [Validators.required, Validators.min(1)]],
            smtp_username: ['', Validators.required],
            smtp_password: ['', Validators.required],
            from_email: ['', [Validators.required, Validators.email]],
            from_name: ['', Validators.required],
            enable_notifications: [true]
        });

        this.paymentForm = this.fb.group({
            stripe_public_key: [''],
            stripe_secret_key: [''],
            webhook_secret: [''],
            stripe_enabled: [false],
            paypal_client_id: [''],
            paypal_client_secret: [''],
            paypal_enabled: [false],
            paypal_sandbox: [true],
            twilio_account_sid: [''],
            twilio_auth_token: [''],
            twilio_phone_number: [''],
            twilio_enabled: [false],
            currency: ['USD', Validators.required],
            trial_days: [14, [Validators.required, Validators.min(0)]]
        });

        this.securityForm = this.fb.group({
            jwt_expiry_minutes: [60, [Validators.required, Validators.min(5)]],
            max_login_attempts: [5, [Validators.required, Validators.min(1)]],
            password_min_length: [8, [Validators.required, Validators.min(6)]],
            require_email_verification: [true],
            enable_mfa: [false]
        });

        this.limitsForm = this.fb.group({
            basic_plan_max_employees: [5, [Validators.required, Validators.min(1)]],
            premium_plan_max_employees: [25, [Validators.required, Validators.min(1)]],
            enterprise_plan_max_employees: [999, [Validators.required, Validators.min(1)]],
            max_tenants: [100, [Validators.required, Validators.min(1)]],
            trial_days: [7, [Validators.required, Validators.min(0)]]
        });

        this.commissionsForm = this.fb.group({
            platform_commission_rate: [5.00, [Validators.required, Validators.min(0), Validators.max(50)]],
            default_currency: ['USD', Validators.required]
        });

        this.automationForm = this.fb.group({
            auto_suspend_expired: [true],
            email_notifications: [true],
            auto_upgrade_limits: [false],
            maintenance_mode: [false]
        });
    }

    private loadSettings() {
        this.settingsService.getSettings().subscribe({
            next: (settings) => {
                console.log('Settings loaded:', settings);
                
                // General form
                this.generalForm.patchValue({
                    platform_name: settings.platform_name || 'BarberSaaS Pro',
                    platform_domain: settings.platform_domain || 'barbersaas.com',
                    support_email: settings.support_email || 'support@barbersaas.com',
                    max_tenants: settings.max_tenants || 100,
                    trial_days: settings.trial_days || 7,
                    maintenance_mode: settings.maintenance_mode || false
                });
                
                // Email form
                this.emailForm.patchValue({
                    smtp_host: settings.smtp_host || 'smtp.gmail.com',
                    smtp_port: settings.smtp_port || 587,
                    smtp_username: settings.smtp_username || 'noreply@barbersaas.com',
                    smtp_password: settings.smtp_password || '',
                    from_email: settings.from_email || 'noreply@barbersaas.com',
                    from_name: settings.from_name || 'BarberSaaS Team',
                    enable_notifications: settings.email_notifications !== false
                });
                
                // Payment form
                this.paymentForm.patchValue({
                    stripe_public_key: settings.stripe_public_key || '',
                    stripe_secret_key: settings.stripe_secret_key || '',
                    webhook_secret: settings.webhook_secret || '',
                    stripe_enabled: settings.stripe_enabled || false,
                    paypal_client_id: settings.paypal_client_id || '',
                    paypal_client_secret: settings.paypal_client_secret || '',
                    paypal_enabled: settings.paypal_enabled || false,
                    paypal_sandbox: settings.paypal_sandbox !== false,
                    twilio_account_sid: settings.twilio_account_sid || '',
                    twilio_auth_token: settings.twilio_auth_token || '',
                    twilio_phone_number: settings.twilio_phone_number || '',
                    twilio_enabled: settings.twilio_enabled || false,
                    currency: settings.default_currency || 'USD',
                    trial_days: settings.trial_days || 14
                });
                
                // Security form
                this.securityForm.patchValue({
                    jwt_expiry_minutes: settings.jwt_expiry_minutes || 60,
                    max_login_attempts: settings.max_login_attempts || 5,
                    password_min_length: settings.password_min_length || 8,
                    require_email_verification: settings.require_email_verification !== false,
                    enable_mfa: settings.enable_mfa || false
                });
                
                // Limits form
                this.limitsForm.patchValue({
                    basic_plan_max_employees: settings.basic_plan_max_employees || 5,
                    premium_plan_max_employees: settings.premium_plan_max_employees || 25,
                    enterprise_plan_max_employees: settings.enterprise_plan_max_employees || 999,
                    max_tenants: settings.max_tenants || 100,
                    trial_days: settings.trial_days || 7
                });
                
                // Commissions form
                this.commissionsForm.patchValue({
                    platform_commission_rate: settings.platform_commission_rate || 5.0,
                    default_currency: settings.default_currency || 'USD'
                });
                
                // Automation form
                this.automationForm.patchValue({
                    auto_suspend_expired: settings.auto_suspend_expired !== false,
                    email_notifications: settings.email_notifications !== false,
                    auto_upgrade_limits: settings.auto_upgrade_limits || false,
                    maintenance_mode: settings.maintenance_mode || false
                });
            },
            error: (error) => this.handleLoadError(error)
        });
    }

    saveGeneral() {
        if (this.generalForm.valid) {
            this.saving = true;
            this.settingsService.updateSettings(this.generalForm.value).subscribe({
                next: () => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: '¡Éxito!',
                        detail: 'Configuración general actualizada correctamente.',
                        life: 3000
                    });
                },
                error: (error) => this.handleSaveError('configuración general', error)
            });
        }
    }

    saveEmail() {
        if (this.emailForm.valid) {
            this.saving = true;
            this.settingsService.updateSettings(this.emailForm.value).subscribe({
                next: () => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: '¡Éxito!',
                        detail: 'Configuración de correo actualizada correctamente.',
                        life: 3000
                    });
                },
                error: (error) => this.handleSaveError('configuración de correo', error)
            });
        }
    }

    savePayment() {
        if (this.paymentForm.valid) {
            this.saving = true;
            this.settingsService.updateSettings(this.paymentForm.value).subscribe({
                next: () => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: '¡Éxito!',
                        detail: 'Configuración de pagos actualizada correctamente.',
                        life: 3000
                    });
                },
                error: (error) => this.handleSaveError('configuración de pagos', error)
            });
        }
    }

    saveSecurity() {
        if (this.securityForm.valid) {
            this.saving = true;
            this.settingsService.updateSettings(this.securityForm.value).subscribe({
                next: () => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: '¡Éxito!',
                        detail: 'Configuración de seguridad actualizada correctamente.',
                        life: 3000
                    });
                },
                error: (error) => this.handleSaveError('configuración de seguridad', error)
            });
        }
    }

    testEmail() {
        if (!this.emailForm.valid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario Incompleto',
                detail: 'Complete todos los campos requeridos antes de probar',
                life: 3000
            });
            return;
        }

        this.settingsService.testEmailConnection(this.emailForm.value).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: response.success ? 'success' : 'error',
                    summary: response.success ? 'Conexión Exitosa' : 'Error de Conexión',
                    detail: response.message || (response.success ? 'Correo de prueba enviado correctamente' : 'No se pudo enviar el correo de prueba'),
                    life: 5000
                });
                
                // Auto-save if test is successful
                if (response.success && this.emailForm.dirty) {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Auto-guardado',
                        detail: 'Configuración guardada automáticamente tras prueba exitosa',
                        life: 3000
                    });
                    this.saveEmail();
                }
            },
            error: (error) => this.showErrorMessage('Fallo en servicio de email', error)
        });
    }

    testPayment() {
        const stripeData = {
            stripe_public_key: this.paymentForm.get('stripe_public_key')?.value,
            stripe_secret_key: this.paymentForm.get('stripe_secret_key')?.value
        };
        
        if (!stripeData.stripe_public_key || !stripeData.stripe_secret_key) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario Incompleto',
                detail: 'Complete las claves de Stripe antes de probar',
                life: 3000
            });
            return;
        }

        this.settingsService.testPaymentConnection(stripeData).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: response.success ? 'success' : 'error',
                    summary: response.success ? 'Stripe Conectado' : 'Error de Stripe',
                    detail: response.message || (response.success ? 'Conexión con Stripe verificada correctamente' : 'No se pudo conectar con Stripe'),
                    life: 5000
                });
            },
            error: (error) => this.showErrorMessage('Fallo en servicio de pagos', error)
        });
    }
    
    testPaypal() {
        const paypalData = {
            paypal_client_id: this.paymentForm.get('paypal_client_id')?.value,
            paypal_client_secret: this.paymentForm.get('paypal_client_secret')?.value,
            paypal_sandbox: this.paymentForm.get('paypal_sandbox')?.value
        };
        
        if (!paypalData.paypal_client_id || !paypalData.paypal_client_secret) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario Incompleto',
                detail: 'Complete las credenciales de PayPal antes de probar',
                life: 3000
            });
            return;
        }

        this.settingsService.testPaypalConnection(paypalData).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: response.success ? 'success' : 'error',
                    summary: response.success ? 'PayPal Conectado' : 'Error de PayPal',
                    detail: response.message || (response.success ? 'Conexión con PayPal verificada correctamente' : 'No se pudo conectar con PayPal'),
                    life: 5000
                });
            },
            error: (error) => this.showErrorMessage('Fallo en servicio de PayPal', error)
        });
    }
    
    testTwilio() {
        const twilioData = {
            twilio_account_sid: this.paymentForm.get('twilio_account_sid')?.value,
            twilio_auth_token: this.paymentForm.get('twilio_auth_token')?.value,
            twilio_phone_number: this.paymentForm.get('twilio_phone_number')?.value
        };
        
        if (!twilioData.twilio_account_sid || !twilioData.twilio_auth_token) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario Incompleto',
                detail: 'Complete las credenciales de Twilio antes de probar',
                life: 3000
            });
            return;
        }

        this.settingsService.testTwilioConnection(twilioData).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: response.success ? 'success' : 'error',
                    summary: response.success ? 'Twilio Conectado' : 'Error de Twilio',
                    detail: response.message || (response.success ? 'Conexión con Twilio verificada correctamente' : 'No se pudo conectar con Twilio'),
                    life: 5000
                });
            },
            error: (error) => this.showErrorMessage('Fallo en servicio de SMS', error)
        });
    }

    saveLimits() {
        if (this.limitsForm.valid) {
            this.saving = true;
            this.settingsService.updateSettings(this.limitsForm.value).subscribe({
                next: () => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: '¡Éxito!',
                        detail: 'Límites actualizados correctamente.',
                        life: 3000
                    });
                },
                error: (error) => this.handleSaveError('límites', error)
            });
        }
    }

    saveCommissions() {
        if (this.commissionsForm.valid) {
            this.saving = true;
            const formData = this.commissionsForm.value;
            
            // Validate commission rate
            if (formData.platform_commission_rate > 30) {
                this.messageService.add({
                    severity: 'warn',
                    summary: '⚠️ Comisión Alta',
                    detail: `${formData.platform_commission_rate}% puede afectar la competitividad`,
                    life: 5000
                });
            }
            
            if (formData.platform_commission_rate < 1) {
                this.messageService.add({
                    severity: 'warn',
                    summary: '⚠️ Comisión Muy Baja',
                    detail: 'Comisión menor al 1% puede no cubrir costos operativos',
                    life: 5000
                });
            }
            
            this.settingsService.updateSettings(formData).subscribe({
                next: () => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: '💰 Comisiones Actualizadas',
                        detail: `Nueva comisión: ${formData.platform_commission_rate}% - Afecta nuevas transacciones`,
                        life: 4000
                    });
                },
                error: (error) => this.handleSaveError('comisiones', error)
            });
        }
    }

    saveAutomation() {
        if (this.automationForm.valid) {
            this.saving = true;
            const formData = this.automationForm.value;
            
            // Warn about critical changes
            if (formData.maintenance_mode) {
                this.messageService.add({
                    severity: 'warn',
                    summary: '⚠️ Modo Mantenimiento Activado',
                    detail: 'Esto bloqueará el acceso a todos los tenants',
                    life: 5000
                });
            }
            
            if (!formData.auto_suspend_expired) {
                this.messageService.add({
                    severity: 'warn',
                    summary: '⚠️ Auto-suspensión Desactivada',
                    detail: 'Los tenants morosos no se suspenderán automáticamente',
                    life: 5000
                });
            }
            
            this.settingsService.updateSettings(formData).subscribe({
                next: () => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: '✅ Automatización Configurada',
                        detail: 'Los cambios se aplicarán en los próximos minutos',
                        life: 3000
                    });
                },
                error: (error) => this.handleSaveError('automatización', error)
            });
        }
    }

    private handleLoadError(error: any): void {
        this.logError('Failed to load settings', error);
        this.showErrorMessage('Error al cargar la configuración', error);
    }

    private handleSaveError(context: string, error: any): void {
        this.saving = false;
        this.logError(`Failed to save ${context}`, error);
        this.showErrorMessage(`Error al actualizar ${context}`, error);
    }

    private showErrorMessage(message: string, error?: any): void {
        this.logError(message, error);
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.sanitizeErrorMessage(error, message),
            life: 3000
        });
    }

    private sanitizeErrorMessage(error: any, fallback: string): string {
        const errorMessage = error?.error?.message || error?.message;
        return typeof errorMessage === 'string' ? errorMessage.substring(0, 200) : fallback;
    }

    private logError(context: string, error: any): void {
        const errorInfo = {
            context,
            timestamp: new Date().toISOString(),
            error: error?.message || 'Unknown error',
            component: 'SystemSettings'
        };
        console.warn('[SystemSettings Error]', errorInfo);
    }
}
