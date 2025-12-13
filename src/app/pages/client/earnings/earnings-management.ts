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
import { Period } from '../../../shared/interfaces/employee.interface';
import { EarningsCalculatorService } from '../../../shared/services/earnings-calculator.service';
import { CashRegisterStateService } from '../../../shared/services/cash-register-state.service';
import { BarbershopSettingsService } from '../../../shared/services/barbershop-settings.service';
import { Router } from '@angular/router';

interface BusinessEarningsResponse {
    business_summary: {
        total_revenue: number;
        total_costs: number;
        net_profit: number;
        profit_margin: number;
    };
    services_performance: ServicePerformance[];
    daily_earnings: DailyEarning[];
}

interface ServicePerformance {
    service_name: string;
    total_sales: number;
    quantity_sold: number;
    revenue: number;
    cost: number;
    profit: number;
    profit_margin: number;
}

interface DailyEarning {
    date: string;
    revenue: number;
    costs: number;
    profit: number;
    transactions_count: number;
}

interface BusinessMetrics {
    total_revenue: number;
    total_costs: number;
    net_profit: number;
    profit_margin: number;
    avg_transaction: number;
    total_transactions: number;
}

interface LoadingStates {
    main: boolean;
    detail: boolean;
    payment: boolean;
    export: boolean;
}

