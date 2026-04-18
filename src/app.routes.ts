import { Routes } from '@angular/router';
import { Notfound } from './app/pages/notfound/notfound';
import { publicRoutes } from './app/routes/public.routes';

export const appRoutes: Routes = [
    // Default redirect to landing
    {
        path: '',
        redirectTo: '/landing',
        pathMatch: 'full'
    },

    // Auth routes FIRST (login, register, forgot-password, reset-password)
    {
        path: 'auth',
        loadChildren: () => import('./app/pages/auth/auth.routes')
    },

    // Admin shell (fully lazy bundle)
    {
        path: 'admin',
        data: { preload: true, preloadAfterAuth: true, preloadFor: ['SUPER_ADMIN'] },
        loadChildren: () => import('./app/routes/admin.routes').then(m => m.adminRoutes)
    },

    // Client shell (fully lazy bundle)
    {
        path: 'client',
        data: {
            preload: true,
            preloadAfterAuth: true,
            preloadFor: ['CLIENT_ADMIN', 'CLIENT_STAFF', 'Cajera', 'Estilista', 'Manager']
        },
        loadChildren: () => import('./app/routes/client.routes').then(m => m.clientRoutes)
    },

    // Public routes (landing, legal, register)
    ...publicRoutes,

    // Legacy pages routes
    {
        path: 'pages',
        loadChildren: () => import('./app/pages/pages.routes')
    },

    // 404 page
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];
