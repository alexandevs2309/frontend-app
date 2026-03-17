/**
 * Environment - Development
 * 
 * SEGURIDAD:
 * - NO usar en producción
 * - URLs localhost solo para desarrollo local
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost/api',
  wsUrl: 'ws://localhost/ws',
  stripePublishableKey: 'pk_test_51T9DZbEfe5r0fZX5FxL0HVAvfmOInVQ53Xq4PscyrwrywPhGLUE6LLujgXUSUbVvzuUAhPh9llFqMhON4jH1RF0Q00jcNqHvOn',
  appName: 'Auron-Suite',
  appVersion: '1.0.0',
  
  // ✅ Feature flags para desarrollo
  enableDebugMode: true,
  enableMockData: false
};
