import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class MaintenanceInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si es error 503 (Service Unavailable) y contiene mensaje de mantenimiento
        if (error.status === 503 && 
            error.error?.error === 'Sistema en modo mantenimiento') {
          
          // Solo redirigir si no estamos ya en la página de mantenimiento
          if (!this.router.url.includes('/maintenance')) {
            this.router.navigate(['/maintenance']);
          }
        }
        
        return throwError(() => error);
      })
    );
  }
}