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
  apiUrl: (window as any).__env?.apiUrl || 'https://api-peluqueria-p25h.onrender.com/api',
  wsUrl: (window as any).__env?.wsUrl || 'wss://api-peluqueria-p25h.onrender.com/ws',
  stripePublishableKey: (window as any).__env?.stripePublishableKey || 'pk_test_51T9DZbEfe5r0fZX5FxL0HVAvfmOInVQ53Xq4PscyrwrywPhGLUE6LLujgXUSUbVvzuUAhPh9llFqMhON4jH1RF0Q00jcNqHvOn',
  
  appName: 'Auron-Suite',
  appVersion: '1.0.0',
  
  // ✅ Feature flags para producción
  enableDebugMode: false,
  enableMockData: false,
  
  // ✅ Configuración de seguridad
  csrfCookieName: 'csrftoken',
  sessionCookieName: 'sessionid'
};
