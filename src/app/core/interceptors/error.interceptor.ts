import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpBackend, HttpClient } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, switchMap, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private httpWithoutInterceptors: HttpClient;
  private refreshInProgress = false;
  private refreshCompleted$ = new Subject<boolean>();

  constructor(
    private router: Router,
    private messageService: MessageService,
    httpBackend: HttpBackend
  ) {
    this.httpWithoutInterceptors = new HttpClient(httpBackend);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && this.shouldAttemptRefresh(req.url)) {
          return this.tryRefreshAndRetry(req, next, error);
        }

        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  private shouldAttemptRefresh(url: string): boolean {
    return !url.includes('/auth/cookie-refresh/') && !url.includes('/auth/cookie-login/');
  }

  private tryRefreshAndRetry(req: HttpRequest<any>, next: HttpHandler, originalError: HttpErrorResponse): Observable<HttpEvent<any>> {
    if (this.refreshInProgress) {
      return this.refreshCompleted$.pipe(
        take(1),
        switchMap((refreshSucceeded) => {
          if (!refreshSucceeded) {
            this.handle401Error();
            return throwError(() => originalError);
          }

          const retryReq = req.clone({ withCredentials: true });
          return next.handle(retryReq);
        })
      );
    }

    this.refreshInProgress = true;

    return this.httpWithoutInterceptors
      .post(`${environment.apiUrl}/auth/cookie-refresh/`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.refreshInProgress = false;
          this.refreshCompleted$.next(true);
        }),
        switchMap(() => {
          const retryReq = req.clone({ withCredentials: true });
          return next.handle(retryReq);
        }),
        catchError(() => {
          this.refreshInProgress = false;
          this.refreshCompleted$.next(false);
          this.handle401Error();
          return throwError(() => originalError);
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
    // ✅ SEGURO - Cookies httpOnly manejadas por navegador
    const currentUrl = this.router.url;
    const publicPages = ['/landing', '/auth', '/maintenance'];
    const isPublicPage = publicPages.some(page => currentUrl.startsWith(page));
    
    if (!isPublicPage) {
      // Limpiar solo datos locales (no tokens)
      localStorage.removeItem('user');
      localStorage.removeItem('tenant');
      
      this.router.navigate(['/auth/login']);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Sesión expirada', 
        detail: 'Por favor, inicia sesión nuevamente.', 
        life: 3000 
      });
    }
  }

  private handle402Error(error: HttpErrorResponse): void {
    const errorData = error.error;
    const code = errorData?.code;
    
    if (code === 'TRIAL_EXPIRED') {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Período de prueba expirado', 
        detail: 'Tu período de prueba ha expirado. Selecciona un plan para continuar.', 
        life: 5000 
      });
      this.router.navigate(['/client/payment']);
    } else if (code === 'SUBSCRIPTION_EXPIRED') {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Suscripción expirada', 
        detail: 'Tu suscripción ha expirado. Renueva para continuar.', 
        life: 5000 
      });
      this.router.navigate(['/client/payment']);
    } else {
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
    // ✅ SEGURO - No exponer detalles técnicos en producción
    let message = 'Ha ocurrido un error. Intenta nuevamente.';
    
    // Solo mostrar detalles en desarrollo
    if (!environment.production && error.error?.message) {
      message = error.error.message;
    }
    
    this.messageService.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: message 
    });
  }
}
