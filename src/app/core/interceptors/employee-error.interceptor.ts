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
          this.handleEmployeeError(error, req.url);
        }
        
        return throwError(() => error);
      })
    );
  }

  private isEmployeeOrUserEndpoint(url: string): boolean {
    return url.includes('/employees/') || url.includes('/auth/users/');
  }

  private handleEmployeeError(error: HttpErrorResponse, url: string): void {
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
      if (error.error?.email) {
        this.messageService.add({
          severity: 'error',
          summary: 'Email Inválido',
          detail: Array.isArray(error.error.email) ? error.error.email[0] : error.error.email,
          life: 5000
        });
      }
      
      if (error.error?.password) {
        this.messageService.add({
          severity: 'error',
          summary: 'Contraseña Inválida',
          detail: Array.isArray(error.error.password) ? error.error.password[0] : error.error.password,
          life: 5000
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
}