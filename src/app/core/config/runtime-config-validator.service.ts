import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface RuntimeConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RuntimeConfigValidatorService {
  validateRuntimeConfig(): RuntimeConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!environment.apiUrl) {
      errors.push('environment.apiUrl is required.');
    }

    if (!environment.wsUrl) {
      errors.push('environment.wsUrl is required.');
    }

    if (!environment.production) {
      if (this.isTestStripeKey(environment.stripePublishableKey)) {
        warnings.push('Development is using a Stripe test publishable key.');
      }
      return { valid: errors.length === 0, errors, warnings };
    }

    if (this.isTestStripeKey(environment.stripePublishableKey)) {
      errors.push('Production cannot use a Stripe test publishable key.');
    }

    if (this.isLocalUrl(environment.apiUrl)) {
      errors.push('Production cannot use a localhost API URL.');
    }

    if (this.isLocalUrl(environment.wsUrl)) {
      errors.push('Production cannot use a localhost WebSocket URL.');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  assertValidRuntimeConfig(): void {
    const result = this.validateRuntimeConfig();

    result.warnings.forEach((warning) => console.warn(`[runtime-config] ${warning}`));

    if (!result.valid) {
      const message = result.errors.join(' ');
      console.error('[runtime-config] Invalid runtime configuration.', result.errors);
      throw new Error(message);
    }
  }

  private isTestStripeKey(key?: string | null): boolean {
    return !!key && key.startsWith('pk_test_');
  }

  private isLocalUrl(url?: string | null): boolean {
    if (!url) return false;
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}
