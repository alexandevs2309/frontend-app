import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TRANSLATIONS, TranslationKey, SupportedLanguage } from './translations';

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
    locale: 'es-DO',
    currency: 'DOP',
    dateFormat: 'dd/MM/yyyy',
    timeZone: 'America/Santo_Domingo'
  });

  private currentLanguage = signal<SupportedLanguage>('es');
  public languageChanged$ = new BehaviorSubject<SupportedLanguage>('es');

  constructor(private http: HttpClient) {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      const lang = savedLang as SupportedLanguage;
      this.currentLanguage.set(lang);
      this.languageChanged$.next(lang);
    }
  }

  loadTenantLocaleFromBackend(tenantId?: number) {
    return this.http.get<TenantLocaleConfig>(`${environment.apiUrl}/tenants/locale/`, { withCredentials: true });
  }

  getCurrentLocale() {
    return this.currentLocale();
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage();
  }

  setLanguage(lang: SupportedLanguage) {
    this.currentLanguage.set(lang);
    localStorage.setItem('language', lang);
    this.languageChanged$.next(lang);
  }

  getLanguageLabel(): string {
    const labels: Record<SupportedLanguage, string> = {
      es: 'Español',
      en: 'English',
      fr: 'Français',
      pt: 'Português',
      de: 'Deutsch'
    };
    return labels[this.currentLanguage()];
  }

  getLanguageIcon(): string {
    const icons: Record<SupportedLanguage, string> = {
      es: '🇪🇸',
      en: '🇬🇧',
      fr: '🇫🇷',
      pt: '🇵🇹',
      de: '🇩🇪'
    };
    return icons[this.currentLanguage()];
  }

  translate(key: TranslationKey): string {
    const lang = this.currentLanguage();
    return TRANSLATIONS[lang][key] || key;
  }

  t(key: TranslationKey): string {
    return this.translate(key);
  }

  setTenantLocale(tenantId: number) {
    // Deprecated: Configuration now loaded from backend
  }

  getDateFormat(): string {
    return this.currentLocale().dateFormat;
  }

  getCurrency(): string {
    return this.currentLocale().currency;
  }
}