@Component({
    selector: 'app-business-earnings',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, TableModule, ScrollerModule, DatePickerModule, SelectModule, ToastModule, TagModule, DialogModule, TooltipModule, InputTextModule, FormsModule],
    providers: [MessageService],
    templateUrl: './earnings-management.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessEarnings implements OnInit {
    private posService = inject(PosService);
    private messageService = inject(MessageService);
    private http = inject(HttpClient);
    private earningsCalculator = inject(EarningsCalculatorService);
    private cashRegisterState = inject(CashRegisterStateService);
    private settingsService = inject(BarbershopSettingsService);
    private router = inject(Router);

    constructor() {
        // Initialize period
        this.periodoSeleccionado.set(this.earningsCalculator.getCurrentPeriod());
    }

    dateToFortnight(date: Date): { fortnight: number; year: number } {
        const day = date.getDate();
        return {
            fortnight: day <= 15 ? 1 : 2,
            year: date.getFullYear()
        };
    }

    /**
     * Convierte fecha a year/fortnight para backend
     * @param referenceDate - Date object o string YYYY-MM-DD
     * @returns {year: number, fortnight: number} donde fortnight es 1-24
     */
    dateToYearFortnight(referenceDate: Date | string): { year: number; fortnight: number } {
        const date = typeof referenceDate === 'string' ? new Date(referenceDate) : referenceDate;
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth() returns 0-11
        const day = date.getDate();
        
        // Calcular quincena: (mes - 1) * 2 + (día > 15 ? 2 : 1)
        const fortnightInMonth = day > 15 ? 2 : 1;
        const fortnight = (month - 1) * 2 + fortnightInMonth;
        
        return { year, fortnight };
    }

    /**
     * Valida respuesta de ganancias del negocio del backend
     */
    validateBusinessResponse(response: any): boolean {
        if (!response) return false;
        if (!response.business_summary) return false;
        if (typeof response.business_summary.total_revenue === 'undefined') return false;
        if (typeof response.business_summary.net_profit === 'undefined') return false;
        return true;
    }

    private apiUrl = `${environment.apiUrl}/reports/business_earnings/`;

    // Signals para ganancias del negocio
    businessMetrics = signal<BusinessMetrics>({
        total_revenue: 0,
        total_costs: 0,
        net_profit: 0,
        profit_margin: 0,
        avg_transaction: 0,
        total_transactions: 0
    });
    servicesPerformance = signal<ServicePerformance[]>([]);
    dailyEarnings = signal<DailyEarning[]>([]);
    periodoSeleccionado = signal<Period>(this.earningsCalculator.getCurrentPeriod());
    frequencySelected = signal<string>('monthly');
    referenceDate = signal<Date>(new Date());
    loadingStates = signal<LoadingStates>({
        main: false,
        detail: false,
        payment: false,
        export: false
    });

    // Subjects para filtros de negocio
    private filtroServicio$ = new BehaviorSubject<string>('');
    private filtroFecha$ = new BehaviorSubject<Date[]>([]);

    // Computed signals - SOLO GANANCIAS DEL NEGOCIO
    resumenCalculado = computed(() => {
        const metrics = this.businessMetrics();
        return {
            totalIngresos: metrics.total_revenue,
            totalCostos: metrics.total_costs,
            gananciaNeta: metrics.net_profit,
            margenGanancia: metrics.profit_margin,
            promedioTransaccion: metrics.avg_transaction,
            totalTransacciones: metrics.total_transactions
        };
    });

    serviciosFiltrados = computed(() => {
        const servicios = this.servicesPerformance();
        const filtro = this.filtroServicio$.value;

        return servicios.filter(servicio => {
            const matchServicio = !filtro || servicio.service_name.toLowerCase().includes(filtro.toLowerCase());
            return matchServicio;
        });
    });

    // Properties para ganancias del negocio
    mostrarDetalleServicio = false;
    mostrarAnalisisRentabilidad = false;
    servicioSeleccionado: ServicePerformance | null = null;
    filtroFecha: Date[] = [];
    cashRegisterData = computed(() => this.cashRegisterState.currentRegister());

    // Filtros para análisis de negocio
    tiposAnalisis = [
        { label: 'Por Servicio', value: 'service' },
        { label: 'Por Día', value: 'daily' },
        { label: 'Por Mes', value: 'monthly' }
    ];

    categoriasServicios = [
        { label: 'Todos los Servicios', value: '' },
        { label: 'Cortes', value: 'haircut' },
        { label: 'Tratamientos', value: 'treatment' },
        { label: 'Productos', value: 'product' }
    ];

    frequencies = [
        { label: 'Semanal', value: 'weekly' },
        { label: 'Mensual', value: 'monthly' },
        { label: 'Trimestral', value: 'quarterly' },
        { label: 'Anual', value: 'yearly' }
    ];



    ngOnInit() {
        console.log('💰 BusinessEarnings iniciado');
        this.setupDataStream();
        this.cargarDatosCaja();
    }

    private setupDataStream() {
        console.log('🔄 Configurando stream de datos del negocio');
        const params$ = combineLatest([
            this.filtroServicio$.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
            this.filtroFecha$.pipe(startWith([]), debounceTime(300))
        ]).pipe(
            map(([servicio, fechas]) => {
                const periodo = this.periodoSeleccionado();
                return {
                    start_date: periodo.fechaInicio.toISOString().split('T')[0],
                    end_date: periodo.fechaFin.toISOString().split('T')[0],
                    service_filter: servicio,
                    frequency: this.frequencySelected()
                };
            })
        );

        params$.subscribe(params => {
            console.log('📊 Parámetros generados para negocio:', params);
            this.cargarDatosNegocio(params);
        });
    }

    private cargarDatosNegocio(params: any) {
        this.setLoading('main', true);
        console.log('🔍 Cargando datos del negocio con params:', params);
        console.log('🌐 URL completa:', this.apiUrl);

        this.http.get<BusinessEarningsResponse>(this.apiUrl, { params })
            .pipe(
                map(response => {
                    console.log('📥 Respuesta de la API del negocio:', response);
                    return this.procesarRespuestaNegocio(response);
                }),
                catchError(error => {
                    console.error('❌ Error cargando datos del negocio:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error de conexión',
                        detail: 'No se pudieron cargar los datos de ganancias del negocio'
                    });
                    return this.handleError('cargar datos del negocio', error);
                }),
                finalize(() => this.setLoading('main', false))
            )
            .subscribe({
                next: (data) => {
                    console.log('📊 Datos del negocio procesados:', data);
                    if (data) {
                        this.businessMetrics.set(data.metrics);
                        this.servicesPerformance.set(data.services);
                        this.dailyEarnings.set(data.daily);
                    }
                },
                error: (error) => {
                    console.error('❌ Error en suscripción del negocio:', error);
                }
            });
    }

    private procesarRespuestaNegocio(response: BusinessEarningsResponse): any {
        console.log('🔄 Procesando respuesta del negocio:', response);

        const metrics: BusinessMetrics = {
            total_revenue: response.business_summary?.total_revenue || 0,
            total_costs: response.business_summary?.total_costs || 0,
            net_profit: response.business_summary?.net_profit || 0,
            profit_margin: response.business_summary?.profit_margin || 0,
            avg_transaction: 0,
            total_transactions: 0
        };

        const services = response.services_performance || [];
        const daily = response.daily_earnings || [];

        // Calcular métricas adicionales
        if (daily.length > 0) {
            metrics.total_transactions = daily.reduce((sum, d) => sum + d.transactions_count, 0);
            metrics.avg_transaction = metrics.total_transactions > 0 ? metrics.total_revenue / metrics.total_transactions : 0;
        }

        return { metrics, services, daily };
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

    verDetalleServicio(servicio: ServicePerformance) {
        this.servicioSeleccionado = servicio;
        this.mostrarDetalleServicio = true;
    }

    abrirAnalisisRentabilidad() {
        this.mostrarAnalisisRentabilidad = true;
    }

    private cargarDatosSimulados() {
        const businessData: BusinessMetrics = {
            total_revenue: 450000,
            total_costs: 180000,
            net_profit: 270000,
            profit_margin: 60,
            avg_transaction: 2500,
            total_transactions: 180
        };

        const servicesData: ServicePerformance[] = [
            {
                service_name: 'Corte Clásico',
                total_sales: 85,
                quantity_sold: 85,
                revenue: 212500,
                cost: 85000,
                profit: 127500,
                profit_margin: 60
            },
            {
                service_name: 'Tratamiento Capilar',
                total_sales: 25,
                quantity_sold: 25,
                revenue: 125000,
                cost: 50000,
                profit: 75000,
                profit_margin: 60
            }
        ];

        const dailyData: DailyEarning[] = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dailyData.push({
                date: date.toISOString().split('T')[0],
                revenue: Math.random() * 20000 + 5000,
                costs: Math.random() * 8000 + 2000,
                profit: 0,
                transactions_count: Math.floor(Math.random() * 15) + 3
            });
        }
        
        // Calcular profit para cada día
        dailyData.forEach(day => {
            day.profit = day.revenue - day.costs;
        });

        this.businessMetrics.set(businessData);
        this.servicesPerformance.set(servicesData);
        this.dailyEarnings.set(dailyData);
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
            service_filter: this.filtroServicio$.value,
            frequency: this.frequencySelected()
        };
        this.cargarDatosNegocio(params);
    }

    aplicarFiltroServicio(servicio: string) {
        this.filtroServicio$.next(servicio);
    }

    aplicarFiltroFecha(fechas: Date[]) {
        console.log('📅 Aplicando filtro de fecha:', fechas);
        this.filtroFecha$.next(fechas);
    }

    aplicarFiltros() {
        console.log('🔍 Aplicando filtros con fechas:', this.filtroFecha);
        this.aplicarFiltroFecha(this.filtroFecha);
    }

    formatearRangoPeriodo(periodo: Period): string {
        const inicio = periodo.fechaInicio.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        const fin = periodo.fechaFin.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `${inicio} - ${fin}`;
    }

    exportarServicio(servicio: ServicePerformance) {
        const data = {
            'Servicio': servicio.service_name,
            'Ventas': servicio.total_sales,
            'Cantidad': servicio.quantity_sold,
            'Ingresos': this.formatearMoneda(servicio.revenue),
            'Costos': this.formatearMoneda(servicio.cost),
            'Ganancia': this.formatearMoneda(servicio.profit),
            'Margen %': `${servicio.profit_margin.toFixed(1)}%`
        };

        const csvContent = this.convertToCSV([data]);
        this.downloadFile(csvContent, `servicio-${servicio.service_name}-${this.periodoSeleccionado().titulo}.csv`, 'text/csv');
    }

    limpiarFiltros() {
        this.filtroServicio$.next('');
        this.filtroFecha$.next([]);
    }

    getProfitSeverity(margin: number): 'success' | 'warn' | 'danger' {
        if (margin >= 50) return 'success';
        if (margin >= 30) return 'warn';
        return 'danger';
    }

    getPerformanceLabel(performance: number): string {
        if (performance >= 80) return 'Excelente';
        if (performance >= 60) return 'Bueno';
        if (performance >= 40) return 'Regular';
        return 'Bajo';
    }

    irAModuloPagos() {
        this.router.navigate(['/client/pagos']);
    }

    irAModuloEmpleados() {
        this.router.navigate(['/client/employees']);
    }

    private cargarDetalleServicio(servicioNombre: string) {
        this.setLoading('detail', true);
        const periodo = this.periodoSeleccionado();

        const params = {
            service_name: servicioNombre,
            start_date: periodo.fechaInicio.toISOString().split('T')[0],
            end_date: periodo.fechaFin.toISOString().split('T')[0]
        };

        this.http.get<any>(`${environment.apiUrl}/reports/service_detail/`, { params })
            .pipe(
                catchError(error => {
                    console.error('❌ Error cargando detalle servicio:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo cargar el detalle del servicio'
                    });
                    return this.handleError('cargar detalle servicio', error);
                }),
                finalize(() => this.setLoading('detail', false))
            )
            .subscribe({
                next: (response) => {
                    console.log('📊 Detalle del servicio cargado:', response);
                },
                error: (error) => {
                    console.error('❌ Error en suscripción detalle servicio:', error);
                }
            });
    }





    exportarExcel() {
        this.setLoading('export', true);

        const data = this.servicesPerformance().map(s => ({
            'Servicio': s.service_name,
            'Ventas': s.total_sales,
            'Cantidad': s.quantity_sold,
            'Ingresos': this.formatearMoneda(s.revenue),
            'Costos': this.formatearMoneda(s.cost),
            'Ganancia': this.formatearMoneda(s.profit),
            'Margen %': `${s.profit_margin.toFixed(1)}%`
        }));

        const csvContent = this.convertToCSV(data);
        this.downloadFile(csvContent, `ganancias-negocio-${this.periodoSeleccionado().titulo}.csv`, 'text/csv');

        setTimeout(() => this.setLoading('export', false), 1000);
    }

    exportarPDF() {
        this.setLoading('export', true);

        const resumen = this.resumenCalculado();
        const data = `REPORTE DE GANANCIAS DEL NEGOCIO\n${this.periodoSeleccionado().titulo}\n\n` +
            `Ingresos Totales: ${this.formatearMoneda(resumen.totalIngresos)}\n` +
            `Costos Totales: ${this.formatearMoneda(resumen.totalCostos)}\n` +
            `Ganancia Neta: ${this.formatearMoneda(resumen.gananciaNeta)}\n` +
            `Margen: ${resumen.margenGanancia.toFixed(1)}%\n\n` +
            `SERVICIOS:\n` +
            this.servicesPerformance().map(s =>
                `${s.service_name}: ${this.formatearMoneda(s.profit)} (${s.profit_margin.toFixed(1)}%)`
            ).join('\n');

        this.downloadFile(data, `ganancias-negocio-${this.periodoSeleccionado().titulo}.txt`, 'text/plain');

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
        this.http.get<any>(`${environment.apiUrl}/pos/cashregisters/current/`)
            .subscribe({
                next: (response) => {
                    if (response && response.is_open) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Caja Abierta',
                            detail: `Caja actual: ${this.formatearMoneda(response.current_amount || 0)}`
                        });
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Caja Cerrada',
                            detail: 'No hay caja abierta actualmente'
                        });
                    }
                },
                error: () => {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Caja Cerrada',
                        detail: 'No hay caja abierta actualmente'
                    });
                }
            });
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

    onFrequencyChange(frequency: string) {
        this.frequencySelected.set(frequency);
        this.refrescarDatos();
    }

    onReferenceDateChange(date: Date) {
        this.referenceDate.set(date);
        this.refrescarDatos();
    }

    /**
     * Calcula el rendimiento promedio de los servicios
     */
    calcularRendimientoPromedio(): number {
        const servicios = this.servicesPerformance();
        if (servicios.length === 0) return 0;
        
        const totalMargen = servicios.reduce((sum, s) => sum + s.profit_margin, 0);
        return totalMargen / servicios.length;
    }

    /**
     * Obtiene el servicio más rentable
     */
    obtenerServicioMasRentable(): ServicePerformance | null {
        const servicios = this.servicesPerformance();
        if (servicios.length === 0) return null;
        
        return servicios.reduce((max, current) => 
            current.profit_margin > max.profit_margin ? current : max
        );
    }
}
