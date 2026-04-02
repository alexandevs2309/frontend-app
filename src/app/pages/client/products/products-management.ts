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
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { FileUploadModule } from 'primeng/fileupload';
import { InventoryService, Product } from '../../../core/services/inventory/inventory.service';
import { environment } from '../../../../environments/environment';
import { SettingsService } from '../../../core/services/settings/settings.service';

interface StockMovementRow {
    id: number;
    product: number | { id?: number; name?: string };
    quantity: number;
    reason: string;
    created_at?: string;
    date?: string;
}

@Component({
    selector: 'app-products-management',
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
        TooltipModule,
        BadgeModule,
        FileUploadModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <div class="space-y-6">
            <section class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div class="grid gap-6 px-6 py-7 xl:grid-cols-[1.35fr,0.85fr] xl:px-8">
                    <div class="space-y-5">
                        <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                            Inventario operativo
                        </div>
                        <div>
                            <h2 class="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Gestión de productos</h2>
                            <p class="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">Controla stock, categorías, movimientos y productos con baja disponibilidad desde una vista más clara.</p>
                        </div>
                        <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                                <i class="pi pi-box text-xs"></i>
                                {{ productos().length }} productos
                            </div>
                            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                                <i class="pi pi-check-circle text-xs"></i>
                                {{ getActiveProductsCount() }} activos
                            </div>
                            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                                <i class="pi pi-exclamation-triangle text-xs"></i>
                                {{ productosStockBajo().length }} con stock bajo
                            </div>
                        </div>
                    </div>

                    <div class="rounded-[1.6rem] bg-slate-950 p-5 text-white shadow-xl">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <div class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Pulso del inventario</div>
                                <div class="mt-2 text-2xl font-black">Productos y existencias</div>
                            </div>
                            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                                <i class="pi pi-box text-lg"></i>
                            </div>
                        </div>
                        <div class="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                            {{ getProductsNarrative() }}
                        </div>
                    </div>
                </div>
                <div class="border-t border-slate-200/80 px-6 py-5 dark:border-slate-800 xl:px-8">
                    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div class="flex flex-wrap gap-2">
                            <button pButton label="Ajustar stock" icon="pi pi-refresh" (click)="abrirDialogoStock()" class="p-button-outlined"></button>
                            <button pButton label="Nuevo producto" icon="pi pi-plus" (click)="abrirDialogo()"></button>
                        </div>
                        <div class="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            Revisa alertas y movimientos antes de llegar a quiebres de stock.
                        </div>
                    </div>
                </div>
            </section>

            <!-- Alertas de Stock Bajo -->
            <div class="mb-4" *ngIf="productosStockBajo().length > 0">
                <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div class="flex items-center">
                        <i class="pi pi-exclamation-triangle text-orange-500 mr-2"></i>
                        <span class="font-medium text-orange-800">
                            {{productosStockBajo().length}} productos con stock bajo
                        </span>
                    </div>
                    <div class="mt-2 text-sm text-orange-700">
                        <span *ngFor="let producto of productosStockBajo(); let last = last">
                            {{producto.name}} ({{producto.stock}} unidades){{!last ? ', ' : ''}}
                        </span>
                    </div>
                </div>
            </div>

            <section class="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p-table [value]="productos()" [loading]="cargando()"
                     [globalFilterFields]="['name', 'sku', 'category']"
                     #dt>
                <ng-template pTemplate="caption">
                    <div class="flex flex-col gap-3 p-2 lg:flex-row lg:items-center lg:justify-between">
                        <span class="text-sm text-gray-600 dark:text-slate-300">
                            Total: {{productos().length}} productos
                        </span>
                        <span class="p-input-icon-left w-full lg:w-80">
                            <i class="pi pi-search"></i>
                            <input pInputText type="text" placeholder="Buscar productos..."
                                   class="w-full"
                                   (input)="dt.filterGlobal($any($event.target).value, 'contains')">
                        </span>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th>Producto</th>
                        <th>SKU</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-producto>
                    <tr>
                        <td>
                            <div class="flex items-center gap-3">
                                <img *ngIf="producto.image" [src]="producto.image" [alt]="producto.name"
                                     class="w-12 h-12 object-cover rounded border">
                                <div class="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center" *ngIf="!producto.image">
                                    <i class="pi pi-image text-gray-400"></i>
                                </div>
                                <div>
                                    <div class="font-medium">{{producto.name}}</div>
                                    <div class="text-sm text-gray-500" *ngIf="producto.description">
                                        {{producto.description}}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm text-gray-800 dark:text-gray-200">{{producto.sku}}</code>
                        </td>
                        <td>
                            <p-tag [value]="producto.category_name || 'Sin categoría'"
                                   severity="info" *ngIf="producto.category_name">
                            </p-tag>
                            <span class="text-gray-400" *ngIf="!producto.category_name">Sin categoría</span>
                        </td>
                        <td class="font-medium">{{ formatearMoneda(producto.price) }}</td>
                        <td>
                            <div class="flex items-center gap-2">
                                <span [class]="getStockClass(producto)">{{producto.stock}}</span>
                                <p-badge [value]="'Min: ' + producto.min_stock"
                                         severity="secondary" size="small"></p-badge>
                                <i class="pi pi-exclamation-triangle text-orange-500"
                                   *ngIf="producto.stock <= producto.min_stock"
                                   pTooltip="Stock bajo"></i>
                            </div>
                        </td>
                        <td>
                            <p-tag [value]="producto.is_active ? 'Activo' : 'Inactivo'"
                                   [severity]="producto.is_active ? 'success' : 'danger'">
                            </p-tag>
                        </td>
                        <td>
                            <div class="flex gap-1">
                                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                                        (click)="editarProducto(producto)" pTooltip="Editar"></button>
                                <button pButton icon="pi pi-plus-circle" class="p-button-text p-button-sm p-button-success"
                                        (click)="ajustarStockProducto(producto)" pTooltip="Ajustar Stock"></button>
                                <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger"
                                        (click)="confirmarEliminar(producto)" pTooltip="Eliminar"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="7" class="text-center py-4">No hay productos registrados</td></tr>
                </ng-template>
            </p-table>
            </section>

            <!-- Historial de Movimientos de Stock -->
            <div class="mt-6">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Historial de Movimientos de Stock</h3>
                    <button pButton icon="pi pi-refresh" class="p-button-text p-button-sm"
                            (click)="cargarMovimientosStock()" pTooltip="Recargar historial"></button>
                </div>

                <p-table [value]="movimientosStock()" [loading]="cargandoMovimientos()">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Fecha</th>
                            <th>Producto</th>
                            <th>Tipo</th>
                            <th>Cantidad</th>
                            <th>Motivo</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-mov>
                        <tr>
                            <td>{{ getMovementDate(mov) | date:'dd/MM/yyyy HH:mm' }}</td>
                            <td>{{ getMovementProductName(mov) }}</td>
                            <td>
                                <p-tag [value]="mov.quantity >= 0 ? 'Entrada' : 'Salida'"
                                       [severity]="mov.quantity >= 0 ? 'success' : 'warn'">
                                </p-tag>
                            </td>
                            <td [class]="mov.quantity >= 0 ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'">
                                {{ mov.quantity >= 0 ? '+' : '' }}{{ mov.quantity }}
                            </td>
                            <td>{{ mov.reason || 'Sin motivo' }}</td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr><td colspan="5" class="text-center py-4">No hay movimientos de stock registrados.</td></tr>
                    </ng-template>
                </p-table>
            </div>

            <!-- Diálogo de Producto -->
            <p-dialog [header]="productoSeleccionado ? 'Editar producto' : 'Nuevo producto'"
                      [(visible)]="mostrarDialogo" [modal]="true" [style]="{width: '680px'}"
                      styleClass="shadow-2xl"
                      [closable]="!guardando()" [closeOnEscape]="!guardando()">
                <form [formGroup]="formulario" class="grid gap-4">
                    <div class="rounded-2xl bg-slate-950 p-4 text-white">
                        <div class="text-[11px] uppercase tracking-[0.24em] text-slate-400">Catalogo e inventario</div>
                        <div class="mt-2 text-xl font-black">{{ productoSeleccionado ? 'Actualizar producto' : 'Registrar nuevo producto' }}</div>
                        <div class="mt-2 text-sm text-slate-300">Mantén precio, stock e imagen listos para venta y control de existencias.</div>
                    </div>

                    <div>
                        <label class="block font-medium mb-1">Nombre del Producto *</label>
                        <input pInputText formControlName="name" class="w-full"
                               [class.ng-invalid]="formulario.get('name')?.invalid && formulario.get('name')?.touched">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-medium mb-1">SKU (Auto si vacío)</label>
                            <input pInputText formControlName="sku" class="w-full"
                                   placeholder="Se genera automáticamente si lo dejas en blanco"
                                   [class.ng-invalid]="formulario.get('sku')?.invalid && formulario.get('sku')?.touched">
                        </div>
                        <div>
                            <label class="block font-medium mb-1">Categoría</label>
                            <p-select formControlName="category" [options]="categoriasOptions" appendTo="body"
                                      optionLabel="label" optionValue="value"
                                      placeholder="Seleccionar categoría" class="w-full"
                                      [showClear]="true">
                            </p-select>
                        </div>
                    </div>

                    <div>
                        <label class="block font-medium mb-1">Descripción</label>
                        <textarea pInputTextarea formControlName="description" class="w-full" rows="3"></textarea>
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label class="block font-medium mb-1">Precio *</label>
                            <p-inputNumber formControlName="price" class="w-full"
                                           mode="currency" [currency]="currencyCode()" [locale]="currencyLocale()"
                                           [min]="0" [step]="0.01">
                            </p-inputNumber>
                        </div>
                        <div>
                            <label class="block font-medium mb-1">Stock Inicial</label>
                            <p-inputNumber formControlName="stock" class="w-full"
                                           [min]="0" [step]="1">
                            </p-inputNumber>
                        </div>
                        <div>
                            <label class="block font-medium mb-1">Stock Mínimo</label>
                            <p-inputNumber formControlName="min_stock" class="w-full"
                                           [min]="0" [step]="1">
                            </p-inputNumber>
                        </div>
                    </div>

                    <div>
                        <label class="block font-medium mb-1">Unidad de Medida</label>
                        <p-select formControlName="unit" [options]="unidadesOptions" appendTo="body"
                                  optionLabel="label" optionValue="value"
                                  placeholder="Seleccionar unidad" class="w-full">
                        </p-select>
                    </div>

                    <div>
                        <label class="block font-medium mb-1">Imagen del Producto</label>
                        <p-fileUpload mode="basic" name="image" accept="image/*"
                                      [maxFileSize]="5000000" [auto]="false"
                                      (onSelect)="onImageSelect($event)"
                                      chooseLabel="Seleccionar Imagen" class="w-full">
                        </p-fileUpload>
                        <small class="text-gray-500">Máximo 5MB. Formatos: JPG, PNG, GIF</small>
                        <div *ngIf="productoSeleccionado?.image" class="mt-2">
                            <img [src]="productoSeleccionado?.image" alt="Imagen actual"
                                 class="w-20 h-20 object-cover rounded border"/>
                            <p class="text-sm text-gray-500 mt-1">Imagen actual</p>
                        </div>
                    </div>

                    <div class="flex items-center">
                        <p-checkbox formControlName="is_active" [binary]="true" inputId="activo"></p-checkbox>
                        <label for="activo" class="ml-2 font-medium">Producto Activo</label>
                    </div>

                    <div class="flex justify-end gap-2 mt-4">
                        <button pButton label="Cancelar" type="button" class="p-button-text"
                                (click)="cerrarDialogo()" [disabled]="guardando()"></button>
                        <button pButton [label]="productoSeleccionado ? 'Actualizar' : 'Crear'"
                                type="button" icon="pi pi-check" [loading]="guardando()"
                                [disabled]="formulario.invalid" (click)="guardarProducto()"></button>
                    </div>
                </form>
            </p-dialog>

            <!-- Diálogo de Ajuste de Stock -->
            <p-dialog header="Ajustar stock"
                      [(visible)]="mostrarDialogoStock" [modal]="true" [style]="{width: '500px'}"
                      styleClass="shadow-2xl"
                      [closable]="!guardando()" [closeOnEscape]="!guardando()">
                <form [formGroup]="formularioStock" class="grid gap-4">
                    <div class="rounded-2xl bg-slate-950 p-4 text-white">
                        <div class="text-[11px] uppercase tracking-[0.24em] text-slate-400">Movimiento de inventario</div>
                        <div class="mt-2 text-xl font-black">Registrar ajuste</div>
                        <div class="mt-2 text-sm text-slate-300">Aplica entradas o salidas con motivo claro para mantener el historial consistente.</div>
                    </div>

                    <div *ngIf="productoStock">
                        <label class="block font-medium mb-1">Producto</label>
                        <div class="p-3 bg-gray-50 dark:bg-slate-800/70 rounded-xl">
                            <div class="font-medium">{{productoStock.name}}</div>
                            <div class="text-sm text-gray-500">Stock actual: {{productoStock.stock}}</div>
                        </div>
                    </div>

                    <div *ngIf="!productoStock">
                        <label class="block font-medium mb-1">Seleccionar Producto *</label>
                        <p-select formControlName="product_id" [options]="productosOptions" appendTo="body"
                                  optionLabel="label" optionValue="value"
                                  placeholder="Seleccionar producto" class="w-full">
                        </p-select>
                    </div>

                    <div>
                        <label class="block font-medium mb-1">Tipo de Movimiento *</label>
                        <p-select formControlName="movement_type" [options]="tiposMovimientoOptions" appendTo="body"
                                  optionLabel="label" optionValue="value"
                                  placeholder="Seleccionar tipo" class="w-full">
                        </p-select>
                    </div>

                    <div>
                        <label class="block font-medium mb-1">Cantidad *</label>
                        <p-inputNumber formControlName="quantity" class="w-full"
                                       [min]="1" [step]="1">
                        </p-inputNumber>
                    </div>

                    <div>
                        <label class="block font-medium mb-1">Motivo *</label>
                        <input pInputText formControlName="reason" class="w-full"
                               placeholder="Ej: Compra, Venta, Ajuste, Pérdida...">
                    </div>

                    <div class="flex justify-end gap-2 mt-4">
                        <button pButton label="Cancelar" type="button" class="p-button-text"
                                (click)="cerrarDialogoStock()" [disabled]="guardando()"></button>
                        <button pButton label="Ajustar Stock" type="button" icon="pi pi-check"
                                [loading]="guardando()" [disabled]="formularioStock.invalid"
                                (click)="ejecutarAjusteStock()"></button>
                    </div>
                </form>
            </p-dialog>
        </div>

        <p-confirmDialog></p-confirmDialog>
        <p-toast></p-toast>
    `
})
export class ProductsManagement implements OnInit {
    private inventoryService = inject(InventoryService);
    private settingsService = inject(SettingsService);

    getActiveProductsCount(): number {
        return this.productos().filter((product) => product.is_active).length;
    }

    getProductsNarrative(): string {
        const total = this.productos().length;
        if (!total) {
            return 'Aun no hay productos cargados. Agrega inventario para empezar a controlar stock, ventas y movimientos.';
        }

        return `${this.getActiveProductsCount()} de ${total} productos siguen activos y ${this.productosStockBajo().length} ya requieren atencion por stock bajo.`;
    }
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private fb = inject(FormBuilder);

    productos = signal<Product[]>([]);
    productosStockBajo = signal<Product[]>([]);
    movimientosStock = signal<StockMovementRow[]>([]);
    cargando = signal(false);
    cargandoMovimientos = signal(false);
    guardando = signal(false);
    currencyCode = computed(() => this.settingsService.settings().currency || 'DOP');
    currencyLocale = computed(() => this.settingsService.getCurrencyLocale());
    mostrarDialogo = false;
    mostrarDialogoStock = false;
    productoSeleccionado: Product | null = null;
    productoStock: Product | null = null;
    imagenSeleccionada: File | null = null;

    productosOptions: any[] = [];

    categoriasOptions: { label: string; value: number }[] = [];

    unidadesOptions = [
        { label: 'Unidad', value: 'unidad' },
        { label: 'Botella', value: 'botella' },
        { label: 'Tubo', value: 'tubo' },
        { label: 'Frasco', value: 'frasco' },
        { label: 'Paquete', value: 'paquete' }
    ];

    tiposMovimientoOptions = [
        { label: 'Entrada (+)', value: 'entrada' },
        { label: 'Salida (-)', value: 'salida' }
    ];

    formulario: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(255)]],
        sku: ['', [Validators.maxLength(100)]],
        description: [''],
        category: [''],
        price: [0, [Validators.required, Validators.min(0)]],
        stock: [0, [Validators.min(0)]],
        min_stock: [1, [Validators.required, Validators.min(0)]],
        unit: ['unidad'],
        is_active: [true]
    });

    formularioStock: FormGroup = this.fb.group({
        product_id: [null, [Validators.required]],
        movement_type: ['', [Validators.required]],
        quantity: [1, [Validators.required, Validators.min(1)]],
        reason: ['', [Validators.required]]
    });

    ngOnInit() {
        this.cargarProductos();
        this.cargarMovimientosStock();
        this.cargarCategorias();
    }

    async cargarCategorias() {
        try {
            const response = await this.inventoryService.getCategories().toPromise();
            const categorias = (response as any)?.results || response || [];
            this.categoriasOptions = (categorias as any[]).map((categoria) => ({
                label: categoria.name,
                value: categoria.id
            }));
        } catch (error: any) {
            if (error?.status !== 401 && error?.status !== 403) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Categorías no disponibles',
                    detail: 'No se pudieron cargar las categorías de productos'
                });
            }
        }
    }

    async cargarProductos() {
        this.cargando.set(true);
        try {
            const response = await this.inventoryService.getProducts().toPromise();
            const productos = (response as any)?.results || response || [];
            this.productos.set(productos);

            // Filtrar productos con stock bajo
            const stockBajo = productos.filter((p: Product) => p.stock <= p.min_stock);
            this.productosStockBajo.set(stockBajo);

            // Configurar opciones para ajuste de stock
            this.productosOptions = productos.map((p: Product) => ({
                label: `${p.name} (Stock: ${p.stock})`,
                value: p.id
            }));

        } catch (error: any) {
            if (!environment.production) {
                
            }

            // Si es error 401/403, no mostrar mensaje ya que el interceptor maneja el logout
            if (error?.status !== 401 && error?.status !== 403) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.error?.detail || 'No se pudieron cargar los productos'
                });
            }
        } finally {
            this.cargando.set(false);
        }
    }

    async cargarMovimientosStock() {
        this.cargandoMovimientos.set(true);
        try {
            const response = await this.inventoryService.getStockMovements().toPromise();
            const movimientos = (response as any)?.results || response || [];
            this.movimientosStock.set((movimientos as StockMovementRow[]).slice(0, 20));
        } catch (error: any) {
            if (!environment.production) {
                
            }
            // Evitar ruido para errores de auth controlados por interceptor
            if (error?.status !== 401 && error?.status !== 403) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Historial no disponible',
                    detail: 'No se pudo cargar el historial de movimientos de stock'
                });
            }
        } finally {
            this.cargandoMovimientos.set(false);
        }
    }

    abrirDialogo() {
        this.productoSeleccionado = null;
        this.imagenSeleccionada = null;
        this.formulario.reset({
            name: '',
            sku: '',
            description: '',
            category: '',
            price: 0,
            stock: 0,
            min_stock: 1,
            unit: 'unidad',
            is_active: true
        });
        this.mostrarDialogo = true;
    }

    editarProducto(producto: Product) {
        this.productoSeleccionado = producto;
        this.imagenSeleccionada = null;
        this.formulario.patchValue({
            name: producto.name,
            sku: producto.sku,
            description: producto.description || '',
            category: producto.category || '',
            price: producto.price,
            stock: producto.stock,
            min_stock: producto.min_stock,
            unit: producto.unit || 'unidad',
            is_active: producto.is_active
        });
        this.mostrarDialogo = true;
    }

    async guardarProducto() {
        if (this.formulario.invalid) return;

        this.guardando.set(true);
        try {
            if (this.imagenSeleccionada) {
                // Con imagen: usar FormData
                const formData = new FormData();
                const productoData = this.formulario.value;

                Object.keys(productoData).forEach(key => {
                    if (productoData[key] !== null && productoData[key] !== undefined) {
                        formData.append(key, productoData[key]);
                    }
                });
                formData.append('image', this.imagenSeleccionada);

                if (this.productoSeleccionado) {
                    await this.inventoryService.updateProductWithImage(this.productoSeleccionado.id, formData).toPromise();
                } else {
                    await this.inventoryService.createProductWithImage(formData).toPromise();
                }
            } else {
                // Sin imagen: usar JSON
                const productoData = this.formulario.value;
                if (this.productoSeleccionado) {
                    await this.inventoryService.updateProduct(this.productoSeleccionado.id, productoData).toPromise();
                } else {
                    await this.inventoryService.createProduct(productoData).toPromise();
                }
            }

            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: this.productoSeleccionado ? 'Producto actualizado correctamente' : 'Producto creado correctamente'
            });

            this.cerrarDialogo();
            this.cargarProductos();
        } catch (error: any) {
            if (!environment.production) {
                
            }
            
            // Extraer mensaje de error específico de la imagen
            let errorDetail = 'Error al guardar el producto';
            if (error?.error?.image && Array.isArray(error.error.image)) {
                errorDetail = error.error.image[0];
            } else if (error?.error?.detail) {
                errorDetail = error.error.detail;
            } else if (error?.error && typeof error.error === 'object') {
                const firstField = Object.keys(error.error)[0];
                const firstFieldErrors = error.error[firstField];
                if (Array.isArray(firstFieldErrors) && firstFieldErrors.length > 0) {
                    errorDetail = `${firstField}: ${firstFieldErrors[0]}`;
                } else if (typeof firstFieldErrors === 'string') {
                    errorDetail = `${firstField}: ${firstFieldErrors}`;
                }
            }
            
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: errorDetail
            });
        } finally {
            this.guardando.set(false);
        }
    }

    abrirDialogoStock() {
        this.productoStock = null;
        this.formularioStock.reset({
            product_id: null,
            movement_type: '',
            quantity: 1,
            reason: ''
        });
        this.mostrarDialogoStock = true;
    }

    ajustarStockProducto(producto: Product) {
        this.productoStock = producto;
        this.formularioStock.patchValue({
            product_id: producto.id,
            movement_type: '',
            quantity: 1,
            reason: ''
        });
        this.mostrarDialogoStock = true;
    }

    async ejecutarAjusteStock() {
        if (this.formularioStock.invalid) return;

        this.guardando.set(true);
        try {
            const formData = this.formularioStock.value;
            const cantidad = formData.movement_type === 'entrada' ?
                formData.quantity : -formData.quantity;

            await this.inventoryService.adjustStock(
                formData.product_id,
                cantidad,
                formData.reason
            ).toPromise();

            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Stock ajustado correctamente'
            });

            this.cerrarDialogoStock();
            this.cargarProductos();
            this.cargarMovimientosStock();
        } catch (error: any) {
            if (!environment.production) {
                
            }
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al ajustar el stock'
            });
        } finally {
            this.guardando.set(false);
        }
    }

    confirmarEliminar(producto: Product) {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el producto "${producto.name}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: () => this.eliminarProducto(producto)
        });
    }

    async eliminarProducto(producto: Product) {
        try {
            await this.inventoryService.deleteProduct(producto.id).toPromise();
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Producto eliminado correctamente'
            });
            this.cargarProductos();
        } catch (error: any) {
            if (!environment.production) {
                
            }
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error?.error?.detail || 'Error al eliminar el producto'
            });
        }
    }

    getStockClass(producto: Product): string {
        if (producto.stock <= producto.min_stock) {
            return 'text-red-600 font-bold';
        } else if (producto.stock <= producto.min_stock * 2) {
            return 'text-orange-600 font-medium';
        }
        return 'text-green-600';
    }

    getMovementDate(mov: StockMovementRow): string | null {
        return mov.created_at || mov.date || null;
    }

    getMovementProductName(mov: StockMovementRow): string {
        if (typeof mov.product === 'object' && mov.product?.name) {
            return mov.product.name;
        }
        const productId = typeof mov.product === 'number' ? mov.product : mov.product?.id;
        const product = this.productos().find((p) => p.id === productId);
        return product?.name || `Producto #${productId ?? 'N/A'}`;
    }

    formatearMoneda(valor: number | string | null | undefined): string {
        const amount = Number(valor) || 0;
        return new Intl.NumberFormat(this.currencyLocale(), {
            style: 'currency',
            currency: this.currencyCode()
        }).format(amount);
    }

    onImageSelect(event: any) {
        const file = event.files[0];
        if (file) {
            // Validar tipo de archivo
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Formato Inválido',
                    detail: 'Solo se permiten imágenes en formato JPG, PNG o GIF'
                });
                return;
            }

            // Validar tamaño (5MB)
            if (file.size > 5000000) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Archivo muy grande',
                    detail: 'La imagen no debe superar los 5MB'
                });
                return;
            }

            this.imagenSeleccionada = file;
            this.messageService.add({
                severity: 'success',
                summary: 'Imagen Seleccionada',
                detail: `${file.name} listo para subir`
            });
        }
    }

    cerrarDialogo() {
        this.mostrarDialogo = false;
        this.productoSeleccionado = null;
        this.imagenSeleccionada = null;
        this.formulario.reset();
    }

    cerrarDialogoStock() {
        this.mostrarDialogoStock = false;
        this.productoStock = null;
        this.formularioStock.reset();
    }
}
