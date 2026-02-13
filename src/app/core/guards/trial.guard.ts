import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../../environments/environment';

export const TrialGuard: CanActivateFn = (route, state) => {
  // Deshabilitar guard temporalmente - la validación se hace en el middleware del backend
  return true;
};
