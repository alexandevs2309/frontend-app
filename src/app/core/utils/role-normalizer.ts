export function roleKey(role: string | null | undefined): string {
    return (role || '')
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, '_');
}

export function normalizeRole(role: string | null | undefined): string {
    const key = roleKey(role);
    const roleMap: Record<string, string> = {
        SUPER_ADMIN: 'SUPER_ADMIN',
        CLIENT_ADMIN: 'CLIENT_ADMIN',
        CLIENT_STAFF: 'CLIENT_STAFF',
        CAJERA: 'Cajera',
        ESTILISTA: 'Estilista',
        MANAGER: 'Manager'
    };

    return roleMap[key] || (role || '').trim();
}
