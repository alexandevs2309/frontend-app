import { Component, EventEmitter, Input, Output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { SelectModule } from 'primeng/select';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { AppointmentService } from '../../../core/services/appointment/appointment.service';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { ClientService } from '../../../core/services/client/client.service';
import { ServiceService } from '../../../core/services/service/service.service';

@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    SelectModule,
    InputTextareaModule
  ],
  template: `
    <p-dialog 
      [(visible)]="visible" 
      [header]="appointment() ? 'Editar Cita' : 'Nueva Cita'"
      [modal]="true"
      [style]="{width: '500px'}"
      (onHide)="onCancel()">
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block mb-2 font-semibold">Cliente *</label>
            <p-select 
              formControlName="client"
              [options]="clients()"
              optionLabel="full_name"
              optionValue="id"
              placeholder="Seleccionar cliente"
              [filter]="true"
              class="w-full" />
          </div>

          <div>
            <label class="block mb-2 font-semibold">Estilista *</label>
            <p-select 
              formControlName="employee"
              [options]="employees()"
              optionLabel="user.full_name"
              optionValue="id"
              placeholder="Seleccionar estilista"
              class="w-full" />
          </div>

          <div>
            <label class="block mb-2 font-semibold">Servicio *</label>
            <p-select 
              formControlName="service"
              [options]="services()"
              optionLabel="name"
              optionValue="id"
              placeholder="Seleccionar servicio"
              class="w-full" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 font-semibold">Fecha *</label>
              <p-calendar 
                formControlName="appointment_date"
                [showIcon]="true"
                dateFormat="dd/mm/yy"
                [minDate]="minDate"
                class="w-full" />
            </div>

            <div>
              <label class="block mb-2 font-semibold">Hora *</label>
              <p-calendar 
                formControlName="appointment_time"
                [timeOnly]="true"
                [showIcon]="true"
                hourFormat="24"
                class="w-full" />
            </div>
          </div>

          <div>
            <label class="block mb-2 font-semibold">Estado</label>
            <p-select 
              formControlName="status"
              [options]="statusOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full" />
          </div>

          <div>
            <label class="block mb-2 font-semibold">Notas</label>
            <textarea 
              pInputTextarea
              formControlName="notes"
              rows="3"
              class="w-full"></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <p-button 
            label="Cancelar" 
            severity="secondary"
            [outlined]="true"
            type="button"
            (onClick)="onCancel()" />
          <p-button 
            [label]="appointment() ? 'Actualizar' : 'Crear'"
            type="submit"
            [disabled]="form.invalid || loading()" />
        </div>
      </form>
    </p-dialog>
  `
})
export class AppointmentDialogComponent implements OnInit {
  @Input() visible = false;
  @Input() appointment = signal<any>(null);
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  loading = signal(false);
  clients = signal<any[]>([]);
  employees = signal<any[]>([]);
  services = signal<any[]>([]);
  minDate = new Date();

  statusOptions = [
    { label: 'Programada', value: 'scheduled' },
    { label: 'Completada', value: 'completed' },
    { label: 'Cancelada', value: 'cancelled' }
  ];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private employeeService: EmployeeService,
    private clientService: ClientService,
    private serviceService: ServiceService
  ) {
    this.form = this.fb.group({
      client: [null, Validators.required],
      employee: [null, Validators.required],
      service: [null, Validators.required],
      appointment_date: [null, Validators.required],
      appointment_time: [null, Validators.required],
      status: ['scheduled'],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadData();
    if (this.appointment()) {
      this.patchForm();
    }
  }

  loadData() {
    this.clientService.getClients().subscribe(data => this.clients.set(data));
    this.employeeService.getEmployees().subscribe(data => this.employees.set(data));
    this.serviceService.getServices().subscribe(data => this.services.set(data));
  }

  patchForm() {
    const apt = this.appointment();
    if (apt) {
      const [date, time] = apt.appointment_datetime.split('T');
      this.form.patchValue({
        client: apt.client.id,
        employee: apt.employee.id,
        service: apt.service.id,
        appointment_date: new Date(date),
        appointment_time: new Date(`2000-01-01T${time}`),
        status: apt.status,
        notes: apt.notes || ''
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    const formValue = this.form.value;
    
    const date = formValue.appointment_date;
    const time = formValue.appointment_time;
    const datetime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:00`;

    const payload = {
      client: formValue.client,
      employee: formValue.employee,
      service: formValue.service,
      appointment_datetime: datetime,
      status: formValue.status,
      notes: formValue.notes
    };

    const request = this.appointment()
      ? this.appointmentService.updateAppointment(this.appointment().id, payload)
      : this.appointmentService.createAppointment(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.saved.emit();
        this.onCancel();
      },
      error: () => this.loading.set(false)
    });
  }

  onCancel() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.form.reset({ status: 'scheduled' });
    this.appointment.set(null);
  }
}
