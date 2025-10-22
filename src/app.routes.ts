import { Routes } from '@angular/router';
import { Notfound } from './app/pages/notfound/notfound';
import { NoAuthGuard } from './app/core/guards';
import { publicRoutes } from './app/routes/public.routes';
import { adminRoutes } from './app/routes/admin.routes';
import { clientRoutes } from './app/routes/client.routes';

export const appRoutes: Routes = [
    // Default redirect to landing
    {
        path: '',
        redirectTo: '/landing',
        pathMatch: 'full'
    },

    // Auth routes (login, etc.)
    {
        path: 'auth',
        canActivate: [NoAuthGuard],
        loadChildren: () => import('./app/pages/auth/auth.routes')
    },

    // Public routes (landing, legal, register)
    ...publicRoutes,

    // Admin routes (SuperAdmin)
    ...adminRoutes,

    // Client routes (Barbershop owners)
    ...clientRoutes,

    // Legacy pages routes
    {
        path: 'pages',
        loadChildren: () => import('./app/pages/pages.routes')
    },

    // 404 page
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];
