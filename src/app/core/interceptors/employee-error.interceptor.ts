import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

@Injectable()
export class EmployeeErrorInterceptor implements HttpInterceptor {
  
  constructor(private messageService: MessageService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Solo manejar errores de endpoints de empleados y usuarios
        if (this.isEmployeeOrUserEndpoint(req.url)) {
          this.handleEmployeeError(error, req);
        }
        
        return throwError(() => error);
      })
    );
  }

  private isEmployeeOrUserEndpoint(url: string): boolean {
    return url.includes('/employees/') || url.includes('/auth/users/');
  }

  private handleEmployeeError(error: HttpErrorResponse, req: HttpRequest<any>): void {
    const url = req.url;
    const isUserEndpoint = url.includes('/auth/users/');
    const isEmployeeEndpoint = url.includes('/employees/');

    // Errores específicos de límites de empleados
    if (error.status === 400 && error.error?.error?.includes('límite')) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Límite Alcanzado',
        detail: error.error.error,
        life: 8000
      });
      return;
    }

    // Errores de validación de usuario
    if (isUserEndpoint && error.status === 400) {
      const details = this.extractValidationMessages(error.error);
      if (details.length > 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Datos invalidos',
          detail: details.join(' | ').substring(0, 250),
          life: 7000
        });
      }
      return;
    }

    // Errores de permisos
    if (error.status === 403) {
      const action = req.method === 'POST' ? 'crear' : 
                    req.method === 'PUT' ? 'actualizar' : 
                    req.method === 'DELETE' ? 'eliminar' : 'acceder a';
      
      const resource = isEmployeeEndpoint ? 'empleados' : 'usuarios';
      
      this.messageService.add({
        severity: 'error',
        summary: 'Sin Permisos',
        detail: `No tiene permisos para ${action} ${resource}`,
        life: 5000
      });
      return;
    }

    // Errores de conexión
    if (error.status === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Conexión',
        detail: 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
        life: 8000
      });
      return;
    }

    // Errores del servidor
    if (error.status >= 500) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error del Servidor',
        detail: 'Error interno del servidor. Intente nuevamente en unos momentos.',
        life: 8000
      });
      return;
    }
  }

  private extractValidationMessages(payload: any): string[] {
    if (!payload) return [];

    if (typeof payload === 'string') {
      return [payload];
    }

    const direct = [payload.error, payload.message, payload.detail].filter((item) => typeof item === 'string' && item.trim());
    if (direct.length > 0) {
      return direct as string[];
    }

    if (typeof payload === 'object') {
      return Object.entries(payload)
        .flatMap(([field, value]) => {
          if (Array.isArray(value)) {
            return value.map((item) => `${field}: ${String(item)}`);
          }
          if (typeof value === 'string') {
            return [`${field}: ${value}`];
          }
          return [];
        })
        .filter(Boolean);
    }

    return [];
  }
}
