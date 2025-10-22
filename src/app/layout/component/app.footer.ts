import { Component, OnInit, signal } from '@angular/core';
import { SettingsService } from '../../core/services/settings.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        {{ platformName() }} by
        <a href="https://primeng.org" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Auron-Suite</a>
    </div>`
})
export class AppFooter implements OnInit {
    platformName = signal('Auron-Suite');

    constructor(
        private settingsService: SettingsService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.loadPlatformName();
    }

    private loadPlatformName() {
        const user = this.authService.getCurrentUser();
        // Only SuperAdmin can access system settings
        if (user?.role === 'SuperAdmin') {
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
        // For Client users, keep default platform name
    }
}
