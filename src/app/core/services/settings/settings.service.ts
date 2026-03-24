import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface AppSettings {
  currency: string;
  currency_symbol: string;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<AppSettings>({
    currency: 'DOP',
    currency_symbol: 'RD$'
  });

  public settings$ = this.settingsSubject.asObservable();
  public settings = signal<AppSettings>({ currency: 'DOP', currency_symbol: 'RD$' });

  constructor(private http: HttpClient) {
    this.loadSettings().subscribe({
      error: () => {
        // Mantener fallback local si el endpoint no responde.
      }
    });
  }

  loadSettings(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/settings/barbershop/`).pipe(
      tap((data: any) => {
        const settings: AppSettings = {
          currency: data.currency || 'DOP',
          currency_symbol: data.currency_symbol || 'RD$',
          name: data.name
        };
        this.settingsSubject.next(settings);
        this.settings.set(settings);
      })
    );
  }

  getCurrency(): string {
    return this.settings().currency;
  }

  getCurrencySymbol(): string {
    return this.settings().currency_symbol;
  }

  getCurrencyLocale(): string {
    const currency = this.getCurrency();
    const localeMap: Record<string, string> = {
      DOP: 'es-DO',
      COP: 'es-CO',
      USD: 'en-US',
      EUR: 'es-ES'
    };
    return localeMap[currency] || 'es-DO';
  }
}
