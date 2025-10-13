import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-earnings-management',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <h5>Ganancias por Quincena</h5>
                    <p>Consulta tus comisiones y ganancias</p>
                    <!-- TODO: Implementar sistema de ganancias con notificaciones -->
                </div>
            </div>
        </div>
    `
})
export class EarningsManagement {}