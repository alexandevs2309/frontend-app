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
import { ClientService, Client } from '../../core/services/client/client.service';

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
                            <span *ngIf="cliente.date_of_birth">
                                {{cliente.date_of_birth | date:'dd/MM/yyyy'}}
                            </span>
                            <span *ngIf="!cliente.date_of_birth" class="text-gray-400">
                                No especificada
                            </span>
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
                            <p-datepicker formControlName="date_of_birth" dateFormat="dd/mm/yy"
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

    clientes = signal<Client[]>([]);
    cargando = signal(false);
    guardando = signal(false);
    mostrarDialogo = false;
    clienteSeleccionado: Client | null = null;

    generoOptions = [
        { label: 'Masculino', value: 'M' },
        { label: 'Femenino', value: 'F' },
        { label: 'Otro', value: 'O' }
    ];

    formulario: FormGroup = this.fb.group({
        full_name: ['', [Validators.required, Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        address: [''],
        date_of_birth: [null],
        gender: [''],
        notes: [''],
        is_active: [true]
    });

    ngOnInit() {
        this.cargarClientes();
    }

    async cargarClientes() {
        this.cargando.set(true);
        try {
            const response = await this.clientService.getClients().toPromise();
            const clientes = (response as any)?.results || response || [];
            this.clientes.set(clientes);
        } catch (error) {
            console.error('Error cargando clientes:', error);
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
            date_of_birth: null,
            gender: '',
            notes: '',
            is_active: true
        });
        this.mostrarDialogo = true;
    }

    editarCliente(cliente: Client) {
        this.clienteSeleccionado = cliente;
        this.formulario.patchValue({
            full_name: cliente.full_name,
            email: cliente.email,
            phone: cliente.phone || '',
            address: cliente.address || '',
            date_of_birth: cliente.date_of_birth ? new Date(cliente.date_of_birth) : null,
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
            const clienteData = { ...this.formulario.value };

            // Formatear fecha de nacimiento
            if (clienteData.date_of_birth) {
                clienteData.date_of_birth = new Date(clienteData.date_of_birth).toISOString().split('T')[0];
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
            console.error('Error guardando cliente:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al guardar el cliente'
            });
        } finally {
            this.guardando.set(false);
        }
    }

    confirmarEliminar(cliente: Client) {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar al cliente "${cliente.full_name}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: () => this.eliminarCliente(cliente)
        });
    }

    async eliminarCliente(cliente: Client) {
        try {
            await this.clientService.deleteClient(cliente.id).toPromise();
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Cliente eliminado correctamente'
            });
            this.cargarClientes();
        } catch (error: any) {
            console.error('Error eliminando cliente:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al eliminar el cliente'
            });
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
}
