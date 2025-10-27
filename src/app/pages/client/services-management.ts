import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ServiceService, Service } from '../../core/services/service/service.service';

@Component({
    selector: 'app-services-management',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        InputNumberModule,
        SelectModule,
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
                    <h5 class="m-0">Gestión de Servicios</h5>
                    <p class="text-gray-600 mt-1">Administra los servicios que ofrece tu barbería</p>
                </div>
                <button pButton label="Nuevo Servicio" icon="pi pi-plus"
                        (click)="abrirDialogo()" class="p-button-primary"></button>
            </div>

            <p-table [value]="servicios()" [loading]="cargando()"
                     [globalFilterFields]="['name', 'category', 'description']"
                     #dt>
                <ng-template pTemplate="caption">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">
                            Total: {{servicios().length}} servicios
                        </span>
                        <span class="p-input-icon-left">
                            <i class="pi pi-search"></i>
                            <input pInputText type="text" placeholder="Buscar servicios..."
                                   (input)="dt.filterGlobal($any($event.target).value, 'contains')">
                        </span>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th>Servicio</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Duración</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-servicio>
                    <tr>
                        <td>
                            <div>
                                <div class="font-medium">{{servicio.name}}</div>
                                <div class="text-sm text-gray-500" *ngIf="servicio.description">
                                    {{servicio.description}}
                                </div>
                            </div>
                        </td>
                        <td>
                            <p-tag [value]="servicio.category || 'Sin categoría'"
                                   severity="info" *ngIf="servicio.category">
                            </p-tag>
                            <span class="text-gray-400" *ngIf="!servicio.category">Sin categoría</span>
                        </td>
                        <td class="font-medium">\${{servicio.price}}</td>
                        <td>{{servicio.duration}} min</td>
                        <td>
                            <p-tag [value]="servicio.is_active ? 'Activo' : 'Inactivo'"
                                   [severity]="servicio.is_active ? 'success' : 'danger'">
                            </p-tag>
                        </td>
                        <td>
                            <div class="flex gap-1">
                                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                                        (click)="editarServicio(servicio)" pTooltip="Editar"></button>
                                <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger"
                                        (click)="confirmarEliminar(servicio)" pTooltip="Eliminar"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="6" class="text-center py-4">No hay servicios registrados</td></tr>
                </ng-template>
            </p-table>

            <p-dialog [header]="servicioSeleccionado ? 'Editar Servicio' : 'Nuevo Servicio'"
                      [(visible)]="mostrarDialogo" [modal]="true" [style]="{width: '500px'}"
                      [closable]="!guardando()" [closeOnEscape]="!guardando()">
                <form [formGroup]="formulario" class="grid gap-4">
                    <div>
                        <label class="block font-medium mb-1">Nombre del Servicio *</label>
                        <input pInputText formControlName="name" class="w-full"
                               [class.ng-invalid]="formulario.get('name')?.invalid && formulario.get('name')?.touched">
                    </div>

                    <div>
                        <label class="block font-medium mb-1">Descripción</label>
                        <textarea pInputTextarea formControlName="description" class="w-full" rows="3"></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-medium mb-1">Categoría</label>
                            <p-select formControlName="category" [options]="categoriasOptions"
                                        optionLabel="label" optionValue="value"
                                        placeholder="Seleccionar categoría" class="w-full"
                                        [showClear]="true">
                            </p-select>
                        </div>
                        <div>
                            <label class="block font-medium mb-1">Duración (minutos) *</label>
                            <p-inputNumber formControlName="duration" class="w-full"
                                           [min]="5" [max]="480" [step]="5">
                            </p-inputNumber>
                        </div>
                    </div>

                    <div>
                        <label class="block font-medium mb-1">Precio *</label>
                        <p-inputNumber formControlName="price" class="w-full"
                                       mode="currency" currency="USD" locale="en-US"
                                       [min]="0" [step]="0.01">
                        </p-inputNumber>
                    </div>

                    <div class="flex items-center">
                        <p-checkbox formControlName="is_active" [binary]="true" inputId="activo"></p-checkbox>
                        <label for="activo" class="ml-2 font-medium">Servicio Activo</label>
                    </div>

                    <div class="flex justify-end gap-2 mt-4">
                        <button pButton label="Cancelar" type="button" class="p-button-text"
                                (click)="cerrarDialogo()" [disabled]="guardando()"></button>
                        <button pButton [label]="servicioSeleccionado ? 'Actualizar' : 'Crear'"
                                type="button" icon="pi pi-check" [loading]="guardando()"
                                [disabled]="formulario.invalid" (click)="guardarServicio()"></button>
                    </div>
                </form>
            </p-dialog>
        </div>

        <p-confirmDialog></p-confirmDialog>
        <p-toast></p-toast>
    `
})
export class ServicesManagement implements OnInit {
    private serviceService = inject(ServiceService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private fb = inject(FormBuilder);

    servicios = signal<Service[]>([]);
    cargando = signal(false);
    guardando = signal(false);
    mostrarDialogo = false;
    servicioSeleccionado: Service | null = null;

    categoriasOptions = [
        { label: 'Corte de Cabello', value: 'Corte de Cabello' },
        { label: 'Barba', value: 'Barba' },
        { label: 'Tratamientos', value: 'Tratamientos' },
        { label: 'Peinado', value: 'Peinado' },
        { label: 'Coloración', value: 'Coloración' },
        { label: 'Afeitado', value: 'Afeitado' },
        { label: 'Combo', value: 'Combo' }
    ];

    formulario: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(100)]],
        description: [''],
        category: [''],
        price: [0, [Validators.required, Validators.min(0)]],
        duration: [30, [Validators.required, Validators.min(5)]],
        is_active: [true]
    });

    ngOnInit() {
        this.cargarServicios();
    }

    async cargarServicios() {
        this.cargando.set(true);
        try {
            const response = await this.serviceService.getServices().toPromise();
            const servicios = (response as any)?.results || response || [];
            this.servicios.set(servicios);
        } catch (error) {
            console.error('Error cargando servicios:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar los servicios'
            });
        } finally {
            this.cargando.set(false);
        }
    }

    abrirDialogo() {
        this.servicioSeleccionado = null;
        this.formulario.reset({
            name: '',
            description: '',
            category: '',
            price: 0,
            duration: 30,
            is_active: true
        });
        this.mostrarDialogo = true;
    }

    editarServicio(servicio: Service) {
        this.servicioSeleccionado = servicio;
        this.formulario.patchValue({
            name: servicio.name,
            description: servicio.description || '',
            category: servicio.category || '',
            price: servicio.price,
            duration: servicio.duration,
            is_active: servicio.is_active
        });
        this.mostrarDialogo = true;
    }

    async guardarServicio() {
        if (this.formulario.invalid) return;

        this.guardando.set(true);
        try {
            const servicioData = this.formulario.value;

            if (this.servicioSeleccionado) {
                await this.serviceService.updateService(this.servicioSeleccionado.id, servicioData).toPromise();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Servicio actualizado correctamente'
                });
            } else {
                await this.serviceService.createService(servicioData).toPromise();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Servicio creado correctamente'
                });
            }

            this.cerrarDialogo();
            this.cargarServicios();
        } catch (error: any) {
            console.error('Error guardando servicio:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al guardar el servicio'
            });
        } finally {
            this.guardando.set(false);
        }
    }

    confirmarEliminar(servicio: Service) {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el servicio "${servicio.name}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: () => this.eliminarServicio(servicio)
        });
    }

    async eliminarServicio(servicio: Service) {
        try {
            await this.serviceService.deleteService(servicio.id).toPromise();
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Servicio eliminado correctamente'
            });
            this.cargarServicios();
        } catch (error: any) {
            console.error('Error eliminando servicio:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al eliminar el servicio'
            });
        }
    }

    cerrarDialogo() {
        this.mostrarDialogo = false;
        this.servicioSeleccionado = null;
        this.formulario.reset();
    }
}
