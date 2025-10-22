import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { API_CONFIG } from '../../config/api.config';
import { TrialService } from '../trial.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: any;
  tenant?: any;
}

export interface SecureLoginResponse {
  user: any;
  tenant?: any;
  message: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  tenant_id?: number;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseApiService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private trialService: TrialService) {
    super();
    this.loadStoredAuth();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.post<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response);
          // Load entitlements for client users after successful login
          if (response.user?.role !== 'SuperAdmin') {
            this.trialService.loadTrialStatus();
          }
        })
      );
  }

  loginSecure(credentials: LoginRequest): Observable<LoginResponse> {
    return this.login(credentials);
  }

  logout(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    const accessToken = this.getToken();

    // Try server logout first with valid tokens
    if (refreshToken && accessToken) {
      this.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, { refresh_token: refreshToken })
        .subscribe({
          next: () => console.log('Server logout successful'),
          error: () => console.log('Server logout failed')
        });
    }

    // Clear local data after attempting server logout
    this.clearAuthData();

    // Always return success to UI
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  logoutSecure(): Observable<any> {
    return this.logout();
  }

  register(userData: any): Observable<any> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
  }

  registerWithPlan(userData: any): Observable<any> {
    console.log('🚀 [AUTH_SERVICE] Enviando registro con plan:', userData);
    return this.post('/subscriptions/register/', userData).pipe(
      tap({
        next: response => console.log('✅ [AUTH_SERVICE] Registro exitoso:', response),
        error: error => console.error('❌ [AUTH_SERVICE] Error en registro:', error)
      })
    );
  }

  changePassword(data: { old_password: string; new_password: string }): Observable<any> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  }

  resetPassword(email: string): Observable<any> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, { email });
  }

  getUsers(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.AUTH.USERS, params);
  }

  getUserPermissions(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.AUTH.PERMISSIONS);
  }

  createUser(userData: any): Observable<any> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.USERS, userData);
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.put(`${API_CONFIG.ENDPOINTS.AUTH.USERS}${id}/`, userData);
  }

  deleteUser(id: number): Observable<any> {
    return this.delete(`${API_CONFIG.ENDPOINTS.AUTH.USERS}${id}/`);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  getTenantId(): number | null {
    const user = this.getCurrentUser();
    return user?.tenant_id || null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  isSuperAdmin(): boolean {
    return this.hasRole('SuperAdmin');
  }

  isClientAdmin(): boolean {
    return this.hasRole('ClientAdmin');
  }

  isClientStaff(): boolean {
    return this.hasRole('ClientStaff');
  }

  getToken(): string | null {
    // Solo localStorage para compatibilidad (las cookies httpOnly se manejan automáticamente)
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setAuthData(response: LoginResponse): void {
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    
    // Agregar tenant_id si viene en la respuesta
    const userWithTenant = {
      ...response.user,
      tenant_id: response.tenant ? response.tenant.id : null
    };
    
    localStorage.setItem('user', JSON.stringify(userWithTenant));

    if (response.tenant) {
      localStorage.setItem('tenant', JSON.stringify(response.tenant));
    }

    // Force state update
    this.currentUserSubject.next(userWithTenant);
    this.isAuthenticatedSubject.next(true);
    
    // Load trial status for non-admin users
    if (response.user?.role !== 'SuperAdmin') {
      this.trialService.loadTrialStatus();
    }
    
    console.log('Auth data set, user:', userWithTenant);
  }

  public clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('tenant');
    localStorage.removeItem('user');

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }



  private loadStoredAuth(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        
        // Cargar trial status si es necesario
        if (user.role !== 'SuperAdmin') {
          this.trialService.loadTrialStatus();
        }
      } catch (error) {
        this.clearAuthData();
      }
    }
  }
}
