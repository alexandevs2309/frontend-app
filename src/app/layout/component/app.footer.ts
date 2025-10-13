import { Component, OnInit, signal } from '@angular/core';
import { SettingsService } from '../../core/services/settings.service';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        {{ platformName() }} by
        <a href="https://primeng.org" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">PrimeNG</a>
    </div>`
})
export class AppFooter implements OnInit {
    platformName = signal('SAKAI');

    constructor(private settingsService: SettingsService) {}

    ngOnInit() {
        this.loadPlatformName();
    }

    private loadPlatformName() {
        this.settingsService.getSettings().subscribe({
            next: (settings) => {
                if (settings?.platform_name) {
                    this.platformName.set(settings.platform_name);
                }
            },
            error: () => {
                // Keep default value on error
            }
        });
    }
}
