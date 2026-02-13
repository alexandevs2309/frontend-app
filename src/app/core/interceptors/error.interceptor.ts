import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private messageService: MessageService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): void {
    switch (error.status) {
      case 401:
        this.handle401Error();
        break;
      case 402:
        this.handle402Error(error);
        break;
      case 403:
        this.handle403Error();
        break;
      case 404:
        this.handle404Error();
        break;
      case 500:
        this.handle500Error();
        break;
      default:
        this.handleGenericError(error);
    }
  }

  private handle401Error(): void {
    // No redirigir al login si estamos en páginas públicas
    const currentUrl = this.router.url;
    const publicPages = ['/landing', '/auth', '/maintenance'];
    const isPublicPage = publicPages.some(page => currentUrl.startsWith(page));
    
    if (!isPublicPage) {
      // Solo limpiar si realmente hay un token inválido
      const hasToken = localStorage.getItem('access_token');
      if (hasToken) {
        // Clear auth data directly
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
        
        this.router.navigate(['/auth/login']);
        this.messageService.add({ severity: 'error', summary: 'Sesión expirada', detail: 'Por favor, inicia sesión nuevamente.', life: 3000 });
      }
    }
  }

  private handle402Error(error: HttpErrorResponse): void {
    console.log('🚨 [ERROR INTERCEPTOR] 402 Payment Required detected:', error);
    const errorData = error.error;
    const code = errorData?.code;
    console.log('🚨 [ERROR INTERCEPTOR] Error code:', code, 'Error data:', errorData);
    
    if (code === 'TRIAL_EXPIRED') {
      console.log('🚨 [ERROR INTERCEPTOR] Trial expired - redirecting to payment');
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Período de prueba expirado', 
        detail: 'Tu período de prueba ha expirado. Selecciona un plan para continuar.', 
        life: 5000 
      });
      this.router.navigate(['/client/payment']);
    } else if (code === 'SUBSCRIPTION_EXPIRED') {
      console.log('🚨 [ERROR INTERCEPTOR] Subscription expired - redirecting to payment');
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Suscripción expirada', 
        detail: 'Tu suscripción ha expirado. Renueva para continuar.', 
        life: 5000 
      });
      this.router.navigate(['/client/payment']);
    } else {
      console.log('🚨 [ERROR INTERCEPTOR] Generic 402 - redirecting to payment');
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Pago requerido', 
        detail: errorData?.error || 'Se requiere un plan activo para continuar.', 
        life: 5000 
      });
      this.router.navigate(['/client/payment']);
    }
  }

  private handle403Error(): void {
    // No limpiar sesión en 403 - solo mostrar mensaje
    this.messageService.add({ 
      severity: 'warn', 
      summary: 'Acceso denegado', 
      detail: 'No tienes permisos para realizar esta acción.', 
      life: 3000 
    });
  }

  private handle404Error(): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Recurso no encontrado.' });
  }

  private handle500Error(): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error interno del servidor. Intenta nuevamente.' });
  }

  private handleGenericError(error: HttpErrorResponse): void {
    const message = error.error?.message || error.message || 'Error desconocido';
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }
}