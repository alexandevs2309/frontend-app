import { Injectable, signal } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  platformName = signal<string>('Auron-Suite');

  constructor(private settingsService: SettingsService) {
    this.loadPlatformName();
  }

  private loadPlatformName() {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        if (settings.platform_name) {
          this.platformName.set(settings.platform_name);
        }
      },
      error: () => {
        // Keep default if fails
      }
    });
  }

  refreshPlatformName() {
    this.loadPlatformName();
  }
}
