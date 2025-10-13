import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-products-management',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <h5>Gestión de Productos</h5>
                    <p>Administra tu inventario de productos</p>
                    <!-- TODO: Implementar CRUD de productos e inventario -->
                </div>
            </div>
        </div>
    `
})
export class ProductsManagement {}