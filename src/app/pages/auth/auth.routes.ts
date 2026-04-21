import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { Register } from './register';
import { RegistrationSuccess } from './registration-success';
import { ForgotPassword } from './forgot-password';
import { ResetPassword } from './reset-password';
import { NoAuthGuard } from '../../core/guards/no-auth.guard';

export default [
    { path: 'access', component: Access, canActivate: [NoAuthGuard] },
    { path: 'error', component: Error },
    { path: 'login', component: Login, canActivate: [NoAuthGuard] },
    { path: 'register', component: Register, canActivate: [NoAuthGuard] },
    { path: 'registration-success', component: RegistrationSuccess },
    { path: 'forgot-password', component: ForgotPassword, canActivate: [NoAuthGuard] },
    { path: 'reset-password/:uid/:token', component: ResetPassword, canActivate: [NoAuthGuard] }
] as Routes;
