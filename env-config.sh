#!/bin/bash
# env-config.sh - Inyecta variables de entorno en runtime
# 
# USO:
# 1. Configurar variables en CI/CD (Vercel, Docker, K8s)
# 2. Ejecutar este script antes de servir la app
# 3. Variables disponibles en window.__env

cat <<EOF > /usr/share/nginx/html/assets/env-config.js
window.__env = {
  apiUrl: '${API_URL:-https://api.auron-suite.com/api}',
  wsUrl: '${WS_URL:-wss://api.auron-suite.com/ws}'
};
EOF

echo "✅ Environment variables injected"
