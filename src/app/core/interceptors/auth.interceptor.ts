import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (environment.production) {
      // Producción: cookies httpOnly (solo para APIs)
      if (req.url.includes('/api/') || req.url.startsWith('/auth/')) {
        const authReq = req.clone({
          withCredentials: true
        });
        return next.handle(authReq);
      }
    } else {
      // Desarrollo: localStorage con Bearer token
      const token = localStorage.getItem('access_token');
      if (token) {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next.handle(authReq);
      }
    }
    
    return next.handle(req);
  }
}