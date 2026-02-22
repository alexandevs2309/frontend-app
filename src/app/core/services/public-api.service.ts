import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicHttpClient } from './public-http-client.service';

/**
 * PublicApiService - Para landing y páginas públicas
 * 
 * PERFORMANCE:
 * - Usa PublicHttpClient (sin interceptors)
 * - Sin overhead de autenticación
 * - Sin acceso a localStorage
 * 
 * SEGURIDAD:
 * - No expone datos de tenant
 * - No envía cookies de sesión
 */
@Injectable({
  providedIn: 'root'
})
export class PublicApiService {
  protected baseUrl = environment.apiUrl;
  protected http = inject(PublicHttpClient);

  protected get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }

  protected post<T>(endpoint: string, data?: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data);
  }
}
