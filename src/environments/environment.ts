/**
 * Environment - Development
 * 
 * SEGURIDAD:
 * - NO usar en producción
 * - URLs localhost solo para desarrollo local
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  wsUrl: 'ws://localhost:8000/ws',
  appName: 'Auron-Suite',
  appVersion: '1.0.0',
  
  // ✅ Feature flags para desarrollo
  enableDebugMode: true,
  enableMockData: false
};