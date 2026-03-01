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
    subtotal = computed(() => this.carrito().reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0));
    total = computed(() => {
        const subtotal = this.subtotal();
        const descuentoValor = Number(this.descuento()) || 0;
        const descuentoFinal = this.tipoDescuento() === '%' ? (subtotal * descuentoValor / 100) : descuentoValor;
        return Math.max(0, subtotal - descuentoFinal);
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

    // Utility function to normalize API responses
    private normalizeArray<T>(response: any): T[] {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (response.results && Array.isArray(response.results)) return response.results;
        return [];
    }

    private isForbiddenError(error: any): boolean {
        return error?.status === 403;
    }

    async cargarDatos() {
        if (this.cargandoDatos) return;
        
        // Verificar caché
        const cacheKey = 'pos_data';
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            console.log('⚡ Usando datos en caché');
            this.servicios = cached.data.servicios;
            this.productos = cached.data.productos;
            this.clientes = cached.data.clientes;
            this.empleados = cached.data.empleados;
            this.clientesFrecuentes = cached.data.clientesFrecuentes;
            this.extraerCategorias();
            this.filtrarItems();
            return;
        }
        
        this.cargandoDatos = true;

        try {
            let accessLimited = false;
            try {
                const servicesResponse = await this.servicesService.getServices().toPromise();
                const services = this.normalizeArray<any>(servicesResponse);
                this.servicios = services.filter((s: any) => s.is_active !== false);
            } catch (error) {
                this.servicios = [];
                if (!this.isForbiddenError(error)) {
                    throw error;
                }
                accessLimited = true;
            }

            try {
                const productsResponse = await this.inventoryService.getProducts().toPromise();
                const products = this.normalizeArray<any>(productsResponse);
                this.productos = products.filter(
                    (p: any) => p.is_active && (p.stock > 0 || p.stock === undefined)
                );
            } catch (error) {
                this.productos = [];
                if (!this.isForbiddenError(error)) {
                    throw error;
                }
                accessLimited = true;
            }

            try {
                const clientsResponse = await this.clientsService.getClients().toPromise();
                const clients = this.normalizeArray<any>(clientsResponse);
                this.clientes = clients.filter((c: any) => c.is_active !== false);
            } catch (error) {
                this.clientes = [];
                if (!this.isForbiddenError(error)) {
                    throw error;
                }
                accessLimited = true;
            }

            // Clientes frecuentes
            this.clientesFrecuentes = this.clientes.filter(
                (c: any) => (c.total_purchases || 0) > 5
            );

            try {
                const employeesResponse = await this.employeesService.getEmployees().toPromise();
                const employees = this.normalizeArray<any>(employeesResponse);
                this.empleados = employees
                    .filter((emp: any) => emp.is_active && ['Estilista', 'Utility'].includes(emp.user?.role))
                    .map((emp: any) => ({
                        ...emp,
                        displayName: `${emp.user?.full_name || emp.full_name || emp.name || `Empleado ${emp.id}`} (${emp.user?.role || 'Sin rol'})`
                    }));
            } catch (error) {
                this.empleados = [];
                if (!this.isForbiddenError(error)) {
                    throw error;
                }
                accessLimited = true;
            }
            
            // Guardar en caché
            this.cache.set(cacheKey, {
                data: {
                    servicios: this.servicios,
                    productos: this.productos,
                    clientes: this.clientes,
                    empleados: this.empleados,
                    clientesFrecuentes: this.clientesFrecuentes
                },
                timestamp: Date.now()
            });
            
            this.extraerCategorias();
            this.filtrarItems();

            if (accessLimited) {
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
        const categoriasUnicas = [...new Set(items.map(item => item.category).filter(Boolean))];
        this.categorias = [
            { name: 'Todas', value: '' },
            ...categoriasUnicas.map(cat => ({ name: cat, value: cat }))
        ];
    }






    filtrarItems() {
        let items = this.tipoActivo === 'services' ? this.servicios : this.productos;

        if (this.categoriaSeleccionada) {
            items = items.filter(item => {
                const itemCategory = item.category || 'General';
                return itemCategory === this.categoriaSeleccionada;
            });
        }

        if (this.busqueda.trim()) {
            const searchTerm = this.busqueda.toLowerCase().trim();
            items = items.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                (item.description && item.description.toLowerCase().includes(searchTerm))
            );
        }

        if (this.tipoActivo === 'products') {
            items = items.filter(item => item.stock > 0);
        }

        this.itemsFiltrados = items;
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
        if (this.carrito().length === 0) return 'Agregue items al carrito';
        if (!this.cajaAbierta()) return 'Debe abrir la caja registradora';
        if (!this.metodoPagoSeleccionado()) return 'Seleccione un método de pago';
        if (this.tieneServicios() && !this.empleadoSeleccionado()) return 'Seleccione un empleado para los servicios';
        if (this.calcularTotal() <= 0) return 'El total debe ser mayor a cero';
        return '';
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
            const descuentoFinal = this.tipoDescuento() === '%' ? (subtotal * descuentoValor / 100) : descuentoValor;
            const descuentoPercent = subtotal > 0 ? (descuentoFinal / subtotal) * 100 : 0;
            let discountReason: string | undefined;

            if (descuentoPercent > this.limiteDescuento) {
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
            
            // Construir array de pagos
            let payments: any[];
            if (this.metodoPagoSeleccionado() === 'mixed' && this.pagosMixtos.length > 0) {
                payments = this.pagosMixtos.map(p => ({
                    method: p.metodo,
                    amount: Number(p.monto)
                }));
            } else {
                payments = [{
                    method: this.metodoPagoSeleccionado(),
                    amount: this.calcularTotal()
                }];
            }
            
            const ventaData: CreateSaleDto = {
                client: this.clienteSeleccionado?.id || undefined,
                employee_id: this.empleadoSeleccionado()?.id ?? undefined,
                payment_method: this.metodoPagoSeleccionado() as 'cash' | 'card' | 'transfer' | 'mixed',
                discount: descuentoFinal,
                discount_reason: discountReason,
                total: this.calcularTotal(),
                paid: this.calcularTotal(),
                details: this.carrito().map(item => this.mapCartItemToSaleDetail(item)),
                payments: payments
            };
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
        if (!this.puedeAbrirCaja()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Sin permisos',
                detail: 'No tiene permisos para abrir la caja'
            });
            return;
        }
        if (this.montoInicialCaja < 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'El monto no puede ser negativo'
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
            localStorage.setItem('monto_inicial_caja', montoParaGuardar.toString());
            this.montoInicialCaja = 0; // Reset solo la variable del formulario

            const mensaje = montoParaGuardar === 0 ?
                'Caja abierta sin efectivo inicial' :
                `Caja abierta con $${montoParaGuardar}`;

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

            console.log('Debug cierre caja (FIXED):', {
                montoInicialGuardado: montoInicialSesion,
                ventasEfectivoBackend: ventasEfectivoReales,
                dailySummary: dailySummary
            });

            this.ventasEfectivoHoy = ventasEfectivoReales;
            this.montoEsperado = montoInicialSesion + ventasEfectivoReales;
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
        this.diferenciaCaja = (Number(this.montoFinalCaja) || 0) - (Number(this.montoEsperado) || 0);
    }

    async cerrarCaja() {
        if (!this.puedeCerrarCaja()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Sin permisos',
                detail: 'No tiene permisos para cerrar la caja'
            });
            return;
        }
        // Validar que no haya items en el carrito
        if (this.carrito().length > 0) {
            const confirmar = confirm('Hay items en el carrito. ¿Está seguro de cerrar la caja? Se perderán los items.');
            if (!confirmar) return;
            this.limpiarCarrito();
        }
        
        // Validar que se haya ingresado el monto final
        if (!this.montoFinalCaja || this.montoFinalCaja < 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Debe ingresar el monto final contado en caja'
            });
            return;
        }

        const diferencia = Math.abs(this.diferenciaCaja);

        if (diferencia > 5) {
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
                detail: `Caja cerrada correctamente. Diferencia: $${this.diferenciaCaja.toFixed(2)}`
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
        console.log('Estadísticas actualizadas y guardadas:', nuevasEstadisticas);

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
                if (this.isForbiddenError(error)) {
                    this.promociones = [];
                    return;
                }
                // Fallback: promociones de ejemplo si no hay endpoint
                response = {
                    results: [
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
                    ]
                };
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

            const ventas = this.normalizeArray<any>(response);
            this.historialVentas = ventas
                .map((venta: any) => this.mapBackendSaleToDto(venta))
                .sort((a: SaleWithDetailsDto, b: SaleWithDetailsDto) =>
                    new Date(b.date_time).getTime() - new Date(a.date_time).getTime())
                .slice(0, 20);
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
        // Recrear estructura de venta para mostrar en ticket usando DTO
        this.ventaActual = {
            ...venta,
            details: venta.details?.map((detail: SaleDetailDto) => ({
                id: detail.id,
                content_type: detail.content_type,
                object_id: detail.object_id,
                name: detail.name,
                quantity: detail.quantity,
                price: detail.price,
                subtotal: detail.quantity * detail.price
            })) || []
        };
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
        return this.denominaciones.reduce((total, denom) => {
            denom.total = denom.valor * denom.cantidad;
            return total + denom.total;
        }, 0);
    }

    calcularDiferenciaArqueo(): number {
        const totalContado = this.calcularTotalArqueo();
        const montoInicial = this.obtenerMontoInicialCaja();
        const efectivoEsperado = montoInicial + this.ventasEfectivoHoy;
        return totalContado - efectivoEsperado;
    }

    obtenerMontoInicialCaja(): number {
        // Obtener del localStorage el monto con el que se abrió la caja
        try {
            const montoGuardado = localStorage.getItem('monto_inicial_caja');
            return montoGuardado ? Number(montoGuardado) : 0;
        } catch {
            return 0;
        }
    }

    limpiarArqueo() {
        this.denominaciones.forEach(d => {
            d.cantidad = 0;
            d.total = 0;
        });
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

            const counts = this.denominaciones
                .filter(d => d.cantidad > 0)
                .map(d => ({
                    denomination: d.valor,
                    count: d.cantidad
                }));

            await this.posService.cashCount(cajaActual.id, counts).toPromise();

            // Calcular diferencia con efectivo esperado
            const efectivoEsperado = (Number(cajaActual.initial_cash) || 0) + this.ventasEfectivoHoy;
            const diferencia = totalContado - efectivoEsperado;

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
            this.denominaciones.forEach(d => {
                d.cantidad = 0;
                d.total = 0;
            });

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
        try {
            const response = await fetch(`${environment.apiUrl}/settings/barbershop/`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const settings = await response.json();
                this.configuracionPos = {
                    business_name: settings.pos_config?.business_name || this.obtenerNombreNegocio(),
                    address: settings.pos_config?.address || 'Dirección no configurada',
                    phone: settings.pos_config?.phone || 'Teléfono no configurado',
                    email: settings.pos_config?.email || '',
                    website: settings.pos_config?.website || ''
                };
                this.limiteDescuento = settings.service_discount_limit || 20;
            }
            
            // Obtener datos del usuario actual desde localStorage
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const userData = JSON.parse(userStr);
                    this.nombreUsuarioActual = userData.full_name || userData.email || 'Cajero';
                    this.rolUsuarioActual = userData.role || '';
                } catch {
                    this.nombreUsuarioActual = 'Cajero';
                    this.rolUsuarioActual = '';
                }
            } else {
                this.nombreUsuarioActual = 'Cajero';
                this.rolUsuarioActual = '';
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
            this.configuracionPos = {
                business_name: this.obtenerNombreNegocio(),
                address: 'Dirección no configurada',
                phone: 'Teléfono no configurado',
                email: '',
                website: ''
            };
            this.nombreUsuarioActual = 'Cajero';
            this.rolUsuarioActual = '';
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
        return this.pagosMixtos.reduce((sum, pago) => sum + (Number(pago.monto) || 0), 0);
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
        return Math.abs(totalPagos - totalVenta) < 0.01; // Exacto con tolerancia de 1 centavo
    }

    obtenerMensajePagoMixto(): string {
        const totalPagos = this.calcularTotalPagosMixtos();
        const totalVenta = this.calcularTotal();
        const diferencia = totalVenta - totalPagos;
        
        if (diferencia > 0.01) {
            return `Falta agregar $${diferencia.toFixed(2)}`;
        } else if (diferencia < -0.01) {
            return `Sobra $${Math.abs(diferencia).toFixed(2)}`;
        }
        return 'Total correcto';
    }

    formatearMoneda(valor: any): string {
        const num = Number(valor) || 0;
        return `$${num.toFixed(2)}`;
    }

    @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;

    mostrarTicket(venta: any) {
        // Guardar datos de la venta actual antes de limpiar el carrito
        const payments = this.metodoPagoSeleccionado() === 'mixed' && this.pagosMixtos.length > 0
            ? this.pagosMixtos.map(p => ({
                method: p.metodo as 'cash' | 'card' | 'transfer' | 'mixed',
                amount: Number(p.monto)
            }))
            : [{
                method: this.metodoPagoSeleccionado() as 'cash' | 'card' | 'transfer' | 'mixed',
                amount: this.calcularTotal()
            }];

        this.ventaActual = {
            id: venta.id,
            client: this.clienteSeleccionado?.id,
            employee_id: this.empleadoSeleccionado()?.id,
            payment_method: this.metodoPagoSeleccionado() as 'cash' | 'card' | 'transfer' | 'mixed',
            discount: this.descuento(),
            total: this.calcularTotal(),
            paid: this.calcularTotal(),
            date_time: new Date().toISOString(),
            details: this.carrito().map(item => this.mapCartItemToSaleDetail(item)),
            payments: payments,
            client_name: this.clienteSeleccionado?.full_name,
            employee_name: this.empleadoSeleccionado()?.display_name
        };
        this.mostrarDialogoTicket = true;
        setTimeout(() => this.generarQR(), 100);
    }

    generarQR() {
        if (!this.qrCanvas?.nativeElement || !this.ventaActual) return;

        const canvas = this.qrCanvas.nativeElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // QR simple con datos de la venta
        const qrData = `VENTA:${this.ventaActual.id}|TOTAL:${this.calcularTotal()}|FECHA:${new Date().toISOString()}`;

        // Generar QR básico (patrón simple)
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 80, 80);
        ctx.fillStyle = '#fff';

        // Patrón QR simplificado
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i + j + this.ventaActual.id) % 3 === 0) {
                    ctx.fillRect(i * 10, j * 10, 8, 8);
                }
            }
        }
    }

    async imprimirTicket() {
        try {
            // Intentar impresión térmica si está disponible
            if ('serial' in navigator) {
                await this.imprimirTermica();
            } else {
                // Fallback a impresión normal
                window.print();
            }
        } catch {
            if (!environment.production) {
                console.log('Usando impresión estándar');
            }
            window.print();
        }
    }

    async imprimirTermica() {
        try {
            const port = await (navigator as any).serial.requestPort();
            await port.open({ baudRate: 9600 });

            const writer = port.writable.getWriter();
            const encoder = new TextEncoder();

            // Comandos ESC/POS básicos
            const ticket = `
\x1B\x40  // Inicializar
\x1B\x61\x01  // Centrar
BARBERÍA APP\n
\x1B\x61\x00  // Izquierda
Ticket: ${this.ventaActual?.id}\n
Fecha: ${new Date().toLocaleString()}\n
${this.carrito().map(item =>
  `${item.item.name}\n${item.quantity} x $${item.price} = $${item.subtotal}\n`
).join('')}
\nTOTAL: $${this.calcularTotal()}\n
\x1B\x61\x01  // Centrar
¡Gracias por su compra!\n\n\n\x1D\x56\x00  // Cortar papel
`;

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
                console.log('Audio no disponible');
            }
        }
    }

    @ViewChild('firmaCanvas') firmaCanvas!: ElementRef<HTMLCanvasElement>;
    firmando = false;

    iniciarFirma(event: any) {
        this.firmando = true;
        const canvas = this.firmaCanvas.nativeElement;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
    }

    dibujarFirma(event: any) {
        if (!this.firmando) return;
        const canvas = this.firmaCanvas.nativeElement;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
        ctx.stroke();
    }

    terminarFirma() {
        this.firmando = false;
    }

    limpiarFirma() {
        const canvas = this.firmaCanvas.nativeElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    confirmarFirma() {
        const canvas = this.firmaCanvas.nativeElement;
        this.firmaCliente = canvas.toDataURL();
        this.mostrarDialogoFirma = false;
        this.confirmarVenta();
    }

    async generarReporteCuadre(caja: any) {
        try {
            // Obtener usuario actual del localStorage o token
            const usuarioActual = this.obtenerUsuarioActual();

            // Calcular monto inicial desde el monto esperado
            const montoInicialReal = this.montoEsperado - this.ventasEfectivoHoy;

            console.log('Debug reporte:', {
                montoEsperado: this.montoEsperado,
                ventasEfectivo: this.ventasEfectivoHoy,
                montoInicialCalculado: montoInicialReal,
                montoInicialGuardado: this.obtenerMontoInicialCaja()
            });

            const reporteData = {
                fecha: new Date().toLocaleDateString('es-ES'),
                hora: new Date().toLocaleTimeString('es-ES'),
                usuario: usuarioActual,
                montoInicial: Math.max(0, montoInicialReal), // Asegurar que no sea negativo
                ventasEfectivo: this.ventasEfectivoHoy,
                montoEsperado: this.montoEsperado,
                montoContado: this.montoFinalCaja,
                diferencia: this.diferenciaCaja,
                estadisticas: this.estadisticasDia()
            };

            this.generarPDFCuadre(reporteData);

            this.messageService.add({
                severity: 'info',
                summary: 'Reporte generado',
                detail: 'Reporte de cuadre descargado'
            });
        } catch (error) {
            console.error('Error generando reporte:', error);
        }
    }

    generarPDFCuadre(data: any) {
        // Crear contenido HTML para el reporte
        const contenidoHTML = `
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

        // Crear ventana para imprimir
        const ventanaImpresion = window.open('', '_blank');
        if (ventanaImpresion) {
            ventanaImpresion.document.write(`
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
                        ${contenidoHTML}
                        <script>
                            window.onload = function() {
                                window.print();
                                setTimeout(() => window.close(), 1000);
                            }
                        </script>
                    </body>
                </html>
            `);
            ventanaImpresion.document.close();
        }
    }

    // Variable para trackear ventas en efectivo de la sesión
    ventasEfectivoSesionActual = 0;

    extraerVentasEfectivo(dailySummary: any): number {
        try {
            // Buscar en by_method el total de ventas en efectivo
            const byMethod = dailySummary?.by_method || [];
            const cashSales = byMethod.find((method: any) => method.payment_method === 'cash');
            return Number(cashSales?.total || 0);
        } catch (error) {
            if (!environment.production) {
                console.error('Error extrayendo ventas en efectivo:', error);
            }
            return 0;
        }
    }

    extraerPagosNoCash(dailySummary: any): void {
        try {
            const byMethod = dailySummary?.by_method || [];
            const pagosNoCash = byMethod
                .filter((method: any) => method.payment_method !== 'cash')
                .map((method: any): PaymentMethodDto => ({
                    payment_method: method.payment_method,
                    total: Number(method.total || 0)
                }))
                .filter((pago: PaymentMethodDto) => pago.total > 0);

            this.pagosNoCash.set(pagosNoCash);
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
            console.log('User ID obtenido:', userId);
            const keyEstadisticas = `estadisticas_pos_user_${userId}`;
            const keyFecha = `estadisticas_pos_fecha_user_${userId}`;
            console.log('Keys a usar:', keyEstadisticas, keyFecha);
            
            // Verificar si cambió el día
            const fechaGuardada = localStorage.getItem(keyFecha);
            const fechaHoy = new Date().toDateString();
            console.log('Fecha guardada:', fechaGuardada, 'Fecha hoy:', fechaHoy);
            
            if (fechaGuardada !== fechaHoy) {
                // Es un nuevo día, resetear estadísticas
                console.log('Nuevo día detectado, reseteando estadísticas');
                const estadisticasLimpias = { ventas: 0, ingresos: 0, ticketPromedio: 0 };
                this.estadisticasDia.set(estadisticasLimpias);
                localStorage.setItem(keyEstadisticas, JSON.stringify(estadisticasLimpias));
                localStorage.setItem(keyFecha, fechaHoy);
                return;
            }
            
            const estadisticasGuardadas = localStorage.getItem(keyEstadisticas);
            console.log('Cargando estadísticas desde localStorage:', estadisticasGuardadas);
            if (estadisticasGuardadas) {
                const estadisticas = JSON.parse(estadisticasGuardadas);
                this.estadisticasDia.set(estadisticas);
                console.log('Estadísticas cargadas:', estadisticas);
            } else {
                console.log('No hay estadísticas guardadas, iniciando en 0');
                const estadisticasLimpias = { ventas: 0, ingresos: 0, ticketPromedio: 0 };
                this.estadisticasDia.set(estadisticasLimpias);
                localStorage.setItem(keyFecha, fechaHoy);
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            this.estadisticasDia.set({ ventas: 0, ingresos: 0, ticketPromedio: 0 });
        }
    }

    guardarEstadisticas(estadisticas: any) {
        try {
            const userId = this.obtenerUserId();
            const keyEstadisticas = `estadisticas_pos_user_${userId}`;
            const keyFecha = `estadisticas_pos_fecha_user_${userId}`;
            localStorage.setItem(keyEstadisticas, JSON.stringify(estadisticas));
            localStorage.setItem(keyFecha, new Date().toDateString());
            console.log('Estadísticas guardadas con fecha:', new Date().toDateString());
        } catch (error) {
            if (!environment.production) {
                console.error('Error guardando estadísticas:', error);
            }
        }
    }

    obtenerUserId(): number {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return user.id || 0;
            }
        } catch {
            return 0;
        }
        return 0;
    }

    obtenerUsuarioActual(): string {
        return this.nombreUsuarioActual || 'Cajero';
    }

    esClienteFrecuente(cliente: any): boolean {
        return this.clientesFrecuentes.some(c => c.id === cliente.id);
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


    obtenerNombreNegocio(): string {
        try {
            const tenantStr = localStorage.getItem('tenant');
            if (tenantStr) {
                const tenant = JSON.parse(tenantStr);
                return tenant.name || 'Barbería';
            }
        } catch {
            return 'Barbería';
        }
        return 'Barbería';
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
        const rolesPermitidos = ['MANAGER', 'CAJERA', 'CLIENT_ADMIN', 'SUPER_ADMIN', 'CLIENT_STAFF', 'ESTILISTA', 'UTILITY'];
        return rolesPermitidos.includes(this.normalizarRolPOS(this.rolUsuarioActual));
    }

    puedeAbrirCaja(): boolean {
        const rolesPermitidos = ['MANAGER', 'CAJERA', 'CLIENT_ADMIN', 'SUPER_ADMIN'];
        return rolesPermitidos.includes(this.normalizarRolPOS(this.rolUsuarioActual));
    }

    puedeCerrarCaja(): boolean {
        const rolesPermitidos = ['MANAGER', 'CLIENT_ADMIN', 'SUPER_ADMIN'];
        return rolesPermitidos.includes(this.normalizarRolPOS(this.rolUsuarioActual));
    }

    puedeAplicarDescuentoAlto(): boolean {
        const rolesPermitidos = ['MANAGER', 'CLIENT_ADMIN', 'SUPER_ADMIN'];
        return rolesPermitidos.includes(this.normalizarRolPOS(this.rolUsuarioActual));
    }

    puedeVerHistorial(): boolean {
        const rolesPermitidos = ['MANAGER', 'CAJERA', 'CLIENT_ADMIN', 'SUPER_ADMIN'];
        return rolesPermitidos.includes(this.normalizarRolPOS(this.rolUsuarioActual));
    }

    puedeReembolsarVentas(): boolean {
        const rolesPermitidos = ['MANAGER', 'CLIENT_ADMIN', 'SUPER_ADMIN'];
        return rolesPermitidos.includes(this.normalizarRolPOS(this.rolUsuarioActual));
    }

    canRefundSale(venta: SaleWithDetailsDto): boolean {
        if (!this.puedeReembolsarVentas()) return false;
        if (!venta || Number(venta.total) <= 0) return false;
        if (!Array.isArray(venta.details) || venta.details.length === 0) return false;

        return venta.details.every((detail: any) => {
            const itemType = String(detail?.item_type || '').toLowerCase();
            const contentType = String(detail?.content_type || '').toLowerCase();
            return itemType === 'product' || contentType === 'product';
        });
    }

    private normalizarRolPOS(role: string): string {
        const normalized = (role || '').trim();
        const roleMap: Record<string, string> = {
            'SuperAdmin': 'SUPER_ADMIN',
            'Super-Admin': 'SUPER_ADMIN',
            'Client-Admin': 'CLIENT_ADMIN',
            'Client-Staff': 'CLIENT_STAFF',
            'Manager': 'MANAGER',
            'Cajera': 'CAJERA',
            'Estilista': 'ESTILISTA',
            'Utility': 'UTILITY'
        };
        const mapped = roleMap[normalized] || normalized;
        return mapped.toUpperCase();
    }

    guardarArqueoHistorico(arqueo: any) {
        try {
            const userId = this.obtenerUserId();
            const key = `arqueos_historicos_user_${userId}`;
            const arqueosGuardados = localStorage.getItem(key);
            let arqueos = arqueosGuardados ? JSON.parse(arqueosGuardados) : [];
            
            // Agregar nuevo arqueo al inicio
            arqueos.unshift(arqueo);
            
            // Mantener solo últimos 50 arqueos
            if (arqueos.length > 50) arqueos = arqueos.slice(0, 50);
            
            localStorage.setItem(key, JSON.stringify(arqueos));
        } catch (error) {
            console.error('Error guardando arqueo histórico:', error);
        }
    }

    cargarHistorialArqueos() {
        try {
            const userId = this.obtenerUserId();
            const key = `arqueos_historicos_user_${userId}`;
            const arqueosGuardados = localStorage.getItem(key);
            this.historialArqueos = arqueosGuardados ? JSON.parse(arqueosGuardados) : [];
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
