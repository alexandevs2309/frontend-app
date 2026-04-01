import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CreateSaleDto, SaleWithDetailsDto } from '../../../core/dto/sale.dto';
import { PosService } from '../../../core/services/pos/pos.service';
import { buildCreateSalePayload, buildSalePayments } from './pos-sale-builder';
import { PosCartItem } from './pos-cart-state';

export class PosStockValidationError extends Error {
    constructor(public readonly messages: string[]) {
        super(messages.join('\n'));
        this.name = 'PosStockValidationError';
    }
}

export interface PosSaleExecutionInput {
    cart: PosCartItem[];
    clientId?: number;
    employeeId?: number;
    paymentMethod: 'cash' | 'card' | 'transfer' | 'mixed';
    discountAmount: number;
    discountReason?: string;
    total: number;
    mixedPayments: any[];
    mapCartItemToSaleDetail: (item: PosCartItem) => any;
}

@Injectable({
    providedIn: 'root'
})
export class PosSaleFlowService {
    constructor(private readonly posService: PosService) {}

    async validateStock(cart: PosCartItem[]): Promise<void> {
        const productosEnCarrito = cart
            .filter(item => item.type === 'product')
            .map(item => ({
                id: item.item.id,
                type: 'product',
                quantity: item.quantity
            }));

        if (productosEnCarrito.length === 0) {
            return;
        }

        try {
            await firstValueFrom(this.posService.validateStock(productosEnCarrito));
        } catch (error: any) {
            const messages = Array.isArray(error?.error?.errors)
                ? error.error.errors.map((entry: any) => entry.message).filter(Boolean)
                : [];

            if (messages.length > 0) {
                throw new PosStockValidationError(messages);
            }

            throw error;
        }
    }

    async createSale(input: PosSaleExecutionInput): Promise<SaleWithDetailsDto> {
        const payments = buildSalePayments(input.paymentMethod, input.total, input.mixedPayments);
        const ventaData: CreateSaleDto = buildCreateSalePayload({
            clientId: input.clientId,
            employeeId: input.employeeId,
            paymentMethod: input.paymentMethod,
            discountAmount: input.discountAmount,
            discountReason: input.discountReason,
            total: input.total,
            details: input.cart.map(item => input.mapCartItemToSaleDetail(item)),
            payments
        });

        return firstValueFrom(this.posService.createSale(ventaData)) as Promise<any>;
    }

    getErrorMessage(error: any): string {
        return (
            error?.error?.detail ||
            error?.error?.message ||
            (Array.isArray(error?.error) ? error.error.join(' ') : null) ||
            (typeof error?.error === 'string' ? error.error : null) ||
            error?.message ||
            'Error al procesar la venta'
        );
    }
}
