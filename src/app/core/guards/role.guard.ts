import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { roleKey } from '../utils/role-normalizer';
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const requiredRoles = route.data['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        const userRole = user.role;
        const userRoleKey = roleKey(userRole);
        const hasRequiredRole = requiredRoles.some((requiredRole) => roleKey(requiredRole) === userRoleKey);

        if (hasRequiredRole) {
          return true;
        } else {
          this.handleUnauthorizedAccess(userRoleKey);
          return false;
        }
      })
    );
  }

  private handleUnauthorizedAccess(userRoleKey: string): void {
    this.messageService.add({ severity: 'error', summary: 'Acceso Denegado', detail: 'No tienes permiso para acceder a esta página.' });

    // Redirecionar al dashboard correspondiente según el rol del usuario
    switch (userRoleKey) {
      case 'SUPER_ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'CLIENT_ADMIN':
      case 'CLIENT_STAFF':
      case 'CAJERA':
      case 'MANAGER':
      case 'ESTILISTA':
        this.router.navigate(['/client/dashboard']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }

}
