import { Routes } from '@angular/router';
import { AppLayout } from '../layout/component/app.layout';
import { AuthGuard, RoleGuard } from '../core/guards';
import { TrialGuard } from '../core/guards/trial.guard';

export const clientRoutes: Routes = [
    {
        path: 'client',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['CLIENT_ADMIN', 'CLIENT_STAFF', 'Cajera', 'Estilista', 'Manager'] },
        component: AppLayout,
        children: [
            {
                path: 'dashboard',
                canActivate: [TrialGuard, RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'CLIENT_STAFF', 'Cajera', 'Estilista', 'Manager'] },
                loadComponent: () => import('../pages/client/dashboard/client-dashboard').then(m => m.ClientDashboard)
            },
            {
                path: 'payment',
                canActivate: [RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'Manager'] },
                loadComponent: () => import('../pages/client/payments/payment').then(m => m.PaymentComponent)
            },
            {
                path: 'checkout',
                canActivate: [RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'Manager'] },
                loadComponent: () => import('../pages/client/checkout/checkout').then(m => m.CheckoutComponent)
            },
            {
                path: 'employees',
                canActivate: [TrialGuard, RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'Manager'] },
                loadComponent: () => import('../pages/client/employees/employees-management').then(m => m.EmployeesManagement)
            },
            {
                path: 'schedules',
                canActivate: [TrialGuard, RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'Manager'] },
                loadComponent: () => import('../pages/client/schedules/schedules-management').then(m => m.SchedulesManagement)
            },
            {
                path: 'appointments',
                canActivate: [TrialGuard, RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'CLIENT_STAFF', 'Cajera', 'Estilista', 'Manager'] },
                loadComponent: () => import('../pages/client/appointments-management/appointments-main').then(m => m.AppointmentsMain)
            },
            {
                path: 'pos',
                canActivate: [TrialGuard, RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'Cajera', 'Manager'] },
                loadComponent: () => import('../pages/client/pos/pos-system').then(m => m.PosSystem)
            },
            {
                path: 'payroll',
                canActivate: [TrialGuard, RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'Manager'] },
                loadChildren: () => import('../pages/client/payroll/payroll.routes').then(m => m.PAYROLL_ROUTES)
            },
            {
                path: 'services',
                canActivate: [TrialGuard, RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'Cajera', 'Manager'] },
                loadComponent: () => import('../pages/client/services-managements/services-management').then(m => m.ServicesManagement)
            },
            {
                path: 'clients',
                canActivate: [TrialGuard, RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'CLIENT_STAFF', 'Cajera', 'Estilista', 'Manager'] },
                loadComponent: () => import('../pages/client/clients-managements/clients-management').then(m => m.ClientsManagement)
            },
            {
                path: 'products',
                canActivate: [TrialGuard, RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'Cajera', 'Manager'] },
                loadComponent: () => import('../pages/client/products/products-management').then(m => m.ProductsManagement)
            },
            {
                path: 'reports',
                canActivate: [TrialGuard, RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'Manager'] },
                loadComponent: () => import('../pages/client/reports/client-reports').then(m => m.ClientReports)
            },
            {
                path: 'settings',
                canActivate: [TrialGuard, RoleGuard],
                data: { roles: ['CLIENT_ADMIN'] },
                loadComponent: () => import('../pages/client/settings/barbershop-settings').then(m => m.BarbershopSettingsComponent)
            },
            {
                path: 'profile',
                canActivate: [RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'CLIENT_STAFF', 'Cajera', 'Estilista', 'Manager'] },
                loadComponent: () => import('../pages/client/profile/user-profile.component').then(m => m.UserProfileComponent)
            },
            {
                path: 'change-password',
                canActivate: [RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'CLIENT_STAFF', 'Cajera', 'Estilista', 'Manager'] },
                loadComponent: () => import('../pages/client/profile/change-password.component').then(m => m.ChangePasswordComponent)
            },
            {
                path: 'help',
                canActivate: [RoleGuard],
                data: { roles: ['CLIENT_ADMIN', 'CLIENT_STAFF', 'Cajera', 'Estilista', 'Manager'] },
                loadComponent: () => import('../pages/client/profile/help.component').then(m => m.HelpComponent)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];
