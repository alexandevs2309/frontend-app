import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { MessageService } from 'primeng/api';
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
        const hasRequiredRole = requiredRoles.includes(userRole);

        if (hasRequiredRole) {
          return true;
        } else {
          this.handleUnauthorizedAccess(user.role);
          return false;
        }
      })
    );
  }

  private handleUnauthorizedAccess(userRole: string): void {
    this.messageService.add({ severity: 'error', summary: 'Acceso Denegado', detail: 'No tienes permiso para acceder a esta página.' });
    
    // Redirect based on user role
    switch (userRole) {
      case 'SUPER_ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'CLIENT_ADMIN':
      case 'CLIENT_STAFF':
        this.router.navigate(['/client/dashboard']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }
}