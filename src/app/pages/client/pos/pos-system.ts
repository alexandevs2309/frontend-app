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
import { CashRegister, PosService } from '../../../core/services/pos/pos.service';
import { ServiceService } from '../../../core/services/service/service.service';
import { InventoryService } from '../../../core/services/inventory/inventory.service';
import { ClientService } from '../../../core/services/client/client.service';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { SettingsService } from '../../../core/services/settings/settings.service';
import { environment } from '../../../../environments/environment';
import { SaleDto, SaleWithDetailsDto, CreateSaleDto } from '../../../core/dto/sale.dto';
import { SaleDetailDto, CartItemDto } from '../../../core/dto/sale-detail.dto';
import { PaymentDto, PaymentMethodDto } from '../../../core/dto/payment.dto';
import { Subject } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { calculateCartSubtotal, calculateMixedPaymentsTotal, calculateTotalFromDiscount, getMixedPaymentMessage, isMixedPaymentBalanced } from './pos-calculations';
import { getDiscountContext, getSaleValidationMessage } from './pos-sale-builder';
import { POS_ROLE_GROUPS, canRefundSaleByContent, hasRolePermission, normalizePosRole } from './pos-permissions';
import {
    buildCashCountEntries,calculateArqueoTotal,calculateCashDifference,calculateExpectedCash,getCloseCashSuccessMessage,    getCloseCashValidationMessage,getDenominationsWithTotals,getDifferenceToConfirm,    getOpenCashSuccessMessage,getOpenCashValidationMessage,getResetDenominations,shouldConfirmCartLoss
} from './pos-cash-workflow';
import {
    buildTicketSaleData
} from './pos-ticket-utils';
import { buildCashCloseReportData, extractCashSalesTotal, extractNonCashPayments, printCashCloseReport } from './pos-cash-reporting';
import { cartHasServices, createCartItem, findCartItemIndex, getAvailableStock, PosCartItem, projectCatalogState, removeCartItem, updateCartQuantity } from './pos-cart-state';
import { PosCashSnapshot, PosCashStateService } from './pos-cash-state.service';
import { PosSaleFlowService, PosStockValidationError } from './pos-sale-flow.service';
import { PosTicketFlowService } from './pos-ticket-flow.service';
import { buildDefaultPosConfig, buildPosConfigFromSettings, getBusinessNameFromTenantStorage, getCurrentUserIdentity, toAbsoluteMediaUrl } from './pos-config';
import {
    extractCatalogCategories,filterCatalogItems,getCachedPosCatalog,isForbiddenStatus,loadPosCatalogData,normalizeArrayResponse,setCachedPosCatalog
} from './pos-catalog';
import { getDefaultPromotions, mapSaleForTicketPreview, mapSalesHistory } from './pos-sales-history';


type CartItem = PosCartItem;
type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mixed';
type FiscalVoucherType = 'consumer' | 'credit';

@Component({
    selector: 'app-pos-system',
    standalone: true,
    imports: [CommonModule, ButtonModule, InputTextModule, SelectModule, TableModule, CardModule, DividerModule, ToastModule, DialogModule, InputNumberModule, TooltipModule, FormsModule],
    providers: [MessageService],
    templateUrl: './pos-system.html',
    styles: [`
        :host {
            display: block;
            height: 100%;
        }
    `]
})
export class PosSystem implements OnInit, OnDestroy {
    private readonly posService = inject(PosService);
    private readonly servicesService = inject(ServiceService);
    private readonly inventoryService = inject(InventoryService);
    private readonly clientsService = inject(ClientService);
    private readonly employeesService = inject(EmployeeService);
    private readonly messageService = inject(MessageService);
    private readonly settingsService = inject(SettingsService);
    private readonly posCashStateService = inject(PosCashStateService);
    private readonly posSaleFlowService = inject(PosSaleFlowService);
    private readonly posTicketFlowService = inject(PosTicketFlowService);

