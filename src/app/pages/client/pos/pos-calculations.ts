export type DiscountType = '$' | '%';

export interface CartItemAmount {
    subtotal?: number | string;
}

export interface MixedPaymentAmount {
    monto?: number | string;
}

export function calculateCartSubtotal(items: CartItemAmount[]): number {
    return items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
}

export function calculateDiscountAmount(subtotal: number, discountValue: number, discountType: DiscountType): number {
    if (discountType === '%') {
        return subtotal * (discountValue / 100);
    }
    return discountValue;
}

export function calculateTotalFromDiscount(subtotal: number, discountValue: number, discountType: DiscountType): number {
    const discountAmount = calculateDiscountAmount(subtotal, discountValue, discountType);
    return Math.max(0, subtotal - discountAmount);
}

export function calculateMixedPaymentsTotal(payments: MixedPaymentAmount[]): number {
    return payments.reduce((sum, payment) => sum + (Number(payment.monto) || 0), 0);
}

export function isMixedPaymentBalanced(totalPayments: number, totalSale: number): boolean {
    return Math.abs(totalPayments - totalSale) < 0.01;
}

export function getMixedPaymentMessage(totalPayments: number, totalSale: number): string {
    const difference = totalSale - totalPayments;
    if (difference > 0.01) {
        return `Falta agregar $${difference.toFixed(2)}`;
    }
    if (difference < -0.01) {
        return `Sobra $${Math.abs(difference).toFixed(2)}`;
    }
    return 'Total correcto';
}
