import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { AppointmentWithDetails } from '../../../core/services/appointment/appointment.service';

export interface AppointmentDialogValue {
    client: number;
    stylist: number;
    service: number | null;
    date: Date | null;
    time: Date | null;
    description: string;
}

type EmployeeOption = { label: string; value: number; serviceIds?: number[] };

@Component({
    selector: 'app-appointment-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, SelectModule, DatePickerModule, TextareaModule],
    template: `
        <p-dialog
            [header]="appointment ? 'Editar Cita' : 'Nueva Cita'"
            [(visible)]="visible"
            [modal]="true"
            [style]="{ width: '95%', maxWidth: '600px' }"
            [closable]="!saving"
            [closeOnEscape]="!saving"
            (onHide)="handleHide()"
        >
            <form [formGroup]="form" class="grid gap-4" (ngSubmit)="onSubmit()">
                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-medium mb-1">Cliente *</label>
                        <p-select
                            formControlName="client"
                            [options]="clientsOptions"
                            appendTo="body"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccionar cliente"
                            class="w-full"
                            [filter]="true"
                        ></p-select>
                    </div>
                    <div>
                        <label class="block font-medium mb-1">Empleado *</label>
                        <p-select
                            formControlName="stylist"
                            [options]="filteredEmployeesOptions"
                            appendTo="body"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccionar empleado"
                            class="w-full"
                        ></p-select>
                        <small class="block mt-1 text-slate-500 dark:text-slate-400">
                            {{ form.controls.service.value ? 'Solo se muestran empleados que realizan el servicio seleccionado.' : 'Se muestran empleados activos con servicios asignados.' }}
                        </small>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-medium mb-1">Fecha *</label>
                        <p-datepicker formControlName="date" dateFormat="dd/mm/yy" appendTo="body" class="w-full"></p-datepicker>
                    </div>
                    <div>
                        <label class="block font-medium mb-1">Hora *</label>
                        <p-datepicker formControlName="time" hourFormat="24" [showTime]="true" [timeOnly]="true" appendTo="body" class="w-full"></p-datepicker>
                    </div>
                </div>

                <div>
                    <label class="block font-medium mb-1">Servicio</label>
                    <p-select
                        formControlName="service"
                        [options]="servicesOptions"
                        appendTo="body"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Seleccionar servicio"
                        class="w-full"
                        [showClear]="true"
                    ></p-select>
                </div>

                <div>
                    <label class="block font-medium mb-1">Notas</label>
                    <textarea pTextarea formControlName="description" class="w-full" rows="3" placeholder="Notas adicionales sobre la cita..."></textarea>
                </div>

                <div class="flex justify-end gap-2 mt-4">
                    <button pButton label="Cancelar" type="button" class="p-button-text" (click)="onCancel()" [disabled]="saving"></button>
                    <button pButton [label]="appointment ? 'Actualizar' : 'Crear'" type="submit" icon="pi pi-check" [loading]="saving" [disabled]="form.invalid"></button>
                </div>
            </form>
        </p-dialog>
    `
})
export class AppointmentDialogComponent implements OnChanges {
    @Input() visible = false;
    @Input() saving = false;
    @Input() appointment: AppointmentWithDetails | null = null;
    @Input() clientsOptions: Array<{ label: string; value: number }> = [];
    @Input() employeesOptions: EmployeeOption[] = [];
    @Input() servicesOptions: Array<{ label: string; value: number }> = [];

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() save = new EventEmitter<AppointmentDialogValue>();
    @Output() cancel = new EventEmitter<void>();

    private readonly fb = inject(FormBuilder);

    form = this.fb.group({
        client: [null as number | null, Validators.required],
        stylist: [null as number | null, Validators.required],
        service: [null as number | null],
        date: [null as Date | null, Validators.required],
        time: [null as Date | null, Validators.required],
        description: ['']
    });

    get filteredEmployeesOptions(): EmployeeOption[] {
        const selectedServiceId = this.form.controls.service.value;
        if (!selectedServiceId) {
            return this.employeesOptions;
        }

        return this.employeesOptions.filter((employee) => employee.serviceIds?.includes(selectedServiceId));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['appointment'] || changes['visible']) {
            this.syncForm();
        }

        if (changes['employeesOptions']) {
            this.ensureSelectedStylistIsStillValid();
        }
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const value = this.form.getRawValue();
        this.save.emit({
            client: value.client as number,
            stylist: value.stylist as number,
            service: value.service ?? null,
            date: value.date,
            time: value.time,
            description: value.description?.trim() || ''
        });
    }

    onCancel(): void {
        this.visible = false;
        this.visibleChange.emit(false);
        this.cancel.emit();
    }

    handleHide(): void {
        this.onCancel();
    }

    private syncForm(): void {
        if (!this.visible) {
            this.form.reset({
                client: null,
                stylist: null,
                service: null,
                date: null,
                time: null,
                description: ''
            });
            return;
        }

        if (!this.appointment) {
            this.form.reset({
                client: null,
                stylist: null,
                service: null,
                date: null,
                time: null,
                description: ''
            });
            return;
        }

        const appointmentDate = new Date(this.appointment.date_time);
        this.form.reset({
            client: this.appointment.client,
            stylist: this.appointment.stylist,
            service: this.appointment.service ?? null,
            date: appointmentDate,
            time: appointmentDate,
            description: this.appointment.description || ''
        });
        this.ensureSelectedStylistIsStillValid();
    }

    private ensureSelectedStylistIsStillValid(): void {
        const selectedStylist = this.form.controls.stylist.value;
        if (!selectedStylist) {
            return;
        }

        const allowedIds = new Set(this.filteredEmployeesOptions.map((employee) => employee.value));
        if (!allowedIds.has(selectedStylist)) {
            this.form.patchValue({ stylist: null });
        }
    }
}
