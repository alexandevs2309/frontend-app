import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppointmentService, AppointmentWithDetails } from '../../../core/services/appointment/appointment.service';
import { ClientService } from '../../../core/services/client/client.service';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { ServiceService } from '../../../core/services/service/service.service';

type SelectOption = { label: string; value: number };
type EmployeeOption = SelectOption & { serviceIds: number[] };
type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

@Injectable({ providedIn: 'root' })
export class AppointmentsDataService {
    private readonly appointmentService = inject(AppointmentService);
    private readonly serviceService = inject(ServiceService);
    private readonly employeeService = inject(EmployeeService);
    private readonly clientService = inject(ClientService);

    private readonly appointmentsState = signal<AppointmentWithDetails[]>([]);
    private readonly clientsOptionsState = signal<SelectOption[]>([]);
    private readonly employeesOptionsState = signal<EmployeeOption[]>([]);
    private readonly servicesOptionsState = signal<SelectOption[]>([]);
    private readonly loadingState = signal(false);
    private readonly loadedState = signal(false);

    readonly appointments = computed(() => this.appointmentsState());
    readonly clientsOptions = computed(() => this.clientsOptionsState());
    readonly employeesOptions = computed(() => this.employeesOptionsState());
    readonly servicesOptions = computed(() => this.servicesOptionsState());
    readonly loading = computed(() => this.loadingState());
    readonly loaded = computed(() => this.loadedState());
    readonly stats = computed(() => {
        const appointments = this.appointmentsState();
        const now = new Date();
        const statusCounts: Record<AppointmentStatus, number> = {
            scheduled: 0,
            completed: 0,
            cancelled: 0,
            no_show: 0
        };

        for (const appointment of appointments) {
            statusCounts[appointment.status] += 1;
        }

        const todayKey = this.toDateKey(now);
        const todayCount = appointments.filter((appointment) => this.toDateKey(new Date(appointment.date_time)) === todayKey).length;
        const overdueCount = appointments.filter((appointment) => appointment.status === 'scheduled' && new Date(appointment.date_time) < now).length;
        const nextAppointment =
            [...appointments]
                .filter((appointment) => appointment.status === 'scheduled' && new Date(appointment.date_time) >= now)
                .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())[0] || null;

        return {
            total: appointments.length,
            todayCount,
            overdueCount,
            statusCounts,
            nextAppointment
        };
    });

    async load(force = false): Promise<void> {
        if (this.loadingState()) {
            return;
        }

        if (this.loadedState() && !force) {
            return;
        }

        this.loadingState.set(true);
        try {
            const [appointmentsRes, servicesRes, employeesRes, clientsRes] = await Promise.all([
                firstValueFrom(this.appointmentService.getAppointments()),
                firstValueFrom(this.serviceService.getActiveServices()),
                firstValueFrom(this.employeeService.getEmployees()),
                firstValueFrom(this.clientService.getClients())
            ]);

            const appointments = this.normalizeArray<any>(appointmentsRes);
            const services = this.normalizeArray<any>(servicesRes);
            const employees = this.normalizeArray<any>(employeesRes);
            const clients = this.normalizeArray<any>(clientsRes);

            const users = employees
                .map((employee: any) => ({
                    id: employee.user_id_read || employee.user?.id,
                    full_name: employee.user?.full_name || employee.full_name || employee.user?.email,
                    role: employee.user?.role
                }))
                .filter((user: any) => !!user.id);

            const enrichedAppointments: AppointmentWithDetails[] = appointments.map((appointment: any) => {
                const service = services.find((item: any) => item.id === appointment.service);
                const employee = users.find((item: any) => item.id === appointment.stylist);
                const client = clients.find((item: any) => item.id === appointment.client);

                return {
                    ...appointment,
                    client_name: client?.name || client?.full_name || `Cliente #${appointment.client}`,
                    stylist_name: employee?.full_name || `Empleado #${appointment.stylist}`,
                    service_name: service?.name || 'Sin servicio',
                    service_price: service?.price,
                    service_duration: service?.duration || 30
                };
            });

            this.appointmentsState.set(enrichedAppointments);
            this.clientsOptionsState.set(
                clients.map((client: any) => ({
                    label: client.name || client.full_name || `Cliente #${client.id}`,
                    value: client.id
                }))
            );
            this.employeesOptionsState.set(
                users
                    .map((user: any) => {
                        const employee = employees.find((item: any) => (item.user_id_read || item.user?.id) === user.id);
                        const serviceIds = Array.isArray(employee?.service_ids) ? employee.service_ids : [];
                        const servicesCount = typeof employee?.services_count === 'number' ? employee.services_count : serviceIds.length;

                        return {
                            label: user.full_name || user.email,
                            value: user.id,
                            serviceIds,
                            servicesCount
                        };
                    })
                    .filter((user: any) => user.servicesCount > 0)
                    .map((user: any) => ({
                        label: user.label,
                        value: user.value,
                        serviceIds: user.serviceIds
                    }))
            );
            this.servicesOptionsState.set(
                services.map((service: any) => ({
                    label: `${service.name} - $${service.price} (${service.duration || 30}min)`,
                    value: service.id
                }))
            );
            this.loadedState.set(true);
        } finally {
            this.loadingState.set(false);
        }
    }

    async refresh(): Promise<void> {
        await this.load(true);
    }

    private normalizeArray<T>(response: any): T[] {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (response.results && Array.isArray(response.results)) return response.results;
        return [];
    }

    private toDateKey(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
