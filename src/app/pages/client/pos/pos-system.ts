import { Component, OnInit, inject, signal, HostListener, ViewChild, ElementRef, ChangeDetectionStrategy, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { PosService } from '../../../core/services/pos/pos.service';
import { ServiceService } from '../../../core/services/service/service.service';
import { InventoryService } from '../../../core/services/inventory/inventory.service';
import { ClientService } from '../../../core/services/client/client.service';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { environment } from '../../../../environments/environment';
import { SaleDto, SaleWithDetailsDto, CreateSaleDto } from '../../../core/dto/sale.dto';
import { SaleDetailDto, CartItemDto } from '../../../core/dto/sale-detail.dto';
import { PaymentDto, PaymentMethodDto } from '../../../core/dto/payment.dto';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { calculateCartSubtotal, calculateMixedPaymentsTotal, calculateTotalFromDiscount, getMixedPaymentMessage, isMixedPaymentBalanced } from './pos-calculations';
import { buildCreateSalePayload, buildSalePayments, getDiscountContext, getSaleValidationMessage } from './pos-sale-builder';
import { POS_ROLE_GROUPS, canRefundSaleByContent, hasRolePermission, normalizePosRole } from './pos-permissions';
import {
    buildCashCountEntries,calculateArqueoTotal,calculateCashDifference,calculateExpectedCash,getCloseCashSuccessMessage,    getCloseCashValidationMessage,getDenominationsWithTotals,getDifferenceToConfirm,getInitialCashFromStorage,    getOpenCashSuccessMessage,getOpenCashValidationMessage,getResetDenominations,saveInitialCashToStorage,shouldConfirmCartLoss
} from './pos-cash-workflow';
import { getUserIdFromStorage, loadArqueoHistory, loadDailyStats, saveArqueoHistory, saveDailyStats } from './pos-storage';
import {
    buildEscPosTicketText, buildTicketSaleData, clearSignatureCanvas, drawSignatureStroke, drawSimpleSaleQr, getSignatureDataUrl,startSignatureStroke,supportsSerialPrinting
} from './pos-ticket-utils';
import { buildCashCloseReportData, extractCashSalesTotal, extractNonCashPayments, printCashCloseReport } from './pos-cash-reporting';
import { buildDefaultPosConfig, buildPosConfigFromSettings, getBusinessNameFromTenantStorage, getCurrentUserIdentity, toAbsoluteMediaUrl } from './pos-config';
import {
    extractCatalogCategories,filterCatalogItems,getCachedPosCatalog,isForbiddenStatus,loadPosCatalogData,normalizeArrayResponse,setCachedPosCatalog
} from './pos-catalog';
import { getDefaultPromotions, mapSaleForTicketPreview, mapSalesHistory } from './pos-sales-history';


interface CartItem {
    id: string;
    type: 'service' | 'product';
    item: any;
    employee?: any;
    quantity: number;
    price: number;
    subtotal: number;
}
type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mixed';

@Component({
    selector: 'app-pos-system',
    standalone: true,
    imports: [CommonModule, ButtonModule, InputTextModule, SelectModule, TableModule, CardModule, DividerModule, ToastModule, DialogModule, InputNumberModule, TooltipModule, FormsModule],
    providers: [MessageService],
    templateUrl: './pos-system.html'
})
export class PosSystem implements OnInit, OnDestroy {
    private readonly posService = inject(PosService);
    private readonly servicesService = inject(ServiceService);
    private readonly inventoryService = inject(InventoryService);
    private readonly clientsService = inject(ClientService);
    private readonly employeesService = inject(EmployeeService);
    private readonly messageService = inject(MessageService);

    // Signals principales
    carrito = signal<CartItem[]>([]);
    cajaAbierta = signal(false);
    estadisticasDia = signal({ ventas: 0, ingresos: 0, ticketPromedio: 0 });
    pagosNoCash = signal<PaymentMethodDto[]>([]);

    // Computed signals para cálculos automáticos
    subtotal = computed(() => calculateCartSubtotal(this.carrito()));
    total = computed(() => {
        return calculateTotalFromDiscount(
            this.subtotal(),
            Number(this.descuento()) || 0,
            this.tipoDescuento()
        );
    });
    puedeVenderComputed = computed(() => {
        const carrito = this.carrito();
        const tieneItems = carrito.length > 0;
        const tienePago = this.metodoPagoSeleccionado() !== '';
        const cajaAbierta = this.cajaAbierta();
        const totalValido = this.total() > 0;

        // Si hay servicios, DEBE haber empleado seleccionado
        const tieneServicios = carrito.some(item => item.type === 'service');
        const empleadoSeleccionado = this.empleadoSeleccionado();
        const empleadoValido = !tieneServicios || !!(empleadoSeleccionado && empleadoSeleccionado.id);

        return tieneItems && tienePago && cajaAbierta && totalValido && empleadoValido;
    });

    servicios: any[] = [];
    productos: any[] = [];
    clientes: any[] = [];
    empleados: any[] = [];
    categorias: any[] = [];
    itemsFiltrados: any[] = [];

    tipoActivo: 'services' | 'products' = 'services';
    categoriaSeleccionada = '';
    busqueda = '';
    clienteSeleccionado: any = null;
    empleadoSeleccionado = signal<any>(null);
    metodoPagoSeleccionado = signal<'cash' | 'card' | 'transfer' | 'mixed' | ''>('');
    descuento = signal(0);
    tipoDescuento = signal<'$' | '%'>('$');
    limiteDescuento = 20;

    metodoPagoTemporal = '';
    montoTemporal = 0;

    mostrarDialogoAbrirCaja = false;
    mostrarDialogoCerrarCaja = false;
    mostrarDialogoPago = false;
    mostrarDialogoPagosMixtos = false;
    mostrarDialogoArqueo = false;
    mostrarDialogoHistorialArqueos = false;
    mostrarDialogoHistorial = false;
    mostrarDialogoPromociones = false;
    mostrarDialogoTicket = false;
    mostrarDialogoFirma = false;
    ventaActual: SaleWithDetailsDto | null = null;
    firmaCliente = '';
    montoInicialCaja = 0;
    montoFinalCaja = 0;

    cargandoDatos = false;
    procesandoVenta = false;
    cargandoHistorial = false;

    montoRecibido = 0;
    cambio = 0;
    pagosMixtos: any[] = [];
    promociones: any[] = [];
    promocionAplicada: any = null;
    historialVentas: SaleWithDetailsDto[] = [];
    historialArqueos: any[] = [];
    configuracionPos: any = {};
    nombreUsuarioActual = '';
    rolUsuarioActual = '';
    permisosUsuario: string[] = [];

    // Método público para template
    private mapCartItemToSaleDetail(item: CartItem): SaleDetailDto {
        return {
            content_type: item.type === 'service' ? 'service' : 'product',
            object_id: item.item.id,
            name: item.item.name,
            quantity: item.quantity,
            price: item.price
        };
    }

    private mapBackendSaleToDto(backendSale: any): SaleWithDetailsDto {
        return {
            id: backendSale.id,
            client: backendSale.client,
            employee_id: backendSale.employee_id,
            payment_method: backendSale.payment_method,
            discount: backendSale.discount || 0,
            total: backendSale.total,
            paid: backendSale.paid,
            date_time: backendSale.date_time,
            details: backendSale.details || [],
            payments: backendSale.payments || [],
            client_name: backendSale.client_name,
            employee_name: backendSale.employee_name
        };
    }

    getPaymentMethodName(method: PaymentMethod): string {
        const methods: Record<PaymentMethod , string> = {
            cash: 'Efectivo',
            card: 'Tarjeta',
            transfer: 'Transferencia',
            mixed: 'Mixto'
        };
        return methods[method];
    }
getSubtotal(venta: SaleWithDetailsDto): number {
  return venta.details.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
}


    denominaciones = [
        { valor: 2000, cantidad: 0, total: 0 },
        { valor: 1000, cantidad: 0, total: 0 },
        { valor: 500, cantidad: 0, total: 0 },
        { valor: 200, cantidad: 0, total: 0 },
        { valor: 100, cantidad: 0, total: 0 },
        { valor: 50, cantidad: 0, total: 0 },
        { valor: 25, cantidad: 0, total: 0 },
        { valor: 10, cantidad: 0, total: 0 },
        { valor: 5, cantidad: 0, total: 0 }
    ];

    codigoBarras = '';
    modoScanner = false;
    clientesFrecuentes: any[] = [];
    Math = Math;
    vistaCompacta = false;
    private searchSubject = new Subject<string>();
    private categorySubject = new Subject<string>();
    private cache = new Map<string, { data: any, timestamp: number }>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos // Nueva propiedad para toggle de vista

    metodosPago = [
        { label: 'Efectivo', value: 'cash' },
        { label: 'Tarjeta', value: 'card' },
        { label: 'Transferencia', value: 'transfer' },
        { label: 'Mixto', value: 'mixed' }
    ];

    constructor() {
        // Configurar debounce para búsqueda
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(term => {
            this.busqueda = term;
            this.filtrarItems();
        });

        // Configurar debounce para categoría
        this.categorySubject.pipe(
            debounceTime(200),
            distinctUntilChanged()
        ).subscribe(category => {
            this.categoriaSeleccionada = category;
            this.filtrarItems();
        });
    }

    async ngOnInit(): Promise<void> {
        // ⚡ OPTIMIZACIÓN: Cargar configuración primero para obtener rol
        await this.cargarConfiguracion();
        
        // Validar permisos para usar POS
        if (!this.puedeUsarPOS()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Acceso denegado',
                detail: 'No tiene permisos para usar el sistema POS',
                life: 10000
            });
            return;
        }
        
        // ⚡ OPTIMIZACIÓN: Cargar datos críticos en paralelo
        await Promise.all([
            this.cargarDatos(),
            this.verificarEstadoCaja()
        ]);
        
        // ⚡ OPTIMIZACIÓN: Cargar datos no críticos en background
        this.cargarEstadisticasGuardadas();
        setTimeout(() => {
            this.cargarPromociones();
            this.setupKeyboardShortcuts();
        }, 0);
    }

    ngOnDestroy(): void {
        this.searchSubject.complete();
        this.categorySubject.complete();
    }

    onSearchChange(value: string): void {
        this.searchSubject.next(value);
    }

    onCategoryChange(value: string): void {
        this.categorySubject.next(value);
    }

    async cargarDatos() {
        if (this.cargandoDatos) return;

        const cacheKey = 'pos_data';
        const cached = getCachedPosCatalog(this.cache, cacheKey, this.CACHE_DURATION);
        if (cached) {
            this.servicios = cached.servicios;
            this.productos = cached.productos;
            this.clientes = cached.clientes;
            this.empleados = cached.empleados;
            this.clientesFrecuentes = cached.clientesFrecuentes;
            this.extraerCategorias();
            this.filtrarItems();
            return;
        }

        this.cargandoDatos = true;

        try {
            const loadedCatalog = await loadPosCatalogData({
                getServices: async () => this.servicesService.getServices().toPromise(),
                getServiceCategories: async () => this.servicesService.getServiceCategories().toPromise(),
                getProducts: async () => this.inventoryService.getProducts().toPromise(),
                getClients: async () => this.clientsService.getClients().toPromise(),
                getEmployees: async () => this.employeesService.getEmployees().toPromise()
            });

            this.servicios = loadedCatalog.servicios;
            this.productos = loadedCatalog.productos;
            this.clientes = loadedCatalog.clientes;
            this.empleados = loadedCatalog.empleados;
            this.clientesFrecuentes = loadedCatalog.clientesFrecuentes;

            setCachedPosCatalog(this.cache, cacheKey, {
                servicios: this.servicios,
                productos: this.productos,
                clientes: this.clientes,
                empleados: this.empleados,
                clientesFrecuentes: this.clientesFrecuentes
            });

            this.extraerCategorias();
            this.filtrarItems();

            if (loadedCatalog.accessLimited) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Acceso limitado',
                    detail: 'Algunos catálogos del POS no están disponibles para tu rol'
                });
            }

        } catch {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar los datos del sistema'
            });
        } finally {
            this.cargandoDatos = false;
        }
    }

    private extraerCategorias() {
        const items = this.tipoActivo === 'services' ? this.servicios : this.productos;
        this.categorias = extractCatalogCategories(items);
    }

    cambiarTipoActivo(tipo: 'services' | 'products'): void {
        this.tipoActivo = tipo;
        this.categoriaSeleccionada = '';
        this.extraerCategorias();
        this.filtrarItems();
    }






    filtrarItems() {
        const items = this.tipoActivo === 'services' ? this.servicios : this.productos;
        this.itemsFiltrados = filterCatalogItems(items, this.tipoActivo, this.categoriaSeleccionada, this.busqueda);
    }

    async agregarAlCarrito(item: any) {
        if (!this.cajaAbierta()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Caja cerrada',
                detail: 'Debe abrir la caja antes de realizar ventas'
            });
            return;
        }

        // Verificar stock en tiempo real antes de agregar
        if (this.tipoActivo === 'products') {
            try {
                const productoActual = await this.inventoryService.getProduct(item.id).toPromise();
                if (productoActual && productoActual.stock <= 0) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Sin stock',
                        detail: `${item.name} ya no tiene stock disponible`
                    });
                    // Actualizar stock local
                    const index = this.productos.findIndex(p => p.id === item.id);
                    if (index !== -1 && productoActual) this.productos[index].stock = productoActual.stock;
                    this.filtrarItems();
                    return;
                }
                // Actualizar stock local con valor real
                if (productoActual) item.stock = productoActual.stock;
            } catch (error) {
                console.error('Error verificando stock:', error);
            }
        }

        const existeEnCarrito = this.carrito().find(cartItem =>
            cartItem.item.id === item.id && cartItem.type === (this.tipoActivo === 'services' ? 'service' : 'product')
        );

        if (existeEnCarrito) {
            const index = this.carrito().indexOf(existeEnCarrito);
            this.cambiarCantidad(index, 1);
            return;
        }

        if (this.tipoActivo === 'products' && item.stock <= 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Sin stock',
                detail: `${item.name} no tiene stock disponible`
            });
            return;
        }

        const cartItem: CartItem = {
            id: `${this.tipoActivo}-${item.id}-${Date.now()}`,
            type: this.tipoActivo === 'services' ? 'service' : 'product',
            item: item,
            quantity: 1,
            price: Number(item.price) || 0,
            subtotal: Number(item.price) || 0
        };

        this.carrito.update(cart => [...cart, cartItem]);
        
        // Animación de éxito
        this.messageService.add({
            severity: 'success',
            summary: '✅ Agregado',
            detail: `${item.name}`,
            life: 2000
        });
    }

    cambiarCantidad(index: number, cambio: number) {
        this.carrito.update(cart => {
            const newCart = [...cart];
            const item = newCart[index];
            const nuevaCantidad = item.quantity + cambio;
            if (nuevaCantidad <= 0) {
                return newCart.filter((_, i) => i !== index);
            }
            if (item.type === 'product' && nuevaCantidad > item.item.stock) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Stock insuficiente',
                    detail: `Solo hay ${item.item.stock} unidades disponibles`
                });
                return cart;
            }
            item.quantity = nuevaCantidad;
            item.subtotal = item.price * item.quantity;
            return newCart;
        });
    }

    removerDelCarrito(index: number) {
        this.carrito.update(cart => cart.filter((_, i) => i !== index));
    }

    limpiarCarrito() {
        this.carrito.set([]);
        this.clienteSeleccionado = null;
        this.empleadoSeleccionado.set(null);
        this.metodoPagoSeleccionado.set('');
        this.descuento.set(0);
        this.tipoDescuento.set('$');
        this.resetearPago();
    }

    obtenerStockDisponible(item: any): number {
        if (this.tipoActivo === 'products') {
            const enCarrito = this.carrito()
                .filter(cartItem => cartItem.item.id === item.id && cartItem.type === 'product')
                .reduce((total, cartItem) => total + cartItem.quantity, 0);
            return Math.max(0, (Number(item.stock) || 0) - enCarrito);
        }
        return 999;
    }

    puedeAgregarMas(item: any): boolean {
        return this.obtenerStockDisponible(item) > 0;
    }

    calcularSubtotal(): number {
        return this.subtotal();
    }

    calcularTotal(): number {
        return this.total();
    }

    alternarTipoDescuento() {
        this.tipoDescuento.set(this.tipoDescuento() === '$' ? '%' : '$');
        this.descuento.set(0);
    }

    validarDescuento() {
        const subtotal = this.calcularSubtotal();
        const descuentoActual = this.descuento();
        
        if (this.tipoDescuento() === '%') {
            const limiteReal = this.puedeAplicarDescuentoAlto() ? 100 : this.limiteDescuento;
            if (descuentoActual > limiteReal) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Descuento limitado',
                    detail: `El descuento máximo permitido es ${limiteReal}%`
                });
                this.descuento.set(limiteReal);
            }
            if (descuentoActual < 0) {
                this.descuento.set(0);
            }
        } else {
            // Validar descuento en $
            if (descuentoActual > subtotal) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Descuento inválido',
                    detail: `El descuento no puede ser mayor al subtotal ($${subtotal.toFixed(2)})`
                });
                this.descuento.set(subtotal);
            }
            if (descuentoActual < 0) {
                this.descuento.set(0);
            }
        }
    }

    tieneServicios(): boolean {
        return this.carrito().some(item => item.type === 'service');
    }

    puedeVender(): boolean {
        return this.puedeVenderComputed();
    }

    obtenerMensajeValidacion(): string {
        return getSaleValidationMessage({
            cartLength: this.carrito().length,
            isCashRegisterOpen: this.cajaAbierta(),
            paymentMethod: this.metodoPagoSeleccionado(),
            hasServices: this.tieneServicios(),
            selectedEmployeeId: this.empleadoSeleccionado()?.id,
            total: this.calcularTotal()
        });
    }

    async procesarVenta() {
        if (!this.puedeVender()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Venta no válida',
                detail: this.obtenerMensajeValidacion()
            });
            return;
        }

        if (this.metodoPagoSeleccionado() === 'mixed') {
            if (this.pagosMixtos.length === 0) {
                this.mostrarDialogoPagosMixtos = true;
                return;
            }
            // Si ya hay pagos mixtos agregados, validar antes de continuar
            if (!this.validarPagoMixto()) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Pagos incompletos',
                    detail: this.obtenerMensajePagoMixto()
                });
                this.mostrarDialogoPagosMixtos = true;
                return;
            }
        }

        if (this.metodoPagoSeleccionado() === 'cash') {
            this.mostrarDialogoPago = true;
            return;
        }

        if (this.calcularTotal() > 500) {
            this.mostrarDialogoFirma = true;
            return;
        }

        await this.confirmarVenta();
    }

    async confirmarVenta() {
        if (this.procesandoVenta) return;
        this.procesandoVenta = true;
        try {
            // 1. Validar stock en tiempo real antes de procesar
            const productosEnCarrito = this.carrito()
                .filter(item => item.type === 'product')
                .map(item => ({
                    id: item.item.id,
                    type: 'product',
                    quantity: item.quantity
                }));

            if (productosEnCarrito.length > 0) {
                try {
                    await this.posService.validateStock(productosEnCarrito).toPromise();
                } catch (error: any) {
                    // Stock insuficiente detectado
                    const errorData = error.error;
                    if (errorData && errorData.errors) {
                        const errorMessages = errorData.errors
                            .map((e: any) => e.message)
                            .join('\n');
                        
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Stock insuficiente',
                            detail: errorMessages,
                            life: 8000
                        });
                        
                        // Recargar datos para actualizar stock
                        await this.cargarDatos();
                        this.procesandoVenta = false;
                        return;
                    }
                }
            }

            // 2. Procesar venta si stock es válido
            const subtotal = this.calcularSubtotal();
            const descuentoValor = Number(this.descuento()) || 0;
            const discountContext = getDiscountContext({
                subtotal,
                discountValue: descuentoValor,
                discountType: this.tipoDescuento(),
                discountLimit: this.limiteDescuento
            });
            let discountReason: string | undefined;

            if (discountContext.requiresReason) {
                const reason = prompt(`Descuento mayor a ${this.limiteDescuento}%. Indique motivo (mínimo 10 caracteres):`) || '';
                if (reason.trim().length < 10) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Motivo requerido',
                        detail: 'Debe indicar un motivo válido para descuentos altos'
                    });
                    this.procesandoVenta = false;
                    return;
                }
                discountReason = reason.trim();
            }
            
            const totalVenta = this.calcularTotal();
            const paymentMethod = this.metodoPagoSeleccionado() as 'cash' | 'card' | 'transfer' | 'mixed';
            const payments = buildSalePayments(paymentMethod, totalVenta, this.pagosMixtos);
            
            const ventaData: CreateSaleDto = buildCreateSalePayload({
                clientId: this.clienteSeleccionado?.id,
                employeeId: this.empleadoSeleccionado()?.id ?? undefined,
                paymentMethod,
                discountAmount: discountContext.discountAmount,
                discountReason,
                total: totalVenta,
                details: this.carrito().map(item => this.mapCartItemToSaleDetail(item)),
                payments
            });
            const venta = await this.posService.createSale(ventaData).toPromise();

            this.reproducirSonidoVenta();
            this.messageService.add({
                severity: 'success',
                summary: 'Venta procesada',
                detail: 'Venta procesada exitosamente'
            });

            await this.actualizarEstadisticasVenta();
            this.mostrarTicket(venta);
            this.limpiarCarrito();
            this.resetearPago();
        } catch (error: any) {
            const errorMsg =
                error?.error?.detail ||
                error?.error?.message ||
                (Array.isArray(error?.error) ? error.error.join(' ') : null) ||
                (typeof error?.error === 'string' ? error.error : null) ||
                'Error al procesar la venta';
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMsg,
                life: 8000
            });
        } finally {
            this.procesandoVenta = false;
        }
    }

    resetearPago() {
        this.montoRecibido = 0;
        this.cambio = 0;
        this.pagosMixtos = [];
        this.metodoPagoTemporal = '';
        this.montoTemporal = 0;
        this.promocionAplicada = null;
        this.mostrarDialogoPago = false;
        this.mostrarDialogoPagosMixtos = false;
    }

    async verificarEstadoCaja() {
        try {
            const register = await this.posService.getCurrentCashRegister().toPromise();
            this.cajaAbierta.set(!!register);

            // Cargar pagos no cash al verificar estado de caja
            if (this.cajaAbierta()) {
                const dailySummary = await this.posService.getDailySummary().toPromise();
                this.extraerPagosNoCash(dailySummary);
            }
        } catch (error) {
            this.cajaAbierta.set(false);
        }
    }

    async abrirCaja() {
        const openValidationError = getOpenCashValidationMessage(this.puedeAbrirCaja(), this.montoInicialCaja);
        if (openValidationError) {
            this.messageService.add({
                severity: 'error',
                summary: 'Sin permisos',
                detail: openValidationError
            });
            return;
        }
        try {
            await this.posService.openCashRegister({
                initial_cash: this.montoInicialCaja
            }).toPromise();
            this.cajaAbierta.set(true);
            this.mostrarDialogoAbrirCaja = false;

            // NO resetear estadísticas - se mantienen del día
            // Solo resetear ventas en efectivo de la sesión
            this.ventasEfectivoSesionActual = 0;

            // Guardar monto inicial para cálculos posteriores
            const montoParaGuardar = this.montoInicialCaja;
            saveInitialCashToStorage(montoParaGuardar);
            this.montoInicialCaja = 0; // Reset solo la variable del formulario

            const mensaje = getOpenCashSuccessMessage(montoParaGuardar);

            this.messageService.add({
                severity: 'success',
                summary: 'Caja abierta',
                detail: mensaje
            });
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al abrir la caja'
            });
        }
    }

    ventasEfectivoHoy = 0;
    montoEsperado = 0;
    diferenciaCaja = 0;

    async prepararCierreCaja() {
        if (!this.cajaAbierta()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No hay una caja abierta'
            });
            return;
        }
        
        try {
            const cajaActual = await this.posService.getCurrentCashRegister().toPromise();

            if (!cajaActual) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No hay una caja abierta'
                });
                return;
            }

            // Obtener monto inicial de cuando se abrió la caja
            const montoInicialSesion = this.obtenerMontoInicialCaja();

            // 🔧 FIX: Consultar ventas en efectivo reales desde backend
            const dailySummary = await this.posService.getDailySummary().toPromise();
            const ventasEfectivoReales = this.extraerVentasEfectivo(dailySummary);

            // 💡 NUEVA FUNCIONALIDAD: Extraer pagos no en efectivo
            this.extraerPagosNoCash(dailySummary);

            this.ventasEfectivoHoy = ventasEfectivoReales;
            this.montoEsperado = calculateExpectedCash(montoInicialSesion, ventasEfectivoReales);
            this.montoFinalCaja = 0; // Reset
            this.diferenciaCaja = 0; // Reset

            // Si no hay datos, mostrar advertencia
            if (this.montoEsperado === 0 && this.estadisticasDia().ventas > 0) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'Hay ventas registradas pero no se detecta efectivo. Verifica los métodos de pago.'
                });
            }

            this.mostrarDialogoCerrarCaja = true;
        } catch (error) {
            console.error('Error preparando cierre de caja:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al preparar cierre de caja'
            });
        }
    }

    calcularDiferencia() {
        this.diferenciaCaja = calculateCashDifference(this.montoFinalCaja, this.montoEsperado);
    }

    async cerrarCaja() {
        const closeValidationError = getCloseCashValidationMessage(this.puedeCerrarCaja(), this.montoFinalCaja);
        if (closeValidationError) {
            this.messageService.add({
                severity: 'error',
                summary: closeValidationError.includes('permisos') ? 'Sin permisos' : 'Error',
                detail: closeValidationError
            });
            return;
        }
        // Validar que no haya items en el carrito
        if (shouldConfirmCartLoss(this.carrito().length)) {
            const confirmar = confirm('Hay items en el carrito. ¿Está seguro de cerrar la caja? Se perderán los items.');
            if (!confirmar) return;
            this.limpiarCarrito();
        }

        const diferencia = getDifferenceToConfirm(this.diferenciaCaja);

        if (diferencia > 0) {
            const confirmar = confirm(`Hay una diferencia de $${diferencia.toFixed(2)}. ¿Está seguro de cerrar la caja?`);
            if (!confirmar) return;
        }

        try {
            const cajaActual = await this.posService.getCurrentCashRegister().toPromise();
            if (cajaActual) {
                await this.posService.closeCashRegister(cajaActual.id, {
                    final_cash: this.montoFinalCaja
                }).toPromise();

                // Generar reporte de cuadre
                await this.generarReporteCuadre(cajaActual);
            }
            this.cajaAbierta.set(false);
            this.mostrarDialogoCerrarCaja = false;

            // Limpiar datos del cuadre
            this.montoFinalCaja = 0;
            this.montoEsperado = 0;
            this.ventasEfectivoHoy = 0;
            this.diferenciaCaja = 0;

            this.messageService.add({
                severity: 'success',
                summary: 'Caja cerrada',
                detail: getCloseCashSuccessMessage(diferencia)
            });

            // NO limpiar estadísticas - se mantienen hasta que se abra nueva caja
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cerrar la caja'
            });
        }
    }

    async actualizarEstadisticasVenta() {
        const estadisticasActuales = this.estadisticasDia();
        const totalVenta = this.calcularTotal();

        // Si es pago en efectivo, agregar a ventas en efectivo de la sesión
        if (this.metodoPagoSeleccionado() === 'cash') {
            this.ventasEfectivoSesionActual += totalVenta;
        }

        const nuevasVentas = estadisticasActuales.ventas + 1;
        const nuevosIngresos = estadisticasActuales.ingresos + totalVenta;

        const nuevasEstadisticas = {
            ventas: nuevasVentas,
            ingresos: nuevosIngresos,
            ticketPromedio: nuevosIngresos / nuevasVentas
        };

        this.estadisticasDia.set(nuevasEstadisticas);
        this.guardarEstadisticas(nuevasEstadisticas);

        // Actualizar pagos no cash después de la venta
        try {
            const dailySummary = await this.posService.getDailySummary().toPromise();
            this.extraerPagosNoCash(dailySummary);
        } catch (error) {
            console.error('Error actualizando pagos no cash:', error);
        }
    }



    getCurrentDateTime(): string {
        const now = new Date();
        // Redondear a minutos para evitar cambios constantes
        now.setSeconds(0, 0);
        return now.toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    calcularCambio(): number {
        return Math.max(0, (Number(this.montoRecibido) || 0) - this.calcularTotal());
    }

    validarMontoRecibido(): boolean {
        return (Number(this.montoRecibido) || 0) >= this.calcularTotal();
    }

    agregarPagoMixto(metodo: string, monto: number) {
        if (!metodo || !monto || monto <= 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Debe seleccionar un método y monto válido'
            });
            return;
        }
        
        const totalActual = this.calcularTotalPagosMixtos();
        const totalVenta = this.calcularTotal();
        const restante = totalVenta - totalActual;
        
        if (monto > restante + 0.01) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Monto excesivo',
                detail: `Solo falta $${restante.toFixed(2)}. Ajuste el monto.`
            });
            return;
        }
        
        this.pagosMixtos.push({ metodo, monto: Number(monto) });
        this.metodoPagoTemporal = '';
        this.montoTemporal = 0;
        
        this.messageService.add({
            severity: 'success',
            summary: 'Pago agregado',
            detail: `${this.getPaymentMethodName(metodo as PaymentMethod)}: $${monto.toFixed(2)}`
        });
    }

    removerPagoMixto(index: number) {
        this.pagosMixtos.splice(index, 1);
    }

    async cargarPromociones() {
        try {
            let response;
            try {
                response = await this.posService.getPromotions().toPromise();
            } catch (error: any) {
                if (isForbiddenStatus(error)) {
                    this.promociones = [];
                    return;
                }
                response = { results: getDefaultPromotions() };
            }
            this.promociones = response?.results || [];
        } catch (error) {
            if (!environment.production) {
                console.error('Error cargando promociones:', error);
            }
        }
    }

    async aplicarPromocion(promocion: any) {
        this.promocionAplicada = promocion;
        this.descuento.set(Number(promocion.discount_value) || 0);
        this.mostrarDialogoPromociones = false;
    }

    async cargarHistorialVentas() {
        this.cargandoHistorial = true;
        try {
            const response = await this.posService.getSales().toPromise();
            this.historialVentas = mapSalesHistory(response, (venta) => this.mapBackendSaleToDto(venta));
        } catch (error) {
            if (!environment.production) {
                console.error('Error cargando historial:', error);
            }
            this.historialVentas = [];
        } finally {
            this.cargandoHistorial = false;
        }
    }

    visualizarVenta(venta: SaleWithDetailsDto) {
        this.ventaActual = mapSaleForTicketPreview(venta);
        this.mostrarDialogoTicket = true;
        setTimeout(() => this.generarQR(), 100);
    }

    reimprimirTicket(venta: SaleWithDetailsDto) {
        this.visualizarVenta(venta);
        // Auto-imprimir después de mostrar
        setTimeout(() => this.imprimirTicket(), 500);
    }

    async imprimirRecibo(ventaId: number) {
        try {
            await this.posService.printReceipt(ventaId).toPromise();
            this.messageService.add({
                severity: 'success',
                summary: 'Recibo generado',
                detail: 'Recibo listo para imprimir'
            });
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo generar el recibo'
            });
        }
    }

    async reembolsarVenta(ventaId: number) {
        if (!confirm('¿Está seguro de reembolsar esta venta?')) return;
        const reason = prompt('Motivo del reembolso (mínimo 10 caracteres):') || '';
        if (reason.trim().length < 10) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Motivo requerido',
                detail: 'Debe indicar un motivo válido para reembolsar'
            });
            return;
        }
        try {
            await this.posService.refundSale(ventaId, { reason: reason.trim() }).toPromise();
            this.messageService.add({
                severity: 'success',
                summary: 'Venta reembolsada',
                detail: 'La venta ha sido reembolsada correctamente'
            });
            this.cargarHistorialVentas();
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo reembolsar la venta'
            });
        }
    }

    calcularTotalArqueo(): number {
        return calculateArqueoTotal(this.denominaciones);
    }

    calcularDiferenciaArqueo(): number {
        const totalContado = this.calcularTotalArqueo();
        const efectivoEsperado = this.calcularEfectivoEsperadoArqueo();
        return calculateCashDifference(totalContado, efectivoEsperado);
    }

    calcularEfectivoEsperadoArqueo(): number {
        return calculateExpectedCash(this.obtenerMontoInicialCaja(), this.ventasEfectivoHoy);
    }

    actualizarDenominacion(denom: { valor: number; cantidad: number; total: number }, cantidad: number | string | null): void {
        const cantidadNormalizada = Math.max(0, Number(cantidad) || 0);
        denom.cantidad = cantidadNormalizada;
        denom.total = (Number(denom.valor) || 0) * cantidadNormalizada;
    }

    obtenerMontoInicialCaja(): number {
        return getInitialCashFromStorage();
    }

    limpiarArqueo() {
        this.denominaciones = getResetDenominations(this.denominaciones);
    }

    async cargarDatosArqueo() {
        try {
            const dailySummary = await this.posService.getDailySummary().toPromise();
            this.ventasEfectivoHoy = this.extraerVentasEfectivo(dailySummary);
            
            // Limpiar denominaciones al abrir
            this.limpiarArqueo();
        } catch (error) {
            console.error('Error cargando datos de arqueo:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar los datos del arqueo'
            });
        }
    }

    async realizarArqueoCaja() {
        const totalContado = this.calcularTotalArqueo();

        if (totalContado === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe contar al menos una denominación'
            });
            return;
        }

        try {
            const cajaActual = await this.posService.getCurrentCashRegister().toPromise();
            if (!cajaActual) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No hay una caja abierta'
                });
                return;
            }

            const counts = buildCashCountEntries(this.denominaciones);

            await this.posService.cashCount(cajaActual.id, counts).toPromise();

            // Calcular diferencia con efectivo esperado
            const efectivoEsperado = calculateExpectedCash(cajaActual.initial_cash, this.ventasEfectivoHoy);
            const diferencia = calculateCashDifference(totalContado, efectivoEsperado);

            // Guardar arqueo en localStorage
            this.guardarArqueoHistorico({
                fecha: new Date().toISOString(),
                totalContado,
                efectivoEsperado,
                diferencia,
                usuario: this.obtenerUsuarioActual(),
                denominaciones: this.denominaciones.filter(d => d.cantidad > 0)
            });

            // Limpiar denominaciones después del arqueo
            this.denominaciones = getResetDenominations(this.denominaciones);

            this.messageService.add({
                severity: diferencia === 0 ? 'success' : 'warn',
                summary: 'Arqueo completado',
                detail: `Total contado: $${totalContado.toFixed(2)}. Diferencia: $${diferencia.toFixed(2)}`
            });
            this.mostrarDialogoArqueo = false;
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo realizar el arqueo'
            });
        }
    }

    async cargarConfiguracion() {
        const businessName = getBusinessNameFromTenantStorage();
        try {
            const response = await fetch(`${environment.apiUrl}/settings/barbershop/`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const settings = await response.json();
                this.configuracionPos = buildPosConfigFromSettings(settings, businessName, environment.apiUrl);
                this.limiteDescuento = settings.service_discount_limit || 20;
            }

            const userIdentity = getCurrentUserIdentity();
            this.nombreUsuarioActual = userIdentity.nombreUsuarioActual;
            this.rolUsuarioActual = userIdentity.rolUsuarioActual;
        } catch (error) {
            console.error('Error cargando configuración:', error);
            this.configuracionPos = buildDefaultPosConfig(businessName);
            const userIdentity = getCurrentUserIdentity();
            this.nombreUsuarioActual = userIdentity.nombreUsuarioActual;
            this.rolUsuarioActual = userIdentity.rolUsuarioActual;
        }
    }

    async buscarPorCodigoBarras() {
        if (!this.codigoBarras.trim()) return;
        try {
            const producto = await this.posService.searchByBarcode(this.codigoBarras).toPromise();
            if (producto) {
                this.tipoActivo = 'products';
                this.filtrarItems();
                this.agregarAlCarrito(producto);
                this.codigoBarras = '';
            }
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Producto no encontrado',
                detail: 'Código de barras no válido'
            });
            this.codigoBarras = '';
        }
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboard(event: KeyboardEvent) {
        if (event.ctrlKey) {
            switch (event.key) {
                case 'n':
                    event.preventDefault();
                    this.limpiarCarrito();
                    break;
                case 'p':
                    event.preventDefault();
                    if (this.puedeVender()) this.procesarVenta();
                    break;
                case 'b':
                    event.preventDefault();
                    this.modoScanner = !this.modoScanner;
                    break;
            }
        }
    }

    setupKeyboardShortcuts() {}

    calcularTotalPagosMixtos(): number {
        return calculateMixedPaymentsTotal(this.pagosMixtos);
    }

    trackByDenominacion(index: number, item: any): any {
        return item.valor;
    }

    trackByItemId(index: number, item: any): any {
        return item.id;
    }

    trackByCartItem(index: number, item: any): any {
        return item.id;
    }

    validarPagoMixto(): boolean {
        const totalPagos = this.calcularTotalPagosMixtos();
        const totalVenta = this.calcularTotal();
        return isMixedPaymentBalanced(totalPagos, totalVenta);
    }

    obtenerMensajePagoMixto(): string {
        const totalPagos = this.calcularTotalPagosMixtos();
        const totalVenta = this.calcularTotal();
        return getMixedPaymentMessage(totalPagos, totalVenta);
    }

    formatearMoneda(valor: any): string {
        const num = Number(valor) || 0;
        return `$${num.toFixed(2)}`;
    }

    @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;

    mostrarTicket(venta: any) {
        // Guardar datos de la venta actual antes de limpiar el carrito
        this.ventaActual = buildTicketSaleData({
            saleId: venta.id,
            clientId: this.clienteSeleccionado?.id,
            employeeId: this.empleadoSeleccionado()?.id,
            paymentMethod: this.metodoPagoSeleccionado() as 'cash' | 'card' | 'transfer' | 'mixed',
            discount: this.descuento(),
            total: this.calcularTotal(),
            details: this.carrito().map(item => this.mapCartItemToSaleDetail(item)),
            mixedPayments: this.pagosMixtos,
            clientName: this.clienteSeleccionado?.full_name,
            employeeName: this.empleadoSeleccionado()?.display_name
        });
        this.mostrarDialogoTicket = true;
        setTimeout(() => this.generarQR(), 100);
    }

    generarQR() {
        if (!this.qrCanvas?.nativeElement || !this.ventaActual) return;
        drawSimpleSaleQr(this.qrCanvas.nativeElement, this.ventaActual.id, this.calcularTotal());
    }

    async imprimirTicket() {
        try {
            // Intentar impresión térmica si está disponible
            if (supportsSerialPrinting()) {
                await this.imprimirTermica();
            } else {
                // Fallback a impresión normal
                window.print();
            }
        } catch {
            window.print();
        }
    }

    async imprimirTermica() {
        try {
            const port = await (navigator as any).serial.requestPort();
            await port.open({ baudRate: 9600 });

            const writer = port.writable.getWriter();
            const encoder = new TextEncoder();

            const ticket = buildEscPosTicketText(
                this.ventaActual?.id,
                this.carrito().map(item => ({
                    name: item.item.name,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.subtotal
                })),
                this.calcularTotal()
            );

            await writer.write(encoder.encode(ticket));
            writer.releaseLock();
            await port.close();

            this.messageService.add({
                severity: 'success',
                summary: 'Impreso',
                detail: 'Ticket enviado a impresora térmica'
            });
        } catch (error) {
            throw error;
        }
    }

    cerrarTicket() {
        this.mostrarDialogoTicket = false;
        this.ventaActual = null;
    }

    reproducirSonidoVenta() {
        try {
            // Crear sonido usando Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
        } catch (error) {
            if (!environment.production) {
                console.warn('Audio no disponible', error);
            }
        }
    }

    @ViewChild('firmaCanvas') firmaCanvas!: ElementRef<HTMLCanvasElement>;
    firmando = false;

    iniciarFirma(event: any) {
        this.firmando = true;
        startSignatureStroke(this.firmaCanvas.nativeElement, event);
    }

    dibujarFirma(event: any) {
        if (!this.firmando) return;
        drawSignatureStroke(this.firmaCanvas.nativeElement, event);
    }

    terminarFirma() {
        this.firmando = false;
    }

    limpiarFirma() {
        clearSignatureCanvas(this.firmaCanvas.nativeElement);
    }

    confirmarFirma() {
        this.firmaCliente = getSignatureDataUrl(this.firmaCanvas.nativeElement);
        this.mostrarDialogoFirma = false;
        this.confirmarVenta();
    }

    async generarReporteCuadre(caja: any) {
        try {
            const reporteData = buildCashCloseReportData({
                usuario: this.obtenerUsuarioActual(),
                montoEsperado: this.montoEsperado,
                ventasEfectivoHoy: this.ventasEfectivoHoy,
                pagosNoCash: this.pagosNoCash(),
                montoFinalCaja: this.montoFinalCaja,
                diferenciaCaja: this.diferenciaCaja,
                estadisticas: this.estadisticasDia()
            });
            printCashCloseReport(reporteData);

            this.messageService.add({
                severity: 'info',
                summary: 'Reporte generado',
                detail: 'Reporte de cuadre descargado'
            });
        } catch (error) {
            console.error('Error generando reporte:', error);
        }
    }

    // Variable para trackear ventas en efectivo de la sesión
    ventasEfectivoSesionActual = 0;

    extraerVentasEfectivo(dailySummary: any): number {
        try {
            return extractCashSalesTotal(dailySummary);
        } catch (error) {
            if (!environment.production) {
                console.error('Error extrayendo ventas en efectivo:', error);
            }
            return 0;
        }
    }

    extraerPagosNoCash(dailySummary: any): void {
        try {
            this.pagosNoCash.set(extractNonCashPayments(dailySummary));
        } catch (error) {
            if (!environment.production) {
                console.error('Error extrayendo pagos no cash:', error);
            }
            this.pagosNoCash.set([]);
        }
    }

    calcularVentasEfectivoSesion(): number {
        return this.ventasEfectivoSesionActual;
    }

    cargarEstadisticasGuardadas() {
        try {
            const userId = this.obtenerUserId();
            this.estadisticasDia.set(loadDailyStats(userId));
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            this.estadisticasDia.set({ ventas: 0, ingresos: 0, ticketPromedio: 0 });
        }
    }

    guardarEstadisticas(estadisticas: any) {
        try {
            const userId = this.obtenerUserId();
            saveDailyStats(userId, estadisticas);
        } catch (error) {
            if (!environment.production) {
                console.error('Error guardando estadísticas:', error);
            }
        }
    }

    obtenerUserId(): number {
        return getUserIdFromStorage();
    }

    obtenerUsuarioActual(): string {
        return this.nombreUsuarioActual || 'Cajero';
    }

    esClienteFrecuente(cliente: any): boolean {
        return this.clientesFrecuentes.some(c => c.id === cliente.id);
    }

    obtenerNombreNegocio(): string {
        return getBusinessNameFromTenantStorage();
    }

    aplicarDescuentoClienteFrecuente() {
        if (this.clienteSeleccionado && this.esClienteFrecuente(this.clienteSeleccionado)) {
            const descuentoVIP = this.calcularSubtotal() * 0.1; // 10% descuento
            this.descuento.set(Math.max(this.descuento(), descuentoVIP));
            this.messageService.add({
                severity: 'success',
                summary: 'Descuento VIP aplicado',
                detail: `10% de descuento por ser cliente frecuente: ${this.formatearMoneda(descuentoVIP)}`
            });
        }
    }


    getBusinessLogo(): string | null {
        const logo = this.configuracionPos?.logo_url || '';
        return logo ? toAbsoluteMediaUrl(environment.apiUrl, logo) : null;
    }

    obtenerResumenVenta() {
        return {
            items: this.carrito().length,
            subtotal: this.calcularSubtotal(),
            descuento: this.descuento(),
            total: this.calcularTotal(),
            cliente: this.clienteSeleccionado?.full_name || 'Cliente General',
            empleado: this.empleadoSeleccionado()?.display_name || this.empleadoSeleccionado()?.user?.full_name || 'N/A',
            payment_method: this.metodoPagoSeleccionado()
        };
    }

    // Métodos de validación de permisos
    puedeUsarPOS(): boolean {
        return hasRolePermission(this.rolUsuarioActual, POS_ROLE_GROUPS.usePos);
    }

    puedeAbrirCaja(): boolean {
        return hasRolePermission(this.rolUsuarioActual, POS_ROLE_GROUPS.openCash);
    }

    puedeCerrarCaja(): boolean {
        return hasRolePermission(this.rolUsuarioActual, POS_ROLE_GROUPS.closeCash);
    }

    puedeAplicarDescuentoAlto(): boolean {
        return hasRolePermission(this.rolUsuarioActual, POS_ROLE_GROUPS.highDiscount);
    }

    puedeVerHistorial(): boolean {
        return hasRolePermission(this.rolUsuarioActual, POS_ROLE_GROUPS.history);
    }

    puedeReembolsarVentas(): boolean {
        return hasRolePermission(this.rolUsuarioActual, POS_ROLE_GROUPS.refund);
    }

    canRefundSale(venta: SaleWithDetailsDto): boolean {
        if (!this.puedeReembolsarVentas()) return false;
        return canRefundSaleByContent(venta);
    }

    private normalizarRolPOS(role: string): string {
        return normalizePosRole(role);
    }

    guardarArqueoHistorico(arqueo: any) {
        try {
            const userId = this.obtenerUserId();
            saveArqueoHistory(userId, arqueo, 50);
        } catch (error) {
            console.error('Error guardando arqueo histórico:', error);
        }
    }

    cargarHistorialArqueos() {
        try {
            const userId = this.obtenerUserId();
            this.historialArqueos = loadArqueoHistory(userId);
        } catch (error) {
            console.error('Error cargando historial de arqueos:', error);
            this.historialArqueos = [];
        }
    }

    limpiarCache(): void {
        this.cache.clear();
        this.messageService.add({
            severity: 'info',
            summary: 'Caché limpiado',
            detail: 'Se recargarán los datos desde el servidor',
            life: 2000
        });
    }
}
