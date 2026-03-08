export interface PosDenomination {
    valor: number;
    cantidad: number;
    total: number;
}

export interface CashCountEntry {
    denomination: number;
    count: number;
}

const INITIAL_CASH_STORAGE_KEY = 'monto_inicial_caja';
const CLOSE_DIFFERENCE_CONFIRM_THRESHOLD = 5;

export function getOpenCashValidationMessage(hasPermission: boolean, initialCash: number): string {
    if (!hasPermission) return 'No tiene permisos para abrir la caja';
    if (initialCash < 0) return 'El monto no puede ser negativo';
    return '';
}

export function getCloseCashValidationMessage(hasPermission: boolean, finalCash: number): string {
    if (!hasPermission) return 'No tiene permisos para cerrar la caja';
    if (!finalCash || finalCash < 0) return 'Debe ingresar el monto final contado en caja';
    return '';
}

export function shouldConfirmCartLoss(cartLength: number): boolean {
    return cartLength > 0;
}

export function getDifferenceToConfirm(difference: number): number {
    const absoluteDifference = Math.abs(Number(difference) || 0);
    return absoluteDifference > CLOSE_DIFFERENCE_CONFIRM_THRESHOLD ? absoluteDifference : 0;
}

export function getOpenCashSuccessMessage(initialCash: number): string {
    return initialCash === 0
        ? 'Caja abierta sin efectivo inicial'
        : `Caja abierta con $${initialCash}`;
}

export function getCloseCashSuccessMessage(difference: number): string {
    return `Caja cerrada correctamente. Diferencia: $${(Number(difference) || 0).toFixed(2)}`;
}

export function saveInitialCashToStorage(amount: number): void {
    localStorage.setItem(INITIAL_CASH_STORAGE_KEY, String(Number(amount) || 0));
}

export function getInitialCashFromStorage(): number {
    try {
        const savedAmount = localStorage.getItem(INITIAL_CASH_STORAGE_KEY);
        return savedAmount ? Number(savedAmount) : 0;
    } catch {
        return 0;
    }
}

export function calculateExpectedCash(initialCash: number, cashSales: number): number {
    return (Number(initialCash) || 0) + (Number(cashSales) || 0);
}

export function calculateCashDifference(finalCash: number, expectedCash: number): number {
    return (Number(finalCash) || 0) - (Number(expectedCash) || 0);
}

export function calculateArqueoTotal(denominations: PosDenomination[]): number {
    return denominations.reduce((total, denomination) => {
        return total + ((Number(denomination.valor) || 0) * (Number(denomination.cantidad) || 0));
    }, 0);
}

export function getDenominationsWithTotals(denominations: PosDenomination[]): PosDenomination[] {
    return denominations.map((denomination) => ({
        ...denomination,
        total: (Number(denomination.valor) || 0) * (Number(denomination.cantidad) || 0)
    }));
}

export function getResetDenominations(denominations: PosDenomination[]): PosDenomination[] {
    return denominations.map((denomination) => ({
        ...denomination,
        cantidad: 0,
        total: 0
    }));
}

export function buildCashCountEntries(denominations: PosDenomination[]): CashCountEntry[] {
    return denominations
        .filter((denomination) => (Number(denomination.cantidad) || 0) > 0)
        .map((denomination) => ({
            denomination: denomination.valor,
            count: denomination.cantidad
        }));
}
