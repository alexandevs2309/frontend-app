import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { environment } from '../../../../environments/environment';
import { SettingsService } from '../../../core/services/settings/settings.service';

interface BarbershopSettings {
  name: string;
  logo?: string;
  currency: string;
  currency_symbol: string;
  currency_locked?: boolean;
  currency_lock_reason?: string;
  business_hours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  pos_config?: {
    business_name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
}

@Component({
  selector: 'app-barbershop-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, CardModule,
    InputTextModule, SelectModule, ToastModule, FileUploadModule,
    DialogModule, MessageModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './barbershop-settings.html'
})
export class BarbershopSettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  settings = signal<BarbershopSettings>({
    name: '',
    currency: 'DOP',
    currency_symbol: 'RD$',
    currency_locked: false,
    currency_lock_reason: '',
    business_hours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '08:00', close: '20:00', closed: false },
      sunday: { open: '10:00', close: '20:00', closed: true }
    },
    contact: {
      phone: '',
      email: '',
      address: ''
    },
    pos_config: {
      business_name: '',
      address: '',
      phone: '',
      email: '',
      website: ''
    }
  });

  loading = signal(false);
  governanceInfo = signal<any>(null);
  showCriticalDialog = signal(false);
  criticalChanges = signal<any[]>([]);
  pendingData = signal<any>(null);

  currencies = [
    { label: 'Peso Colombiano (COP)', value: 'COP', symbol: '$' },
    { label: 'Peso Dominicano (DOP)', value: 'DOP', symbol: 'RD$' },
    { label: 'Dólar Americano (USD)', value: 'USD', symbol: 'USD$' },
    { label: 'Euro (EUR)', value: 'EUR', symbol: '€' }
  ];

  days = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.loading.set(true);
    this.settingsService.getBarbershopAdminSettings()
      .subscribe({
        next: (data) => {
          const normalizedData: BarbershopSettings = {
            name: data.name || '',
            logo: data.logo ? this.toAbsoluteUrl(data.logo) : undefined,
            currency: data.currency || 'DOP',
            currency_symbol: data.currency_symbol || 'RD$',
            currency_locked: data.currency_locked ?? false,
            currency_lock_reason: data.currency_lock_reason || '',
            business_hours: data.business_hours || {
              monday: { open: '08:00', close: '20:00', closed: false },
              tuesday: { open: '08:00', close: '20:00', closed: false },
              wednesday: { open: '08:00', close: '20:00', closed: false },
              thursday: { open: '08:00', close: '20:00', closed: false },
              friday: { open: '08:00', close: '20:00', closed: false },
              saturday: { open: '08:00', close: '20:00', closed: false },
              sunday: { open: '10:00', close: '20:00', closed: true }
            },
            contact: data.contact || {
              phone: '',
              email: '',
              address: ''
            },
            pos_config: (data.pos_config as BarbershopSettings['pos_config']) || {
              business_name: '',
              address: '',
              phone: '',
              email: '',
              website: ''
            }
          };
          this.settings.set(normalizedData);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'warn',
            summary: 'Configuración',
            detail: 'Usando configuración por defecto'
          });
        }
      });
  }

  loadGovernanceInfo() {
    // Endpoint governance_info no disponible - usando configuración por defecto
  }

  saveSettings() {
    const validationErrors = this.validateSettings();
    if (validationErrors.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Revisa la configuración',
        detail: validationErrors[0]
      });
      return;
    }

    this.loading.set(true);
    const current = this.settings();
    const payload = {
      name: current.name,
      currency: current.currency,
      currency_symbol: current.currency_symbol,
      business_hours: current.business_hours,
      contact: current.contact,
      pos_config: current.pos_config
    };

    this.settingsService.updateBarbershopSettings(payload)
      .subscribe({
        next: (response: any) => {
          this.loading.set(false);
          
          if (response.requires_confirmation) {
            this.criticalChanges.set(response.critical_changes);
            this.pendingData.set(this.settings());
            this.showCriticalDialog.set(true);
            return;
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Guardado',
            detail: 'Configuración actualizada correctamente'
          });
          this.loadSettings();
        },
        error: (error) => {
          this.loading.set(false);
          const backendDetail =
            error?.error?.details ||
            error?.error?.error ||
            error?.error?.message ||
            'No se pudo guardar la configuración';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: backendDetail
          });
        }
      });
  }

  confirmCriticalChanges() {
    if (!this.pendingData()) return;
    
    this.loading.set(true);
    const dataWithConfirmation = {
      ...this.pendingData(),
      confirmed_critical: true
    };
    
    this.settingsService.updateBarbershopSettings(dataWithConfirmation)
      .subscribe({
        next: (response: any) => {
          this.loading.set(false);
          this.showCriticalDialog.set(false);
          this.criticalChanges.set([]);
          this.pendingData.set(null);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Guardado',
            detail: 'Configuración crítica actualizada y registrada'
          });
          this.loadSettings();
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo guardar la configuración'
          });
        }
      });
  }

  cancelCriticalChanges() {
    this.showCriticalDialog.set(false);
    this.criticalChanges.set([]);
    this.pendingData.set(null);
    
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'Cambios críticos cancelados'
    });
  }

  onCurrencyChange(currency: any) {
    if (this.settings().currency_locked) {
      return;
    }
    const selected = this.currencies.find(c => c.value === currency);
    if (selected) {
      this.settings.update(s => ({
        ...s,
        currency: selected.value,
        currency_symbol: selected.symbol
      }));
    }
  }

  onLogoUpload(event: any) {
    const file = event.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('logo', file);

      this.settingsService.uploadBarbershopLogo(formData)
        .subscribe({
          next: (response: any) => {
            this.settings.update(s => ({ ...s, logo: this.toAbsoluteUrl(response.logo_url) }));
            this.messageService.add({
              severity: 'success',
              summary: 'Logo',
              detail: 'Logo actualizado correctamente'
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo subir el logo'
            });
          }
        });
    }
  }

  updateBusinessHour(day: string, field: 'open' | 'close' | 'closed', value: any) {
    this.settings.update(s => ({
      ...s,
      business_hours: {
        ...s.business_hours,
        [day]: {
          ...s.business_hours[day],
          [field]: value
        }
      }
    }));
  }

  getBusinessHour(day: string, field: 'open' | 'close' | 'closed'): any {
    return this.settings().business_hours[day]?.[field];
  }

  isBusinessNameInvalid(): boolean {
    return !this.settings().name?.trim();
  }

  isContactEmailInvalid(): boolean {
    const email = this.settings().contact?.email;
    return Boolean(email && !this.isValidEmail(email));
  }

  isPosEmailInvalid(): boolean {
    const email = this.settings().pos_config?.email;
    return Boolean(email && !this.isValidEmail(email));
  }

  isPosWebsiteInvalid(): boolean {
    const website = this.settings().pos_config?.website;
    return Boolean(website && !this.isValidUrl(website));
  }

  isDayScheduleInvalid(day: string): boolean {
    const schedule = this.settings().business_hours?.[day];
    if (!schedule || schedule.closed) {
      return false;
    }

    return !schedule.open || !schedule.close || schedule.open >= schedule.close;
  }

  getTicketPreviewBusinessName(): string {
    return this.settings().pos_config?.business_name?.trim() || this.settings().name?.trim() || 'Mi Peluqueria';
  }

  getTicketPreviewAddress(): string {
    return this.settings().pos_config?.address?.trim() || this.settings().contact?.address?.trim() || 'Direccion no configurada';
  }

  getTicketPreviewPhone(): string {
    return this.settings().pos_config?.phone?.trim() || this.settings().contact?.phone?.trim() || 'Telefono no configurado';
  }

  getTicketPreviewEmail(): string {
    return this.settings().pos_config?.email?.trim() || this.settings().contact?.email?.trim() || 'Email no configurado';
  }

  getTicketPreviewWebsite(): string {
    return this.settings().pos_config?.website?.trim() || 'www.tunegocio.com';
  }

  getTicketPreviewCurrency(): string {
    return this.settings().currency_symbol || '$';
  }

  copyMondayScheduleToOpenDays() {
    const monday = this.settings().business_hours['monday'];
    if (!monday) {
      return;
    }

    this.settings.update(s => {
      const updatedHours = { ...s.business_hours };
      Object.keys(updatedHours).forEach((dayKey) => {
        if (dayKey === 'monday') return;
        if (!updatedHours[dayKey].closed) {
          updatedHours[dayKey] = {
            ...updatedHours[dayKey],
            open: monday.open,
            close: monday.close
          };
        }
      });

      return {
        ...s,
        business_hours: updatedHours
      };
    });

    this.messageService.add({
      severity: 'info',
      summary: 'Horarios copiados',
      detail: 'Se aplicó el horario del lunes a los días abiertos'
    });
  }

  getSettingType(settingName: string): 'critical' | 'sensitive' | 'cosmetic' {
    const governance = this.governanceInfo();
    if (!governance) return 'cosmetic';
    
    if (governance.critical && governance.critical[settingName]) return 'critical';
    if (governance.sensitive && governance.sensitive[settingName]) return 'sensitive';
    return 'cosmetic';
  }

  getSettingIcon(settingName: string): string {
    const type = this.getSettingType(settingName);
    switch (type) {
      case 'critical': return 'pi pi-exclamation-triangle';
      case 'sensitive': return 'pi pi-info-circle';
      default: return 'pi pi-cog';
    }
  }

  getSettingColor(settingName: string): string {
    const type = this.getSettingType(settingName);
    switch (type) {
      case 'critical': return 'text-red-600';
      case 'sensitive': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  }

  private toAbsoluteUrl(url?: string): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const apiOrigin = new URL(environment.apiUrl).origin;
    return url.startsWith('/') ? `${apiOrigin}${url}` : `${apiOrigin}/${url}`;
  }

  private validateSettings(): string[] {
    const current = this.settings();
    const errors: string[] = [];

    if (!current.name?.trim()) {
      errors.push('El nombre de la peluquería es obligatorio.');
    }

    if (current.contact?.email && !this.isValidEmail(current.contact.email)) {
      errors.push('El email de contacto no tiene un formato válido.');
    }

    if (current.pos_config?.email && !this.isValidEmail(current.pos_config.email)) {
      errors.push('El email del POS no tiene un formato válido.');
    }

    if (current.pos_config?.website && !this.isValidUrl(current.pos_config.website)) {
      errors.push('El sitio web del POS debe ser una URL válida.');
    }

    for (const day of Object.keys(current.business_hours || {})) {
      const schedule = current.business_hours[day];
      if (!schedule || schedule.closed) {
        continue;
      }

      if (!schedule.open || !schedule.close) {
        errors.push(`El horario de ${day} debe tener apertura y cierre.`);
        continue;
      }

      if (schedule.open >= schedule.close) {
        errors.push(`El horario de ${day} es inválido: la apertura debe ser antes del cierre.`);
      }
    }

    return errors;
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  private isValidUrl(value: string): boolean {
    const normalized = value.startsWith('http://') || value.startsWith('https://')
      ? value
      : `https://${value}`;

    try {
      const url = new URL(normalized);
      return Boolean(url.hostname);
    } catch {
      return false;
    }
  }
}
