import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ServiceService, Service, ServiceCategory } from '../../../core/services/service/service.service';
import { environment } from '../../../../environments/environment';
import { ServiceDto, ServiceCategoryDto, CreateServiceDto, UpdateServiceDto } from '../../../core/dto/service.dto';
import { SettingsService } from '../../../core/services/settings/settings.service';

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
        MultiSelectModule,
        CheckboxModule,
        TagModule,
        ToastModule,
        ConfirmDialogModule,
        TooltipModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <div class="space-y-6">
            <section class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div class="grid gap-6 px-6 py-7 xl:grid-cols-[1.35fr,0.85fr] xl:px-8">
                    <div class="space-y-5">
                        <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                            Oferta de servicios
                        </div>
                        <div>
                            <h2 class="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Gestión de servicios</h2>
                            <p class="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">Define qué ofreces, cómo se agrupa cada servicio y qué permanece activo para agenda y venta.</p>
                        </div>
                        <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                                <i class="pi pi-star text-xs"></i>
                                {{ servicios().length }} servicios
                            </div>
                            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                                <i class="pi pi-check-circle text-xs"></i>
                                {{ getActiveServicesCount() }} activos
                            </div>
                            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                                <i class="pi pi-tags text-xs"></i>
                                {{ categoriasDisponibles.length }} categorias
                            </div>
                        </div>
                    </div>

                    <div class="rounded-[1.6rem] bg-slate-950 p-5 text-white shadow-xl">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <div class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Resumen del catalogo</div>
                                <div class="mt-2 text-2xl font-black">Oferta comercial</div>
                            </div>
                            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                                <i class="pi pi-star text-lg"></i>
                            </div>
                        </div>
                        <div class="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                            {{ getServicesNarrative() }}
                        </div>
                    </div>
                </div>
                <div class="border-t border-slate-200/80 px-6 py-5 dark:border-slate-800 xl:px-8">
                    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <button pButton label="Nuevo servicio" icon="pi pi-plus" (click)="abrirDialogo()"></button>
                        <div class="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            Mantén precios, duración y categorías alineados con la agenda y el POS.
                        </div>
                    </div>
                </div>
            </section>

            <section class="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p-table [value]="servicios()" [loading]="cargando()"
                     [globalFilterFields]="['name', 'category', 'description']"
                     #dt>
                <ng-template pTemplate="caption">
                    <div class="flex flex-col gap-3 p-2 lg:flex-row lg:items-center lg:justify-between">
                        <span class="text-sm text-gray-600 dark:text-slate-300">
                            Total: {{servicios().length}} servicios
                        </span>
                        <span class="p-input-icon-left w-full lg:w-80">
                            <i class="pi pi-search"></i>
                            <input pInputText type="text" placeholder="Buscar servicios..."
                                   class="w-full"
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
                            <div class="flex flex-wrap gap-1" *ngIf="servicio.category_names && servicio.category_names.length > 0; else singleCategory">
                                <p-tag *ngFor="let categoryName of servicio.category_names" 
                                       [value]="categoryName" severity="info">
                                </p-tag>
                            </div>
                            <ng-template #singleCategory>
                                <p-tag [value]="servicio.category || 'Sin categoría'"
                                       severity="info" *ngIf="servicio.category">
                                </p-tag>
                                <span class="text-gray-400" *ngIf="!servicio.category">Sin categoría</span>
                            </ng-template>
                        </td>
                        <td class="font-medium">{{ formatearMoneda(servicio.price) }}</td>
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
            </section>

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
                            <label class="block font-medium mb-1">Categorías</label>
                            <p-multiSelect formControlName="categories" appendTo="body"
                                            [options]="categoriasDisponibles" 
                                          optionLabel="name" 
                                          optionValue="id"
                                          placeholder="Seleccionar categorías" 
                                          class="w-full"
                                          [showClear]="true"
                                          display="chip">
                            </p-multiSelect>
                            <small class="text-gray-500" *ngIf="categoriasDisponibles.length === 0">
                                No hay categorías disponibles
                            </small>
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
                                       mode="currency" [currency]="currencyCode()" [locale]="currencyLocale()"
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
    private settingsService = inject(SettingsService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private fb = inject(FormBuilder);

    servicios = signal<ServiceDto[]>([]);
    cargando = signal(false);
    guardando = signal(false);
    currencyCode = computed(() => this.settingsService.settings().currency || 'DOP');
    currencyLocale = computed(() => this.settingsService.getCurrencyLocale());
    mostrarDialogo = false;
    servicioSeleccionado: ServiceDto | null = null;
    categoriasDisponibles: ServiceCategoryDto[] = [];

    getActiveServicesCount(): number {
        return this.servicios().filter((service) => service.is_active).length;
    }

    getServicesNarrative(): string {
        const total = this.servicios().length;
        if (!total) {
            return 'Aun no hay servicios cargados. Crea el primero para empezar a vender, agendar y asignar trabajo al equipo.';
        }

        return `${this.getActiveServicesCount()} de ${total} servicios estan activos y ${this.categoriasDisponibles.length} categorias ayudan a ordenar la oferta del negocio.`;
    }

    // Utility function to normalize API responses
    private normalizeArray<T>(response: any): T[] {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (response.results && Array.isArray(response.results)) return response.results;
        return [];
    }

    // Adaptador Backend → Frontend DTO
    private mapBackendToServiceDto(backendService: any, categorias: ServiceCategoryDto[]): ServiceDto {
        // Manejar tanto categories (array) como category (string legacy)
        let categoryIds: number[] = [];
        let categoryNames: string[] = [];
        
        if (backendService.categories && Array.isArray(backendService.categories)) {
            categoryIds = backendService.categories;
            categoryNames = backendService.categories.map((catId: number) => {
                const categoria = categorias.find(c => c.id === catId);
                return categoria?.name;
            }).filter(Boolean);
        } else if (backendService.category) {
            // Legacy: category como string
            categoryNames = [backendService.category];
        }

        return {
            id: backendService.id,
            name: backendService.name,
            description: backendService.description,
            categories: categoryIds,
            category_names: categoryNames,
            price: backendService.price,
            duration: backendService.duration,
            is_active: backendService.is_active,
            created_at: backendService.created_at,
            updated_at: backendService.updated_at
        };
    }

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
        categories: [[]], // ✅ Normalizado array IDs
        price: [0, [Validators.required, Validators.min(0)]],
        duration: [30, [Validators.required, Validators.min(5)]],
        is_active: [true]
    });

    ngOnInit() {
        this.cargarCategorias().then(() => {
            this.cargarServicios();
        });
    }

    async cargarCategorias() {
        try {
            const response: any = await this.serviceService.getServiceCategories().toPromise();
            this.categoriasDisponibles = this.normalizeArray<ServiceCategoryDto>(response);
        } catch (error) {
            console.error('Error cargando categorías:', error);
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se pudieron cargar las categorías'
            });
            this.categoriasDisponibles = [];
        }
    }

    async cargarServicios() {
        if (this.cargando()) return; // ✅ Prevenir llamadas concurrentes
        this.cargando.set(true);
        try {
            const response = await this.serviceService.getServices().toPromise();
            const servicios = this.normalizeArray<any>(response);
            const serviciosNormalizados = servicios.map((servicio: any) => 
                this.mapBackendToServiceDto(servicio, this.categoriasDisponibles)
            );
            this.servicios.set(serviciosNormalizados);
        } catch (error) {
            if (!environment.production) {
                
            }
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
            categories: [],
            price: 0,
            duration: 30,
            is_active: true
        });
        this.mostrarDialogo = true;
    }

    editarServicio(servicio: ServiceDto) {
        this.servicioSeleccionado = servicio;
        this.formulario.patchValue({
            name: servicio.name,
            description: servicio.description || '',
            categories: servicio.categories || [], // ✅ Normalizado
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
            const servicioData: CreateServiceDto | UpdateServiceDto = this.formulario.value;

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
            if (!environment.production) {
                
            }
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al guardar el servicio'
            });
        } finally {
            this.guardando.set(false);
        }
    }

    confirmarEliminar(servicio: ServiceDto) {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el servicio "${servicio.name}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: () => this.eliminarServicio(servicio)
        });
    }

    async eliminarServicio(servicio: ServiceDto) {
        try {
            await this.serviceService.deleteService(servicio.id).toPromise();
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Servicio eliminado correctamente'
            });
            this.cargarServicios();
        } catch (error: any) {
            if (!environment.production) {
                
            }
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al eliminar el servicio'
            });
        }
    }

    formatearMoneda(valor: number | string | null | undefined): string {
        const amount = Number(valor) || 0;
        return new Intl.NumberFormat(this.currencyLocale(), {
            style: 'currency',
            currency: this.currencyCode()
        }).format(amount);
    }

    cerrarDialogo() {
        this.mostrarDialogo = false;
        this.servicioSeleccionado = null;
        this.formulario.reset();
    }
}
