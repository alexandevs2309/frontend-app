import {
    cartHasServices,
    createCartItem,
    findCartItemIndex,
    getAvailableStock,
    projectCatalogState,
    removeCartItem,
    updateCartQuantity
} from './pos-cart-state';

describe('pos-cart-state', () => {
    it('should project categories and filtered items from the active catalog', () => {
        const servicios = [{ id: 1, category: 'corte', name: 'Corte clasico' }];
        const productos = [{ id: 2, category: 'gel', name: 'Gel premium' }];

        const projection = projectCatalogState(
            'services',
            servicios,
            productos,
            'corte',
            'Corte',
            (items) => items.map(item => item.category),
            (items, _tipo, categoria, busqueda) => items.filter(item => item.category === categoria && item.name.includes(busqueda))
        );

        expect(projection.categorias).toEqual(['corte']);
        expect(projection.itemsFiltrados).toEqual([servicios[0]]);
    });

    it('should find an existing cart item and update quantity safely', () => {
        const product = { id: 10, price: 250, stock: 3, name: 'Pomada' };
        const cart = [createCartItem(product, 'products')];

        const index = findCartItemIndex(cart, product, 'products');
        const updated = updateCartQuantity(cart, index, 1);

        expect(index).toBe(0);
        expect(updated.warning).toBeUndefined();
        expect(updated.cart[0].quantity).toBe(2);
        expect(updated.cart[0].subtotal).toBe(500);
    });

    it('should warn instead of exceeding product stock', () => {
        const product = { id: 11, price: 100, stock: 1, name: 'Shampoo' };
        const cart = [createCartItem(product, 'products')];

        const updated = updateCartQuantity(cart, 0, 1);

        expect(updated.cart).toEqual(cart);
        expect(updated.warning).toContain('Solo hay 1 unidades disponibles');
    });

    it('should calculate available stock and remove items correctly', () => {
        const product = { id: 12, price: 50, stock: 5, name: 'Cera' };
        const first = createCartItem(product, 'products');
        const second = { ...createCartItem(product, 'products'), quantity: 2, subtotal: 100 };
        const cart = [first, second];

        expect(getAvailableStock(cart, product)).toBe(2);
        expect(removeCartItem(cart, 0)).toEqual([second]);
    });

    it('should detect when the cart contains services', () => {
        const service = createCartItem({ id: 20, price: 300, name: 'Lavado' }, 'services');
        const product = createCartItem({ id: 21, price: 80, stock: 2, name: 'Gel' }, 'products');

        expect(cartHasServices([product])).toBeFalse();
        expect(cartHasServices([product, service])).toBeTrue();
    });
});
