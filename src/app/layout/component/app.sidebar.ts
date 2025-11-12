import { Component, ElementRef } from '@angular/core';
import { AppMenu } from './app.menu';
import { SubscriptionStatusComponent } from '../../shared/components/subscription-status.component';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu, SubscriptionStatusComponent],
    template: ` <div class="layout-sidebar">
        <div class="p-3">
            <app-subscription-status></app-subscription-status>
        </div>
        <app-menu></app-menu>
    </div>`
})
export class AppSidebar {
    constructor(public el: ElementRef) {}
}
