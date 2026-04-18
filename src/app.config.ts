import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApplicationConfig, APP_INITIALIZER, ErrorHandler, LOCALE_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling, withPreloading } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { appRoutes } from './app.routes';
import { AuthInterceptor, ErrorInterceptor, TenantInterceptor } from './app/core/interceptors';
import { MaintenanceInterceptor } from './app/core/interceptors/maintenance.interceptor';
import { RuntimeConfigValidatorService } from './app/core/config/runtime-config-validator.service';
import { GlobalErrorHandlerService } from './app/core/services/global-error-handler.service';
import { RoleBasedPreloadingStrategy } from './app/core/services/role-based-preloading.strategy';

function validateRuntimeConfigFactory(validator: RuntimeConfigValidatorService) {
    return () => validator.assertValidRuntimeConfig();
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            appRoutes,
            withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
            withEnabledBlockingInitialNavigation(),
            withPreloading(RoleBasedPreloadingStrategy)
        ),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        MessageService,
        
        // HTTP Interceptors
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TenantInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MaintenanceInterceptor,
            multi: true
        },
        {
            provide: LOCALE_ID,
            useValue: 'es-DO'
        },
        {
            provide: APP_INITIALIZER,
            useFactory: validateRuntimeConfigFactory,
            deps: [RuntimeConfigValidatorService],
            multi: true
        },
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandlerService
        }
    ]
};
