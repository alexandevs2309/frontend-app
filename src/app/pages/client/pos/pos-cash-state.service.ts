import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PaymentMethodDto } from '../../../core/dto/payment.dto';
import { CashRegister, PosService } from '../../../core/services/pos/pos.service';
import { calculateExpectedCash } from './pos-cash-workflow';
import { extractCashSalesTotal, extractNonCashPayments } from './pos-cash-reporting';

export interface PosDailyStats {
    ventas: number;
    ingresos: number;
    ticketPromedio: number;
}

export interface PosCashSnapshot {
    register: CashRegister | null;
    cashierName: string;
    stats: PosDailyStats;
    cashSales: number;
    nonCashPayments: PaymentMethodDto[];
}

export interface PosClosePreparation extends PosCashSnapshot {
    initialCash: number;
    expectedCash: number;
}

export interface PosCashCountHistoryEntry {
    fecha: string;
    totalContado: number;
    efectivoEsperado: number;
    diferencia: number;
    usuario: string;
    denominaciones: Array<{ valor: number; cantidad: number; total: number }>;
}

export interface PosCashCountResult {
    totalCounted: number;
    expectedCash: number;
    difference: number;
    historyEntry: PosCashCountHistoryEntry;
}

@Injectable({
    providedIn: 'root'
})
export class PosCashStateService {
    constructor(private readonly posService: PosService) {}

    async getCurrentSnapshot(fallbackCashierName: string): Promise<PosCashSnapshot> {
        try {
            const register = await firstValueFrom(this.posService.getCurrentCashRegister());
            if (!register) {
                return this.getEmptySnapshot(fallbackCashierName);
            }

            return this.buildSnapshot(register, fallbackCashierName);
        } catch {
            return this.getEmptySnapshot(fallbackCashierName);
        }
    }

    async openRegister(initialCash: number, fallbackCashierName: string): Promise<PosCashSnapshot> {
        const register = await firstValueFrom(this.posService.openCashRegister({ initial_cash: initialCash }));
        return this.buildSnapshot(register, fallbackCashierName);
    }

    async prepareClose(fallbackCashierName: string): Promise<PosClosePreparation | null> {
        const register = await firstValueFrom(this.posService.getCurrentCashRegister());
        if (!register) {
            return null;
        }

        const snapshot = await this.buildSnapshot(register, fallbackCashierName);
        const initialCash = Number(register.initial_cash) || 0;

        return {
            ...snapshot,
            initialCash,
            expectedCash: calculateExpectedCash(initialCash, snapshot.cashSales)
        };
    }

    async closeRegister(registerId: number, finalCash: number): Promise<CashRegister> {
        return firstValueFrom(this.posService.closeCashRegister(registerId, { final_cash: finalCash }));
    }

    async loadCashCountContext(currentRegister: CashRegister | null, fallbackCashierName: string): Promise<PosCashSnapshot> {
        if (currentRegister) {
            return this.buildSnapshot(currentRegister, fallbackCashierName);
        }

        return this.getCurrentSnapshot(fallbackCashierName);
    }

    async performCashCount(
        registerId: number,
        counts: any[],
        usuario: string,
        denominaciones: Array<{ valor: number; cantidad: number; total: number }>
    ): Promise<PosCashCountResult> {
        const result = await firstValueFrom(this.posService.cashCount(registerId, counts));
        const totalCounted = Number(result?.total_counted) || 0;
        const expectedCash = Number(result?.expected_cash) || 0;
        const difference = Number(result?.difference) || 0;

        return {
            totalCounted,
            expectedCash,
            difference,
            historyEntry: {
                fecha: new Date().toISOString(),
                totalContado: totalCounted,
                efectivoEsperado: expectedCash,
                diferencia: difference,
                usuario,
                denominaciones
            }
        };
    }

    private async buildSnapshot(register: CashRegister, fallbackCashierName: string): Promise<PosCashSnapshot> {
        const dailySummary = await firstValueFrom(this.posService.getDailySummary());

        return {
            register,
            cashierName: register?.user_name || fallbackCashierName || '',
            stats: this.normalizeDailyStats(dailySummary),
            cashSales: this.extractCashSales(dailySummary),
            nonCashPayments: this.extractNonCashPayments(dailySummary)
        };
    }

    private getEmptySnapshot(fallbackCashierName: string): PosCashSnapshot {
        return {
            register: null,
            cashierName: fallbackCashierName || '',
            stats: {
                ventas: 0,
                ingresos: 0,
                ticketPromedio: 0
            },
            cashSales: 0,
            nonCashPayments: []
        };
    }

    private normalizeDailyStats(dailySummary: any): PosDailyStats {
        const ventas = Number(dailySummary?.sales_count) || 0;
        const ingresos = Number(dailySummary?.paid ?? dailySummary?.total) || 0;

        return {
            ventas,
            ingresos,
            ticketPromedio: ventas > 0 ? ingresos / ventas : 0
        };
    }

    private extractCashSales(dailySummary: any): number {
        try {
            return extractCashSalesTotal(dailySummary);
        } catch {
            return 0;
        }
    }

    private extractNonCashPayments(dailySummary: any): PaymentMethodDto[] {
        try {
            return extractNonCashPayments(dailySummary);
        } catch {
            return [];
        }
    }
}
