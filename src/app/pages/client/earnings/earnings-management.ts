import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ScrollerModule } from 'primeng/scroller';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { PosService } from '../../../core/services/pos/pos.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, EMPTY, BehaviorSubject, combineLatest } from 'rxjs';
import { map, catchError, finalize, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EmployeeEarnings, Period } from '../../../shared/interfaces/employee.interface';
import { EarningsCalculatorService } from '../../../shared/services/earnings-calculator.service';
import { CashRegisterStateService } from '../../../shared/services/cash-register-state.service';
import { BarbershopSettingsService } from '../../../shared/services/barbershop-settings.service';

interface EarningsResponse {
    employees: EmployeeEarnings[];
    summary: {
        total_generated: number;
        total_paid: number;
        total_pending: number;
    };
}

interface Sale {
    id: number;
    date_created: string;
    client_name: string;
    employee_id: number;
    total: number;
    details: SaleDetail[];
}

interface SaleDetail {
    service_name: string;
    price: number;
    commission_rate?: number;
}

interface ServiceDetail {
    date: string;
    client_name: string;
    service_name: string;
    price: number;
    commission: number;
    commission_rate?: number;
}

interface LoadingStates {
    main: boolean;
    detail: boolean;
    payment: boolean;
    export: boolean;
}

@Component({
    selector: 'app-earnings-management',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, TableModule, ScrollerModule, DatePickerModule, SelectModule, ToastModule, TagModule, DialogModule, TooltipModule, InputTextModule, FormsModule],
    providers: [MessageService],
    templateUrl: './earnings-management.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EarningsManagement implements OnInit {
    private posService = inject(PosService);
    private messageService = inject(MessageService);
    private http = inject(HttpClient);
    private earningsCalculator = inject(EarningsCalculatorService);
    private cashRegisterState = inject(CashRegisterStateService);
    private settingsService = inject(BarbershopSettingsService);

    constructor() {
        console.log('🏗️ EarningsManagement constructor ejecutado');

    }

    private apiUrl = `${environment.apiUrl}/employees/earnings/`;

    // Signals
    empleados = signal<EmployeeEarnings[]>([]);
    periodoSeleccionado = signal<Period>(this.earningsCalculator.getCurrentPeriod());
    loadingStates = signal<LoadingStates>({
        main: false,
        detail: false,
        payment: false,
        export: false
    });

    // Subjects para filtros
    private filtroRol$ = new BehaviorSubject<string>('');
    private filtroEstado$ = new BehaviorSubject<string>('');
    private filtroFecha$ = new BehaviorSubject<Date[]>([]);

    // Computed signals
    resumenCalculado = computed(() => {
        const empleados = this.empleados();
        const totalGenerado = empleados.reduce((sum, e) =>
            sum + (e.payment_type === 'commission' ? (e.total_sales || 0) : (e.fixed_salary || 0)), 0);

        const totalPagado = empleados
            .filter(e => e.payment_status === 'paid')
            .reduce((sum, e) => sum + e.total_earned, 0);

        const totalPendiente = empleados
            .filter(e => e.payment_status === 'pending')
            .reduce((sum, e) => sum + e.total_earned, 0);

        return { totalGenerado, totalPagado, totalPendiente };
    });

    empleadosFiltrados = computed(() => {
        const empleados = this.empleados();
        const rol = this.filtroRol$.value;
        const estado = this.filtroEstado$.value;

        return empleados.filter(emp => {
            const matchRol = !rol || emp.role === rol;
            const matchEstado = !estado || emp.payment_status === estado;
            return matchRol && matchEstado;
        });
    });

    // Properties
    mostrarDetalle = false;
    mostrarConfiguracion = false;
    empleadoSeleccionado: EmployeeEarnings | null = null;
    empleadoConfiguracion: EmployeeEarnings | null = null;
    detalleServicios: ServiceDetail[] = [];
    filtroFecha: Date[] = [];
    cashRegisterData = computed(() => this.cashRegisterState.currentRegister());

    // Payment configuration
    tiposPago = [
        { label: 'Sueldo Fijo', value: 'fixed' },
        { label: 'Comisión', value: 'commission' },
        { label: 'Mixto (Sueldo + Comisión)', value: 'mixed' }
    ];

    rolesEmpleados = [
        { label: 'Todos', value: '' },
        { label: 'Estilistas', value: 'stylist' },
        { label: 'Asistentes', value: 'assistant' },
        { label: 'Gerentes', value: 'manager' },
        {label : 'Cajera', value: 'cajera'}
    ];

    estadosPago = [
        { label: 'Todos', value: '' },
        { label: 'Pendiente', value: 'pending' },
        { label: 'Pagado', value: 'paid' },
        { label: 'En Proceso', value: 'processing' }
    ];

    ngOnInit() {
        console.log('💰 EarningsManagement iniciado');
        this.setupDataStream();
        this.cargarDatosCaja();
    }

    private setupDataStream() {
        console.log('🔄 Configurando stream de datos');
        const params$ = combineLatest([
            this.filtroRol$.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
            this.filtroEstado$.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
            this.filtroFecha$.pipe(startWith([]), debounceTime(300))
        ]).pipe(
            map(([rol, estado, fechas]) => {
                const periodo = this.periodoSeleccionado();
                return {
                    start_date: fechas.length ? fechas[0].toISOString().split('T')[0] : periodo.fechaInicio.toISOString().split('T')[0],
                    end_date: fechas.length > 1 ? fechas[1].toISOString().split('T')[0] : periodo.fechaFin.toISOString().split('T')[0],
                    role: rol,
                    status: estado
                };
            })
        );

        params$.subscribe(params => {
            console.log('📊 Parámetros generados:', params);
            this.cargarDatos(params);
        });
    }

    private cargarDatos(params: any) {
        this.setLoading('main', true);
        console.log('🔍 Cargando datos con params:', params);
        console.log('🌐 URL completa:', this.apiUrl);

        this.http.get<any>(this.apiUrl, { params })
            .pipe(
                map(response => {
                    console.log('📥 Respuesta de la API:', response);
                    return this.procesarRespuesta(response);
                }),
                catchError(error => this.handleError('cargar datos', error)),
                finalize(() => this.setLoading('main', false))
            )
            .subscribe(empleados => {
                console.log('👥 Empleados procesados:', empleados);
                if (empleados) this.empleados.set(empleados);
            });
    }

    private procesarRespuesta(response: any): EmployeeEarnings[] {
        console.log('🔄 Procesando respuesta:', response);

        // Handle different response structures
        let employees: EmployeeEarnings[] = [];

        if (response?.employees) {
            console.log('✅ Usando response.employees');
            employees = response.employees;
        } else if (Array.isArray(response)) {
            console.log('✅ Usando array directo');
            employees = response;
        } else if (response?.results) {
            console.log('✅ Usando response.results');
            employees = response.results;
        } else {
            console.log('❌ Estructura de respuesta no reconocida:', Object.keys(response || {}));
        }

        console.log('👤 Empleados encontrados:', employees.length);

        return employees.map(emp => ({
            ...emp,
            total_earned: this.earningsCalculator.calculateTotalEarnings(emp)
        }));
    }

    private cargarDatosCaja() {
        this.cashRegisterState.loadCurrentRegister();
    }

    private handleError(operation: string, error: any): Observable<any> {
        console.error(`Error en ${operation}:`, error);
        this.messageService.add({
            severity: 'warn',
            summary: 'Conexión limitada',
            detail: `Error al ${operation}. Usando datos locales.`
        });

        if (operation === 'cargar datos') {
            this.cargarDatosSimulados();
        }

        return EMPTY;
    }

    private setLoading(type: keyof LoadingStates, value: boolean) {
        this.loadingStates.update(states => ({ ...states, [type]: value }));
    }

    configurarPago(empleado: EmployeeEarnings) {
        this.empleadoConfiguracion = { ...empleado };
        this.mostrarConfiguracion = true;
    }

    guardarConfiguracion() {
        if (!this.empleadoConfiguracion) return;

        this.setLoading('main', true);
        const payload = {
            payment_type: this.empleadoConfiguracion.payment_type,
            fixed_salary: this.empleadoConfiguracion.fixed_salary,
            commission_rate: this.empleadoConfiguracion.commission_rate
        };

        this.http.patch(`${environment.apiUrl}/employees/employees/${this.empleadoConfiguracion.id}/`, payload)
            .pipe(
                catchError(error => this.handleError('guardar configuración', error)),
                finalize(() => this.setLoading('main', false))
            )
            .subscribe(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Configuración guardada',
                    detail: `Configuración de pago actualizada para ${this.empleadoConfiguracion!.full_name}`

                });
                this.mostrarConfiguracion = false;
                this.refrescarDatos();
            });
    }

    private cargarDatosSimulados() {
        const empleadosData: EmployeeEarnings[] = [
            {
                id: 1,
                user_id: 1,
                full_name: 'María García',
                email: 'maria@salon.com',
                role: 'stylist',
                is_active: true,
                payment_type: 'commission',
                commission_rate: 40,
                total_sales: 2125000,
                total_earned: 850000,
                services_count: 25,
                payment_status: 'pending'
            },
            {
                id: 2,
                user_id: 2,
                full_name: 'Carlos López',
                email: 'carlos@salon.com',
                role: 'assistant',
                is_active: true,
                payment_type: 'fixed',
                fixed_salary: 1200000,
                total_sales: 0,
                total_earned: 1200000,
                services_count: 0,
                payment_status: 'paid'
            }
        ];
        this.empleados.set(empleadosData);
    }

    periodoAnterior() {
        const actual = this.periodoSeleccionado();
        const nuevaFecha = new Date(actual.fechaInicio);
        nuevaFecha.setDate(nuevaFecha.getDate() - 1);
        this.periodoSeleccionado.set(this.calcularPeriodo(nuevaFecha));
        this.refrescarDatos();
    }

    periodoSiguiente() {
        const actual = this.periodoSeleccionado();
        const nuevaFecha = new Date(actual.fechaFin);
        nuevaFecha.setDate(nuevaFecha.getDate() + 1);
        this.periodoSeleccionado.set(this.calcularPeriodo(nuevaFecha));
        this.refrescarDatos();
    }

    irAPeriodoActual() {
        this.periodoSeleccionado.set(this.earningsCalculator.getCurrentPeriod());
        this.refrescarDatos();
    }

    puedeAvanzarPeriodo(): boolean {
        const actual = this.periodoSeleccionado();
        const hoy = new Date();
        return actual.fechaFin < hoy;
    }

    calcularPeriodo(fecha: Date): Period {
        const dia = fecha.getDate();
        const mes = fecha.getMonth();
        const año = fecha.getFullYear();
        const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long' });

        if (dia <= 15) {
            return {
                titulo: `1ra Quincena ${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}`,
                fechaInicio: new Date(año, mes, 1),
                fechaFin: new Date(año, mes, 15)
            };
        } else {
            const ultimoDia = new Date(año, mes + 1, 0).getDate();
            return {
                titulo: `2da Quincena ${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}`,
                fechaInicio: new Date(año, mes, 16),
                fechaFin: new Date(año, mes, ultimoDia)
            };
        }
    }

    private refrescarDatos() {
        const periodo = this.periodoSeleccionado();
        const params = {
            start_date: periodo.fechaInicio.toISOString().split('T')[0],
            end_date: periodo.fechaFin.toISOString().split('T')[0],
            role: this.filtroRol$.value,
            status: this.filtroEstado$.value
        };
        this.cargarDatos(params);
    }

    aplicarFiltroRol(rol: string) {
        this.filtroRol$.next(rol);
    }

    aplicarFiltroEstado(estado: string) {
        this.filtroEstado$.next(estado);
    }

    aplicarFiltroFecha(fechas: Date[]) {
        this.filtroFecha$.next(fechas);
    }

    aplicarFiltros() {
        this.aplicarFiltroFecha(this.filtroFecha);
    }

    formatearRangoPeriodo(periodo: Period): string {
        const inicio = periodo.fechaInicio.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        const fin = periodo.fechaFin.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `${inicio} - ${fin}`;
    }

    exportarEmpleado(empleado: EmployeeEarnings) {
        const data = {
            'Empleado': empleado.full_name,
            'Email': empleado.email,
            'Rol': empleado.role,
            'Tipo Pago': empleado.payment_type === 'commission' ? 'Comisión' : 'Fijo',
            'Porcentaje/Sueldo': empleado.payment_type === 'commission' ? `${empleado.commission_rate}%` : this.formatearMoneda(empleado.fixed_salary || 0),
            'Total Generado': this.formatearMoneda(empleado.total_earned),
            'Servicios': empleado.services_count,
            'Estado': this.getPaymentStatusLabel(empleado.payment_status)
        };

        const csvContent = this.convertToCSV([data]);
        this.downloadFile(csvContent, `empleado-${empleado.full_name}-${this.periodoSeleccionado().titulo}.csv`, 'text/csv');
    }

    exportarDetalleEmpleado() {
        if (!this.empleadoSeleccionado) return;

        const data = this.detalleServicios.map(servicio => ({
            'Fecha': new Date(servicio.date).toLocaleDateString('es-ES'),
            'Cliente': servicio.client_name,
            'Servicio': servicio.service_name,
            'Precio': this.formatearMoneda(servicio.price),
            'Comisión': this.formatearMoneda(servicio.commission)
        }));

        const csvContent = this.convertToCSV(data);
        this.downloadFile(csvContent, `detalle-${this.empleadoSeleccionado.full_name}-${this.periodoSeleccionado().titulo}.csv`, 'text/csv');
    }

    verHistorialPagos() {
        if (!this.empleadoSeleccionado) return;

        this.messageService.add({
            severity: 'info',
            summary: 'Historial de Pagos',
            detail: `Funcionalidad en desarrollo para ${this.empleadoSeleccionado.full_name}`
        });
    }

    limpiarFiltros() {
        this.filtroRol$.next('');
        this.filtroEstado$.next('');
        this.filtroFecha$.next([]);
    }

    getRoleSeverity(role: string): 'success' | 'info' | 'warn' {
        switch (role) {
            case 'stylist': return 'success';
            case 'manager': return 'info';
            case 'assistant': return 'warn';
            default: return 'info';
        }
    }

    getPaymentSeverity(status: string): 'success' | 'warn' | 'info' {
        switch (status) {
            case 'paid': return 'success';
            case 'pending': return 'warn';
            case 'processing': return 'info';
            default: return 'info';
        }
    }

    getPaymentStatusLabel(status: string): string {
        const labels: any = {
            'pending': 'Pendiente',
            'paid': 'Pagado',
            'processing': 'En Proceso'
        };
        return labels[status] || status;
    }

    verDetalle(empleado: EmployeeEarnings) {
        this.empleadoSeleccionado = empleado;
        this.cargarDetalleServicios(empleado.id);
        this.mostrarDetalle = true;
    }

    private cargarDetalleServicios(empleadoId: number) {
        this.setLoading('detail', true);
        const periodo = this.periodoSeleccionado();

        const params = {
            employee_id: empleadoId.toString(),
            start_date: periodo.fechaInicio.toISOString().split('T')[0],
            end_date: periodo.fechaFin.toISOString().split('T')[0]
        };

        this.http.get<Sale[]>(`${environment.apiUrl}/pos/sales/`, { params })
            .pipe(
                map(response => this.procesarDetalleServicios(response, empleadoId)),
                catchError(error => this.handleError('cargar detalle', error)),
                finalize(() => this.setLoading('detail', false))
            )
            .subscribe(servicios => {
                if (servicios) this.detalleServicios = servicios;
            });
    }

    private procesarDetalleServicios(response: any, empleadoId: number): ServiceDetail[] {
        const empleado = this.empleados().find(e => e.id === empleadoId);

        // Ensure response is an array
        const sales = Array.isArray(response) ? response : [];

        if (empleado?.payment_type === 'commission' && sales.length > 0) {
            return sales.flatMap((sale: Sale) =>
                (sale.details || []).map(detail => ({
                    date: sale.date_created,
                    client_name: sale.client_name,
                    service_name: detail.service_name,
                    price: detail.price,
                    commission: (detail.price * (empleado.commission_rate || 0)) / 100,
                    commission_rate: empleado.commission_rate
                }))
            );
        } else {
            const periodo = this.periodoSeleccionado();
            return [{
                date: periodo.fechaInicio.toISOString(),
                client_name: 'Sueldo Fijo',
                service_name: `Sueldo ${periodo.titulo}`,
                price: empleado?.fixed_salary || 0,
                commission: empleado?.fixed_salary || 0
            }];
        }
    }

    marcarComoPagado(empleado: EmployeeEarnings) {
        this.setLoading('payment', true);
        const periodo = this.periodoSeleccionado();

        this.http.patch(`${this.apiUrl}${empleado.id}/mark-paid/`, {
            period_start: periodo.fechaInicio.toISOString().split('T')[0],
            period_end: periodo.fechaFin.toISOString().split('T')[0]
        }).pipe(
            catchError(error => this.handleError('marcar pago', error)),
            finalize(() => this.setLoading('payment', false))
        ).subscribe(() => {
            empleado.payment_status = 'paid';
            this.empleados.update(emps => [...emps]);
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `Pago marcado para ${empleado.full_name}`
            });
        });
    }

    exportarExcel() {
        this.setLoading('export', true);

        const data = this.empleados().map(e => ({
            'Empleado': e.full_name,
            'Email': e.email,
            'Rol': e.role,
            'Tipo Pago': e.payment_type === 'commission' ? 'Comisión' : 'Fijo',
            'Porcentaje/Sueldo': e.payment_type === 'commission' ? `${e.commission_rate}%` : this.formatearMoneda(e.fixed_salary || 0),
            'Total Generado': this.formatearMoneda(e.total_earned),
            'Servicios': e.services_count,
            'Estado': this.getPaymentStatusLabel(e.payment_status)
        }));

        const csvContent = this.convertToCSV(data);
        this.downloadFile(csvContent, `ganancias-${this.periodoSeleccionado().titulo}.csv`, 'text/csv');

        setTimeout(() => this.setLoading('export', false), 1000);
    }

    exportarPDF() {
        this.setLoading('export', true);

        const data = this.empleados().map(e =>
            `${e.full_name} - ${e.role} - ${this.formatearMoneda(e.total_earned)}`
        ).join('\n');

        this.downloadFile(data, `ganancias-${this.periodoSeleccionado().titulo}.txt`, 'text/plain');

        setTimeout(() => this.setLoading('export', false), 1000);
    }

    private convertToCSV(data: any[]): string {
        if (!data.length) return '';
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        return [headers, ...rows].join('\n');
    }

    private downloadFile(content: string, filename: string, type: string) {
        const blob = new Blob([content], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    formatearMoneda(valor: number): string {
        return this.settingsService.formatCurrency(valor);
    }

    sincronizarConCaja() {
        this.cashRegisterState.syncWithEarnings();
        const cashData = this.cashRegisterData();
        if (cashData?.is_open) {
            this.messageService.add({
                severity: 'info',
                summary: 'Caja Abierta',
                detail: `Caja actual: ${this.formatearMoneda(cashData.current_amount)}`
            });
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Caja Cerrada',
                detail: 'No hay caja abierta actualmente'
            });
        }
    }

    calcularProximoPago(): string {
        const periodo = this.periodoSeleccionado();
        const hoy = new Date();

        if (periodo.fechaFin < hoy) {
            return 'Pagado';
        }

        const dia = hoy.getDate();
        let proximoPago: Date;

        if (dia <= 15) {
            proximoPago = new Date(hoy.getFullYear(), hoy.getMonth(), 15);
        } else {
            proximoPago = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        }

        return proximoPago.toLocaleDateString('es-ES');
    }
}
