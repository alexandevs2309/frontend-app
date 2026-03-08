export type TicketPaymentMethod = 'cash' | 'card' | 'transfer' | 'mixed';

export interface TicketMixedPayment {
    metodo: TicketPaymentMethod;
    monto: number | string;
}

export interface TicketLineItem {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface BuildTicketSaleInput {
    saleId: number;
    clientId?: number;
    employeeId?: number;
    paymentMethod: TicketPaymentMethod;
    discount: number;
    total: number;
    details: any[];
    mixedPayments: TicketMixedPayment[];
    clientName?: string;
    employeeName?: string;
}

export function buildTicketPayments(
    paymentMethod: TicketPaymentMethod,
    total: number,
    mixedPayments: TicketMixedPayment[]
): Array<{ method: TicketPaymentMethod; amount: number }> {
    if (paymentMethod === 'mixed' && mixedPayments.length > 0) {
        return mixedPayments.map((payment) => ({
            method: payment.metodo,
            amount: Number(payment.monto)
        }));
    }

    return [{ method: paymentMethod, amount: total }];
}

export function buildTicketSaleData(input: BuildTicketSaleInput): any {
    const payments = buildTicketPayments(input.paymentMethod, input.total, input.mixedPayments);
    return {
        id: input.saleId,
        client: input.clientId,
        employee_id: input.employeeId,
        payment_method: input.paymentMethod,
        discount: input.discount,
        total: input.total,
        paid: input.total,
        date_time: new Date().toISOString(),
        details: input.details,
        payments,
        client_name: input.clientName,
        employee_name: input.employeeName
    };
}

export function drawSimpleSaleQr(canvas: HTMLCanvasElement, saleId: number, total: number): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const qrData = `VENTA:${saleId}|TOTAL:${total}|FECHA:${new Date().toISOString()}`;
    if (!qrData) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 80, 80);
    ctx.fillStyle = '#fff';

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if ((i + j + saleId) % 3 === 0) {
                ctx.fillRect(i * 10, j * 10, 8, 8);
            }
        }
    }
}

export function supportsSerialPrinting(): boolean {
    return 'serial' in navigator;
}

export function buildEscPosTicketText(
    saleId: number | undefined,
    items: TicketLineItem[],
    total: number
): string {
    return `
\x1B\x40  // Inicializar
\x1B\x61\x01  // Centrar
BARBERÍA APP\n
\x1B\x61\x00  // Izquierda
Ticket: ${saleId}\n
Fecha: ${new Date().toLocaleString()}\n
${items.map(item =>
`${item.name}\n${item.quantity} x $${item.price} = $${item.subtotal}\n`
).join('')}
\nTOTAL: $${total}\n
\x1B\x61\x01  // Centrar
¡Gracias por su compra!\n\n\n\x1D\x56\x00  // Cortar papel
`;
}

export function startSignatureStroke(canvas: HTMLCanvasElement, event: any): void {
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
}

export function drawSignatureStroke(canvas: HTMLCanvasElement, event: any): void {
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
}

export function clearSignatureCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function getSignatureDataUrl(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL();
}
