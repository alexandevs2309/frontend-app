import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { firstValueFrom } from 'rxjs';
import { ClientService, Client } from '../../../core/services/client/client.service';
import { environment } from '../../../../environments/environment';
import { ClientDto, CreateClientDto, UpdateClientDto } from '../../../core/dto/client.dto';

@Component({
    selector: 'app-clients-management',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        DatePickerModule,
        CheckboxModule,
        TagModule,
        ToastModule,
        ConfirmDialogModule,
        TooltipModule
    ],
    providers: [MessageService, ConfirmationService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="space-y-6">
            <section class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div class="grid gap-6 px-6 py-7 xl:grid-cols-[1.35fr,0.85fr] xl:px-8">
                    <div class="space-y-5">
                        <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                            Base de clientes
                        </div>
                        <div>
                            <h2 class="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Gestión de clientes</h2>
                            <p class="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">Mantén visible quién compra, cómo contactarlo y qué clientes siguen activos dentro del negocio.</p>
                        </div>
                        <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                                <i class="pi pi-users text-xs"></i>
                                {{ clientes().length }} clientes
                            </div>
                            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                                <i class="pi pi-check-circle text-xs"></i>
                                {{ getActiveClientsCount() }} activos
                            </div>
                            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                                <i class="pi pi-id-card text-xs"></i>
                                {{ getContactableClientsCount() }} con contacto
                            </div>
                        </div>
                    </div>

                    <div class="rounded-[1.6rem] bg-slate-950 p-5 text-white shadow-xl">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <div class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Resumen comercial</div>
                                <div class="mt-2 text-2xl font-black">Relación con clientes</div>
                            </div>
                            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                                <i class="pi pi-users text-lg"></i>
                            </div>
                        </div>
                        <div class="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                            {{ getClientsNarrative() }}
                        </div>
                    </div>
                </div>
                <div class="border-t border-slate-200/80 px-6 py-5 dark:border-slate-800 xl:px-8">
                    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <button pButton label="Nuevo cliente" icon="pi pi-plus" (click)="abrirDialogo()"></button>
                        <div class="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            Mantén correos, teléfonos y notas listos para seguimiento.
                        </div>
                    </div>
                </div>
            </section>

            <section class="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p-table [value]="clientes()" [loading]="cargando()"
                     [globalFilterFields]="['full_name', 'email', 'phone']"
                     #dt>
                <ng-template pTemplate="caption">
                    <div class="flex flex-col gap-3 p-2 lg:flex-row lg:items-center lg:justify-between">
                        <span class="text-sm text-gray-600 dark:text-slate-300">
                            Total: {{clientes().length}} clientes
                        </span>
                        <span class="p-input-icon-left w-full lg:w-80">
                            <i class="pi pi-search"></i>
                            <input pInputText type="text" placeholder="Buscar clientes..."
                                   class="w-full"
                                   (input)="dt.filterGlobal($any($event.target).value, 'contains')">
                        </span>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th>Cliente</th>
                        <th>Contacto</th>
                        <th>Género</th>
                        <th>Fecha Nacimiento</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-cliente>
                    <tr>
                        <td>
                            <div>
                                <div class="font-medium">{{cliente.full_name}}</div>
                                <div class="text-sm text-gray-500" *ngIf="cliente.notes">
                                    {{cliente.notes}}
                                </div>
                            </div>
                        </td>
                        <td>
                            <div>
                                <div>{{cliente.email}}</div>
                                <div class="text-sm text-gray-500" *ngIf="cliente.phone">
                                    {{cliente.phone}}
                                </div>
                                <div class="text-sm text-gray-500" *ngIf="cliente.address">
                                    {{cliente.address}}
                                </div>
                            </div>
                        </td>
                        <td>
                            <p-tag [value]="cliente.gender || 'No especificado'"
                                   [severity]="getGenderSeverity(cliente.gender)">
                            </p-tag>
                        </td>
                        <td>
                            <div class="flex items-center gap-2">
                                <span>{{ formatearFecha(cliente) }}</span>
                                @if (esCumpleanosHoy(cliente)) {
                                    <i class="pi pi-gift text-yellow-500" pTooltip="¡Cumpleaños hoy! 🎉"></i>
                                } @else if (esCumpleanosEsteMes(cliente)) {
                                    <i class="pi pi-calendar text-blue-500" pTooltip="Cumpleaños este mes"></i>
                                }
                                @if (calcularEdad(cliente)) {
                                    <span class="text-xs text-gray-500">
                                        ({{ calcularEdad(cliente) }} años)
                                    </span>
                                }
                            </div>
                        </td>
                        <td>
                            <p-tag [value]="cliente.is_active ? 'Activo' : 'Inactivo'"
                                   [severity]="cliente.is_active ? 'success' : 'danger'">
                            </p-tag>
                        </td>
                        <td>
                            <div class="flex gap-1">
                                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                                        (click)="editarCliente(cliente)" pTooltip="Editar"></button>
                                <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger"
                                        (click)="confirmarEliminar(cliente)" pTooltip="Eliminar"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="6" class="text-center py-4">No hay clientes registrados</td></tr>
                </ng-template>
            </p-table>
            </section>

            <p-dialog [header]="clienteSeleccionado ? 'Editar Cliente' : 'Nuevo Cliente'"
                      [(visible)]="mostrarDialogo" [modal]="true" [style]="{width: '600px'}"
                      [closable]="!guardando()" [closeOnEscape]="!guardando()">
                <form [formGroup]="formulario" class="grid gap-4">
                    <div>
                        <label class="block font-medium mb-1">Nombre Completo *</label>
                        <input pInputText formControlName="full_name" class="w-full"
                               [class.ng-invalid]="formulario.get('full_name')?.invalid && formulario.get('full_name')?.touched">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-medium mb-1">Email</label>
                            <input pInputText formControlName="email" type="email" class="w-full"
                                   [class.ng-invalid]="formulario.get('email')?.invalid && formulario.get('email')?.touched">
                            <small *ngIf="formulario.get('email')?.invalid && formulario.get('email')?.touched"
                                   class="text-red-500 block mt-1">
                                Ingresa un correo válido.
                            </small>
                        </div>
                        <div>
                            <label class="block font-medium mb-1">Teléfono</label>
                            <input pInputText formControlName="phone" class="w-full">
                        </div>
                    </div>

                    <small *ngIf="formulario.errors?.['contactRequired'] && (formulario.get('email')?.touched || formulario.get('phone')?.touched)"
                           class="text-red-500 block -mt-2">
                        Debes proporcionar al menos un medio de contacto: correo o teléfono.
                    </small>

                    <div>
                        <label class="block font-medium mb-1">Dirección</label>
                        <input pInputText formControlName="address" class="w-full">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-medium mb-1">Fecha de Nacimiento</label>
                            <p-datepicker formControlName="birthday" dateFormat="dd/mm/yy" appendTo="body"
                                        class="w-full" [showClear]="true" [maxDate]="todayDate">
                            </p-datepicker>
                        </div>
                        <div>
                            <label class="block font-medium mb-1">Género</label>
                            <p-select formControlName="gender" [options]="generoOptions" appendTo="body"
                                      optionLabel="label" optionValue="value"
                                      placeholder="Seleccionar género" class="w-full">
                            </p-select>
                        </div>
                    </div>

                    <div>
                        <label class="block font-medium mb-1">Notas</label>
                        <textarea pInputTextarea formControlName="notes" class="w-full" rows="3"
                                  placeholder="Notas adicionales sobre el cliente..."></textarea>
                    </div>

                    <div class="flex items-center">
                        <p-checkbox formControlName="is_active" [binary]="true" inputId="activo"></p-checkbox>
                        <label for="activo" class="ml-2 font-medium">Cliente Activo</label>
                    </div>

                    <div class="flex justify-end gap-2 mt-4">
                        <button pButton label="Cancelar" type="button" class="p-button-text"
                                (click)="cerrarDialogo()" [disabled]="guardando()"></button>
                        <button pButton [label]="clienteSeleccionado ? 'Actualizar' : 'Crear'"
                                type="button" icon="pi pi-check" [loading]="guardando()"
                                [disabled]="formulario.invalid" (click)="guardarCliente()"></button>
                    </div>
                </form>
            </p-dialog>
        </div>

        <p-confirmDialog></p-confirmDialog>
        <p-toast></p-toast>
    `
})
export class ClientsManagement implements OnInit {
    private clientService = inject(ClientService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private fb = inject(FormBuilder);

    clientes = signal<ClientDto[]>([]);
    cargando = signal(false);
    guardando = signal(false);
    mostrarDialogo = false;
    clienteSeleccionado: ClientDto | null = null;
    todayDate = new Date();

    getActiveClientsCount(): number {
        return this.clientes().filter((client) => client.is_active).length;
    }

    getContactableClientsCount(): number {
        return this.clientes().filter((client) => !!client.email || !!client.phone).length;
    }

    getClientsNarrative(): string {
        const total = this.clientes().length;
        if (!total) {
            return 'Aun no hay clientes registrados. Agrega el primero para empezar a construir historial, contacto y seguimiento comercial.';
        }

        return `${this.getActiveClientsCount()} de ${total} clientes siguen activos y ${this.getContactableClientsCount()} tienen un medio de contacto disponible para recordatorios o promociones.`;
    }

    // Utility function to normalize API responses
    private normalizeArray<T>(response: any): T[] {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (response.results && Array.isArray(response.results)) return response.results;
        return [];
    }

    // Adaptador Backend → Frontend DTO
    private mapBackendToClientDto(backendClient: any): ClientDto {
        return {
            id: backendClient.id,
            full_name: backendClient.full_name, // ✅ Normalizado
            email: backendClient.email,
            phone: backendClient.phone,
            address: backendClient.address,
            birthday: backendClient.birthday, // formato esperado YYYY-MM-DD
            gender: backendClient.gender,
            notes: backendClient.notes,
            is_active: backendClient.is_active,
            created_at: backendClient.created_at,
            updated_at: backendClient.updated_at
        };
    }

    generoOptions = [
        { label: 'Masculino', value: 'M' },
        { label: 'Femenino', value: 'F' },
        { label: 'Otro', value: 'O' }
    ];

    formulario: FormGroup = this.fb.group({
        full_name: ['', [Validators.required, Validators.maxLength(100)]], // ✅ Normalizado
        email: ['', [Validators.email]],
        phone: [''],
        address: [''],
        birthday: [null], // ✅ Normalizado desde backend
        gender: [''],
        notes: [''],
        is_active: [true]
    }, { validators: this.contactRequiredValidator });

    ngOnInit() {
        this.cargarClientes();
    }

    async cargarClientes() {
        if (this.cargando()) return; // ✅ Prevenir llamadas concurrentes
        this.cargando.set(true);
        try {
            const response = await firstValueFrom(this.clientService.getClients());
            
            const clientes = this.normalizeArray<any>(response);
            const clientesNormalizados = clientes.map((cliente: any) => this.mapBackendToClientDto(cliente));
            
            this.clientes.set(clientesNormalizados);

        } catch (error) {
            if (!environment.production) {
                
            }
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar los clientes'
            });
        } finally {
            this.cargando.set(false);
        }
    }

    abrirDialogo() {
        this.clienteSeleccionado = null;
        this.formulario.reset({
            full_name: '',
            email: '',
            phone: '',
            address: '',
            birthday: null,
            gender: '',
            notes: '',
            is_active: true
        });
        this.mostrarDialogo = true;
    }

    editarCliente(cliente: ClientDto) {
        this.clienteSeleccionado = cliente;
        this.formulario.patchValue({
            full_name: cliente.full_name, // ✅ Normalizado
            email: cliente.email,
            phone: cliente.phone || '',
            address: cliente.address || '',
            birthday: this.parseDateOnly(cliente.birthday),
            gender: cliente.gender || '',
            notes: cliente.notes || '',
            is_active: cliente.is_active
        });
        this.mostrarDialogo = true;
    }

    async guardarCliente() {
        if (this.formulario.invalid) {
            this.formulario.markAllAsTouched();
            return;
        }

        this.guardando.set(true);
        try {
            const clienteData: CreateClientDto | UpdateClientDto = { ...this.formulario.value };

            // Formatear fecha de nacimiento - el backend espera 'birthday'
            if (clienteData.birthday) {
                clienteData.birthday = this.formatDateOnly(clienteData.birthday as any);
            }

            if (this.clienteSeleccionado) {
                await firstValueFrom(this.clientService.updateClient(this.clienteSeleccionado.id, clienteData));
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Cliente actualizado correctamente'
                });
            } else {
                await firstValueFrom(this.clientService.createClient(clienteData));
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Cliente creado correctamente'
                });
            }

            this.cerrarDialogo();
            this.cargarClientes();
        } catch (error: any) {
            if (!environment.production) {
                
            }
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al guardar el cliente'
            });
        } finally {
            this.guardando.set(false);
        }
    }

    confirmarEliminar(cliente: ClientDto) {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar al cliente "${cliente.full_name}"?`, // ✅ Normalizado
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: () => this.eliminarCliente(cliente)
        });
    }

    async eliminarCliente(cliente: ClientDto) {
        try {
            await firstValueFrom(this.clientService.deleteClient(cliente.id));
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Cliente eliminado correctamente'
            });
            this.cargarClientes();
        } catch (error: any) {
            if (!environment.production) {
                
            }
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al eliminar el cliente'
            });
        }
    }

    formatearFecha(cliente: any): string {
        const fecha = this.parseDateOnly(cliente.birthday);
        if (!fecha) return 'No especificada';
        try {
            return fecha.toLocaleDateString('es-ES');
        } catch {
            return 'No especificada';
        }
    }

    getGenderSeverity(gender: string): 'success' | 'info' | 'warn' | 'secondary' {
        switch (gender) {
            case 'M': return 'info';
            case 'F': return 'success';
            case 'O': return 'warn';
            default: return 'secondary';
        }
    }

    cerrarDialogo() {
        this.mostrarDialogo = false;
        this.clienteSeleccionado = null;
        this.formulario.reset();
    }

    private contactRequiredValidator(control: AbstractControl): ValidationErrors | null {
        const email = control.get('email')?.value?.toString().trim();
        const phone = control.get('phone')?.value?.toString().trim();

        return email || phone ? null : { contactRequired: true };
    }

    // Funciones para sistema de cumpleaños
    esCumpleanosHoy(cliente: any): boolean {
        const cumple = this.parseDateOnly(cliente.birthday);
        if (!cumple) return false;
        const hoy = new Date();
        return hoy.getDate() === cumple.getDate() && hoy.getMonth() === cumple.getMonth();
    }

    esCumpleanosEsteMes(cliente: any): boolean {
        const cumple = this.parseDateOnly(cliente.birthday);
        if (!cumple) return false;
        const hoy = new Date();
        return hoy.getMonth() === cumple.getMonth();
    }

    calcularEdad(cliente: any): number | null {
        const cumple = this.parseDateOnly(cliente.birthday);
        if (!cumple) return null;
        const hoy = new Date();
        let edad = hoy.getFullYear() - cumple.getFullYear();
        const mesActual = hoy.getMonth();
        const mesCumple = cumple.getMonth();
        
        if (mesActual < mesCumple || (mesActual === mesCumple && hoy.getDate() < cumple.getDate())) {
            edad--;
        }
        return edad;
    }

    private parseDateOnly(value: unknown): Date | null {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (typeof value === 'string') {
            const parts = value.split('-');
            if (parts.length === 3) {
                const year = Number(parts[0]);
                const month = Number(parts[1]);
                const day = Number(parts[2]);
                if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
                    return new Date(year, month - 1, day);
                }
            }
            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }
        return null;
    }

    private formatDateOnly(value: Date | string): string {
        const date = value instanceof Date ? value : this.parseDateOnly(value);
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
