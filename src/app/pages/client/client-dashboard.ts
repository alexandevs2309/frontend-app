import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';
import { TrialService } from '../../core/services/trial.service';
import { TrialBannerComponent } from '../../shared/components/trial-banner.component';
import { StatsWidget } from '../dashboard/components/statswidget';
import { RecentSalesWidget } from '../dashboard/components/recentsaleswidget';
import { BestSellingWidget } from '../dashboard/components/bestsellingwidget';
import { RevenueStreamWidget } from '../dashboard/components/revenuestreamwidget';
import { NotificationsWidget } from '../dashboard/components/notificationswidget';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-client-dashboard',
    standalone: true,
    imports: [CommonModule, TrialBannerComponent, StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
    template: `
        <app-trial-banner></app-trial-banner>
        
        @if (currentUser(); as user) {
            <div class="mb-6">
                <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-lg border">
                    <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">
                        ¡Bienvenido, {{user.full_name}}! ✂️
                    </h1>
                    <p class="text-surface-600 dark:text-surface-300">
                        Rol: <span class="font-semibold">{{getRoleDisplayName(user.role)}}</span>
                        <span class="ml-4">Panel de Control - Barbería</span>
                    </p>
                </div>
            </div>
            
            <div class="grid grid-cols-12 gap-8">
                <app-stats-widget class="contents" />
                
                <div class="col-span-12 xl:col-span-6">
                    <app-recent-sales-widget />
                    <app-best-selling-widget />
                </div>
                <div class="col-span-12 xl:col-span-6">
                    <app-revenue-stream-widget />
                    <app-notifications-widget />
                </div>
            </div>
        }
    `
})
export class ClientDashboard implements OnInit, OnDestroy {
    currentUser = signal<any>(null);
    private subscription = new Subscription();

    constructor(
        private authService: AuthService,
        private trialService: TrialService
    ) {}

    ngOnInit() {
        this.trialService.loadTrialStatus();
        this.subscription.add(
            this.authService.currentUser$.subscribe(user => {
                this.currentUser.set(user);
            })
        );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private readonly roleNames = {
        'SuperAdmin': 'Super Administrador',
        'Client-Admin': 'Administrador de Barbería', 
        'Client-Staff': 'Empleado de Barbería'
    } as const;

    getRoleDisplayName(role: string): string {
        return this.roleNames[role as keyof typeof this.roleNames] || role;
    }

    canAccessFeature(feature: string): boolean {
        return this.trialService.canAccessFeature(feature);
    }
}