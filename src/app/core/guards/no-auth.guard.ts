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
          // Redirect authenticated users to their dashboard
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
      case 'SuperAdmin':
        this.router.navigate(['/superadmin/dashboard']);
        break;
      case 'ClientAdmin':
        this.router.navigate(['/salon/dashboard']);
        break;
      case 'ClientStaff':
        this.router.navigate(['/employee/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}