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
import { BadgeModule } from 'primeng/badge';
import { FileUploadModule } from 'primeng/fileupload';
import { InventoryService, Product } from '../../../core/services/inventory/inventory.service';
import { environment } from '../../../../environments/environment';

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
        <div class="card">
            <!-- Hero Header -->
            <div class="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white p-6 rounded-2xl mb-6 shadow-2xl">
                <div class="absolute inset-0 bg-black/10"></div>
                <div class="absolute top-0 left-0 w-60 h-60 bg-white/10 rounded-full blur-3xl -ml-30 -mt-30"></div>
                
                <div class="relative flex justify-between items-center">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-white/20 backdrop-blur-sm rounded-xl animate-pulse">
                            <i class="pi pi-box text-4xl"></i>
                        </div>
                        <div>
                            <h2 class="text-3xl font-bold drop-shadow-lg">Gestión de Productos</h2>
                            <p class="text-emerald-100 mt-1">Administra tu inventario de productos de barbería</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button pButton label="Ajustar Stock" icon="pi pi-refresh" (click)="abrirDialogoStock()" 
                                class="bg-white/20 hover:bg-white/30 border-0 text-white"></button>
                        <button pButton label="Nuevo Producto" icon="pi pi-plus" (click)="abrirDialogo()" 
                                class="bg-white text-emerald-600 hover:bg-emerald-50 border-0 shadow-lg transform hover:scale-105 transition-all"></button>
                    </div>
                </div>
            </div>

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

            <p-table [value]="productos()" [loading]="cargando()"
                     [globalFilterFields]="['name', 'sku', 'category']"
                     #dt>
                <ng-template pTemplate="caption">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">
                            Total: {{productos().length}} productos
                        </span>
                        <span class="p-input-icon-left">
                            <i class="pi pi-search"></i>
                            <input pInputText type="text" placeholder="Buscar productos..."
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
                            <code class="bg-gray-100 px-2 py-1 rounded text-sm">{{producto.sku}}</code>
                        </td>
                        <td>
                            <p-tag [value]="producto.category || 'Sin categoría'"
                                   severity="info" *ngIf="producto.category">
                            </p-tag>
                            <span class="text-gray-400" *ngIf="!producto.category">Sin categoría</span>
                        </td>
                        <td class="font-medium">\${{producto.price}}</td>
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

            <!-- Diálogo de Producto -->
            <p-dialog [header]="productoSeleccionado ? 'Editar Producto' : 'Nuevo Producto'"
                      [(visible)]="mostrarDialogo" [modal]="true" [style]="{width: '600px'}"
                      [closable]="!guardando()" [closeOnEscape]="!guardando()">
                <form [formGroup]="formulario" class="grid gap-4">
                    <div>
                        <label class="block font-medium mb-1">Nombre del Producto *</label>
                        <input pInputText formControlName="name" class="w-full"
                               [class.ng-invalid]="formulario.get('name')?.invalid && formulario.get('name')?.touched">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-medium mb-1">SKU *</label>
                            <input pInputText formControlName="sku" class="w-full"
                                   [class.ng-invalid]="formulario.get('sku')?.invalid && formulario.get('sku')?.touched">
                        </div>
                        <div>
                            <label class="block font-medium mb-1">Categoría</label>
                            <p-select formControlName="category" [options]="categoriasOptions"
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
                                           mode="currency" currency="USD" locale="en-US"
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
                        <p-select formControlName="unit" [options]="unidadesOptions"
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
            <p-dialog header="Ajustar Stock"
                      [(visible)]="mostrarDialogoStock" [modal]="true" [style]="{width: '400px'}"
                      [closable]="!guardando()" [closeOnEscape]="!guardando()">
                <form [formGroup]="formularioStock" class="grid gap-4">
                    <div *ngIf="productoStock">
                        <label class="block font-medium mb-1">Producto</label>
                        <div class="p-3 bg-gray-50 rounded">
                            <div class="font-medium">{{productoStock.name}}</div>
                            <div class="text-sm text-gray-500">Stock actual: {{productoStock.stock}}</div>
                        </div>
                    </div>

                    <div *ngIf="!productoStock">
                        <label class="block font-medium mb-1">Seleccionar Producto *</label>
                        <p-select formControlName="product_id" [options]="productosOptions"
                                  optionLabel="label" optionValue="value"
                                  placeholder="Seleccionar producto" class="w-full">
                        </p-select>
                    </div>

                    <div>
                        <label class="block font-medium mb-1">Tipo de Movimiento *</label>
                        <p-select formControlName="movement_type" [options]="tiposMovimientoOptions"
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
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private fb = inject(FormBuilder);

    productos = signal<Product[]>([]);
    productosStockBajo = signal<Product[]>([]);
    cargando = signal(false);
    guardando = signal(false);
    mostrarDialogo = false;
    mostrarDialogoStock = false;
    productoSeleccionado: Product | null = null;
    productoStock: Product | null = null;
    imagenSeleccionada: File | null = null;

    productosOptions: any[] = [];

    categoriasOptions = [
        { label: 'Shampoo', value: 'Shampoo' },
        { label: 'Acondicionador', value: 'Acondicionador' },
        { label: 'Gel', value: 'Gel' },
        { label: 'Cera', value: 'Cera' },
        { label: 'Pomada', value: 'Pomada' },
        { label: 'Aceite', value: 'Aceite' },
        { label: 'Herramientas', value: 'Herramientas' },
        { label: 'Accesorios', value: 'Accesorios' }
    ];

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
        sku: ['', [Validators.required, Validators.maxLength(100)]],
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
                console.error('Error cargando productos:', error);
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
                console.error('Error guardando producto:', error);
            }
            
            // Extraer mensaje de error específico de la imagen
            let errorDetail = 'Error al guardar el producto';
            if (error?.error?.image && Array.isArray(error.error.image)) {
                errorDetail = error.error.image[0];
            } else if (error?.error?.detail) {
                errorDetail = error.error.detail;
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
        } catch (error: any) {
            if (!environment.production) {
                console.error('Error ajustando stock:', error);
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
                console.error('Error eliminando producto:', error);
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
