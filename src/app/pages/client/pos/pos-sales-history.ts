import { SaleWithDetailsDto } from '../../../core/dto/sale.dto';
import { normalizeArrayResponse } from './pos-catalog';

export interface PromotionItem {
    id: number;
    name: string;
    description: string;
    type: 'percentage' | 'fixed';
    discount_value: number;
    min_amount: number;
    is_active: boolean;
}

export function getDefaultPromotions(): PromotionItem[] {
    return [
        {
            id: 1,
            name: '10% Descuento Cliente VIP',
            description: 'Descuento especial para clientes frecuentes',
            type: 'percentage',
            discount_value: 10,
            min_amount: 0,
            is_active: true
        },
        {
            id: 2,
            name: '$5 Descuento en compras +$50',
            description: 'Descuento fijo en compras mayores a $50',
            type: 'fixed',
            discount_value: 5,
            min_amount: 50,
            is_active: true
        }
    ];
}

export function mapSalesHistory(
    response: any,
    mapBackendSaleToDto: (sale: any) => SaleWithDetailsDto
): SaleWithDetailsDto[] {
    const sales = normalizeArrayResponse<any>(response);
    return sales
        .map((sale: any) => mapBackendSaleToDto(sale))
        .sort((a: SaleWithDetailsDto, b: SaleWithDetailsDto) =>
            new Date(b.date_time).getTime() - new Date(a.date_time).getTime())
        .slice(0, 20);
}

export function mapSaleForTicketPreview(venta: SaleWithDetailsDto): any {
    return {
        ...venta,
        details: venta.details?.map((detail: any) => ({
            id: detail.id,
            content_type: detail.content_type,
            object_id: detail.object_id,
            name: detail.name,
            quantity: detail.quantity,
            price: detail.price,
            subtotal: detail.quantity * detail.price
        })) || []
    };
}
