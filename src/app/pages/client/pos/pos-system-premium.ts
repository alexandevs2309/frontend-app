import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { PosService } from '../../core/services/pos/pos.service';
import { ServiceService } from '../../core/services/service/service.service';
import { InventoryService } from '../../core/services/inventory/inventory.service';
import { ClientService } from '../../core/services/client/client.service';
import { EmployeeService } from '../../core/services/employee/employee.service';

interface CartItem {
    id: string;
    type: 'service' | 'product';
    item: any;
    employee?: any;
    quantity: number;
    price: number;
    subtotal: number;
}

interface PosState {
    loading: boolean;
    processing: boolean;
    cashRegisterOpen: boolean;
    error: string | null;
}

@Component({
    selector: 'app-pos-system-premium',
    standalone: true,
    imports: [
        CommonModule, 
        ButtonModule, 
        InputTextModule, 
        SelectModule, 
        ToastModule, 
        DialogModule, 
        InputNumberModule, 
        TooltipModule, 
        RippleModule,
        FormsModule
    ],
    providers: [MessageService],
    templateUrl: './pos-system-premium.html',
    styleUrls: ['./pos-system-premium.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PosSystemPremium implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private searchSubject = new Subject<string>();
    
    // Services
    private posService = inject(PosService);
    private servicesService = inject(ServiceService);
    private inventoryService = inject(InventoryService);
    private clientsService = inject(ClientService);
    private employeesService = inject(EmployeeService);
    private messageService = inject(MessageService);

    // State Management
    state = signal<PosState>({
        loading: false,
        processing: false,
        cashRegisterOpen: false,
        error: null
    });

    // Data Signals
    carrito = signal<CartItem[]>([]);
    servicios = signal<any[]>([]);
    productos = signal<any[]>([]);
    clientes = signal<any[]>([]);
    empleados = signal<any[]>([]);
    categorias = signal<any[]>([]);
    estadisticasDia = signal({ ventas: 0, ingresos: 0 });

    // Form Signals
    tipoActivo = signal<'services' | 'products'>('services');
    categoriaSeleccionada = signal('');
    busqueda = signal('');
    clienteSeleccionado = signal<any>(null);
    empleadoSeleccionado = signal<any>(null);
    metodoPagoSeleccionado = signal('');
    descuento = signal(0);

    // Computed Values
    itemsFiltrados = computed(() => {
        const items = this.tipoActivo() === 'services' ? this.servicios() : this.productos();
        const categoria = this.categoriaSeleccionada();
        const busquedaText = this.busqueda().toLowerCase().trim();

        let filtered = items;

        if (categoria) {
            filtered = filtered.filter(item => 
                (item.category || 'General') === categoria
            );
        }

        if (busquedaText) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(busquedaText) ||
                (item.description && item.description.toLowerCase().includes(busquedaText))
            );
        }

        if (this.tipoActivo() === 'products') {
            filtered = filtered.filter(item => item.stock > 0);
        }

        return filtered;
    });

    subtotal = computed(() => 
        this.carrito().reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0)
    );

    total = computed(() => 
        Math.max(0, this.subtotal() - (Number(this.descuento()) || 0))
    );

    tieneServicios = computed(() => 
        this.carrito().some(item => item.type === 'service')
    );

    puedeVender = computed(() => 
        this.carrito().length > 0 && 
        this.metodoPagoSeleccionado() !== '' && 
        this.state().cashRegisterOpen && 
        (!this.tieneServicios() || this.empleadoSeleccionado() !== null) && 
        this.total() > 0
    );

    mensajeValidacion = computed(() => {
        if (this.carrito().length === 0) return 'Agregue items al carrito';
        if (!this.state().cashRegisterOpen) return 'Debe abrir la caja registradora';
        if (!this.metodoPagoSeleccionado()) return 'Seleccione un método de pago';
        if (this.tieneServicios() && !this.empleadoSeleccionado()) return 'Seleccione un empleado';
        if (this.total() <= 0) return 'El total debe ser mayor a cero';
        return '';
    });

    // Constants
    metodosPago = [
        { label: 'Efectivo', value: 'cash' },
        { label: 'Tarjeta', value: 'card' },
        { label: 'Transferencia', value: 'transfer' },
        { label: 'Mixto', value: 'mixed' }
    ];

    // Dialogs
    mostrarDialogoAbrirCaja = signal(false);
    mostrarDialogoCerrarCaja = signal(false);
    mostrarDialogoTicket = signal(false);
    ventaActual = signal<any>(null);

    ngOnInit() {
        this.initializeComponent();
        this.setupSearchDebounce();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private async initializeComponent() {
        this.updateState({ loading: true });
        
        try {
            await Promise.all([
                this.cargarDatos(),
                this.verificarEstadoCaja(),
                this.cargarEstadisticasDia()
            ]);
        } catch (error) {
            this.handleError('Error inicializando componente', error);
        } finally {
            this.updateState({ loading: false });
        }
    }

    private setupSearchDebounce() {
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(searchTerm => {
            this.busqueda.set(searchTerm);
        });
    }

    private updateState(updates: Partial<PosState>) {
        this.state.update(current => ({ ...current, ...updates }));
    }

    private handleError(message: string, error: any) {
        console.error(message, error);
        this.updateState({ error: error.message || 'Error desconocido' });
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: message
        });
    }

    // Data Loading Methods
    private async cargarDatos() {
        try {
            const [serviciosRes, productosRes, clientesRes, empleadosRes] = await Promise.all([
                this.servicesService.getServices().toPromise(),
                this.inventoryService.getProducts().toPromise(),
                this.clientsService.getClients().toPromise(),
                this.employeesService.getEmployees().toPromise()
            ]);

            this.servicios.set((serviciosRes?.results || serviciosRes || [])
                .filter((s: any) => s.is_active !== false));

            this.productos.set((productosRes?.results || productosRes || [])
                .filter((p: any) => p.is_active && (p.stock > 0 || p.stock === undefined)));

            this.clientes.set((clientesRes?.results || clientesRes || [])
                .filter((c: any) => c.is_active !== false));

            const allEmployees = empleadosRes?.results || empleadosRes || [];
            const empleadosActivos = allEmployees
                .filter((emp: any) => emp.is_active)
                .map((emp: any) => ({
                    ...emp,
                    displayName: `${emp.user?.full_name || emp.user?.email || 'Sin nombre'} (${emp.user?.role || 'Sin rol'})`
                }));

            this.empleados.set(empleadosActivos);

            // Cargar categorías
            try {
                const categoriesResponse = await this.posService.getCategories().toPromise();
                this.categorias.set([
                    { name: 'Todas las categorías', value: '' },
                    ...(categoriesResponse?.results || [])
                ]);
            } catch {
                this.categorias.set([{ name: 'Todas las categorías', value: '' }]);
            }

        } catch (error) {
            this.handleError('Error cargando datos', error);
        }
    }

    private async verificarEstadoCaja() {
        try {
            const registers = await this.posService.getCashRegisters({ is_open: true }).toPromise();
            this.updateState({ cashRegisterOpen: registers?.results?.length > 0 || false });
        } catch (error) {
            this.updateState({ cashRegisterOpen: false });
        }
    }

    private async cargarEstadisticasDia() {
        try {
            const stats = await this.posService.getDashboardStats().toPromise();
            this.estadisticasDia.set({
                ventas: Number(stats?.total_transactions) || 0,
                ingresos: Number(stats?.total_sales) || 0
            });
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }

    // Cart Management
    agregarAlCarrito(item: any) {
        if (!this.state().cashRegisterOpen) {
            this.messageService.add({
                severity: 'error',
                summary: 'Caja cerrada',
                detail: 'Debe abrir la caja antes de realizar ventas'
            });
            return;
        }

        const existeEnCarrito = this.carrito().find(cartItem =>
            cartItem.item.id === item.id && cartItem.type === (this.tipoActivo() === 'services' ? 'service' : 'product')
        );

        if (existeEnCarrito) {
            const index = this.carrito().indexOf(existeEnCarrito);
            this.cambiarCantidad(index, 1);
            return;
        }

        if (this.tipoActivo() === 'products' && item.stock <= 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Sin stock',
                detail: `${item.name} no tiene stock disponible`
            });
            return;
        }

        const cartItem: CartItem = {
            id: `${this.tipoActivo()}-${item.id}-${Date.now()}`,
            type: this.tipoActivo() === 'services' ? 'service' : 'product',
            item: item,
            quantity: 1,
            price: Number(item.price) || 0,
            subtotal: Number(item.price) || 0
        };

        this.carrito.update(cart => [...cart, cartItem]);
        
        this.messageService.add({
            severity: 'success',
            summary: 'Agregado',
            detail: `${item.name} agregado al carrito`
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
        this.clienteSeleccionado.set(null);
        this.empleadoSeleccionado.set(null);
        this.metodoPagoSeleccionado.set('');
        this.descuento.set(0);
    }

    // Stock Management
    obtenerStockDisponible(item: any): number {
        if (this.tipoActivo() === 'products') {
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

    // Sales Processing
    async procesarVenta() {
        if (!this.puedeVender()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Venta no válida',
                detail: this.mensajeValidacion()
            });
            return;
        }

        this.updateState({ processing: true });

        try {
            const ventaData = {
                client: this.clienteSeleccionado()?.id || null,
                employee_id: this.empleadoSeleccionado()?.id || null,
                payment_method: this.metodoPagoSeleccionado(),
                discount: Number(this.descuento()) || 0,
                total: this.total(),
                paid: this.total(),
                details: this.carrito().map(item => ({
                    content_type: item.type === 'service' ? 'service' : 'product',
                    object_id: item.item.id,
                    name: item.item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                payments: [{
                    method: this.metodoPagoSeleccionado(),
                    amount: this.total()
                }]
            };

            const venta = await this.posService.createSale(ventaData).toPromise();

            this.messageService.add({
                severity: 'success',
                summary: 'Venta procesada',
                detail: 'Venta procesada exitosamente'
            });

            this.mostrarTicket(venta);
            this.limpiarCarrito();
            await this.cargarEstadisticasDia();

        } catch (error) {
            this.handleError('Error al procesar la venta', error);
        } finally {
            this.updateState({ processing: false });
        }
    }

    // Utility Methods
    formatearMoneda(valor: any): string {
        const num = Number(valor) || 0;
        return `$${num.toFixed(2)}`;
    }

    getCurrentDateTime(): string {
        return new Date().toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getPaymentIcon(method: string): string {
        const icons: { [key: string]: string } = {
            'cash': 'pi-money-bill',
            'card': 'pi-credit-card',
            'transfer': 'pi-send',
            'mixed': 'pi-wallet'
        };
        return icons[method] || 'pi-money-bill';
    }

    esClienteFrecuente(cliente: any): boolean {
        return (cliente.total_purchases || 0) > 5;
    }

    // Search Methods
    onSearchInput(event: any) {
        this.searchSubject.next(event.target.value);
    }

    // Ticket Management
    mostrarTicket(venta: any) {
        this.ventaActual.set({
            ...venta,
            items: [...this.carrito()],
            cliente: this.clienteSeleccionado(),
            empleado: this.empleadoSeleccionado(),
            subtotal: this.subtotal(),
            descuento: this.descuento(),
            total: this.total(),
            metodoPago: this.metodoPagoSeleccionado()
        });
        this.mostrarDialogoTicket.set(true);
    }

    cerrarTicket() {
        this.mostrarDialogoTicket.set(false);
        this.ventaActual.set(null);
    }

    // Cash Register Management
    async abrirCaja() {
        try {
            await this.posService.openCashRegister({ initial_amount: 0 }).toPromise();
            this.updateState({ cashRegisterOpen: true });
            this.mostrarDialogoAbrirCaja.set(false);
            
            this.messageService.add({
                severity: 'success',
                summary: 'Caja abierta',
                detail: 'Caja registradora abierta correctamente'
            });
        } catch (error) {
            this.handleError('Error al abrir la caja', error);
        }
    }

    async prepararCierreCaja() {
        this.mostrarDialogoCerrarCaja.set(true);
    }

    // Computed getters for template
    get cargandoDatos() {
        return this.state().loading;
    }

    get procesandoVenta() {
        return this.state().processing;
    }

    get cajaAbierta() {
        return this.state().cashRegisterOpen;
    }

    // Methods for computed values access in template
    calcularSubtotal() {
        return this.subtotal();
    }

    calcularTotal() {
        return this.total();
    }

    obtenerMensajeValidacion() {
        return this.mensajeValidacion();
    }
}