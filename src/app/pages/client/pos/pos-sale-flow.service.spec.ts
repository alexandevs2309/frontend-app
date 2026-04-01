import { of, throwError } from 'rxjs';
import { PosService } from '../../../core/services/pos/pos.service';
import { createCartItem } from './pos-cart-state';
import { PosSaleFlowService, PosStockValidationError } from './pos-sale-flow.service';

describe('PosSaleFlowService', () => {
    let service: PosSaleFlowService;
    let posServiceSpy: jasmine.SpyObj<PosService>;

    beforeEach(() => {
        posServiceSpy = jasmine.createSpyObj<PosService>('PosService', ['validateStock', 'createSale']);
        service = new PosSaleFlowService(posServiceSpy);
    });

    it('should skip stock validation when the cart has no products', async () => {
        const serviceItem = createCartItem({ id: 1, price: 500, name: 'Corte' }, 'services');

        await service.validateStock([serviceItem]);

        expect(posServiceSpy.validateStock).not.toHaveBeenCalled();
    });

    it('should call stock validation with product quantities', async () => {
        const product = createCartItem({ id: 2, price: 120, stock: 4, name: 'Shampoo' }, 'products');
        product.quantity = 2;
        posServiceSpy.validateStock.and.returnValue(of({ ok: true }));

        await service.validateStock([product]);

        expect(posServiceSpy.validateStock).toHaveBeenCalledWith([
            { id: 2, type: 'product', quantity: 2 }
        ]);
    });

    it('should raise a domain error when backend reports stock issues', async () => {
        const product = createCartItem({ id: 3, price: 120, stock: 1, name: 'Cera' }, 'products');
        posServiceSpy.validateStock.and.returnValue(throwError(() => ({
            error: {
                errors: [
                    { message: 'Stock insuficiente para Cera' }
                ]
            }
        })));

        await expectAsync(service.validateStock([product])).toBeRejectedWith(jasmine.any(PosStockValidationError));
    });

    it('should build and submit a sale payload through the API', async () => {
        const product = createCartItem({ id: 4, price: 200, stock: 3, name: 'Aceite' }, 'products');
        const backendSale = { id: 99, total: 200, details: [], payments: [], discount: 0, paid: 200 };
        posServiceSpy.createSale.and.returnValue(of(backendSale as any));

        const result = await service.createSale({
            cart: [product],
            clientId: 10,
            employeeId: 20,
            paymentMethod: 'cash',
            discountAmount: 0,
            total: 200,
            mixedPayments: [],
            mapCartItemToSaleDetail: (item) => ({
                content_type: item.type,
                object_id: item.item.id,
                name: item.item.name,
                quantity: item.quantity,
                price: item.price
            })
        });

        expect(posServiceSpy.createSale).toHaveBeenCalled();
        expect(result).toEqual(backendSale as any);
    });

    it('should normalize API errors into readable messages', () => {
        expect(service.getErrorMessage({ error: { detail: 'Fallo de venta' } })).toBe('Fallo de venta');
        expect(service.getErrorMessage({ error: ['uno', 'dos'] })).toBe('uno dos');
        expect(service.getErrorMessage({ message: 'Error genérico' })).toBe('Error genérico');
    });
});
