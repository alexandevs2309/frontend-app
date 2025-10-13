import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tenantId = this.authService.getTenantId();
    
    // Add tenant header for multi-tenant isolation
    if (tenantId && !this.authService.isSuperAdmin()) {
      const tenantReq = req.clone({
        headers: req.headers.set('X-Tenant-ID', tenantId.toString())
      });
      return next.handle(tenantReq);
    }
    
    return next.handle(req);
  }
}