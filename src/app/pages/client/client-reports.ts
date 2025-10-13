import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-client-reports',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <h5>Reportes de Barbería</h5>
                    <p>Analiza el rendimiento de tu negocio</p>
                    <!-- TODO: Implementar reportes y métricas -->
                </div>
            </div>
        </div>
    `
})
export class ClientReports {}