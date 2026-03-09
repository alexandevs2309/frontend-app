export function roleKey(role: string | null | undefined): string {
    const raw = (role || '').trim();
    if (!raw) return '';

    // Normalize camelCase/PascalCase role names like "SuperAdmin" -> "SUPER_ADMIN"
    return raw
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .toUpperCase()
        .replace(/[\s-]+/g, '_');
}

export function normalizeRole(role: string | null | undefined): string {
    const key = roleKey(role);
    const roleMap: Record<string, string> = {
        SUPERADMIN: 'SUPER_ADMIN',
        SUPER_ADMIN: 'SUPER_ADMIN',
        CLIENTADMIN: 'CLIENT_ADMIN',
        CLIENT_ADMIN: 'CLIENT_ADMIN',
        CLIENTSTAFF: 'CLIENT_STAFF',
        CLIENT_STAFF: 'CLIENT_STAFF',
        CAJERA: 'Cajera',
        ESTILISTA: 'Estilista',
        MANAGER: 'Manager'
    };

    return roleMap[key] || (role || '').trim();
}
