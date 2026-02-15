import { Injectable, signal, computed } from '@angular/core';
import { AppointmentService } from '../appointment/appointment.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationBadgeService {
  private appointments = signal<any[]>([]);
  
  todayAppointments = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.appointments().filter(apt => {
      const aptDate = new Date(apt.date_time);
      return aptDate >= today && aptDate < tomorrow && apt.status === 'scheduled';
    });
  });

  upcomingAppointments = computed(() => {
    const now = new Date();
    const in30min = new Date(now.getTime() + 30 * 60000);

    return this.appointments().filter(apt => {
      const aptDate = new Date(apt.date_time);
      return aptDate >= now && aptDate <= in30min && apt.status === 'scheduled';
    });
  });

  badgeCount = computed(() => this.todayAppointments().length);

  constructor(private appointmentService: AppointmentService) {}

  loadAppointments() {
    this.appointmentService.getAppointments().subscribe({
      next: (response: any) => {
        const data = response?.results || response || [];
        this.appointments.set(data);
      },
      error: () => this.appointments.set([])
    });
  }

  refresh() {
    this.loadAppointments();
  }
}
