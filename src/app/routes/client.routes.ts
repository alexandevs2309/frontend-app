import { Routes } from '@angular/router';
import { AppLayout } from '../layout/component/app.layout';
import { AuthGuard, RoleGuard } from '../core/guards';
import { TrialGuard } from '../core/guards/trial.guard';

export const clientRoutes: Routes = [
    {
        path: 'client',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Client-Admin', 'Client-Staff'] },
        component: AppLayout,
        children: [
            {
                path: 'dashboard',
                canActivate: [TrialGuard],
                loadComponent: () => import('../pages/client/client-dashboard').then(m => m.ClientDashboard)
            },
            {
                path: 'payment',
                loadComponent: () => import('../pages/client/payment').then(m => m.PaymentComponent)
            },
            {
                path: 'users',
                canActivate: [TrialGuard],
                loadComponent: () => import('../pages/admin/users-management').then(m => m.UsersManagement)
            },
            {
                path: 'employees',
                canActivate: [TrialGuard],
                loadComponent: () => import('../pages/client/employees-management').then(m => m.EmployeesManagement)
            },
            {
                path: 'appointments',
                canActivate: [TrialGuard],
                loadComponent: () => import('../pages/client/appointments-management').then(m => m.AppointmentsManagement)
            },
            {
                path: 'pos',
                canActivate: [TrialGuard],
                loadComponent: () => import('../pages/client/pos-system').then(m => m.PosSystem)
            },
            {
                path: 'earnings',
                canActivate: [TrialGuard],
                loadComponent: () => import('../pages/client/earnings-management').then(m => m.EarningsManagement)
            },
            {
                path: 'services',
                canActivate: [TrialGuard],
                loadComponent: () => import('../pages/client/services-management').then(m => m.ServicesManagement)
            },
            {
                path: 'clients',
                canActivate: [TrialGuard],
                loadComponent: () => import('../pages/client/clients-management').then(m => m.ClientsManagement)
            },
            {
                path: 'products',
                canActivate: [TrialGuard],
                loadComponent: () => import('../pages/client/products-management').then(m => m.ProductsManagement)
            },
            {
                path: 'reports',
                canActivate: [TrialGuard],
                loadComponent: () => import('../pages/client/client-reports').then(m => m.ClientReports)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];
