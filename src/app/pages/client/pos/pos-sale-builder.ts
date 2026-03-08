import { CreateSaleDto } from '../../../core/dto/sale.dto';

export type PosPaymentMethod = 'cash' | 'card' | 'transfer' | 'mixed' | '';
export type DiscountType = '$' | '%';

export interface SaleValidationInput {
    cartLength: number;
    isCashRegisterOpen: boolean;
    paymentMethod: PosPaymentMethod;
    hasServices: boolean;
    selectedEmployeeId?: number | null;
    total: number;
}

export interface DiscountContextInput {
    subtotal: number;
    discountValue: number;
    discountType: DiscountType;
    discountLimit: number;
}

export interface DiscountContextResult {
    discountAmount: number;
    discountPercent: number;
    requiresReason: boolean;
}

export interface MixedPaymentInput {
    metodo: 'cash' | 'card' | 'transfer';
    monto: number | string;
}

export interface SalePayment {
    method: 'cash' | 'card' | 'transfer' | 'mixed';
    amount: number;
}

export interface SalePayloadInput {
    clientId?: number;
    employeeId?: number;
    paymentMethod: 'cash' | 'card' | 'transfer' | 'mixed';
    discountAmount: number;
    discountReason?: string;
    total: number;
    details: any[];
    payments: SalePayment[];
}

export function getSaleValidationMessage(input: SaleValidationInput): string {
    if (input.cartLength === 0) return 'Agregue items al carrito';
    if (!input.isCashRegisterOpen) return 'Debe abrir la caja registradora';
    if (!input.paymentMethod) return 'Seleccione un método de pago';
    if (input.hasServices && !input.selectedEmployeeId) return 'Seleccione un empleado para los servicios';
    if (input.total <= 0) return 'El total debe ser mayor a cero';
    return '';
}

export function getDiscountContext(input: DiscountContextInput): DiscountContextResult {
    const discountAmount = input.discountType === '%'
        ? input.subtotal * (input.discountValue / 100)
        : input.discountValue;

    const discountPercent = input.subtotal > 0
        ? (discountAmount / input.subtotal) * 100
        : 0;

    return {
        discountAmount,
        discountPercent,
        requiresReason: discountPercent > input.discountLimit
    };
}

export function buildSalePayments(
    paymentMethod: 'cash' | 'card' | 'transfer' | 'mixed',
    total: number,
    mixedPayments: MixedPaymentInput[]
): SalePayment[] {
    if (paymentMethod === 'mixed' && mixedPayments.length > 0) {
        return mixedPayments.map((payment) => ({
            method: payment.metodo,
            amount: Number(payment.monto)
        }));
    }

    return [{
        method: paymentMethod,
        amount: total
    }];
}

export function buildCreateSalePayload(input: SalePayloadInput): CreateSaleDto {
    return {
        client: input.clientId || undefined,
        employee_id: input.employeeId ?? undefined,
        payment_method: input.paymentMethod,
        discount: input.discountAmount,
        discount_reason: input.discountReason,
        total: input.total,
        paid: input.total,
        details: input.details,
        payments: input.payments
    };
}
