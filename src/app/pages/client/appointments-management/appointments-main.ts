import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { AppointmentsCalendar } from './appointments-calendar';
import { AppointmentsManagement } from './appointments-management';
import { NotificationBadgeService } from '../../../core/services/notification/notification-badge.service';

@Component({
    selector: 'app-appointments-main',
    standalone: true,
    imports: [CommonModule, TabsModule, ButtonModule, AppointmentsCalendar, AppointmentsManagement],
    template: `
        <div class="p-4 md:p-6">
            <!-- Hero Header -->
            <div class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-6 rounded-xl mb-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-indigo-600 rounded-xl">
                            <i class="pi pi-calendar text-white text-3xl"></i>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Citas</h2>
                            <p class="text-slate-600 dark:text-slate-400 mt-1">Administra las citas de tu barbería</p>
                        </div>
                    </div>
                    <button pButton label="Nueva Cita" icon="pi pi-plus" (click)="crearCita()" 
                            class="!bg-indigo-600 !text-white hover:!bg-indigo-700 !border-0 !shadow-lg"></button>
                </div>
            </div>

            <!-- Tabs -->
            <p-tabs value="calendar">
                <p-tabpanel value="calendar">
                    <ng-template pTemplate="header">
                        <i class="pi pi-calendar mr-2"></i>
                        <span>Calendario</span>
                    </ng-template>
                    <app-appointments-calendar #calendar></app-appointments-calendar>
                </p-tabpanel>
                
                <p-tabpanel value="list">
                    <ng-template pTemplate="header">
                        <i class="pi pi-list mr-2"></i>
                        <span>Lista</span>
                    </ng-template>
                    <app-appointments-management #lista></app-appointments-management>
                </p-tabpanel>
            </p-tabs>
        </div>
    `
})
export class AppointmentsMain implements OnInit {
    @ViewChild('lista') listaComponent!: AppointmentsManagement;
    @ViewChild('calendar') calendarComponent!: AppointmentsCalendar;
    private notificationService = inject(NotificationBadgeService);

    crearCita() {
        this.calendarComponent?.abrirFormulario();
    }

    ngOnInit() {
        // Escuchar evento de guardado para refrescar badge
        window.addEventListener('appointmentSaved', () => {
            this.notificationService.refresh();
        });
    }
}
