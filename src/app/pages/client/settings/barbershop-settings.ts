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
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface BarbershopSettings {
  name: string;
  logo?: string;
  currency: string;
  currency_symbol: string;
  default_commission_rate: number;
  default_fixed_salary: number;
  business_hours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  contact: {
    phone: string;
    email: string;
    address: string;

  };
  tax_rate: number;
  service_discount_limit: number;
  cancellation_policy_hours: number;
  late_arrival_grace_minutes: number;
  booking_advance_days: number;
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
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  settings = signal<BarbershopSettings>({
    name: '',
    currency: 'DOP',
    currency_symbol: 'RD$',
    default_commission_rate: 40,
    default_fixed_salary: 1200000,
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
    tax_rate: 0,
    service_discount_limit: 20,
    cancellation_policy_hours: 24,
    late_arrival_grace_minutes: 15,
    booking_advance_days: 30
  });

  loading = signal(false);
  governanceInfo = signal<any>(null);
  showCriticalDialog = signal(false);
  criticalChanges = signal<any[]>([]);
  pendingData = signal<any>(null);

  currencies = [
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
    this.loadGovernanceInfo();
  }

  loadSettings() {
    this.loading.set(true);
    this.http.get<BarbershopSettings>(`${environment.apiUrl}/settings/barbershop/`)
      .subscribe({
        next: (data) => {
          this.settings.set(data);
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
    this.http.get(`${environment.apiUrl}/settings/barbershop/governance_info/`)
      .subscribe({
        next: (data) => {
          this.governanceInfo.set(data);
        },
        error: () => {
          console.warn('No se pudo cargar información de gobierno');
        }
      });
  }

  saveSettings() {
    this.loading.set(true);
    this.http.post(`${environment.apiUrl}/settings/barbershop/`, this.settings())
      .subscribe({
        next: (response: any) => {
          this.loading.set(false);
          
          // Si requiere confirmación, mostrar diálogo
          if (response.requires_confirmation) {
            this.criticalChanges.set(response.critical_changes);
            this.pendingData.set(this.settings());
            this.showCriticalDialog.set(true);
            return;
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Guardado',
            detail: response.changes_logged ? 
              'Configuración actualizada y cambios registrados' : 
              'Configuración actualizada correctamente'
          });
        },
        error: (error) => {
          this.loading.set(false);
          
          if (error.error?.validation_errors) {
            const errors = error.error.validation_errors
              .map((e: any) => `${e.setting}: ${e.error}`)
              .join(', ');
            
            this.messageService.add({
              severity: 'error',
              summary: 'Error de Validación',
              detail: errors
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo guardar la configuración'
            });
          }
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
    
    this.http.post(`${environment.apiUrl}/settings/barbershop/`, dataWithConfirmation)
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

      this.http.post(`${environment.apiUrl}/settings/barbershop/upload_logo/`, formData)
        .subscribe({
          next: (response: any) => {
            this.settings.update(s => ({ ...s, logo: response.logo_url }));
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
}
