import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { Register } from './register';
import { RegistrationSuccess } from './registration-success';
import { ForgotPassword } from './forgot-password';
import { ResetPassword } from './reset-password';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'registration-success', component: RegistrationSuccess },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'reset-password/:uid/:token', component: ResetPassword }
] as Routes;
