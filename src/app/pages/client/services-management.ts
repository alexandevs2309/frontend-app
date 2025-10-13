import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-services-management',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <h5>Gestión de Servicios</h5>
                    <p>Administra los servicios que ofreces</p>
                    <!-- TODO: Implementar CRUD de servicios -->
                </div>
            </div>
        </div>
    `
})
export class ServicesManagement {}