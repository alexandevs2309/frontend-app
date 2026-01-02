import { Routes } from '@angular/router';

export const PAYROLL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./payroll.component').then(m => m.PayrollComponent),
    data: { title: 'Nómina Simple' }
  }
];