import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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
        FormsModule,
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
        <div class="clients-shell">
            <section class="clients-hero">
                <div>
                    <span class="clients-hero__eyebrow">Clientes operativos</span>
                    <h2>Encuentra y captura clientes sin fricción</h2>
                    <p>La prioridad es buscar rápido, abrir una ficha mínima y volver a la venta o a la cita sin rodeos.</p>
                </div>
                <div class="clients-hero__panel">
                    <span class="clients-hero__label">Acción rápida</span>
                    <strong>{{ getClientsNarrative() }}</strong>
                    <button pButton label="Nuevo cliente" icon="pi pi-plus" (click)="abrirDialogo()" class="w-full"></button>
                </div>
            </section>

            <div class="clients-toolbar">
                <div class="clients-toolbar__left">
                    <span class="clients-toolbar__count">{{ clientesVisibles().length }} visibles &middot; {{ getActiveClientsCount() }} activos</span>
                </div>
                <div class="clients-toolbar__right">
                    <span class="p-input-icon-left">
                        <i class="pi pi-search"></i>
                        <input pInputText type="text" placeholder="Nombre, email o teléfono" class="clients-search" [(ngModel)]="textoBusqueda" (ngModelChange)="aplicarBusqueda()">
                    </span>
                    <div class="clients-toolbar__hint">RNC/Cédula sigue en POS y configuración hasta que exista soporte backend.</div>
                </div>
            </div>

            <p-table [value]="clientesVisibles()" [loading]="cargando()" class="clients-table">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="full_name">Cliente <p-sortIcon field="full_name"></p-sortIcon></th>
                        <th>Contacto</th>
                        <th>Cumplea&ntilde;os</th>
                        <th>Estado</th>
                        <th style="width:7rem">Acciones</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-cliente>
                    <tr>
                        <td>
                            <div class="client-name">
                                <strong>{{ cliente.full_name }}</strong>
                                <span *ngIf="cliente.notes" class="client-notes">{{ cliente.notes }}</span>
                            </div>
                        </td>
                        <td>
                            <div class="client-contact">
                                <span *ngIf="cliente.email"><i class="pi pi-envelope"></i> {{ cliente.email }}</span>
                                <span *ngIf="cliente.phone"><i class="pi pi-phone"></i> {{ cliente.phone }}</span>
                            </div>
                        </td>
                        <td>
                            <div class="client-bday">
                                <span>{{ formatearFecha(cliente) }}</span>
                                <i *ngIf="esCumpleanosHoy(cliente)" class="pi pi-gift text-yellow-500" pTooltip="Cumplea&ntilde;os hoy"></i>
                                <i *ngIf="!esCumpleanosHoy(cliente) && esCumpleanosEsteMes(cliente)" class="pi pi-calendar text-blue-500" pTooltip="Cumplea&ntilde;os este mes"></i>
                            </div>
                        </td>
                        <td>
                            <p-tag [value]="cliente.is_active ? 'Activo' : 'Inactivo'" [severity]="cliente.is_active ? 'success' : 'danger'"></p-tag>
                        </td>
                        <td>
                            <div class="client-actions">
                                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editarCliente(cliente)" pTooltip="Editar"></button>
                                <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="confirmarEliminar(cliente)" pTooltip="Eliminar"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="5" class="clients-empty">Sin clientes registrados</td></tr>
                </ng-template>
            </p-table>

            <p-dialog [header]="clienteSeleccionado ? 'Editar cliente' : 'Nuevo cliente'"
                      [(visible)]="mostrarDialogo" [modal]="true" [style]="{width: '560px'}"
                      [closable]="!guardando()" [closeOnEscape]="!guardando()">
                <form [formGroup]="formulario" class="grid gap-4">
                    <div>
                        <label class="block font-medium mb-1">Nombre completo *</label>
                        <small class="mb-2 block text-slate-500">Captura primero lo esencial para no frenar la operación.</small>
                        <input pInputText formControlName="full_name" class="w-full"
                               [class.ng-invalid]="formulario.get('full_name')?.invalid && formulario.get('full_name')?.touched">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-medium mb-1">Email</label>
                            <input pInputText formControlName="email" type="email" class="w-full"
                                   [class.ng-invalid]="formulario.get('email')?.invalid && formulario.get('email')?.touched">
                            <small *ngIf="formulario.get('email')?.invalid && formulario.get('email')?.touched" class="text-red-500 block mt-1">Correo invalido.</small>
                        </div>
                        <div>
                            <label class="block font-medium mb-1">Telefono</label>
                            <input pInputText formControlName="phone" class="w-full">
                        </div>
                    </div>
                    <small *ngIf="formulario.errors?.['contactRequired'] && (formulario.get('email')?.touched || formulario.get('phone')?.touched)" class="text-red-500 block -mt-2">Ingresa correo o telefono.</small>
                    <div>
                        <label class="block font-medium mb-1">Direccion</label>
                        <input pInputText formControlName="address" class="w-full">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-medium mb-1">Cumpleanos</label>
                            <p-datepicker formControlName="birthday" dateFormat="dd/mm/yy" appendTo="body" class="w-full" [showClear]="true" [maxDate]="todayDate"></p-datepicker>
                        </div>
                        <div>
                            <label class="block font-medium mb-1">Genero</label>
                            <p-select formControlName="gender" [options]="generoOptions" appendTo="body" optionLabel="label" optionValue="value" placeholder="Seleccionar" class="w-full"></p-select>
                        </div>
                    </div>
                    <div>
                        <label class="block font-medium mb-1">Notas</label>
                        <textarea pInputTextarea formControlName="notes" class="w-full" rows="2" placeholder="Notas adicionales..."></textarea>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-checkbox formControlName="is_active" [binary]="true" inputId="activo"></p-checkbox>
                        <label for="activo" class="font-medium">Cliente activo</label>
                    </div>
                    <div class="flex justify-end gap-2 mt-2">
                        <button pButton label="Cancelar" type="button" class="p-button-text" (click)="cerrarDialogo()" [disabled]="guardando()"></button>
                        <button pButton [label]="clienteSeleccionado ? 'Actualizar' : 'Crear'" type="button" icon="pi pi-check" [loading]="guardando()" [disabled]="formulario.invalid" (click)="guardarCliente()"></button>
                    </div>
                </form>
            </p-dialog>
        </div>

        <p-confirmDialog></p-confirmDialog>
        <p-toast></p-toast>

        <style>
        .clients-shell { display: flex; flex-direction: column; gap: 0.75rem; }

        .clients-hero {
            display: grid;
            grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
            gap: 1rem;
            padding: 1rem 1.1rem;
            border: 1px solid var(--surface-border);
            background: linear-gradient(135deg, color-mix(in srgb, var(--surface-card) 82%, #ffffff 18%) 0%, color-mix(in srgb, var(--surface-card) 90%, #dbeafe 10%) 100%);
            border-radius: 1rem;
        }

        .clients-hero__eyebrow {
            display: inline-flex;
            padding: 0.35rem 0.7rem;
            border-radius: 999px;
            background: var(--surface-100);
            color: var(--text-color-secondary);
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.16em;
        }

        .clients-hero h2 {
            margin: 0.5rem 0 0.65rem;
            font-size: 1.85rem;
            line-height: 1.03;
            color: var(--text-color);
        }

        .clients-hero p {
            margin: 0;
            max-width: 40rem;
            color: var(--text-color-secondary);
            line-height: 1.55;
        }

        .clients-hero__panel {
            display: flex;
            flex-direction: column;
            gap: 0.65rem;
            padding: 1rem;
            border-radius: 1rem;
            background: #0f172a;
            color: #e2e8f0;
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
        }

        .clients-hero__label {
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            color: #94a3b8;
        }

        .clients-toolbar {
            display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.65rem;
            padding: 0.75rem 1rem;
            border: 1px solid var(--surface-border);
            background: var(--surface-card);
            border-radius: 0.75rem;
        }

        .clients-toolbar__left, .clients-toolbar__right { display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap; }
        .clients-toolbar__count { font-size: 0.85rem; color: var(--text-color-secondary); }
        .clients-search { height: 2.25rem; font-size: 0.88rem; }
        .clients-toolbar__hint { font-size: 0.8rem; color: var(--text-color-secondary); }

        .client-name { display: flex; flex-direction: column; gap: 0.1rem; }
        .client-name strong { font-size: 0.92rem; }
        .client-notes { font-size: 0.78rem; color: var(--text-color-secondary); font-style: italic; }

        .client-contact { display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.82rem; color: var(--text-color-secondary); }
        .client-contact span { display: flex; align-items: center; gap: 0.35rem; }

        .client-bday { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; }
        .client-actions { display: flex; gap: 0.25rem; }

        .clients-empty { text-align: center; padding: 2rem; color: var(--text-color-secondary); font-size: 0.9rem; }

        @media (max-width: 860px) {
            .clients-hero { grid-template-columns: 1fr; }
        }
        </style>
    `
})
export class ClientsManagement implements OnInit {
    private clientService = inject(ClientService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private fb = inject(FormBuilder);

    clientes = signal<ClientDto[]>([]);
    clientesVisibles = signal<ClientDto[]>([]);
    cargando = signal(false);
    guardando = signal(false);
    mostrarDialogo = false;
    clienteSeleccionado: ClientDto | null = null;
    todayDate = new Date();
    textoBusqueda = '';

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
            this.aplicarBusqueda();

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

    aplicarBusqueda(): void {
        const termino = this.textoBusqueda.trim().toLowerCase();
        if (!termino) {
            this.clientesVisibles.set(this.clientes());
            return;
        }

        this.clientesVisibles.set(
            this.clientes().filter((cliente) =>
                [cliente.full_name, cliente.email, cliente.phone]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(termino))
            )
        );
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
