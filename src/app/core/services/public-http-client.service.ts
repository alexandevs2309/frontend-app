import { HttpClient, HttpBackend } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * PublicHttpClient - Sin interceptors
 * 
 * PERFORMANCE:
 * - Landing page NO ejecuta interceptors de autenticación
 * - Sin overhead de token checks
 * - Sin acceso a localStorage
 * 
 * USO:
 * - Landing page
 * - Páginas públicas (legal, about)
 * - Registro inicial
 */
@Injectable({
  providedIn: 'root'
})
export class PublicHttpClient extends HttpClient {
  constructor(handler: HttpBackend) {
    // ✅ Bypass ALL interceptors
    super(handler);
  }
}