    // Signals principales
    carrito = signal<CartItem[]>([]);
    cajaAbierta = signal(false);
    estadisticasDia = signal({ ventas: 0, ingresos: 0, ticketPromedio: 0 });
    pagosNoCash = signal<PaymentMethodDto[]>([]);
    currentCashRegister = signal<CashRegister | null>(null);

    // Computed signals para cálculos automáticos
    subtotal = computed(() => calculateCartSubtotal(this.carrito()));
    currencyCode = computed(() => this.settingsService.settings().currency || 'DOP');
    currencyLocale = computed(() => this.settingsService.getCurrencyLocale());
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

        const fiscalValido = !this.requiereComprobanteFiscal() || this.isFiscalDataValid();

        return tieneItems && tienePago && cajaAbierta && totalValido && empleadoValido && fiscalValido;
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
    requiereComprobanteFiscal = signal(false);
    tipoComprobanteFiscal = signal<FiscalVoucherType>('consumer');
    datosComprobanteFiscal = { nombre: '', documento: '' };

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
    nombreCajeroTurno = '';

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
            employee_name: backendSale.employee_name,
            user_name: backendSale.user_name,
            cashier_name: backendSale.cashier_name || backendSale.user_name,
            fiscal_requested: backendSale.fiscal_requested,
            fiscal_voucher_type: backendSale.fiscal_voucher_type,
            fiscal_name: backendSale.fiscal_name,
            fiscal_document: backendSale.fiscal_document
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

    getSelectedPaymentMethodLabel(): string {
        const method = this.metodoPagoSeleccionado();
        return method ? this.getPaymentMethodName(method as PaymentMethod) : 'Sin metodo';
    }

    getSaleReadinessLabel(): string {
        if (this.procesandoVenta) {
            return 'Procesando venta';
        }

        if (this.puedeVenderComputed()) {
            return 'Listo para cobrar';
        }

        if (!this.cajaAbierta()) {
            return 'Abre caja para comenzar';
        }

        if (this.carrito().length === 0) {
            return 'Agrega productos o servicios';
        }

        if (!this.metodoPagoSeleccionado()) {
            return 'Selecciona un metodo de pago';
        }

        if (this.tieneServicios() && !this.empleadoSeleccionado()?.id) {
            return 'Asigna un empleado';
        }

        if (this.requiereComprobanteFiscal() && !this.isFiscalDataValid()) {
            return 'Completa los datos fiscales';
        }

        return 'Completa los datos de la venta';
    }

