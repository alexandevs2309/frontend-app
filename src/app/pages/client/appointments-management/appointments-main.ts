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
            <div class="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-6 rounded-2xl mb-6 shadow-2xl">
                <div class="absolute inset-0 bg-black/10"></div>
                <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
                
                <div class="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-white/20 backdrop-blur-sm rounded-xl animate-pulse">
                            <i class="pi pi-calendar text-4xl"></i>
                        </div>
                        <div>
                            <h2 class="text-3xl font-bold drop-shadow-lg">Gestión de Citas</h2>
                            <p class="text-purple-100 mt-1">Administra las citas de tu barbería</p>
                        </div>
                    </div>
                    <button pButton label="Nueva Cita" icon="pi pi-plus" (click)="crearCita()" 
                            class="bg-white text-purple-600 hover:bg-purple-50 border-0 shadow-lg transform hover:scale-105 transition-all"></button>
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
