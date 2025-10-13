import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private authService: AuthService,
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
      this.authService.logout().subscribe();
      this.router.navigate(['/auth/login']);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Sesión expirada. Por favor, inicia sesión nuevamente.' });
    }
  }

  private handle403Error(): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No tienes permisos para realizar esta acción.' });
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