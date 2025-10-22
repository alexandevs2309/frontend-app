import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Solo agregar tenant_id para APIs del backend
    if (req.url.includes('localhost:8000/api/')) {
      const user = localStorage.getItem('user');
      let tenantId = null;
      
      if (user) {
        const userData = JSON.parse(user);
        tenantId = userData.tenant_id;
      }
      
      // Si no hay tenant_id en user, intentar obtenerlo del tenant
      if (!tenantId) {
        const tenant = localStorage.getItem('tenant');
        if (tenant) {
          const tenantData = JSON.parse(tenant);
          tenantId = tenantData.id;
        }
      }
      
      if (tenantId) {
        // Agregar tenant_id como query parameter en lugar de header
        const separator = req.url.includes('?') ? '&' : '?';
        const modifiedUrl = `${req.url}${separator}tenant_id=${tenantId}`;
        
        const modifiedReq = req.clone({
          url: modifiedUrl
        });
        
        return next.handle(modifiedReq);
      }
    }
    
    return next.handle(req);
  }
}