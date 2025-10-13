import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  BASE_URL: environment.apiUrl,
  WS_URL: environment.wsUrl,
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/auth/login/',
      LOGOUT: '/auth/logout/',
      REGISTER: '/auth/register/',
      CHANGE_PASSWORD: '/auth/change-password/',
      RESET_PASSWORD: '/auth/reset-password/',
      RESET_PASSWORD_CONFIRM: '/auth/reset-password-confirm/',
      ACTIVE_SESSIONS: '/auth/active-sessions/',
      TERMINATE_SESSION: '/auth/session/',
      VERIFY_EMAIL: '/auth/verify-email/',
      MFA_SETUP: '/auth/mfa/setup/',
      MFA_VERIFY: '/auth/mfa/verify/',
      MFA_LOGIN_VERIFY: '/auth/mfa/login-verify/',
      PERMISSIONS: '/auth/permissions/',
      USERS: '/auth/users/'
    },
    
    // Tenants
    TENANTS: '/tenants/',
    ADMIN_USERS: '/tenants/admin/users/',
    
    // Subscriptions
    SUBSCRIPTIONS: {
      PLANS: '/subscriptions/plans/',
      USER_SUBSCRIPTIONS: '/subscriptions/user-subscriptions/',
      AUDIT_LOGS: '/subscriptions/audit-logs/',
      MY_ACTIVE: '/subscriptions/me/active/',
      MY_ENTITLEMENTS: '/subscriptions/me/entitlements/',
      REGISTER: '/subscriptions/register/',
      ONBOARD: '/subscriptions/onboard/'
    },
    
    // Employees
    EMPLOYEES: {
      BASE: '/employees/employees/',
      SCHEDULES: '/employees/schedules/',
      EARNINGS: '/employees/earnings/',
      FORTNIGHT_SUMMARIES: '/employees/fortnight-summaries/',
      CURRENT_FORTNIGHT: '/employees/earnings/current_fortnight/',
      MY_EARNINGS: '/employees/earnings/my_earnings/'
    },
    
    // Appointments
    APPOINTMENTS: {
      BASE: '/appointments/appointments/',
      TEST: '/appointments/test/'
    },
    
    // Clients
    CLIENTS: '/clients/clients/',
    
    // Services
    SERVICES: '/services/services/',
    
    // POS
    POS: {
      SALES: '/pos/sales/',
      CASH_REGISTERS: '/pos/cashregisters/',
      DAILY_SUMMARY: '/pos/summary/daily/',
      DASHBOARD_STATS: '/pos/dashboard/stats/',
      ACTIVE_PROMOTIONS: '/pos/promotions/active/',
      CATEGORIES: '/pos/categories/',
      CONFIG: '/pos/config/',
      MY_EARNINGS: '/pos/earnings/my_earnings/',
      CURRENT_FORTNIGHT: '/pos/earnings/current_fortnight/'
    },
    
    // Inventory
    INVENTORY: {
      PRODUCTS: '/inventory/products/',
      SUPPLIERS: '/inventory/suppliers/',
      STOCK_MOVEMENTS: '/inventory/stock-movements/',
      LOW_STOCK_ALERTS: '/inventory/alerts/low-stock/',
      CATEGORIES: '/inventory/categories/',
      LOW_STOCK_PRODUCTS: '/inventory/products/low-stock/'
    },
    
    // Reports
    REPORTS: '/reports/',
    ADMIN_REPORTS: '/reports/admin/',
    
    // Billing
    BILLING: '/billing/',
    BILLING_ADMIN_STATS: '/billing/admin/stats/',
    
    // Payments
    PAYMENTS: '/payments/',
    
    // Settings
    SETTINGS: {
      BASE: '/settings/',
      SYSTEM: '/system-settings/',
      SYSTEM_RESET: '/system-settings/reset/',
      TEST_EMAIL: '/settings/test-email/',
      TEST_PAYMENT: '/settings/test-payment/',
      
      // SuperAdmin endpoints
      ADMIN_METRICS: '/settings/admin/metrics/',
      ADMIN_SYSTEM_MONITOR: '/settings/admin/system-monitor/',
      ADMIN_TEST_SERVICE: '/settings/admin/test-service/'
    },
    
    // Roles
    ROLES: '/roles/',
    
    // Audit
    AUDIT: '/audit/',
    
    // Notifications
    NOTIFICATIONS: '/notifications/notifications/',
    
    // Compatibility endpoints
    COMPATIBILITY: {
      USERS_AVAILABLE_FOR_EMPLOYEE: '/users/available-for-employee/',
      PRODUCTS_LOW_STOCK: '/inventory/products/low-stock/'
    },
    
    // System
    SYSTEM: {
      HEALTH: '/healthz/',
      SENTRY_TEST: '/sentry-test/',
      SCHEMA: '/schema/',
      DOCS: '/docs/'
    }
  }
};

export const HTTP_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};