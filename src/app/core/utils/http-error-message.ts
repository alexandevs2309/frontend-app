export function getHttpErrorMessage(error: any, fallbackMessage: string): string {
    const status = error?.status;
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
