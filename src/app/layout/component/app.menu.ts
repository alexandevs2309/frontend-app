import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    constructor(private authService: AuthService) {}

    ngOnInit() {
        const userRole = this.authService.getCurrentUserRole();
        
        if (userRole === 'SuperAdmin') {
            this.model = this.getAdminMenu();
        } else {
            this.model = this.getClientMenu();
        }
    }

    getAdminMenu(): MenuItem[] {
        return [
            {
                label: 'Admin Panel',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/admin/dashboard'] },
                    { label: 'Tenants', icon: 'pi pi-fw pi-building', routerLink: ['/admin/tenants'] },
                    { label: 'Users', icon: 'pi pi-fw pi-users', routerLink: ['/admin/users'] },
                    { label: 'Subscription Plans', icon: 'pi pi-fw pi-credit-card', routerLink: ['/admin/plans'] },
                    { label: 'Billing', icon: 'pi pi-fw pi-dollar', routerLink: ['/admin/billing'] },
                    { label: 'Reports', icon: 'pi pi-fw pi-chart-line', routerLink: ['/admin/reports'] },
                    { label: 'System Monitor', icon: 'pi pi-fw pi-eye', routerLink: ['/admin/monitor'] },
                    { label: 'Audit Logs', icon: 'pi pi-fw pi-list', routerLink: ['/admin/audit-logs'] },
                    { label: 'System Settings', icon: 'pi pi-fw pi-cog', routerLink: ['/admin/settings'] }
                ]
            }
        ];
    }

    getClientMenu(): MenuItem[] {
        return [
            {
                label: 'Barbershop',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/client/dashboard'] }]
            },
        ];
    }
}
