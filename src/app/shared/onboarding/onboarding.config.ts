export type OnboardingShape = 'rounded' | 'circle';
export type OnboardingTooltipPlacement = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type OnboardingUserRole =
    | 'CLIENT_ADMIN'
    | 'ClientAdmin'
    | 'CLIENT_STAFF'
    | 'Estilista'
    | 'Manager'
    | 'Cajera'
    | 'SUPER_ADMIN'
    | 'SuperAdmin'
    | string;

export interface OnboardingStep {
    id: string;
    selector: string;
    title: string;
    description: string;
    shape?: OnboardingShape;
    titleKey?: string;
    descriptionKey?: string;
    placement?: OnboardingTooltipPlacement;
    spotlightPadding?: number;
    offsetX?: number;
    offsetY?: number;
    scrollBehavior?: ScrollBehavior;
    scrollBlock?: ScrollLogicalPosition;
    skipIf?: (ctx: OnboardingContext) => boolean;
    beforeEnter?: (ctx: OnboardingContext) => void | Promise<void>;
    nextRoute?: string;
}

export interface OnboardingContext {
    currentRole: string;
    currentUrl: string;
    hasEmployees: boolean;
    hasServices: boolean;
}

export interface OnboardingTourConfig {
    id: string;
    name: string;
    routeMatch: string;
    roles: OnboardingUserRole[];
    autoStart?: boolean;
    version?: number;
    context?: (ctx: OnboardingContext) => boolean;
    steps: OnboardingStep[];
}

