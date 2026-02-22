import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * AuthInterceptor - httpOnly Cookies
 * 
 * SEGURIDAD:
 * - NO inyecta Authorization header manualmente
 * - Cookies httpOnly son enviadas automáticamente por el navegador
 * - Tokens NO accesibles desde JavaScript (previene XSS)
 * - withCredentials: true permite envío de cookies cross-origin
 * 
 * PERFORMANCE:
 * - Skip para rutas públicas (landing, legal, register)
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private readonly publicPaths = [
    '/landing',
    '/terms',
    '/privacy',
    '/cookies',
    '/about',
    '/register',
    '/auth/login',
    '/auth/register',
    '/auth/reset-password'
  ];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ✅ Skip interceptor para rutas públicas
    if (this.isPublicRoute(req.url)) {
      return next.handle(req);
    }

    // ✅ Solo para requests al backend API autenticado
    if (req.url.startsWith(environment.apiUrl)) {
      const authReq = req.clone({
        withCredentials: true  // Envía cookies httpOnly automáticamente
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }

  private isPublicRoute(url: string): boolean {
    return this.publicPaths.some(path => url.includes(path));
  }
}