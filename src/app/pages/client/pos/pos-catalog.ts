export type PosCatalogTab = 'services' | 'products';

export interface PosCatalogCacheData {
    servicios: any[];
    productos: any[];
    clientes: any[];
    empleados: any[];
    clientesFrecuentes: any[];
}

export interface PosCatalogLoadResult extends PosCatalogCacheData {
    accessLimited: boolean;
}

export interface PosCatalogLoadFetchers {
    getServices: () => Promise<any>;
    getServiceCategories?: () => Promise<any>;
    getProducts: () => Promise<any>;
    getClients: () => Promise<any>;
    getEmployees: () => Promise<any>;
}

export function normalizeArrayResponse<T>(response: any): T[] {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.results && Array.isArray(response.results)) return response.results;
    return [];
}

export function isForbiddenStatus(error: any): boolean {
    return error?.status === 403;
}

export function getCachedPosCatalog(
    cache: Map<string, { data: any; timestamp: number }>,
    cacheKey: string,
    cacheDuration: number
): PosCatalogCacheData | null {
    const cached = cache.get(cacheKey);
    if (!cached) return null;
    if (Date.now() - cached.timestamp >= cacheDuration) return null;
    return cached.data as PosCatalogCacheData;
}

export function setCachedPosCatalog(
    cache: Map<string, { data: any; timestamp: number }>,
    cacheKey: string,
    data: PosCatalogCacheData
): void {
    cache.set(cacheKey, {
        data,
        timestamp: Date.now()
    });
}

export async function loadPosCatalogData(fetchers: PosCatalogLoadFetchers): Promise<PosCatalogLoadResult> {
    let accessLimited = false;

    const serviceCategories = await loadWithAccessControl(
        async () => (fetchers.getServiceCategories ? fetchers.getServiceCategories() : []),
        (response) => normalizeArrayResponse<any>(response),
        () => { accessLimited = true; }
    );
    const serviceCategoryMap = new Map<number, string>(
        serviceCategories
            .filter((category: any) => category && category.id != null)
            .map((category: any) => [Number(category.id), String(category.name || '').trim()])
    );

    const servicesRaw = await loadWithAccessControl(
        fetchers.getServices,
        (response) => normalizeArrayResponse<any>(response).filter((service: any) => service.is_active !== false),
        () => { accessLimited = true; }
    );
    const services = mapServicesWithCategories(servicesRaw, serviceCategoryMap);

    const products = await loadWithAccessControl(
        fetchers.getProducts,
        (response) => normalizeArrayResponse<any>(response).filter(
            (product: any) => product.is_active && (product.stock > 0 || product.stock === undefined)
        ),
        () => { accessLimited = true; }
    );

    const clients = await loadWithAccessControl(
        fetchers.getClients,
        (response) => normalizeArrayResponse<any>(response).filter((client: any) => client.is_active !== false),
        () => { accessLimited = true; }
    );

    const employees = await loadWithAccessControl(
        fetchers.getEmployees,
        (response) => normalizeArrayResponse<any>(response)
            .filter((employee: any) => employee.is_active && ['Estilista', 'Utility'].includes(employee.user?.role))
            .map((employee: any) => ({
                ...employee,
                displayName: `${employee.user?.full_name || employee.full_name || employee.name || `Empleado ${employee.id}`} (${employee.user?.role || 'Sin rol'})`
            })),
        () => { accessLimited = true; }
    );

    const clientesFrecuentes = clients.filter((client: any) => (client.total_purchases || 0) > 5);

    return {
        servicios: services,
        productos: products,
        clientes: clients,
        empleados: employees,
        clientesFrecuentes,
        accessLimited
    };
}

function mapServicesWithCategories(services: any[], serviceCategoryMap: Map<number, string>): any[] {
    return services.map((service: any) => {
        const categoryIds: number[] = Array.isArray(service?.categories)
            ? service.categories.map((id: any) => Number(id)).filter((id: number) => !Number.isNaN(id))
            : [];
        const categoryNames = categoryIds
            .map((id: number) => serviceCategoryMap.get(id))
            .filter((name: string | undefined): name is string => Boolean(name && name.trim()));

        const fallbackCategory = resolveCategoryName(service);
        const normalizedCategoryNames = categoryNames.length > 0
            ? categoryNames
            : (fallbackCategory ? [fallbackCategory] : []);

        return {
            ...service,
            category_names: normalizedCategoryNames,
            category: normalizedCategoryNames[0] || fallbackCategory || ''
        };
    });
}

export function extractCatalogCategories(items: any[]): any[] {
    const uniqueCategories = [...new Set(items.map((item) => resolveCategoryName(item)).filter(Boolean))];
    return [
        { name: 'Todas', value: '' },
        ...uniqueCategories.map((category) => ({ name: category, value: category }))
    ];
}

export function filterCatalogItems(
    items: any[],
    tab: PosCatalogTab,
    selectedCategory: string,
    search: string
): any[] {
    let result = [...items];

    if (selectedCategory) {
        result = result.filter((item) => {
            const itemCategory = resolveCategoryName(item) || 'General';
            return itemCategory === selectedCategory;
        });
    }

    if (search.trim()) {
        const searchTerm = search.toLowerCase().trim();
        result = result.filter((item) =>
            item.name.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm))
        );
    }

    if (tab === 'products') {
        result = result.filter((item) => item.stock > 0);
    }

    return result;
}

function resolveCategoryName(item: any): string {
    if (!item) return '';

    if (Array.isArray(item.category_names) && item.category_names.length > 0) {
        const firstCategory = item.category_names[0];
        if (typeof firstCategory === 'string') return firstCategory.trim();
    }
    if (typeof item.category === 'string') return item.category.trim();
    if (item.category && typeof item.category.name === 'string') return item.category.name.trim();
    if (typeof item.category_name === 'string') return item.category_name.trim();
    if (typeof item.category_display === 'string') return item.category_display.trim();

    return '';
}

async function loadWithAccessControl(
    loader: () => Promise<any>,
    transform: (response: any) => any[],
    onAccessLimited: () => void
): Promise<any[]> {
    try {
        const response = await loader();
        return transform(response);
    } catch (error) {
        if (!isForbiddenStatus(error)) {
            throw error;
        }
        onAccessLimited();
        return [];
    }
}
