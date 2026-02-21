import { Routes } from '@angular/router';
import { Empty } from './empty/empty';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { Landing } from './landing/landing';

export default [
  
    { path: 'empty', component: Empty },
    { path: 'landing', component: Landing },
    { path: 'maintenance', component: MaintenanceComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
