import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TrialService } from '../services/trial.service';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TrialGuard implements CanActivate {
  constructor(
    private trialService: TrialService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();

    // Usuarios SuperAdmin evitan el Bypass
    if (user?.role === 'SuperAdmin') {
      return true;
    }

    // Comprobar si el periodo de prueba ha expirado
    if (this.trialService.isTrialExpired()) {
      this.router.navigate(['/client/payment']);
      return false;
    }

    return true;
  }
}
