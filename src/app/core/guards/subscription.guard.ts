import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { MessageService } from 'primeng/api';

export const subscriptionGuard: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const messageService = inject(MessageService);

  // Verificar estado de suscripción haciendo un request simple
  return http.get('/api/tenants/subscription-status/').pipe(
    map(() => true),
    catchError((error) => {
      if (error.status === 402) {
        const errorData = error.error;
        const code = errorData?.code;
        
        if (code === 'TRIAL_EXPIRED') {
          messageService.add({ 
            severity: 'warn', 
            summary: 'Período de prueba expirado', 
            detail: 'Tu período de prueba ha expirado. Selecciona un plan para continuar.', 
            life: 5000 
          });
        } else if (code === 'SUBSCRIPTION_EXPIRED') {
          messageService.add({ 
            severity: 'warn', 
            summary: 'Suscripción expirada', 
            detail: 'Tu suscripción ha expirado. Renueva para continuar.', 
            life: 5000 
          });
        } else {
          messageService.add({ 
            severity: 'warn', 
            summary: 'Pago requerido', 
            detail: 'Se requiere un plan activo para continuar.', 
            life: 5000 
          });
        }
        
        router.navigate(['/client/payment']);
        return of(false);
      }
      return of(true);
    })
  );
};
