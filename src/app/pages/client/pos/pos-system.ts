import { Component, OnInit, inject, signal, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
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


interface CartItem {
    id: string;
    type: 'service' | 'product';
    item: any;
    employee?: any;
    quantity: number;
    price: number;
    subtotal: number;
}

@Component({
    selector: 'app-pos-system',
    standalone: true,
    imports: [CommonModule, ButtonModule, InputTextModule, SelectModule, TableModule, CardModule, DividerModule, ToastModule, DialogModule, InputNumberModule, TooltipModule, FormsModule],
    providers: [MessageService],
    templateUrl: './pos-system.html',
})
export class PosSystem implements OnInit {
    private posService = inject(PosService);
    private servicesService = inject(ServiceService);
    private inventoryService = inject(InventoryService);
    private clientsService = inject(ClientService);
    private employeesService = inject(EmployeeService);
    private cdr = inject(ChangeDetectorRef);
    private messageService = inject(MessageService);

    carrito = signal<CartItem[]>([]);
    cajaAbierta = signal(false);
    estadisticasDia = signal({ ventas: 0, ingresos: 0, ticketPromedio: 0 });

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
    empleadoSeleccionado: any = null;
    metodoPagoSeleccionado = '';
    descuento = 0;
    tipoDescuento: '$' | '%' = '$';

    metodoPagoTemporal = '';
    montoTemporal = 0;

    mostrarDialogoAbrirCaja = false;
    mostrarDialogoCerrarCaja = false;
    mostrarDialogoPago = false;
    mostrarDialogoArqueo = false;
    mostrarDialogoHistorial = false;
    mostrarDialogoPromociones = false;
    mostrarDialogoTicket = false;
    mostrarDialogoFirma = false;
    ventaActual: any = null;
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
    historialVentas: any[] = [];
    configuracionPos: any = {};


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

    metodosPago = [
        { label: 'Efectivo', value: 'cash' },
        { label: 'Tarjeta', value: 'card' },
        { label: 'Transferencia', value: 'transfer' },
        { label: 'Mixto', value: 'mixed' }
    ];

    ngOnInit() {
        this.cargarDatos();
        this.verificarEstadoCaja();
        this.cargarEstadisticasGuardadas();
        this.cargarPromociones();
        this.cargarConfiguracion();

        this.setupKeyboardShortcuts();
    }

    async cargarDatos() {
        if (this.cargandoDatos) return;
        this.cargandoDatos = true;
        try {
            const servicesResponse = await this.servicesService.getServices().toPromise();
            this.servicios = (servicesResponse?.results || servicesResponse || [])
                .filter((s: any) => s.is_active !== false);

            const productsResponse = await this.inventoryService.getProducts().toPromise();
            this.productos = (productsResponse?.results || productsResponse || [])
                .filter((p: any) => p.is_active && (p.stock > 0 || p.stock === undefined));

            const clientsResponse = await this.clientsService.getClients().toPromise();
            this.clientes = (clientsResponse?.results || clientsResponse || [])
                .filter((c: any) => c.is_active !== false);

            // Identificar clientes frecuentes (más de 5 compras)
            this.clientesFrecuentes = this.clientes.filter(c => (c.total_purchases || 0) > 5);

            console.log('🔑 Token en localStorage:', localStorage.getItem('access_token') ? 'Presente' : 'Ausente');

            const employeesResponse = await this.employeesService.getEmployees().toPromise();
            console.log('🔍 Empleados response completo:', employeesResponse);
            console.log('🔍 URL llamada:', `${this.employeesService['baseUrl']}/employees/employees/`);

            const allEmployees = employeesResponse?.results || employeesResponse || [];
            console.log('📋 Total empleados recibidos:', allEmployees.length);

            // Mostrar cada empleado para debug
            allEmployees.forEach((emp: any, index: number) => {
                console.log(`👤 Empleado ${index + 1}:`, {
                    id: emp.id,
                    is_active: emp.is_active,
                    user: emp.user,
                    specialty: emp.specialty
                });
            });

            // Filtrar solo por is_active inicialmente
            this.empleados = allEmployees.filter((emp: any) => emp.is_active);
            console.log('✅ Empleados activos:', this.empleados.length);

            // Agregar displayName a cada empleado
            this.empleados = this.empleados.map(emp => {
                const userName = emp.user?.full_name || emp.user?.email || 'Sin nombre';
                const userRole = emp.user?.role || 'Sin rol';
                return {
                    ...emp,
                    displayName: `${userName} (${userRole})`
                };
            });

            console.log('🎯 Empleados finales con displayName:', this.empleados);

            if (this.empleados.length === 0) {
                console.warn('No hay empleados activos disponibles');
            } else {
                console.log(`✅ ${this.empleados.length} empleados cargados correctamente`);
            }

            try {
                const categoriesResponse = await this.posService.getCategories().toPromise();
                this.categorias = [
                    { name: 'Todas las categorías', value: '' },
                    ...(categoriesResponse?.results || [])
                ];
            } catch (error) {
                this.categorias = [{ name: 'Todas las categorías', value: '' }];
            }

            this.filtrarItems();
        } catch (error: any) {
            console.error('❌ Error completo cargando datos:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Error al cargar datos: ${error.message || 'Error desconocido'}`
            });
        } finally {
            this.cargandoDatos = false;
        }
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

    agregarAlCarrito(item: any) {
        if (!this.cajaAbierta()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Caja cerrada',
                detail: 'Debe abrir la caja antes de realizar ventas'
            });
            return;
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
        this.messageService.add({
            severity: 'success',
            summary: 'Agregado al carrito',
            detail: `${item.name} agregado correctamente`
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
        this.empleadoSeleccionado = null;
        this.metodoPagoSeleccionado = '';
        this.descuento = 0;
        this.tipoDescuento = '$';
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
        return this.carrito().reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
    }

    calcularTotal(): number {
        const subtotal = this.calcularSubtotal();
        const descuentoValor = Number(this.descuento) || 0;
        const descuentoFinal = this.tipoDescuento === '%' ?
            (subtotal * descuentoValor / 100) : descuentoValor;
        return Math.max(0, subtotal - descuentoFinal);
    }

    alternarTipoDescuento() {
        this.tipoDescuento = this.tipoDescuento === '$' ? '%' : '$';
        this.descuento = 0; // Reset descuento al cambiar tipo
    }

    tieneServicios(): boolean {
        return this.carrito().some(item => item.type === 'service');
    }

    puedeVender(): boolean {
        return this.carrito().length > 0 &&
               this.metodoPagoSeleccionado !== '' &&
               this.cajaAbierta() &&
               (!this.tieneServicios() || this.empleadoSeleccionado !== null) &&
               this.calcularTotal() > 0;
    }

    obtenerMensajeValidacion(): string {
        if (this.carrito().length === 0) return 'Agregue items al carrito';
        if (!this.cajaAbierta()) return 'Debe abrir la caja registradora';
        if (!this.metodoPagoSeleccionado) return 'Seleccione un método de pago';
        if (this.tieneServicios() && !this.empleadoSeleccionado) return 'Seleccione un empleado';
        if (this.calcularTotal() <= 0) return 'El total debe ser mayor a cero';
        return '';
    }

    async procesarVenta() {
        console.log('=== PROCESANDO VENTA ===');
        console.log('1. puedeVender():', this.puedeVender());
        console.log('2. carrito:', this.carrito());
        console.log('3. metodoPago:', this.metodoPagoSeleccionado);
        console.log('4. total:', this.calcularTotal());

        if (!this.puedeVender()) {
            console.log('❌ NO PUEDE VENDER:', this.obtenerMensajeValidacion());
            this.messageService.add({
                severity: 'error',
                summary: 'Venta no válida',
                detail: this.obtenerMensajeValidacion()
            });
            return;
        }

        console.log('✅ PUEDE VENDER - Continuando...');

        if (this.metodoPagoSeleccionado === 'cash' || this.metodoPagoSeleccionado === 'mixed') {
            console.log('💰 Método efectivo/mixto - Abriendo diálogo pago');
            this.mostrarDialogoPago = true;
            return;
        }

        if (this.calcularTotal() > 500) {
            console.log('✍️ Total > $500 - Solicitando firma');
            this.mostrarDialogoFirma = true;
            return;
        }

        console.log('🚀 Llamando confirmarVenta() directamente');
        await this.confirmarVenta();
    }

    async confirmarVenta() {
        if (this.procesandoVenta) return;
        this.procesandoVenta = true;
        try {
            const ventaData = {
                client: this.clienteSeleccionado?.id || null,
                employee_id: this.empleadoSeleccionado?.id || null,
                payment_method: this.metodoPagoSeleccionado,
                discount: Number(this.descuento) || 0,
                total: this.calcularTotal(),
                paid: this.calcularTotal(),
                details: this.carrito().map(item => ({
                    content_type: item.type === 'service' ? 'service' : 'product',
                    object_id: item.item.id,
                    name: item.item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                payments: [{
                    method: this.metodoPagoSeleccionado,
                    amount: this.calcularTotal()
                }]
            };
            const venta = await this.posService.createSale(ventaData).toPromise();

            // Sonido de confirmación
            this.reproducirSonidoVenta();

            this.messageService.add({
                severity: 'success',
                summary: 'Venta procesada',
                detail: 'Venta procesada exitosamente'
            });

            // Actualizar estadísticas ANTES de limpiar carrito
            this.actualizarEstadisticasVenta();

            // Mostrar ticket automáticamente
            this.mostrarTicket(venta);

            this.limpiarCarrito();
            this.resetearPago();
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al procesar la venta'
            });
        } finally {
            this.procesandoVenta = false;
        }
    }

    resetearPago() {
        this.montoRecibido = 0;
        this.cambio = 0;
        this.pagosMixtos = [];
        this.promocionAplicada = null;
        this.mostrarDialogoPago = false;
    }

    async verificarEstadoCaja() {
        try {
            const registers = await this.posService.getCashRegisters({ is_open: true }).toPromise();
            this.cajaAbierta.set(registers?.results?.length > 0 || false);
        } catch (error) {
            this.cajaAbierta.set(false);
        }
    }

    async abrirCaja() {
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
                initial_amount: this.montoInicialCaja
            }).toPromise();
            this.cajaAbierta.set(true);
            this.mostrarDialogoAbrirCaja = false;

            // Limpiar estadísticas al abrir nueva caja
            const estadisticasLimpias = { ventas: 0, ingresos: 0, ticketPromedio: 0 };
            this.estadisticasDia.set(estadisticasLimpias);
            this.ventasEfectivoSesionActual = 0;
            this.guardarEstadisticas(estadisticasLimpias);

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
        try {
            const registers = await this.posService.getCashRegisters({ is_open: true }).toPromise();
            const cajaActual = registers?.results?.[0];

            // Obtener monto inicial de cuando se abrió la caja
            const montoInicialSesion = this.obtenerMontoInicialCaja();
            const ventasEfectivoSesion = this.ventasEfectivoSesionActual;

            console.log('Debug cierre caja:', {
                montoInicialGuardado: montoInicialSesion,
                ventasEfectivoSesion: ventasEfectivoSesion,
                estadisticas: this.estadisticasDia()
            });

            this.ventasEfectivoHoy = ventasEfectivoSesion;
            this.montoEsperado = montoInicialSesion + ventasEfectivoSesion;
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
            const registers = await this.posService.getCashRegisters({ is_open: true }).toPromise();
            const cajaActual = registers?.results?.[0];
            if (cajaActual) {
                await this.posService.closeCashRegister(cajaActual.id, {
                    final_amount: this.montoFinalCaja
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

            // Limpiar estadísticas al cerrar caja
            const estadisticasLimpias = { ventas: 0, ingresos: 0, ticketPromedio: 0 };
            this.estadisticasDia.set(estadisticasLimpias);
            this.ventasEfectivoSesionActual = 0;
            this.guardarEstadisticas(estadisticasLimpias);
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cerrar la caja'
            });
        }
    }

    actualizarEstadisticasVenta() {
        const estadisticasActuales = this.estadisticasDia();
        const totalVenta = this.calcularTotal();

        // Si es pago en efectivo, agregar a ventas en efectivo de la sesión
        if (this.metodoPagoSeleccionado === 'cash') {
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
        this.pagosMixtos.push({ metodo, monto: Number(monto) });
        this.metodoPagoTemporal = '';
        this.montoTemporal = 0;
    }

    removerPagoMixto(index: number) {
        this.pagosMixtos.splice(index, 1);
    }

    async cargarPromociones() {
        try {
            let response;
            try {
                response = await this.posService.getPromotions().toPromise();
            } catch {
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
            console.log('Promociones cargadas:', this.promociones);
        } catch (error) {
            console.error('Error cargando promociones:', error);
        }
    }

    async aplicarPromocion(promocion: any) {
        this.promocionAplicada = promocion;
        this.descuento = Number(promocion.discount_value) || 0;
        this.mostrarDialogoPromociones = false;
    }

    async cargarHistorialVentas() {
        this.cargandoHistorial = true;
        try {
            console.log('Cargando historial de ventas...');
            const response = await this.posService.getSales().toPromise();
            console.log('Response del historial:', response);

            const ventas = response?.results || response || [];
            this.historialVentas = ventas
                .sort((a: any, b: any) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime())
                .slice(0, 20); // Mostrar últimas 20 ventas

            console.log('Historial procesado:', this.historialVentas.length, 'ventas');
            console.log('Primera venta:', this.historialVentas[0]);
        } catch (error) {
            console.error('Error cargando historial:', error);
            this.historialVentas = [];
        } finally {
            this.cargandoHistorial = false;
        }
    }

    visualizarVenta(venta: any) {
        // Recrear estructura de venta para mostrar en ticket
        this.ventaActual = {
            ...venta,
            items: venta.details?.map((detail: any) => ({
                item: { name: detail.name },
                type: detail.content_type,
                quantity: detail.quantity,
                price: detail.price,
                subtotal: detail.quantity * detail.price
            })) || [],
            cliente: venta.client,
            empleado: venta.employee,
            subtotal: venta.total + (venta.discount || 0),
            descuento: venta.discount || 0,
            total: venta.total,
            metodoPago: venta.payment_method
        };
        this.mostrarDialogoTicket = true;
        setTimeout(() => this.generarQR(), 100);
    }

    reimprimirTicket(venta: any) {
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
        try {
            await this.posService.refundSale(ventaId, {}).toPromise();
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
        const efectivoEsperado = montoInicial + this.ventasEfectivoSesionActual;
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
            const registers = await this.posService.getCashRegisters({ is_open: true }).toPromise();
            const cajaActual = registers?.results?.[0];
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
            const config = await this.posService.getPosConfiguration().toPromise();
            this.configuracionPos = config?.results?.[0] || {};
        } catch (error) {
            console.error('Error cargando configuración:', error);
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

    validarPagoMixto(): boolean {
        return this.calcularTotalPagosMixtos() >= this.calcularTotal();
    }

    formatearMoneda(valor: any): string {
        const num = Number(valor) || 0;
        return `$${num.toFixed(2)}`;
    }

    @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;

    mostrarTicket(venta: any) {
        // Guardar datos de la venta actual antes de limpiar el carrito
        this.ventaActual = {
            ...venta,
            items: [...this.carrito()],
            cliente: this.clienteSeleccionado,
            empleado: this.empleadoSeleccionado,
            subtotal: this.calcularSubtotal(),
            descuento: this.descuento,
            total: this.calcularTotal(),
            metodoPago: this.metodoPagoSeleccionado
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
        } catch (error) {
            console.log('Usando impresión estándar');
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
            console.log('Audio no disponible');
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

    calcularVentasEfectivoSesion(): number {
        return this.ventasEfectivoSesionActual;
    }

    cargarEstadisticasGuardadas() {
        try {
            const estadisticasGuardadas = localStorage.getItem('estadisticas_pos');
            if (estadisticasGuardadas) {
                const estadisticas = JSON.parse(estadisticasGuardadas);
                this.estadisticasDia.set(estadisticas);
                console.log('Estadísticas cargadas:', estadisticas);
            } else {
                this.estadisticasDia.set({ ventas: 0, ingresos: 0, ticketPromedio: 0 });
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            this.estadisticasDia.set({ ventas: 0, ingresos: 0, ticketPromedio: 0 });
        }
    }

    guardarEstadisticas(estadisticas: any) {
        try {
            localStorage.setItem('estadisticas_pos', JSON.stringify(estadisticas));
        } catch (error) {
            console.error('Error guardando estadísticas:', error);
        }
    }

    obtenerUsuarioActual(): string {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.full_name || payload.email || payload.username || 'Usuario';
            }
        } catch (error) {
            console.log('Error obteniendo usuario del token');
        }
        return 'Usuario del Sistema';
    }

    esClienteFrecuente(cliente: any): boolean {
        return this.clientesFrecuentes.some(c => c.id === cliente.id);
    }

    aplicarDescuentoClienteFrecuente() {
        if (this.clienteSeleccionado && this.esClienteFrecuente(this.clienteSeleccionado)) {
            const descuentoVIP = this.calcularSubtotal() * 0.1; // 10% descuento
            this.descuento = Math.max(this.descuento, descuentoVIP);
            this.messageService.add({
                severity: 'success',
                summary: 'Descuento VIP aplicado',
                detail: `10% de descuento por ser cliente frecuente: ${this.formatearMoneda(descuentoVIP)}`
            });
        }
    }

    getPaymentMethodName(method: string): string {
        const methods: any = {
            'cash': 'Efectivo',
            'card': 'Tarjeta',
            'transfer': 'Transferencia',
            'mixed': 'Mixto'
        };
        return methods[method] || method;
    }



    obtenerResumenVenta() {
        return {
            items: this.carrito().length,
            subtotal: this.calcularSubtotal(),
            descuento: this.descuento,
            total: this.calcularTotal(),
            cliente: this.clienteSeleccionado?.full_name || 'Cliente General',
            empleado: this.empleadoSeleccionado?.displayName || this.empleadoSeleccionado?.user?.full_name || 'N/A',
            metodoPago: this.metodoPagoSeleccionado
        };
    }
}
