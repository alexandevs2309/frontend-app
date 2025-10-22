import { Routes } from '@angular/router';
import { AppLayout } from '../layout/component/app.layout';
import { AuthGuard } from '../core/guards';
import { SuperAdminGuard } from '../core/guards/super-admin.guard';

export const adminRoutes: Routes = [
    {
        path: 'admin',
        canActivate: [AuthGuard, SuperAdminGuard],
        data: { roles: ['SuperAdmin'] },
        component: AppLayout,
        children: [
            { 
                path: 'dashboard', 
                loadComponent: () => import('../pages/admin/admin-dashboard').then(m => m.AdminDashboard)
            },
            { 
                path: 'tenants', 
                loadComponent: () => import('../pages/admin/tenants-management').then(m => m.TenantsManagement)
            },
            { 
                path: 'users', 
                loadComponent: () => import('../pages/admin/users-management').then(m => m.UsersManagement)
            },
            { 
                path: 'plans', 
                loadComponent: () => import('../pages/admin/subscription-plans').then(m => m.SubscriptionPlans)
            },
            { 
                path: 'settings', 
                loadComponent: () => import('../pages/admin/system-settings').then(m => m.SystemSettings)
            },
            { 
                path: 'audit-logs', 
                loadComponent: () => import('../pages/admin/audit-logs').then(m => m.AuditLogs)
            },
            { 
                path: 'billing', 
                loadComponent: () => import('../pages/admin/billing-management').then(m => m.BillingManagement)
            },
            { 
                path: 'reports', 
                loadComponent: () => import('../pages/admin/admin-reports').then(m => m.AdminReports)
            },
            { 
                path: 'monitor', 
                loadComponent: () => import('../pages/admin/system-monitor').then(m => m.SystemMonitor)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];