import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-employees-management',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <h5>Gestión de Empleados</h5>
                    <p>Administra tu equipo de trabajo</p>
                    <!-- TODO: Implementar CRUD de empleados -->
                </div>
            </div>
        </div>
    `
})
export class EmployeesManagement {}