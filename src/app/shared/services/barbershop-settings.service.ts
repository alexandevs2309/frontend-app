import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

export interface BarbershopSettings {
  name: string;
  logo?: string;
  currency: string;
  currency_symbol: string;
  default_commission_rate: number;
  default_fixed_salary: number;
  business_hours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
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

@Injectable({
  providedIn: 'root'
})
export class BarbershopSettingsService {
  private http = inject(HttpClient);
  
  private settingsSubject = new BehaviorSubject<BarbershopSettings>({
    name: '',
    currency: 'COP',
    currency_symbol: '$',
    default_commission_rate: 40,
    default_fixed_salary: 1200000,
    business_hours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '14:00', closed: true }
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

  settings$ = this.settingsSubject.asObservable();
  settings = signal<BarbershopSettings>(this.settingsSubject.value);

  constructor() {
    this.loadSettings();
  }

  loadSettings() {
    this.http.get<BarbershopSettings>(`${environment.apiUrl}/settings/barbershop/`)
      .subscribe({
        next: (settings) => {
          this.settingsSubject.next(settings);
          this.settings.set(settings);
        },
        error: () => {
          // Keep default settings
        }
      });
  }

  formatCurrency(amount: number): string {
    const settings = this.settings();
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 0
    }).format(amount);
  }

  getCurrencySymbol(): string {
    return this.settings().currency_symbol;
  }

  getDefaultCommissionRate(): number {
    return this.settings().default_commission_rate;
  }

  getDefaultFixedSalary(): number {
    return this.settings().default_fixed_salary;
  }

  updateBusinessHours(day: string, field: 'open' | 'close' | 'closed', value: any) {
    this.settings.update(settings => ({
      ...settings,
      business_hours: {
        ...settings.business_hours,
        [day]: {
          ...settings.business_hours[day],
          [field]: value
        }
      }
    }));
  }

  getBusinessHour(day: string, field: 'open' | 'close' | 'closed'): any {
    return this.settings().business_hours[day]?.[field];
  }
}