import { of } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth/auth.service';

describe('AuthGuard', () => {
    let guard: AuthGuard;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: { navigate: jasmine.Spy };

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
            'getCurrentUser',
            'validateSession',
            'clearAuthData'
        ]);
        routerSpy = {
            navigate: jasmine.createSpy('navigate')
        };

        guard = new AuthGuard(authServiceSpy, routerSpy as any);
    });

    it('should redirect to login when there is no current user', (done) => {
        authServiceSpy.getCurrentUser.and.returnValue(null);

        guard.canActivate({} as any, { url: '/client/dashboard' } as any).subscribe(result => {
            expect(result).toBeFalse();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], {
                queryParams: { returnUrl: '/client/dashboard' }
            });
            done();
        });
    });

    it('should allow access when session validation succeeds', (done) => {
        authServiceSpy.getCurrentUser.and.returnValue({ id: 1 } as any);
        authServiceSpy.validateSession.and.returnValue(of(true));

        guard.canActivate({} as any, { url: '/client/dashboard' } as any).subscribe(result => {
            expect(result).toBeTrue();
            expect(authServiceSpy.clearAuthData).not.toHaveBeenCalled();
            expect(routerSpy.navigate).not.toHaveBeenCalled();
            done();
        });
    });

    it('should clear auth data and redirect when session validation fails', (done) => {
        authServiceSpy.getCurrentUser.and.returnValue({ id: 1 } as any);
        authServiceSpy.validateSession.and.returnValue(of(false));

        guard.canActivate({} as any, { url: '/client/dashboard' } as any).subscribe(result => {
            expect(result).toBeFalse();
            expect(authServiceSpy.clearAuthData).toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], {
                queryParams: { returnUrl: '/client/dashboard' }
            });
            done();
        });
    });
});
