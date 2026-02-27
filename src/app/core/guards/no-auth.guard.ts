import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> | boolean {
    return this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          // Redirecionar al dashboard correspondiente según el rol del usuario
          const userRole = this.authService.getCurrentUserRole();
          this.redirectToDashboard(userRole);
          return false;
        }
        return true;
      })
    );
  }

  private redirectToDashboard(role: string | null): void {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'SuperAdmin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'CLIENT_ADMIN':
      case 'CLIENT_STAFF':
      case 'Client-Admin':
      case 'Client-Staff':
        this.router.navigate(['/client/dashboard']);
        break;
      default:
        this.router.navigate(['/landing']);
    }
  }
}
