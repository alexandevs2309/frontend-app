import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import { PublicBrandingSettings } from './settings.service';

const DEFAULT_PLATFORM_NAME = 'Auron-Suite';
const DEFAULT_SUPPORT_EMAIL = 'support@auron-suite.com';
const DEFAULT_PLATFORM_DOMAIN = 'localhost:4200';
const DEFAULT_PUBLIC_SITE_URL = 'http://localhost:4200';
const DEFAULT_SUPPORTED_LANGUAGES = ['es', 'en'];

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  platformName = signal<string>(DEFAULT_PLATFORM_NAME);
  private supportEmailValue = signal<string>(DEFAULT_SUPPORT_EMAIL);
  private platformDomainValue = signal<string>(DEFAULT_PLATFORM_DOMAIN);
  private publicSiteUrlValue = signal<string>(DEFAULT_PUBLIC_SITE_URL);
  private supportedLanguagesValue = signal<string[]>(DEFAULT_SUPPORTED_LANGUAGES);
  private readonly http: HttpClient;

  constructor(httpBackend: HttpBackend) {
    this.http = new HttpClient(httpBackend);
    this.loadPublicBranding();
  }

  private loadPublicBranding() {
    this.http
      .get<PublicBrandingSettings>(`${environment.apiUrl}/settings/public-branding/`)
      .subscribe({
        next: (settings) => {
          if (settings.platform_name) {
            this.platformName.set(String(settings.platform_name));
          }

          if (settings.support_email) {
            this.supportEmailValue.set(String(settings.support_email));
          }

          if (settings.platform_domain) {
            this.platformDomainValue.set(String(settings.platform_domain));
          }

          if (settings.public_site_url) {
            this.publicSiteUrlValue.set(String(settings.public_site_url));
          } else if (settings.platform_domain) {
            this.publicSiteUrlValue.set(this.buildPublicSiteUrl(String(settings.platform_domain)));
          }

          if (Array.isArray(settings.supported_languages) && settings.supported_languages.length > 0) {
            this.supportedLanguagesValue.set(settings.supported_languages.map((lang: unknown) => String(lang)));
          }
        },
        error: () => {
          // Keep safe defaults when public branding is unavailable.
        }
      });
  }

  private buildPublicSiteUrl(platformDomain: string): string {
    const trimmed = platformDomain.trim();
    if (!trimmed) {
      return DEFAULT_PUBLIC_SITE_URL;
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    return trimmed.includes('localhost') ? `http://${trimmed}` : `https://${trimmed}`;
  }

  refreshPlatformName() {
    this.loadPublicBranding();
  }

  supportEmail() {
    return this.supportEmailValue();
  }

  platformDomain() {
    return this.platformDomainValue();
  }

  publicSiteUrl() {
    return this.publicSiteUrlValue();
  }

  supportedLanguages() {
    return this.supportedLanguagesValue();
  }
}
