import { PaymentMethodDto } from '../../../core/dto/payment.dto';

export interface CashCloseStats {
    ventas: number;
    ingresos: number;
    ticketPromedio: number;
}

export interface CashCloseReportData {
    fecha: string;
    hora: string;
    usuario: string;
    montoInicial: number;
    ventasEfectivo: number;
    montoEsperado: number;
    montoContado: number;
    diferencia: number;
    estadisticas: CashCloseStats;
}

interface BuildCashCloseReportInput {
    usuario: string;
    montoEsperado: number;
    ventasEfectivoHoy: number;
    montoFinalCaja: number;
    diferenciaCaja: number;
    estadisticas: CashCloseStats;
}

export function buildCashCloseReportData(input: BuildCashCloseReportInput): CashCloseReportData {
    const montoInicialReal = input.montoEsperado - input.ventasEfectivoHoy;
    return {
        fecha: new Date().toLocaleDateString('es-ES'),
        hora: new Date().toLocaleTimeString('es-ES'),
        usuario: input.usuario,
        montoInicial: Math.max(0, montoInicialReal),
        ventasEfectivo: input.ventasEfectivoHoy,
        montoEsperado: input.montoEsperado,
        montoContado: input.montoFinalCaja,
        diferencia: input.diferenciaCaja,
        estadisticas: input.estadisticas
    };
}

export function printCashCloseReport(data: CashCloseReportData): void {
    const contentHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
                <h1 style="color: #333; margin: 0;">BARBERÍA APP</h1>
                <h2 style="color: #666; margin: 5px 0;">REPORTE DE CUADRE DE CAJA</h2>
            </div>

            <div style="margin-bottom: 20px;">
                <p><strong>Fecha:</strong> ${data.fecha}</p>
                <p><strong>Hora:</strong> ${data.hora}</p>
                <p><strong>Usuario:</strong> ${data.usuario}</p>
            </div>

            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; background-color: #f9f9f9;">
                <h3 style="color: #333; margin-top: 0;">MOVIMIENTOS DE CAJA</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>Monto inicial:</strong></td><td style="text-align: right;">$${data.montoInicial.toFixed(2)}</td></tr>
                    <tr><td style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>Ventas en efectivo:</strong></td><td style="text-align: right;">$${data.ventasEfectivo.toFixed(2)}</td></tr>
                    <tr><td style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>Monto esperado:</strong></td><td style="text-align: right;">$${data.montoEsperado.toFixed(2)}</td></tr>
                    <tr><td style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>Monto contado:</strong></td><td style="text-align: right;">$${data.montoContado.toFixed(2)}</td></tr>
                    <tr style="background-color: ${data.diferencia === 0 ? '#d4edda' : '#f8d7da'};">
                        <td style="padding: 8px 0; font-weight: bold;"><strong>Diferencia:</strong></td>
                        <td style="text-align: right; font-weight: bold; color: ${data.diferencia === 0 ? '#155724' : '#721c24'};">$${data.diferencia.toFixed(2)}</td>
                    </tr>
                </table>
            </div>

            <div style="border: 1px solid #ddd; padding: 15px; background-color: #f9f9f9;">
                <h3 style="color: #333; margin-top: 0;">ESTADÍSTICAS DEL DÍA</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>Total ventas:</strong></td><td style="text-align: right;">${data.estadisticas.ventas}</td></tr>
                    <tr><td style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>Ingresos totales:</strong></td><td style="text-align: right;">$${data.estadisticas.ingresos.toFixed(2)}</td></tr>
                    <tr><td style="padding: 5px 0;"><strong>Ticket promedio:</strong></td><td style="text-align: right;">$${data.estadisticas.ticketPromedio.toFixed(2)}</td></tr>
                </table>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
                <p>Reporte generado automáticamente - ${new Date().toLocaleString('es-ES')}</p>
            </div>
        </div>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
        <html>
            <head>
                <title>Cuadre de Caja - ${data.fecha}</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                ${contentHtml}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 1000);
                    }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

export function extractCashSalesTotal(dailySummary: any): number {
    const byMethod = dailySummary?.by_method || [];
    const cashSales = byMethod.find((method: any) => method.payment_method === 'cash');
    return Number(cashSales?.total || 0);
}

export function extractNonCashPayments(dailySummary: any): PaymentMethodDto[] {
    const byMethod = dailySummary?.by_method || [];
    return byMethod
        .filter((method: any) => method.payment_method !== 'cash')
        .map((method: any): PaymentMethodDto => ({
            payment_method: method.payment_method,
            total: Number(method.total || 0)
        }))
        .filter((payment: PaymentMethodDto) => payment.total > 0);
}
