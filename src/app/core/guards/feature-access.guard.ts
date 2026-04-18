import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { PlanAccessService } from '../services/plan-access.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureAccessGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly planAccessService = inject(PlanAccessService);

  canActivate(route: ActivatedRouteSnapshot) {
    const requiredFeature = String(route.data?.['requiredFeature'] || '').trim();
    if (!requiredFeature || this.planAccessService.canAccessFeature(requiredFeature)) {
      return of(true);
    }

    const recommendation = this.planAccessService.getFeatureUpgradeRecommendation(requiredFeature);
    const detail = recommendation
      ? `${recommendation.reason} ${recommendation.detail}`
      : 'Tu plan actual no incluye esta funcionalidad.';

    this.messageService.add({
      severity: 'warn',
      summary: 'Funcionalidad no disponible',
      detail,
      life: 5000
    });

    this.router.navigate(['/client/dashboard']);
    return of(false);
  }
}