export const ONBOARDING_TOURS: OnboardingTourConfig[] = [
    {
        id: 'onboarding-main',
        name: 'Onboarding Inicial',
        routeMatch: '/client/dashboard',
        version: 2,
        roles: ['CLIENT_ADMIN', 'ClientAdmin'],
        autoStart: true,
        // context: (ctx) => !ctx.hasEmployees || !ctx.hasServices,
        steps: [
            {
                id: 'welcome',
                selector: '#onb-dashboard-welcome',
                title: 'Bienvenida',
                description: 'Este panel te muestra el estado del negocio y atajos operativos.',
                titleKey: 'onboarding.main.welcome.title',
                descriptionKey: 'onboarding.main.welcome.description',
                shape: 'rounded',
                spotlightPadding: 14
            },
            {
                id: 'business-settings',
                selector: 'a[data-tour="menu-settings"]',
                title: 'Configuración del negocio',
                description: 'Define datos de la barbería, moneda, contacto y ajustes base.',
                titleKey: 'onboarding.main.business_settings.title',
                descriptionKey: 'onboarding.main.business_settings.description',
                shape: 'rounded',
                spotlightPadding: 12
            },
            {
                id: 'add-employee',
                selector: 'a[data-tour="menu-employees"]',
                title: 'Agregar empleado',
                description: 'Crea tu equipo para habilitar agenda, nómina y operación diaria.',
                titleKey: 'onboarding.main.add_employee.title',
                descriptionKey: 'onboarding.main.add_employee.description',
                shape: 'rounded',
                spotlightPadding: 12
            },
            {
                id: 'create-service',
                selector: 'a[data-tour="menu-services"]',
                title: 'Crear servicio',
                description: 'Configura servicios, duración y precio antes de vender.',
                titleKey: 'onboarding.main.create_service.title',
                descriptionKey: 'onboarding.main.create_service.description',
                shape: 'rounded',
                spotlightPadding: 12
            },
            {
                id: 'first-pos-sale',
                selector: 'a[data-tour="menu-pos"]',
                title: 'Registrar venta en POS',
                description: 'Cuando tengas equipo y servicios, usa POS para la primera venta.',
                titleKey: 'onboarding.main.first_pos_sale.title',
                descriptionKey: 'onboarding.main.first_pos_sale.description',
                shape: 'rounded',
                spotlightPadding: 12
            }
        ]
    },
    {
        id: 'onboarding-dashboard-ops',
        name: 'Onboarding Operativo',
        routeMatch: '/client/dashboard',
        version: 2,
        roles: ['CLIENT_STAFF', 'Estilista', 'Manager', 'Cajera'],
        autoStart: true,
        steps: [
            {
                id: 'ops-welcome',
                selector: '#onb-dashboard-welcome',
                title: 'Panel principal',
                description: 'Desde aqui puedes revisar el estado del dia y acceder rapido a las funciones clave.',
                titleKey: 'onboarding.ops.welcome.title',
                descriptionKey: 'onboarding.ops.welcome.description',
                shape: 'rounded',
                spotlightPadding: 14
            },
            {
                id: 'ops-pos',
                selector: 'a[data-tour="menu-pos"]',
                title: 'Ir al POS',
                description: 'Usa este acceso para registrar ventas y cobrar de forma rapida.',
                titleKey: 'onboarding.ops.pos.title',
                descriptionKey: 'onboarding.ops.pos.description',
                shape: 'rounded',
                spotlightPadding: 12
            }
        ]
    },
    {
        id: 'onboarding-pos',
        name: 'Tour POS',
        routeMatch: '/client/pos',
        version: 2,
        roles: ['CLIENT_ADMIN', 'ClientAdmin', 'CLIENT_STAFF', 'Estilista', 'Manager', 'Cajera'],
        autoStart: true,
        steps: [
            {
                id: 'pos-header',
                selector: '#pos-tour-header',
                title: 'Cabecera POS',
                description: 'Controla estado de caja, apertura/cierre y arqueo.',
                titleKey: 'onboarding.pos.header.title',
                descriptionKey: 'onboarding.pos.header.description',
                shape: 'rounded',
                spotlightPadding: 10
            },
            {
                id: 'pos-filters',
                selector: '#pos-tour-filters',
                title: 'Búsqueda y filtros',
                description: 'Filtra productos/servicios para vender más rápido.',
                titleKey: 'onboarding.pos.filters.title',
                descriptionKey: 'onboarding.pos.filters.description',
                shape: 'rounded',
                spotlightPadding: 10
            },
            {
                id: 'pos-summary',
                selector: '#pos-tour-summary',
                title: 'Resumen de venta',
                description: 'Selecciona cliente, empleado y método de pago.',
                titleKey: 'onboarding.pos.summary.title',
                descriptionKey: 'onboarding.pos.summary.description',
                shape: 'rounded',
                spotlightPadding: 12
            },
            {
                id: 'pos-process',
                selector: '#pos-tour-process-btn',
                title: 'Procesar venta',
                description: 'Confirma aquí la transacción cuando la venta esté completa.',
                titleKey: 'onboarding.pos.process.title',
                descriptionKey: 'onboarding.pos.process.description',
                shape: 'rounded',
                spotlightPadding: 10
            }
        ]
    },
    {
        id: 'onboarding-earnings',
        name: 'Tour de Ganancias',
        routeMatch: '/client/payroll',
        version: 2,
        roles: ['CLIENT_ADMIN', 'ClientAdmin', 'Manager'],
        autoStart: true,
        steps: [
            {
                id: 'earnings-header',
                selector: '#onb-earnings-header',
                title: 'Módulo de ganancias',
                description: 'Aquí gestionas periodos, aprobación y pago a empleados.',
                titleKey: 'onboarding.earnings.header.title',
                descriptionKey: 'onboarding.earnings.header.description',
                shape: 'rounded',
                spotlightPadding: 12
            },
            {
                id: 'earnings-periods',
                selector: '#onb-earnings-periods-table',
                title: 'Períodos de nómina',
                description: 'Revisa estado, totales y ejecuta acciones del flujo de pago.',
                titleKey: 'onboarding.earnings.periods.title',
                descriptionKey: 'onboarding.earnings.periods.description',
                shape: 'rounded',
                spotlightPadding: 12
            }
        ]
    }
];
