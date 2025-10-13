import { Routes } from '@angular/router';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { Landing } from './landing/landing';

export default [
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'landing', component: Landing },
    { path: 'maintenance', component: MaintenanceComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
