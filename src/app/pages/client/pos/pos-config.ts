const DEFAULT_BUSINESS_NAME = 'Barbería';
const DEFAULT_ADDRESS = 'Dirección no configurada';
const DEFAULT_PHONE = 'Teléfono no configurado';

export interface PosConfigModel {
    business_name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logo_url: string;
}

export interface PosUserIdentity {
    nombreUsuarioActual: string;
    rolUsuarioActual: string;
}

export function getBusinessNameFromTenantStorage(): string {
    try {
        const tenantStr = localStorage.getItem('tenant');
        if (!tenantStr) return DEFAULT_BUSINESS_NAME;
        const tenant = JSON.parse(tenantStr);
        return tenant?.name || DEFAULT_BUSINESS_NAME;
    } catch {
        return DEFAULT_BUSINESS_NAME;
    }
}

export function getCurrentUserIdentity(): PosUserIdentity {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return { nombreUsuarioActual: 'Cajero', rolUsuarioActual: '' };
        const userData = JSON.parse(userStr);
        return {
            nombreUsuarioActual: userData?.full_name || userData?.email || 'Cajero',
            rolUsuarioActual: userData?.role || ''
        };
    } catch {
        return { nombreUsuarioActual: 'Cajero', rolUsuarioActual: '' };
    }
}

export function toAbsoluteMediaUrl(apiUrl: string, url: string): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const apiOrigin = new URL(apiUrl).origin;
    return url.startsWith('/') ? `${apiOrigin}${url}` : `${apiOrigin}/${url}`;
}

export function buildDefaultPosConfig(businessName: string): PosConfigModel {
    return {
        business_name: businessName || DEFAULT_BUSINESS_NAME,
        address: DEFAULT_ADDRESS,
        phone: DEFAULT_PHONE,
        email: '',
        website: '',
        logo_url: ''
    };
}

export function buildPosConfigFromSettings(settings: any, fallbackBusinessName: string, apiUrl: string): PosConfigModel {
    return {
        business_name: settings?.pos_config?.business_name || fallbackBusinessName,
        address: settings?.pos_config?.address || DEFAULT_ADDRESS,
        phone: settings?.pos_config?.phone || DEFAULT_PHONE,
        email: settings?.pos_config?.email || '',
        website: settings?.pos_config?.website || '',
        logo_url: settings?.logo ? toAbsoluteMediaUrl(apiUrl, settings.logo) : ''
    };
}
