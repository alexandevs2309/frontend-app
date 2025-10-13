import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-appointments-management',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <h5>Agenda de Citas</h5>
                    <p>Gestiona las citas de tu barbería</p>
                    <!-- TODO: Implementar calendario y gestión de citas -->
                </div>
            </div>
        </div>
    `
})
export class AppointmentsManagement {}