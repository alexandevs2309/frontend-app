import { Component } from '@angular/core';
import { AppConfigService } from '../../core/services/app-config.service';
import { environment } from '../../../environments/environment';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        {{ appConfig.platformName() }} by
        <a href="https://primeng.org" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">{{environment.appName}}</a>
    </div>`
})
export class AppFooter {
    environment = environment;

    constructor(public appConfig: AppConfigService) {}
}
