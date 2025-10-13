import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard, RoleGuard, TenantGuard, NoAuthGuard } from './app/core/guards';
import { SuperAdminGuard } from './app/core/guards/super-admin.guard';

export const appRoutes: Routes = [

    
    // Auth routes (no authenticated users)
    {
        path: 'auth',
        canActivate: [NoAuthGuard],
        loadChildren: () => import('./app/pages/auth/auth.routes')
    },
    
    // Admin Panel - Para dueño del SaaS
    {
        path: 'admin',
        canActivate: [AuthGuard, SuperAdminGuard],
        data: { roles: ['SuperAdmin'] },
        component: AppLayout,
        children: [
            { 
                path: 'dashboard', 
                loadComponent: () => import('./app/pages/admin/admin-dashboard').then(m => m.AdminDashboard)
            },
            { 
                path: 'tenants', 
                loadComponent: () => import('./app/pages/admin/tenants-management').then(m => m.TenantsManagement)
            },
            { 
                path: 'users', 
                loadComponent: () => import('./app/pages/admin/users-management').then(m => m.UsersManagement)
            },
            { 
                path: 'plans', 
                loadComponent: () => import('./app/pages/admin/subscription-plans').then(m => m.SubscriptionPlans)
            },
            { 
                path: 'settings', 
                loadComponent: () => import('./app/pages/admin/system-settings').then(m => m.SystemSettings)
            },
            { 
                path: 'audit-logs', 
                loadComponent: () => import('./app/pages/admin/audit-logs').then(m => m.AuditLogs)
            },
            { 
                path: 'billing', 
                loadComponent: () => import('./app/pages/admin/billing-management').then(m => m.BillingManagement)
            },
            { 
                path: 'reports', 
                loadComponent: () => import('./app/pages/admin/admin-reports').then(m => m.AdminReports)
            },
            { 
                path: 'monitor', 
                loadComponent: () => import('./app/pages/admin/system-monitor').then(m => m.SystemMonitor)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    
    // Client Panel - Para clientes que compran tenants
    {
        path: 'client',
        canActivate: [AuthGuard, RoleGuard, TenantGuard],
        data: { roles: ['ClientAdmin', 'ClientStaff'] },
        component: AppLayout,
        children: [
            { 
                path: 'dashboard', 
                loadComponent: () => import('./app/pages/client/client-dashboard').then(m => m.ClientDashboard)
            },
            { 
                path: 'employees', 
                loadComponent: () => import('./app/pages/client/employees-management').then(m => m.EmployeesManagement)
            },
            { 
                path: 'appointments', 
                loadComponent: () => import('./app/pages/client/appointments-management').then(m => m.AppointmentsManagement)
            },
            { 
                path: 'pos', 
                loadComponent: () => import('./app/pages/client/pos-system').then(m => m.PosSystem)
            },
            { 
                path: 'earnings', 
                loadComponent: () => import('./app/pages/client/earnings-management').then(m => m.EarningsManagement)
            },
            { 
                path: 'services', 
                loadComponent: () => import('./app/pages/client/services-management').then(m => m.ServicesManagement)
            },
            { 
                path: 'products', 
                loadComponent: () => import('./app/pages/client/products-management').then(m => m.ProductsManagement)
            },
            { 
                path: 'reports', 
                loadComponent: () => import('./app/pages/client/client-reports').then(m => m.ClientReports)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    
    // Default redirect based on authentication
    {
        path: '',
        canActivate: [AuthGuard],
        component: AppLayout,
        children: [
            { path: '', component: Dashboard }
        ]
    },
    
    // Pages routes
    {
        path: 'pages',
        loadChildren: () => import('./app/pages/pages.routes')
    },
    
    // Landing page (direct access)
    {
        path: 'landing',
        loadComponent: () => import('./app/pages/landing/landing').then(m => m.Landing)
    },
    
    // Maintenance page
    {
        path: 'maintenance',
        loadComponent: () => import('./app/pages/maintenance/maintenance.component').then(m => m.MaintenanceComponent)
    },
    
    // 404 page
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];
