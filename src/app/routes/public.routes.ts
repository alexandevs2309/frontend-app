import { Routes } from '@angular/router';

export const publicRoutes: Routes = [
    // Landing page
    {
        path: 'landing',
        loadComponent: () => import('../pages/landing/landing').then(m => m.Landing)
    },
    
    // Registration (public access)
    {
        path: 'register',
        loadComponent: () => import('../pages/auth/register').then(m => m.Register)
    },
    
    // Legal pages
    {
        path: 'terms',
        loadComponent: () => import('../pages/legal/terms.component').then(m => m.TermsComponent)
    },
    {
        path: 'privacy',
        loadComponent: () => import('../pages/legal/privacy.component').then(m => m.PrivacyComponent)
    },
    {
        path: 'cookies',
        loadComponent: () => import('../pages/legal/cookies.component').then(m => m.CookiesComponent)
    },
    {
        path: 'about',
        loadComponent: () => import('../pages/info/about.component').then(m => m.AboutComponent)
    },
    
    // Maintenance
    {
        path: 'maintenance',
        loadComponent: () => import('../pages/maintenance/maintenance.component').then(m => m.MaintenanceComponent)
    }
];