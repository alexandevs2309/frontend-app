/**
 * Environment - Production
 * 
 * SEGURIDAD:
 * - URLs deben configurarse en build time o runtime
 * - NO hardcodear URLs de producción
 * - Usar variables de entorno del CI/CD
 * 
 * CONFIGURACIÓN:
 * - Vercel: Variables de entorno en dashboard
 * - Docker: Variables en docker-compose.yml
 * - Kubernetes: ConfigMap/Secrets
 */
export const environment = {
  production: true,
  
  // ✅ URLs desde variables de entorno (configuradas en build)
  apiUrl: (window as any).__env?.apiUrl || 'https://api.auron-suite.com/api',
  wsUrl: (window as any).__env?.wsUrl || 'wss://api.auron-suite.com/ws',
  stripePublishableKey: (window as any).__env?.stripePublishableKey || 'pk_test_1234567890abcdef',
  
  appName: 'Auron-Suite',
  appVersion: '1.0.0',
  
  // ✅ Feature flags para producción
  enableDebugMode: false,
  enableMockData: false,
  
  // ✅ Configuración de seguridad
  csrfCookieName: 'csrftoken',
  sessionCookieName: 'sessionid'
};
