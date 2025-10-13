import { Injectable, signal } from '@angular/core';

export interface TenantLocaleConfig {
  locale: string;
  currency: string;
  dateFormat: string;
  timeZone: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocaleService {
  private currentLocale = signal<TenantLocaleConfig>({
    locale: 'es-ES',
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    timeZone: 'Europe/Madrid'
  });

  getCurrentLocale() {
    return this.currentLocale();
  }

  setTenantLocale(tenantId: number) {
    const tenantConfigs: { [key: number]: TenantLocaleConfig } = {
      1: { locale: 'es-ES', currency: 'EUR', dateFormat: 'dd/MM/yyyy', timeZone: 'Europe/Madrid' },
      2: { locale: 'es-MX', currency: 'MXN', dateFormat: 'dd/MM/yyyy', timeZone: 'America/Mexico_City' },
      3: { locale: 'en-US', currency: 'USD', dateFormat: 'MM/dd/yyyy', timeZone: 'America/New_York' }
    };

    const config = tenantConfigs[tenantId] || tenantConfigs[1];
    this.currentLocale.set(config);
  }

  getDateFormat(): string {
    return this.currentLocale().dateFormat;
  }

  getCurrency(): string {
    return this.currentLocale().currency;
  }
}