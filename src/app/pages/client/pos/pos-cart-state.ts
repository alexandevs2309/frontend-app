export interface PosCartItem {
    id: string;
    type: 'service' | 'product';
    item: any;
    employee?: any;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface PosCatalogProjection {
    categorias: any[];
    itemsFiltrados: any[];
}

export function projectCatalogState(
    tipoActivo: 'services' | 'products',
    servicios: any[],
    productos: any[],
    categoriaSeleccionada: string,
    busqueda: string,
    extractCatalogCategories: (items: any[]) => any[],
    filterCatalogItems: (items: any[], tipo: 'services' | 'products', categoria: string, busqueda: string) => any[]
): PosCatalogProjection {
    const items = tipoActivo === 'services' ? servicios : productos;
    return {
        categorias: extractCatalogCategories(items),
        itemsFiltrados: filterCatalogItems(items, tipoActivo, categoriaSeleccionada, busqueda)
    };
}

export function findCartItemIndex(
    cart: PosCartItem[],
    item: any,
    tipoActivo: 'services' | 'products'
): number {
    const targetType = tipoActivo === 'services' ? 'service' : 'product';
    return cart.findIndex(cartItem => cartItem.item.id === item.id && cartItem.type === targetType);
}

export function createCartItem(item: any, tipoActivo: 'services' | 'products'): PosCartItem {
    return {
        id: `${tipoActivo}-${item.id}-${Date.now()}`,
        type: tipoActivo === 'services' ? 'service' : 'product',
        item,
        quantity: 1,
        price: Number(item.price) || 0,
        subtotal: Number(item.price) || 0
    };
}

export function updateCartQuantity(
    cart: PosCartItem[],
    index: number,
    change: number
): { cart: PosCartItem[]; warning?: string } {
    const nextCart = [...cart];
    const currentItem = nextCart[index];

    if (!currentItem) {
        return { cart };
    }

    const nextQuantity = currentItem.quantity + change;
    if (nextQuantity <= 0) {
        return { cart: nextCart.filter((_, itemIndex) => itemIndex !== index) };
    }

    if (currentItem.type === 'product' && nextQuantity > (Number(currentItem.item.stock) || 0)) {
        return {
            cart,
            warning: `Solo hay ${currentItem.item.stock} unidades disponibles`
        };
    }

    nextCart[index] = {
        ...currentItem,
        quantity: nextQuantity,
        subtotal: currentItem.price * nextQuantity
    };

    return { cart: nextCart };
}

export function removeCartItem(cart: PosCartItem[], index: number): PosCartItem[] {
    return cart.filter((_, itemIndex) => itemIndex !== index);
}

export function getAvailableStock(cart: PosCartItem[], item: any): number {
    const quantityInCart = cart
        .filter(cartItem => cartItem.item.id === item.id && cartItem.type === 'product')
        .reduce((total, cartItem) => total + cartItem.quantity, 0);

    return Math.max(0, (Number(item.stock) || 0) - quantityInCart);
}

export function cartHasServices(cart: PosCartItem[]): boolean {
    return cart.some(item => item.type === 'service');
}
