/**
 * Environment - Development
 * 
 * Conectado temporalmente al backend remoto de Render para evitar
 * que el frontend local siga intentando llamar a localhost.
 */
export const environment = {
  production: false,
  apiUrl: 'https://api-peluqueria-p25h.onrender.com/api',
  wsUrl: 'wss://api-peluqueria-p25h.onrender.com/ws',
  stripePublishableKey: 'pk_test_51T9DZbEfe5r0fZX5FxL0HVAvfmOInVQ53Xq4PscyrwrywPhGLUE6LLujgXUSUbVvzuUAhPh9llFqMhON4jH1RF0Q00jcNqHvOn',
  appName: 'Auron-Suite',
  appVersion: '1.0.0',
  
  enableDebugMode: true,
  enableMockData: false,

  csrfCookieName: 'csrftoken',
  sessionCookieName: 'sessionid'
};
