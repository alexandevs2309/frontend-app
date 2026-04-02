import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { AuthService } from '../../../core/services/auth/auth.service';

type DayValue =
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';

interface ScheduleFormState {
    id: number | null;
    employee: number | null;
    day_of_week: DayValue;
    start_time: string;
    end_time: string;
}

@Component({
    selector: 'app-schedules-management',
    standalone: true,
    imports: [CommonModule, FormsModule, ConfirmDialogModule],
    providers: [ConfirmationService],
    template: `
        <div class="p-4 md:p-6 space-y-6">
            <p-confirmDialog></p-confirmDialog>

            <section class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div class="grid gap-6 px-6 py-7 xl:grid-cols-[1.35fr,0.85fr] xl:px-8">
                    <div class="space-y-5">
                        <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                            Operación del equipo
                        </div>
                        <div>
                            <h2 class="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Turnos y asistencia</h2>
                            <p class="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">Gestiona horarios del equipo, controla entradas y salidas y mantén visible la cobertura operativa del día.</p>
                        </div>
                        <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                                <i class="pi pi-calendar-plus text-xs"></i>
                                {{ schedules.length }} turnos
                            </div>
                            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                                <i class="pi pi-users text-xs"></i>
                                {{ employees.length }} empleados
                            </div>
                            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                                <i class="pi pi-clock text-xs"></i>
                                {{ attendanceRecords.length }} registros de hoy
                            </div>
                        </div>
                    </div>

                    <div class="rounded-[1.6rem] bg-slate-950 p-5 text-white shadow-xl">
                        <div class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Resumen operativo</div>
                        <div class="mt-2 text-2xl font-black">Cobertura del equipo</div>
                        <div class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                            {{ getSchedulesNarrative() }}
                        </div>
                    </div>
                </div>
            </section>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div class="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 lg:col-span-1">
                    <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                        {{ form.id ? 'Editar Turno' : 'Nuevo Turno' }}
                    </h3>

                    <div class="space-y-3">
                        <label class="block">
                            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Empleado</span>
                            <select class="w-full mt-1 p-2 border rounded-md bg-white dark:bg-slate-800"
                                [(ngModel)]="form.employee" name="employee">
                                <option [ngValue]="null">Seleccionar</option>
                                <option *ngFor="let emp of employees" [ngValue]="emp.id">
                                    {{ getEmployeeName(emp) }}
                                </option>
                            </select>
                        </label>

                        <label class="block">
                            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Día</span>
                            <select class="w-full mt-1 p-2 border rounded-md bg-white dark:bg-slate-800"
                                [(ngModel)]="form.day_of_week" name="day_of_week">
                                <option *ngFor="let day of days" [ngValue]="day.value">{{ day.label }}</option>
                            </select>
                        </label>

                        <label class="block">
                            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Hora inicio</span>
                            <input type="time" class="w-full mt-1 p-2 border rounded-md bg-white dark:bg-slate-800"
                                [(ngModel)]="form.start_time" name="start_time" />
                        </label>

                        <label class="block">
                            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Hora fin</span>
                            <input type="time" class="w-full mt-1 p-2 border rounded-md bg-white dark:bg-slate-800"
                                [(ngModel)]="form.end_time" name="end_time" />
                        </label>

                        <div class="flex gap-2 pt-2">
                            <button class="px-4 py-2 rounded-md text-white bg-teal-600 hover:bg-teal-700"
                                (click)="saveSchedule()" [disabled]="loading">
                                {{ form.id ? 'Actualizar' : 'Crear' }}
                            </button>
                            <button class="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600"
                                (click)="resetForm()">
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 lg:col-span-2">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Horarios registrados</h3>
                        <select class="p-2 border rounded-md bg-white dark:bg-slate-800"
                            [(ngModel)]="filterEmployeeId" (ngModelChange)="applyFilter()">
                            <option [ngValue]="null">Todos los empleados</option>
                            <option *ngFor="let emp of employees" [ngValue]="emp.id">{{ getEmployeeName(emp) }}</option>
                        </select>
                    </div>

                    <div *ngIf="errorMessage" class="mb-4 text-sm text-red-600">{{ errorMessage }}</div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="text-left border-b border-slate-200 dark:border-slate-700">
                                    <th class="py-2">Empleado</th>
                                    <th class="py-2">Día</th>
                                    <th class="py-2">Inicio</th>
                                    <th class="py-2">Fin</th>
                                    <th class="py-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let schedule of filteredSchedules" class="border-b border-slate-100 dark:border-slate-800">
                                    <td class="py-2">{{ getScheduleEmployeeName(schedule) }}</td>
                                    <td class="py-2">{{ getDayLabel(schedule.day_of_week) }}</td>
                                    <td class="py-2">{{ formatTimeForInput(schedule.start_time) }}</td>
                                    <td class="py-2">{{ formatTimeForInput(schedule.end_time) }}</td>
                                    <td class="py-2">
                                        <button class="px-2 py-1 text-xs rounded bg-slate-200 dark:bg-slate-700 mr-2"
                                            (click)="editSchedule(schedule)">
                                            Editar
                                        </button>
                                        <button *ngIf="canDeleteSchedule()"
                                            class="px-2 py-1 text-xs rounded bg-red-600 text-white"
                                            (click)="deleteSchedule(schedule)">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                                <tr *ngIf="!loading && filteredSchedules.length === 0">
                                    <td colspan="5" class="py-6 text-center text-slate-500">No hay horarios para mostrar.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="mt-6 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Asistencia de Hoy</h3>
                    <div class="flex items-center gap-2">
                        <select class="p-2 border rounded-md bg-white dark:bg-slate-800"
                            [(ngModel)]="selectedAttendanceEmployeeId" name="attendance_employee">
                            <option [ngValue]="null">Seleccionar empleado</option>
                            <option *ngFor="let emp of employees" [ngValue]="emp.id">{{ getEmployeeName(emp) }}</option>
                        </select>
                        <button class="px-3 py-2 rounded-md text-white bg-green-600 hover:bg-green-700"
                            (click)="performCheckIn()" [disabled]="loading || !selectedAttendanceEmployeeId">
                            Check-in
                        </button>
                        <button class="px-3 py-2 rounded-md text-white bg-orange-600 hover:bg-orange-700"
                            (click)="performCheckOut()" [disabled]="loading || !selectedAttendanceEmployeeId">
                            Check-out
                        </button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="text-left border-b border-slate-200 dark:border-slate-700">
                                <th class="py-2">Fecha</th>
                                <th class="py-2">Empleado</th>
                                <th class="py-2">Estado</th>
                                <th class="py-2">Entrada</th>
                                <th class="py-2">Salida</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let record of attendanceRecords" class="border-b border-slate-100 dark:border-slate-800">
                                <td class="py-2">{{ record.work_date }}</td>
                                <td class="py-2">{{ getAttendanceEmployeeName(record) }}</td>
                                <td class="py-2">{{ getAttendanceStatusLabel(record.status) }}</td>
                                <td class="py-2">{{ record.check_in_at ? (record.check_in_at | date:'shortTime') : '-' }}</td>
                                <td class="py-2">{{ record.check_out_at ? (record.check_out_at | date:'shortTime') : '-' }}</td>
                            </tr>
                            <tr *ngIf="!loading && attendanceRecords.length === 0">
                                <td colspan="5" class="py-6 text-center text-slate-500">No hay registros de asistencia.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
})
export class SchedulesManagement implements OnInit {
    private readonly employeeService = inject(EmployeeService);
    private readonly authService = inject(AuthService);
    private readonly confirmationService = inject(ConfirmationService);

    loading = false;
    errorMessage = '';
    employees: any[] = [];
    schedules: any[] = [];
    filteredSchedules: any[] = [];
    attendanceRecords: any[] = [];
    filterEmployeeId: number | null = null;
    selectedAttendanceEmployeeId: number | null = null;
    currentRole: string | null = null;

    days: { label: string; value: DayValue }[] = [
        { label: 'Lunes', value: 'monday' },
        { label: 'Martes', value: 'tuesday' },
        { label: 'Miércoles', value: 'wednesday' },
        { label: 'Jueves', value: 'thursday' },
        { label: 'Viernes', value: 'friday' },
        { label: 'Sábado', value: 'saturday' },
        { label: 'Domingo', value: 'sunday' }
    ];

    form: ScheduleFormState = this.createEmptyForm();

    getSchedulesNarrative(): string {
        if (!this.employees.length) {
            return 'Aun no hay empleados cargados para asignar turnos o registrar asistencia.';
        }

        return `${this.schedules.length} turnos registrados y ${this.attendanceRecords.length} movimientos recientes de asistencia visibles para seguimiento operativo.`;
    }

    ngOnInit(): void {
        this.currentRole = this.authService.getCurrentUserRole();
        this.loadData();
    }

    private async loadData(): Promise<void> {
        this.loading = true;
        this.errorMessage = '';
        try {
            const [employeesResponse, schedulesResponse, attendanceResponse] = await Promise.all([
                firstValueFrom(this.employeeService.getEmployees()),
                firstValueFrom(this.employeeService.getSchedules()),
                firstValueFrom(this.employeeService.getAttendance())
            ]);
            this.employees = this.normalizeArray(employeesResponse);
            this.schedules = this.normalizeArray(schedulesResponse);
            this.attendanceRecords = this.normalizeArray(attendanceResponse).slice(0, 20);
            if (!this.selectedAttendanceEmployeeId && this.employees.length > 0) {
                this.selectedAttendanceEmployeeId = this.employees[0].id;
            }
            this.applyFilter();
        } catch (error: any) {
            this.errorMessage = error?.error?.error || 'No se pudieron cargar los turnos.';
        } finally {
            this.loading = false;
        }
    }

    async saveSchedule(): Promise<void> {
        if (!this.form.employee || !this.form.start_time || !this.form.end_time) {
            this.errorMessage = 'Completa empleado, hora inicio y hora fin.';
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        const payload = {
            employee: this.form.employee,
            day_of_week: this.form.day_of_week,
            start_time: this.toBackendTime(this.form.start_time),
            end_time: this.toBackendTime(this.form.end_time)
        };

        try {
            if (this.form.id) {
                await firstValueFrom(this.employeeService.updateSchedule(this.form.id, payload));
            } else {
                await firstValueFrom(this.employeeService.createSchedule(payload));
            }
            this.resetForm();
            await this.loadData();
        } catch (error: any) {
            this.errorMessage = error?.error?.error || error?.error?.detail || 'No se pudo guardar el turno.';
        } finally {
            this.loading = false;
        }
    }

    editSchedule(schedule: any): void {
        this.form = {
            id: schedule.id,
            employee: schedule.employee,
            day_of_week: schedule.day_of_week,
            start_time: this.formatTimeForInput(schedule.start_time),
            end_time: this.formatTimeForInput(schedule.end_time)
        };
    }

    deleteSchedule(schedule: any): void {
        if (!this.canDeleteSchedule()) {
            return;
        }
        this.confirmationService.confirm({
            message: '¿Eliminar este turno? Esta acción no se puede deshacer.',
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                void this.deleteScheduleConfirmed(schedule);
            }
        });
    }

    private async deleteScheduleConfirmed(schedule: any): Promise<void> {
        this.loading = true;
        this.errorMessage = '';
        try {
            await firstValueFrom(this.employeeService.deleteSchedule(schedule.id));
            await this.loadData();
        } catch (error: any) {
            this.errorMessage = error?.error?.error || error?.error?.detail || 'No se pudo eliminar el turno.';
        } finally {
            this.loading = false;
        }
    }

    async performCheckIn(): Promise<void> {
        if (!this.selectedAttendanceEmployeeId) {
            return;
        }
        this.loading = true;
        this.errorMessage = '';
        try {
            await firstValueFrom(this.employeeService.checkIn(this.selectedAttendanceEmployeeId));
            await this.loadData();
        } catch (error: any) {
            this.errorMessage = error?.error?.detail || 'No se pudo registrar check-in.';
        } finally {
            this.loading = false;
        }
    }

    async performCheckOut(): Promise<void> {
        if (!this.selectedAttendanceEmployeeId) {
            return;
        }
        this.loading = true;
        this.errorMessage = '';
        try {
            await firstValueFrom(this.employeeService.checkOut(this.selectedAttendanceEmployeeId));
            await this.loadData();
        } catch (error: any) {
            this.errorMessage = error?.error?.detail || 'No se pudo registrar check-out.';
        } finally {
            this.loading = false;
        }
    }

    applyFilter(): void {
        if (!this.filterEmployeeId) {
            this.filteredSchedules = [...this.schedules];
            return;
        }
        this.filteredSchedules = this.schedules.filter((s) => s.employee === this.filterEmployeeId);
    }

    resetForm(): void {
        this.form = this.createEmptyForm();
    }

    canDeleteSchedule(): boolean {
        return this.currentRole === 'CLIENT_ADMIN';
    }

    getEmployeeName(employee: any): string {
        return employee?.user?.full_name || employee?.full_name || `Empleado #${employee?.id ?? ''}`;
    }

    getScheduleEmployeeName(schedule: any): string {
        const employee = this.employees.find((emp) => emp.id === schedule.employee);
        return this.getEmployeeName(employee);
    }

    getAttendanceEmployeeName(record: any): string {
        if (record.employee_name) {
            return record.employee_name;
        }
        const employee = this.employees.find((emp) => emp.id === record.employee);
        return this.getEmployeeName(employee);
    }

    getAttendanceStatusLabel(status: string): string {
        const map: Record<string, string> = {
            present: 'Presente',
            late: 'Tarde',
            absent: 'Ausente'
        };
        return map[status] || status;
    }

    getDayLabel(dayValue: DayValue): string {
        const found = this.days.find((day) => day.value === dayValue);
        return found ? found.label : dayValue;
    }

    formatTimeForInput(time: string): string {
        if (!time) {
            return '';
        }
        return time.slice(0, 5);
    }

    private toBackendTime(time: string): string {
        return time.length === 5 ? `${time}:00` : time;
    }

    private normalizeArray<T>(value: any): T[] {
        if (Array.isArray(value)) {
            return value;
        }
        if (value?.results && Array.isArray(value.results)) {
            return value.results;
        }
        return [];
    }

    private createEmptyForm(): ScheduleFormState {
        return {
            id: null,
            employee: null,
            day_of_week: 'monday',
            start_time: '09:00',
            end_time: '17:00'
        };
    }
}
