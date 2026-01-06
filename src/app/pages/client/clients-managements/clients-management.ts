import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
    template: `
        <div class="card">
            <div class="flex justify-between items-center mb-4">
                <div>
                    <h5 class="m-0">Gestión de Clientes</h5>
                    <p class="text-gray-600 mt-1">Administra la base de datos de clientes de tu barbería</p>
                </div>
                <button pButton label="Nuevo Cliente" icon="pi pi-plus"
                        (click)="abrirDialogo()" class="p-button-primary"></button>
            </div>

            <p-table [value]="clientes()" [loading]="cargando()"
                     [globalFilterFields]="['full_name', 'email', 'phone']"
                     #dt>
                <ng-template pTemplate="caption">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">
                            Total: {{clientes().length}} clientes
                        </span>
                        <span class="p-input-icon-left">
                            <i class="pi pi-search"></i>
                            <input pInputText type="text" placeholder="Buscar clientes..."
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
                            <label class="block font-medium mb-1">Email *</label>
                            <input pInputText formControlName="email" type="email" class="w-full"
                                   [class.ng-invalid]="formulario.get('email')?.invalid && formulario.get('email')?.touched">
                        </div>
                        <div>
                            <label class="block font-medium mb-1">Teléfono</label>
                            <input pInputText formControlName="phone" class="w-full">
                        </div>
                    </div>

                    <div>
                        <label class="block font-medium mb-1">Dirección</label>
                        <input pInputText formControlName="address" class="w-full">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-medium mb-1">Fecha de Nacimiento</label>
                            <p-datepicker formControlName="birthday" dateFormat="dd/mm/yy"
                                        class="w-full" [showClear]="true">
                            </p-datepicker>
                        </div>
                        <div>
                            <label class="block font-medium mb-1">Género</label>
                            <p-select formControlName="gender" [options]="generoOptions"
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
            birthday: backendClient.birthday, // ✅ Normalizado desde backend
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
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        address: [''],
        birthday: [null], // ✅ Normalizado desde backend
        gender: [''],
        notes: [''],
        is_active: [true]
    });

    ngOnInit() {
        this.cargarClientes();
    }

    async cargarClientes() {
        if (this.cargando()) return; // ✅ Prevenir llamadas concurrentes
        this.cargando.set(true);
        try {
            const response = await this.clientService.getClients().toPromise();
            
            const clientes = this.normalizeArray<any>(response);
            const clientesNormalizados = clientes.map((cliente: any) => this.mapBackendToClientDto(cliente));
            
            this.clientes.set(clientesNormalizados);

        } catch (error) {
            if (!environment.production) {
                console.error('Error cargando clientes:', error);
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
            birthday: (() => { // ✅ Normalizado
                const fecha = cliente.birthday;
                return fecha ? new Date(fecha) : null;
            })(),
            gender: cliente.gender || '',
            notes: cliente.notes || '',
            is_active: cliente.is_active
        });
        this.mostrarDialogo = true;
    }

    async guardarCliente() {
        if (this.formulario.invalid) return;

        this.guardando.set(true);
        try {
            const clienteData: CreateClientDto | UpdateClientDto = { ...this.formulario.value };

            // Formatear fecha de nacimiento - el backend espera 'birthday'
            if (clienteData.birthday) {
                clienteData.birthday = new Date(clienteData.birthday).toISOString().split('T')[0];
            }

            if (this.clienteSeleccionado) {
                await this.clientService.updateClient(this.clienteSeleccionado.id, clienteData).toPromise();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Cliente actualizado correctamente'
                });
            } else {
                await this.clientService.createClient(clienteData).toPromise();
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
                console.error('Error guardando cliente:', error);
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
            await this.clientService.deleteClient(cliente.id).toPromise();
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Cliente eliminado correctamente'
            });
            this.cargarClientes();
        } catch (error: any) {
            if (!environment.production) {
                console.error('Error eliminando cliente:', error);
            }
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al eliminar el cliente'
            });
        }
    }



    formatearFecha(cliente: any): string {
        const fecha = cliente.birthday;
        if (!fecha) return 'No especificada';
        try {
            return new Date(fecha).toLocaleDateString('es-ES');
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

    // Funciones para sistema de cumpleaños
    esCumpleanosHoy(cliente: any): boolean {
        if (!cliente.birthday) return false;
        const hoy = new Date();
        const cumple = new Date(cliente.birthday);
        return hoy.getDate() === cumple.getDate() && hoy.getMonth() === cumple.getMonth();
    }

    esCumpleanosEsteMes(cliente: any): boolean {
        if (!cliente.birthday) return false;
        const hoy = new Date();
        const cumple = new Date(cliente.birthday);
        return hoy.getMonth() === cumple.getMonth();
    }

    calcularEdad(cliente: any): number | null {
        if (!cliente.birthday) return null;
        const hoy = new Date();
        const cumple = new Date(cliente.birthday);
        let edad = hoy.getFullYear() - cumple.getFullYear();
        const mesActual = hoy.getMonth();
        const mesCumple = cumple.getMonth();
        
        if (mesActual < mesCumple || (mesActual === mesCumple && hoy.getDate() < cumple.getDate())) {
            edad--;
        }
        return edad;
    }
}
