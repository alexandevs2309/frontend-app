export function getHttpErrorMessage(error: any, fallbackMessage: string): string {
    const status = error?.status;
    const backendCode = error?.error?.code;
    const backendReason = error?.error?.reason;
    const backendDetail =
        error?.error?.detail ||
        error?.error?.message ||
        error?.error?.error;

    if (status === 0) {
        return 'No hay conexion con el servidor. Verifica tu internet o que el API este en linea.';
    }

    if (status >= 500) {
        return 'El servidor no esta disponible en este momento. Intenta nuevamente en unos minutos.';
    }

    if (status === 429) {
        return 'Demasiados intentos. Espera un momento e intenta otra vez.';
    }

    if (status === 401) {
        return backendDetail || 'Credenciales invalidas.';
    }

    if (status === 403) {
        if (backendCode === 'TENANT_INACTIVE') {
            if (backendReason === 'trial_expired') {
                return 'El periodo de prueba de tu empresa ha expirado. Contacta al soporte o al administrador del SaaS.';
            }

            if (backendReason === 'paid_access_expired') {
                return 'El acceso de pago de tu empresa ha expirado. Contacta al soporte o al administrador del SaaS.';
            }

            if (backendReason === 'tenant_suspended') {
                return 'La cuenta de tu empresa esta suspendida. Contacta al soporte o al administrador del SaaS.';
            }

            if (backendReason === 'tenant_deleted') {
                return 'La cuenta de tu empresa fue desactivada. Contacta al soporte o al administrador del SaaS.';
            }

            return 'La cuenta de tu empresa esta inactiva. Contacta al soporte o al administrador del SaaS.';
        }

        return backendDetail || 'No tienes permisos para realizar esta accion.';
    }

    if (status === 404) {
        return backendDetail || 'No se encontro el recurso solicitado.';
    }

    if (status === 402) {
        return backendDetail || 'Se requiere una suscripcion activa para continuar.';
    }

    return backendDetail || fallbackMessage;
}
