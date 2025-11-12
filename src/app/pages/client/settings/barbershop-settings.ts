import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
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
    InputTextModule, SelectModule, ToastModule, FileUploadModule
  ],
  providers: [MessageService],
  templateUrl: './barbershop-settings.html'
})
export class BarbershopSettingsComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);

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

  saveSettings() {
    this.loading.set(true);
    this.http.post(`${environment.apiUrl}/settings/barbershop/`, this.settings())
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Guardado',
            detail: 'Configuración actualizada correctamente'
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

      this.http.post(`${environment.apiUrl}/settings/upload-logo/`, formData)
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
}
