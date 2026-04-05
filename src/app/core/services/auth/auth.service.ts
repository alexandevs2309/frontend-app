import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, map, of } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { API_CONFIG } from '../../config/api.config';
import { TrialService } from '../trial.service';
import { LocaleService } from '../locale/locale.service';
import { throwError } from 'rxjs';
import { normalizeRole } from '../../utils/role-normalizer';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access?: string;
  refresh?: string;
  user?: any;
  tenant?: any;
  detail?: string;
  message?: string;
  email?: string;
  requires_mfa?: boolean;
}

export interface SecureLoginResponse {
  user: any;
  tenant?: any;
  message: string;
}

export interface MFALoginVerifyRequest {
  email: string;
  code: string;
  tenant_subdomain?: string;
}

export interface MFASetupResponse {
  qr_code: string;
  secret: string;
}

export interface MFAVerifyRequest {
  code: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  tenant_id?: number;
  tenant_name?: string;
  roles: string[];
  phone?: string;
  is_active?: boolean;
  date_joined?: string;
  avatar_url?: string | null;
}

export interface CreateUserRequest {
  email: string;
  full_name: string;
  phone?: string;
  password: string;
  tenant?: number;
}

export interface CreateUserResponse {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseApiService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private trialService: TrialService, private localeService: LocaleService) {
    super();
    this.loadStoredAuth();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // ✅ Backend detecta tenant automáticamente por email
    return this.post<LoginResponse>('/auth/cookie-login/', credentials, { withCredentials: true })
      .pipe(
        tap(response => {
          this.setAuthData(response);
          const normalizedRole = normalizeRole(response.user?.role);
          if (normalizedRole !== 'SUPER_ADMIN') {
            this.trialService.loadTrialStatus();
          }
        })
      );
  }

  loginSecure(credentials: LoginRequest): Observable<LoginResponse> {
    return this.login(credentials);
  }

  verifyLoginMfa(data: MFALoginVerifyRequest): Observable<LoginResponse> {
    return this.post<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.MFA_LOGIN_VERIFY, data, { withCredentials: true })
      .pipe(
        tap(response => this.setAuthData(response))
      );
  }

  setupMfa(): Observable<MFASetupResponse> {
    return this.post<MFASetupResponse>(API_CONFIG.ENDPOINTS.AUTH.MFA_SETUP, {}, { withCredentials: true });
  }

  verifyMfa(data: MFAVerifyRequest): Observable<{ detail: string }> {
    return this.post<{ detail: string }>(API_CONFIG.ENDPOINTS.AUTH.MFA_VERIFY, data, { withCredentials: true });
  }

  disableMfa(data: MFAVerifyRequest): Observable<{ detail: string }> {
    return this.post<{ detail: string }>(API_CONFIG.ENDPOINTS.AUTH.MFA_DISABLE, data, { withCredentials: true });
  }

  logout(): Observable<any> {
    // ✅ Backend invalida cookies httpOnly
    return this.post('/auth/cookie-logout/', {}, { withCredentials: true })
      .pipe(
        tap(() => this.clearAuthData()),
        catchError(() => {
          // Limpiar local incluso si falla backend
          this.clearAuthData();
          return of({ success: true });
        })
      );
  }

  logoutSecure(): Observable<any> {
    return this.logout();
  }

  register(userData: any): Observable<any> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
  }

  registerWithPlan(userData: any): Observable<any> {
    return this.post('/subscriptions/register/', userData);
  }

  // Check if email is already registered
  checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    return this.get<{ available: boolean }>('/subscriptions/check-email/', { email });
  }

  changePassword(data: { old_password: string; new_password: string }): Observable<any> {
    return this.put(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  }

  resetPassword(email: string): Observable<any> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, { email });
  }

  requestPasswordReset(email: string, tenantSubdomain?: string): Observable<any> {
    const payload: any = { email };
    if (tenantSubdomain) payload.tenant_subdomain = tenantSubdomain;
    return this.post('/auth/reset-password/', payload);
  }

  confirmPasswordReset(uid: string, token: string, password: string): Observable<any> {
    return this.post('/auth/reset-password-confirm/', { uid, token, new_password: password });
  }

  getUsers(params?: any): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.AUTH.USERS, params);
  }

  getUserPermissions(): Observable<any> {
    return this.get(API_CONFIG.ENDPOINTS.AUTH.PERMISSIONS);
  }

  createUser(userData: CreateUserRequest): Observable<CreateUserResponse> {
    return this.post<CreateUserResponse>(API_CONFIG.ENDPOINTS.AUTH.USERS, userData)
      .pipe(
        catchError(error => {
          if (error.status === 402 || error.error?.code === 'UPGRADE_REQUIRED') {
            // Upgrade required - handle in component
          }
          return throwError(() => error);
        })
      );
  }

  updateUser(id: number, userData: Partial<CreateUserRequest>): Observable<User> {
    return this.put<User>(`${API_CONFIG.ENDPOINTS.AUTH.USERS}${id}/`, userData);
  }

  deleteUser(id: number): Observable<any> {
    return this.delete(`${API_CONFIG.ENDPOINTS.AUTH.USERS}${id}/`);
  }

  bulkDeleteUsers(userIds: number[]): Observable<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.AUTH.USERS}bulk_delete/`, { user_ids: userIds });
  }

  getUsersAvailableForEmployee(): Observable<User[]> {
    return this.get<User[]>(API_CONFIG.ENDPOINTS.COMPATIBILITY.USERS_AVAILABLE_FOR_EMPLOYEE);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  patchCurrentUser(patch: Partial<User>): void {
    const current = this.currentUserSubject.value;
    if (!current) return;

    const updated = { ...current, ...patch };
    if (updated.role) {
      updated.role = normalizeRole(updated.role);
    }
    this.currentUserSubject.next(updated);
    localStorage.setItem('user', JSON.stringify(updated));
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
    const user = this.getCurrentUser();
    return user?.role === 'SUPER_ADMIN';
  }

  isClientAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'CLIENT_ADMIN';
  }

  isClientStaff(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'CLIENT_STAFF';
  }

  getToken(): string | null {
    // ❌ DEPRECADO - Tokens en httpOnly cookies, no accesibles desde JS
    return null;
  }

  getRefreshToken(): string | null {
    // ❌ DEPRECADO - Tokens en httpOnly cookies, no accesibles desde JS
    return null;
  }

  private setAuthData(response: LoginResponse): void {
    if (!response.user) {
      return;
    }

    // ✅ NO almacenar tokens - están en httpOnly cookies
    // Solo almacenar datos de usuario (no sensibles)
    
    const normalizedRole = normalizeRole(response.user?.role);
    
    const userWithTenant = {
      ...response.user,
      role: normalizedRole,
      tenant_id: response.tenant ? response.tenant.id : null
    };
    
    // Solo datos de usuario para UI (no tokens)
    localStorage.setItem('user', JSON.stringify(userWithTenant));

    if (response.tenant) {
      localStorage.setItem('tenant', JSON.stringify(response.tenant));
    } else {
      localStorage.removeItem('tenant');
    }

    this.currentUserSubject.next(userWithTenant);
    this.isAuthenticatedSubject.next(true);
    
    if (normalizedRole !== 'SUPER_ADMIN') {
      this.trialService.loadTrialStatus();
      // Cargar configuración regional del tenant
      this.localeService.loadTenantLocaleFromBackend().subscribe({
        next: (config) => this.localeService['currentLocale'].set(config),
        error: () => {} // Fallback to default config
      });
    }
  }

  public clearAuthData(): void {
    // ✅ Solo limpiar datos locales (tokens ya invalidados en backend)
    localStorage.removeItem('tenant');
    localStorage.removeItem('user');

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private loadStoredAuth(): void {
    const userStr = localStorage.getItem('user');

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        user.role = normalizeRole(user.role);
        
        // ✅ Validar sesión con backend (cookies httpOnly)
        this.validateSession().subscribe({
          next: (isValid) => {
            if (isValid) {
              this.currentUserSubject.next(user);
              this.isAuthenticatedSubject.next(true);
              
              if (user.role !== 'SUPER_ADMIN') {
                this.trialService.loadTrialStatus();
              }
            } else {
              this.clearAuthData();
            }
          },
          error: () => this.clearAuthData()
        });
      } catch (error) {
        this.clearAuthData();
      }
    }
  }
  
  // ✅ Método público para guards y validación de sesión
  public validateSession(): Observable<boolean> {
    return this.get<any>('/auth/verify/', {}, { withCredentials: true })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

}
