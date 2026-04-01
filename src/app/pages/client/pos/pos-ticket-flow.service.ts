import { ElementRef, Injectable } from '@angular/core';
import { SaleWithDetailsDto } from '../../../core/dto/sale.dto';
import { buildEscPosTicketText, buildTicketSaleData, clearSignatureCanvas, drawSignatureStroke, drawSimpleSaleQr, getSignatureDataUrl, startSignatureStroke, supportsSerialPrinting } from './pos-ticket-utils';
import { PosCartItem } from './pos-cart-state';

@Injectable({
    providedIn: 'root'
})
export class PosTicketFlowService {
    buildTicketSale(params: {
        saleId: number;
        clientId?: number;
        employeeId?: number;
        paymentMethod: 'cash' | 'card' | 'transfer' | 'mixed';
        discount: number;
        total: number;
        details: any[];
        mixedPayments: any[];
        clientName?: string;
        employeeName?: string;
        cashierName?: string;
    }): SaleWithDetailsDto {
        return buildTicketSaleData(params);
    }

    scheduleQrRender(render: () => void): void {
        setTimeout(render, 100);
    }

    scheduleTicketPrint(print: () => void): void {
        setTimeout(print, 500);
    }

    renderQr(canvas: HTMLCanvasElement, saleId: number, total: number): void {
        drawSimpleSaleQr(canvas, saleId, total);
    }

    async printTicket(cart: PosCartItem[], total: number, saleId?: number): Promise<'thermal' | 'browser'> {
        try {
            if (supportsSerialPrinting()) {
                await this.printThermal(cart, total, saleId);
                return 'thermal';
            }
        } catch {
            window.print();
            return 'browser';
        }

        window.print();
        return 'browser';
    }

    startSignature(canvas: HTMLCanvasElement, event: any): void {
        startSignatureStroke(canvas, event);
    }

    drawSignature(canvas: HTMLCanvasElement, event: any): void {
        drawSignatureStroke(canvas, event);
    }

    clearSignature(canvas: HTMLCanvasElement): void {
        clearSignatureCanvas(canvas);
    }

    readSignature(canvas: HTMLCanvasElement): string {
        return getSignatureDataUrl(canvas);
    }

    playSaleSound(): void {
        const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextCtor();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    private async printThermal(cart: PosCartItem[], total: number, saleId?: number): Promise<void> {
        const port = await (navigator as any).serial.requestPort();
        await port.open({ baudRate: 9600 });

        const writer = port.writable.getWriter();
        const encoder = new TextEncoder();

        const ticket = buildEscPosTicketText(
            saleId,
            cart.map(item => ({
                name: item.item.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal
            })),
            total
        );

        await writer.write(encoder.encode(ticket));
        writer.releaseLock();
        await port.close();
    }
}
