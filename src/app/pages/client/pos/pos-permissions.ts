export const POS_ROLE_GROUPS = {
    usePos: ['MANAGER', 'CAJERA', 'CLIENT_ADMIN', 'SUPER_ADMIN', 'CLIENT_STAFF', 'ESTILISTA', 'UTILITY'],
    openCash: ['MANAGER', 'CAJERA', 'CLIENT_ADMIN', 'SUPER_ADMIN'],
    closeCash: ['MANAGER', 'CLIENT_ADMIN', 'SUPER_ADMIN'],
    highDiscount: ['MANAGER', 'CLIENT_ADMIN', 'SUPER_ADMIN'],
    history: ['MANAGER', 'CAJERA', 'CLIENT_ADMIN', 'SUPER_ADMIN'],
    refund: ['MANAGER', 'CLIENT_ADMIN', 'SUPER_ADMIN']
} as const;

const roleMap: Record<string, string> = {
    SuperAdmin: 'SUPER_ADMIN',
    'Super-Admin': 'SUPER_ADMIN',
    'Client-Admin': 'CLIENT_ADMIN',
    'Client-Staff': 'CLIENT_STAFF',
    Manager: 'MANAGER',
    Cajera: 'CAJERA',
    Estilista: 'ESTILISTA',
    Utility: 'UTILITY'
};

export function normalizePosRole(role: string): string {
    const normalized = (role || '').trim();
    const mapped = roleMap[normalized] || normalized;
    return mapped.toUpperCase();
}

export function hasRolePermission(role: string, allowedRoles: readonly string[]): boolean {
    return allowedRoles.includes(normalizePosRole(role));
}

export function canRefundSaleByContent(venta: any): boolean {
    if (!venta || Number(venta.total) <= 0) return false;
    if (!Array.isArray(venta.details) || venta.details.length === 0) return false;

    return venta.details.every((detail: any) => {
        const itemType = String(detail?.item_type || '').toLowerCase();
        const contentType = String(detail?.content_type || '').toLowerCase();
        return itemType === 'product' || contentType === 'product';
    });
}