    getSaleReadinessClass(): string {
        if (this.procesandoVenta) {
            return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20';
        }

        return this.puedeVenderComputed()
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20';
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
    private quickSearchResetTimer: number | null = null;
    private dateTimeInterval: ReturnType<typeof setInterval> | null = null;
    currentDateTime = signal(this.buildDateTime());

    private buildDateTime(): string {
        const now = new Date();
        now.setSeconds(0, 0);
        return now.toLocaleString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long',
            day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    metodosPago = [
        { label: 'Efectivo', value: 'cash' },
        { label: 'Tarjeta', value: 'card' },
        { label: 'Transferencia', value: 'transfer' },
        { label: 'Mixto', value: 'mixed' }
    ];
    tiposComprobanteFiscal = [
        { label: 'Consumo (02/32)', value: 'consumer' },
        { label: 'Credito fiscal (01/31)', value: 'credit' }
    ];

    constructor() {
        // Configurar debounce para búsqueda
        this.searchSubject.pipe(
            debounceTime(120),
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
        this.dateTimeInterval = setInterval(() => this.currentDateTime.set(this.buildDateTime()), 60_000);
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
        this.cargarHistorialArqueos();
        setTimeout(() => {
            this.cargarPromociones();
            this.setupKeyboardShortcuts();
        }, 0);
    }

    ngOnDestroy(): void {
        if (this.quickSearchResetTimer !== null) window.clearTimeout(this.quickSearchResetTimer);
        if (this.dateTimeInterval !== null) clearInterval(this.dateTimeInterval);
        this.searchSubject.complete();
        this.categorySubject.complete();
    }

    onSearchChange(value: string): void {
        this.busqueda = value;
        this.filtrarItems();
        this.searchSubject.next(value);
    }

    onCategoryChange(value: string): void {
        this.categoriaSeleccionada = value;
        this.filtrarItems();
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
                getServices: () => firstValueFrom(this.servicesService.getServices()),
                getServiceCategories: () => firstValueFrom(this.servicesService.getServiceCategories()),
                getProducts: () => firstValueFrom(this.inventoryService.getProducts()),
                getClients: () => firstValueFrom(this.clientsService.getClients()),
                getEmployees: () => firstValueFrom(this.employeesService.getEmployees())
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
        const projection = projectCatalogState(
            this.tipoActivo,
            this.servicios,
            this.productos,
            this.categoriaSeleccionada,
            this.busqueda,
            extractCatalogCategories,
            filterCatalogItems
        );
        this.categorias = projection.categorias;
    }

    cambiarTipoActivo(tipo: 'services' | 'products'): void {
        this.tipoActivo = tipo;
        this.categoriaSeleccionada = '';
        this.extraerCategorias();
        this.filtrarItems();
    }






    filtrarItems() {
        const projection = projectCatalogState(
            this.tipoActivo,
            this.servicios,
            this.productos,
            this.categoriaSeleccionada,
            this.busqueda,
            extractCatalogCategories,
            filterCatalogItems
        );
        this.itemsFiltrados = projection.itemsFiltrados;
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
                const productoActual = await firstValueFrom(this.inventoryService.getProduct(item.id));
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
                if (!environment.production) console.error('Error verificando stock:', error);
            }
        }

        const index = findCartItemIndex(this.carrito(), item, this.tipoActivo);

        if (index >= 0) {
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

        const cartItem: CartItem = createCartItem(item, this.tipoActivo);

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
            const result = updateCartQuantity(cart, index, cambio);
            if (result.warning) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Stock insuficiente',
                    detail: result.warning
                });
            }
            return result.cart;
        });
    }

    removerDelCarrito(index: number) {
        this.carrito.update(cart => removeCartItem(cart, index));
    }

    limpiarCarrito() {
        this.carrito.set([]);
        this.clienteSeleccionado = null;
        this.empleadoSeleccionado.set(null);
        this.metodoPagoSeleccionado.set('');
        this.descuento.set(0);
        this.tipoDescuento.set('$');
        this.requiereComprobanteFiscal.set(false);
        this.tipoComprobanteFiscal.set('consumer');
        this.datosComprobanteFiscal = { nombre: '', documento: '' };
        this.resetearPago();
    }

    obtenerStockDisponible(item: any): number {
        if (this.tipoActivo === 'products') {
            return getAvailableStock(this.carrito(), item);
        }
        return 999;
    }

    puedeAgregarMas(item: any): boolean {
        return this.obtenerStockDisponible(item) > 0;
    }

    getCantidadEnCarrito(item: any): number {
        const cartItem = this.carrito().find((entry) => {
            const expectedType = this.tipoActivo === 'services' ? 'service' : 'product';
            return entry.type === expectedType && entry.item.id === item.id;
        });

        return cartItem?.quantity || 0;
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
                    detail: `El descuento no puede ser mayor al subtotal (${this.formatearMoneda(subtotal)})`
                });
                this.descuento.set(subtotal);
            }
            if (descuentoActual < 0) {
                this.descuento.set(0);
            }
        }
    }

    tieneServicios(): boolean {
        return cartHasServices(this.carrito());
    }

    puedeVender(): boolean {
        return this.puedeVenderComputed();
    }

    obtenerMensajeValidacion(): string {
        if (this.requiereComprobanteFiscal() && !this.isFiscalDataValid()) {
            return 'Completa nombre y RNC/Cedula para emitir comprobante fiscal';
        }

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
            await this.posSaleFlowService.validateStock(this.carrito());

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
            const venta = await this.posSaleFlowService.createSale({
                cart: this.carrito(),
                clientId: this.clienteSeleccionado?.id,
                employeeId: this.empleadoSeleccionado()?.id ?? undefined,
                paymentMethod,
                discountAmount: discountContext.discountAmount,
                discountReason,
                total: totalVenta,
                mixedPayments: this.pagosMixtos,
                mapCartItemToSaleDetail: (item) => this.mapCartItemToSaleDetail(item)
            });

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
            if (error instanceof PosStockValidationError) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Stock insuficiente',
                    detail: error.messages.join('\n'),
                    life: 8000
                });
                await this.cargarDatos();
                return;
            }

            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: this.posSaleFlowService.getErrorMessage(error),
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
        const snapshot = await this.posCashStateService.getCurrentSnapshot(this.nombreUsuarioActual);
        this.aplicarCashSnapshot(snapshot);
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
            const snapshot = await this.posCashStateService.openRegister(this.montoInicialCaja, this.nombreUsuarioActual);
            this.aplicarCashSnapshot(snapshot);
            this.mostrarDialogoAbrirCaja = false;

            // NO resetear estadísticas - se mantienen del día
            // Solo resetear ventas en efectivo de la sesión
            this.ventasEfectivoSesionActual = 0;

            const montoParaGuardar = this.montoInicialCaja;
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
            const closePreparation = await this.posCashStateService.prepareClose(this.nombreUsuarioActual);

            if (!closePreparation?.register) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No hay una caja abierta'
                });
                return;
            }
            this.aplicarCashSnapshot(closePreparation);

            this.ventasEfectivoHoy = closePreparation.cashSales;
            this.montoEsperado = closePreparation.expectedCash;
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
            if (!environment.production) console.error('Error preparando cierre de caja:', error);
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
            const confirmar = confirm(`Hay una diferencia de ${this.formatearMoneda(diferencia)}. ¿Está seguro de cerrar la caja?`);
            if (!confirmar) return;
        }

        try {
            const cajaActual = await firstValueFrom(this.posService.getCurrentCashRegister());
            if (cajaActual) {
                await this.posCashStateService.closeRegister(cajaActual.id, this.montoFinalCaja);

                // Generar reporte de cuadre
                await this.generarReporteCuadre(cajaActual);
            }
            this.aplicarCashSnapshot({
                register: null,
                cashierName: this.nombreUsuarioActual,
                stats: this.estadisticasDia(),
                cashSales: 0,
                nonCashPayments: []
            });
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

        // Actualizar pagos no cash después de la venta
        try {
            await this.sincronizarEstadisticasDesdeBackend();
        } catch (error) {
            if (!environment.production) console.error('Error actualizando pagos no cash:', error);
        }
    }



    getCurrentDateTime(): string {
        return this.currentDateTime();
    }

    calcularCambio(): number {
        return Math.max(0, (Number(this.montoRecibido) || 0) - this.calcularTotal());
    }

    validarMontoRecibido(): boolean {
        return (Number(this.montoRecibido) || 0) >= this.calcularTotal();
    }

    toggleComprobanteFiscal(): void {
        const next = !this.requiereComprobanteFiscal();
        this.requiereComprobanteFiscal.set(next);

        if (!next) {
            this.tipoComprobanteFiscal.set('consumer');
            this.datosComprobanteFiscal = { nombre: '', documento: '' };
            return;
        }

        if (this.clienteSeleccionado?.full_name && !this.datosComprobanteFiscal.nombre) {
            this.datosComprobanteFiscal.nombre = this.clienteSeleccionado.full_name;
        }
    }

    getFiscalVoucherLabel(): string {
        return this.tipoComprobanteFiscal() === 'credit'
            ? 'Factura de credito fiscal'
            : 'Factura de consumo';
    }

    getFiscalDocumentLabel(): string {
        return this.tipoComprobanteFiscal() === 'credit' ? 'RNC' : 'RNC o Cedula';
    }

    sanitizeFiscalDocumentInput(value: string): void {
        this.datosComprobanteFiscal.documento = (value || '').replace(/[^\d-]/g, '').trim();
    }

    isFiscalDocumentValid(): boolean {
        const digits = (this.datosComprobanteFiscal.documento || '').replace(/\D/g, '');
        return digits.length === 9 || digits.length === 11;
    }

    isFiscalDataValid(): boolean {
        return !!this.datosComprobanteFiscal.nombre.trim() && this.isFiscalDocumentValid();
    }

    usarMontoRecibido(monto: number): void {
        this.montoRecibido = Math.max(0, Number(monto) || 0);
        this.cambio = this.calcularCambio();
    }

    getMontosRapidosEfectivo(): number[] {
        const total = this.calcularTotal();
        if (total <= 0) return [];

        const rounded = [
            total,
            this.redondearHaciaArriba(total, 50),
            this.redondearHaciaArriba(total, 100),
            this.redondearHaciaArriba(total, 500),
            this.redondearHaciaArriba(total, 1000)
        ];

        return [...new Set(rounded.filter((value) => value >= total))].slice(0, 4);
    }

    getMontoRestanteMixto(): number {
        return Math.max(0, this.calcularTotal() - this.calcularTotalPagosMixtos());
    }

    completarPagoMixto(metodo: string): void {
        this.agregarPagoMixto(metodo, this.getMontoRestanteMixto());
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
                detail: `Solo falta ${this.formatearMoneda(restante)}. Ajuste el monto.`
            });
            return;
        }
        
        this.pagosMixtos.push({ metodo, monto: Number(monto) });
        this.metodoPagoTemporal = '';
        this.montoTemporal = 0;
        
        this.messageService.add({
            severity: 'success',
            summary: 'Pago agregado',
            detail: `${this.getPaymentMethodName(metodo as PaymentMethod)}: ${this.formatearMoneda(monto)}`
        });
    }

    removerPagoMixto(index: number) {
        this.pagosMixtos.splice(index, 1);
    }

    async cargarPromociones() {
        try {
            let response;
            try {
                response = await firstValueFrom(this.posService.getPromotions());
            } catch (error: any) {
                if (isForbiddenStatus(error)) {
                    this.promociones = [];
                    return;
                }
                response = { results: getDefaultPromotions() };
            }
            this.promociones = response?.results || [];
        } catch (error) {
            if (!environment.production) console.error('Error cargando promociones:', error);
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
            const response = await firstValueFrom(this.posService.getSales());
            this.historialVentas = mapSalesHistory(response, (venta) => this.mapBackendSaleToDto(venta));
        } catch (error) {
            if (!environment.production) console.error('Error cargando historial:', error);
            this.historialVentas = [];
        } finally {
            this.cargandoHistorial = false;
        }
    }

    visualizarVenta(venta: SaleWithDetailsDto) {
        this.ventaActual = mapSaleForTicketPreview(venta);
        this.mostrarDialogoTicket = true;
        this.posTicketFlowService.scheduleQrRender(() => this.generarQR());
    }

    reimprimirTicket(venta: SaleWithDetailsDto) {
        this.visualizarVenta(venta);
        this.posTicketFlowService.scheduleTicketPrint(() => {
            void this.imprimirTicket();
        });
    }

    async imprimirRecibo(ventaId: number) {
        try {
            await firstValueFrom(this.posService.printReceipt(ventaId));
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
            await firstValueFrom(this.posService.refundSale(ventaId, { reason: reason.trim() }));
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
        return Number(this.currentCashRegister()?.initial_cash) || 0;
    }

    limpiarArqueo() {
        this.denominaciones = getResetDenominations(this.denominaciones);
    }

    async cargarDatosArqueo() {
        try {
            const snapshot = await this.posCashStateService.loadCashCountContext(this.currentCashRegister(), this.nombreUsuarioActual);
            this.aplicarCashSnapshot(snapshot);
            
            // Limpiar denominaciones al abrir
            this.limpiarArqueo();
        } catch (error) {
            if (!environment.production) console.error('Error cargando datos de arqueo:', error);
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
            const cajaActual = await firstValueFrom(this.posService.getCurrentCashRegister());
            if (!cajaActual) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No hay una caja abierta'
                });
                return;
            }

            const counts = buildCashCountEntries(this.denominaciones);
            const cashCountResult = await this.posCashStateService.performCashCount(
                cajaActual.id,
                counts,
                this.obtenerUsuarioActual(),
                this.denominaciones.filter(d => d.cantidad > 0)
            );

            this.historialArqueos = [cashCountResult.historyEntry, ...this.historialArqueos].slice(0, 20);

            // Limpiar denominaciones después del arqueo
            this.denominaciones = getResetDenominations(this.denominaciones);

            this.messageService.add({
                severity: cashCountResult.difference === 0 ? 'success' : 'warn',
                summary: 'Arqueo completado',
                detail: `Total contado: ${this.formatearMoneda(cashCountResult.totalCounted)}. Diferencia: ${this.formatearMoneda(cashCountResult.difference)}`
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
            const settings = await firstValueFrom(this.settingsService.getBarbershopSettings());
            this.configuracionPos = buildPosConfigFromSettings(settings, businessName, environment.apiUrl);
            this.limiteDescuento = settings.service_discount_limit || 20;

            const userIdentity = getCurrentUserIdentity();
            this.nombreUsuarioActual = userIdentity.nombreUsuarioActual;
            this.rolUsuarioActual = userIdentity.rolUsuarioActual;
        } catch (error) {
            if (!environment.production) console.error('Error cargando configuración:', error);
            this.configuracionPos = buildDefaultPosConfig(businessName);
            const userIdentity = getCurrentUserIdentity();
            this.nombreUsuarioActual = userIdentity.nombreUsuarioActual;
            this.rolUsuarioActual = userIdentity.rolUsuarioActual;
        }
    }

    async buscarPorCodigoBarras() {
        if (!this.codigoBarras.trim()) return;
        try {
            const producto = await firstValueFrom(this.posService.searchByBarcode(this.codigoBarras));
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
        if (this.handleDialogKeyboard(event)) {
            return;
        }

        const target = event.target as HTMLElement | null;
        const isEditable = this.isEditableTarget(target);

        if (!event.ctrlKey && !event.metaKey && !event.altKey) {
            if (event.key === 'Enter' && !isEditable) {
                event.preventDefault();
                if (this.puedeVender()) {
                    void this.procesarVenta();
                }
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                if (!this.procesandoVenta && this.carrito().length > 0) {
                    this.limpiarCarrito();
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Orden limpia',
                        detail: 'La orden actual fue reiniciada',
                        life: 2000
                    });
                }
                return;
            }

            if (!isEditable && event.key === 'Backspace') {
                event.preventDefault();
                this.syncQuickSearch(this.busqueda.slice(0, -1), true);
                return;
            }

            if (!isEditable && event.key.length === 1) {
                event.preventDefault();
                this.syncQuickSearch(`${this.busqueda}${event.key}`, true);
                return;
            }
        }

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

    setupKeyboardShortcuts() {
        window.setTimeout(() => this.focusQuickSearch(), 0);
    }

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
        return new Intl.NumberFormat(this.currencyLocale(), {
            style: 'currency',
            currency: this.currencyCode()
        }).format(num);
    }

    @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;

    mostrarTicket(venta: any) {
        // Guardar datos de la venta actual antes de limpiar el carrito
        this.ventaActual = this.posTicketFlowService.buildTicketSale({
            saleId: venta.id,
            clientId: this.clienteSeleccionado?.id,
            employeeId: this.empleadoSeleccionado()?.id,
            paymentMethod: this.metodoPagoSeleccionado() as 'cash' | 'card' | 'transfer' | 'mixed',
            discount: this.descuento(),
            total: this.calcularTotal(),
            details: this.carrito().map(item => this.mapCartItemToSaleDetail(item)),
            mixedPayments: this.pagosMixtos,
            clientName: this.clienteSeleccionado?.full_name,
            employeeName:
                this.empleadoSeleccionado()?.displayName ||
                this.empleadoSeleccionado()?.display_name ||
                this.empleadoSeleccionado()?.user?.full_name ||
                this.empleadoSeleccionado()?.full_name,
            cashierName: this.nombreCajeroTurno || this.nombreUsuarioActual,
            fiscalRequested: this.requiereComprobanteFiscal(),
            fiscalVoucherType: this.getFiscalVoucherLabel(),
            fiscalName: this.datosComprobanteFiscal.nombre.trim(),
            fiscalDocument: this.datosComprobanteFiscal.documento.trim()
        });
        this.mostrarDialogoTicket = true;
        this.posTicketFlowService.scheduleQrRender(() => this.generarQR());
    }

    generarQR() {
        if (!this.qrCanvas?.nativeElement || !this.ventaActual) return;
        this.posTicketFlowService.renderQr(this.qrCanvas.nativeElement, this.ventaActual.id, this.calcularTotal());
    }

    async imprimirTicket() {
        try {
            const mode = await this.posTicketFlowService.printTicket(
                this.carrito(),
                this.calcularTotal(),
                this.ventaActual?.id
            );
            if (mode === 'thermal') {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Impreso',
                    detail: 'Ticket enviado a impresora térmica'
                });
            }
        } catch {
            window.print();
        }
    }

    cerrarTicket() {
        this.mostrarDialogoTicket = false;
        this.ventaActual = null;
    }

    reproducirSonidoVenta() {
        try {
            this.posTicketFlowService.playSaleSound();
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
        this.posTicketFlowService.startSignature(this.firmaCanvas.nativeElement, event);
    }

    dibujarFirma(event: any) {
        if (!this.firmando) return;
        this.posTicketFlowService.drawSignature(this.firmaCanvas.nativeElement, event);
    }

    terminarFirma() {
        this.firmando = false;
    }

    limpiarFirma() {
        this.posTicketFlowService.clearSignature(this.firmaCanvas.nativeElement);
    }

    confirmarFirma() {
        this.firmaCliente = this.posTicketFlowService.readSignature(this.firmaCanvas.nativeElement);
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
            if (!environment.production) console.error('Error generando reporte:', error);
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

    private aplicarCashSnapshot(snapshot: PosCashSnapshot): void {
        this.currentCashRegister.set(snapshot.register);
        this.cajaAbierta.set(!!snapshot.register);
        this.nombreCajeroTurno = snapshot.cashierName || this.nombreUsuarioActual || '';
        this.estadisticasDia.set(snapshot.stats);
        this.ventasEfectivoHoy = snapshot.cashSales;
        this.pagosNoCash.set(snapshot.nonCashPayments);
    }

    private async sincronizarEstadisticasDesdeBackend(): Promise<void> {
        const snapshot = await this.posCashStateService.getCurrentSnapshot(this.nombreUsuarioActual);
        this.aplicarCashSnapshot(snapshot);
    }

    async cargarEstadisticasGuardadas() {
        try {
            await this.sincronizarEstadisticasDesdeBackend();
        } catch (error) {
            if (!environment.production) console.error('Error cargando estadísticas desde backend:', error);
            this.estadisticasDia.set({ ventas: 0, ingresos: 0, ticketPromedio: 0 });
        }
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

    cargarHistorialArqueos() {
        this.historialArqueos = [];
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

    @ViewChild('quickSearchInput') quickSearchInput?: ElementRef<HTMLInputElement>;

    seleccionarMetodoPago(metodo: PaymentMethod): void {
        this.metodoPagoSeleccionado.set(metodo);
    }

    onCashDialogShow(): void {
        if (!this.montoRecibido || this.montoRecibido < this.calcularTotal()) {
            this.usarMontoRecibido(this.calcularTotal());
        }

        this.focusCurrencyInput('.pos-cash-input');
    }

    onMixedPaymentDialogShow(): void {
        this.focusCurrencyInput('.pos-mixed-amount-input');
    }

    private focusQuickSearch(cursorAtEnd = true): void {
        const input = this.quickSearchInput?.nativeElement;
        if (!input) return;

        input.focus();
        if (cursorAtEnd) {
            const end = input.value.length;
            input.setSelectionRange(end, end);
        }
    }

    private syncQuickSearch(value: string, focusInput = false): void {
        this.onSearchChange(value);

        if (focusInput) {
            this.focusQuickSearch();
        }

        if (this.quickSearchResetTimer !== null) {
            window.clearTimeout(this.quickSearchResetTimer);
        }

        this.quickSearchResetTimer = window.setTimeout(() => {
            this.quickSearchResetTimer = null;
        }, 1200);
    }

    private isDialogOpen(): boolean {
        return [
            this.mostrarDialogoAbrirCaja,
            this.mostrarDialogoCerrarCaja,
            this.mostrarDialogoPago,
            this.mostrarDialogoPagosMixtos,
            this.mostrarDialogoArqueo,
            this.mostrarDialogoHistorialArqueos,
            this.mostrarDialogoHistorial,
            this.mostrarDialogoPromociones,
            this.mostrarDialogoTicket,
            this.mostrarDialogoFirma
        ].some(Boolean);
    }

    private handleDialogKeyboard(event: KeyboardEvent): boolean {
        if (!this.isDialogOpen()) {
            return false;
        }

        if (event.ctrlKey || event.metaKey || event.altKey) {
            return false;
        }

        if (event.key === 'Escape') {
            event.preventDefault();

            if (this.mostrarDialogoPago) this.mostrarDialogoPago = false;
            else if (this.mostrarDialogoPagosMixtos) this.mostrarDialogoPagosMixtos = false;
            else if (this.mostrarDialogoTicket) this.cerrarTicket();

            return true;
        }

        if (event.key !== 'Enter') {
            return false;
        }

        if (this.procesandoVenta) {
            event.preventDefault();
            return true;
        }

        if (this.mostrarDialogoPago) {
            event.preventDefault();
            if (this.validarMontoRecibido()) {
                void this.confirmarVenta();
            }
            return true;
        }

        if (this.mostrarDialogoPagosMixtos) {
            const canAddCurrentPayment = !!this.metodoPagoTemporal && (Number(this.montoTemporal) || 0) > 0;
            event.preventDefault();

            if (canAddCurrentPayment) {
                this.agregarPagoMixto(this.metodoPagoTemporal, this.montoTemporal);
                window.setTimeout(() => this.focusCurrencyInput('.pos-mixed-amount-input'), 0);
                return true;
            }

            if (this.validarPagoMixto()) {
                void this.confirmarVenta();
                return true;
            }

            return true;
        }

        if (this.mostrarDialogoTicket) {
            event.preventDefault();
            this.cerrarTicket();
            return true;
        }

        return false;
    }

    private isEditableTarget(target: HTMLElement | null): boolean {
        if (!target) return false;

        const tagName = target.tagName?.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
            return true;
        }

        return target.isContentEditable || !!target.closest('.p-inputtext, .p-inputwrapper, .p-select, .p-dialog');
    }

    private redondearHaciaArriba(valor: number, paso: number): number {
        if (paso <= 0) return valor;
        return Math.ceil(valor / paso) * paso;
    }

    private focusCurrencyInput(selector: string): void {
        window.setTimeout(() => {
            const input = document.querySelector(selector) as HTMLInputElement | null;
            if (!input) return;

            input.focus();
            input.select();
        }, 0);
    }
}
