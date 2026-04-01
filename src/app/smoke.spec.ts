import { clientRoutes } from './routes/client.routes';

describe('Route Smoke Test', () => {
    it('should keep the payroll route lazy-loaded through children only', () => {
        const clientRoot = clientRoutes.find(route => route.path === 'client');
        const payrollRoute = clientRoot?.children?.find(route => route.path === 'payroll');

        expect(payrollRoute).toBeDefined();
        expect(payrollRoute?.loadChildren).toEqual(jasmine.any(Function));
        expect(payrollRoute?.loadComponent).toBeUndefined();
    });

    it('should expose profile routes for client users', () => {
        const clientRoot = clientRoutes.find(route => route.path === 'client');
        const childPaths = (clientRoot?.children || []).map(route => route.path);

        expect(childPaths).toContain('profile');
        expect(childPaths).toContain('change-password');
        expect(childPaths).toContain('help');
    });
});
