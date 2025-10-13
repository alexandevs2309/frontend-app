import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role',
  standalone: true
})
export class RolePipe implements PipeTransform {
  private roleTranslations: { [key: string]: string } = {
    'SuperAdmin': 'Super Administrador',
    'ClientAdmin': 'Administrador',
    'ClientStaff': 'Empleado',
    'super_admin': 'Super Administrador',
    'client_admin': 'Administrador',
    'client_staff': 'Empleado',
    'admin': 'Administrador',
    'staff': 'Empleado',
    'user': 'Usuario'
  };

  transform(value: string | null): string {
    if (!value) return 'Sin rol';
    
    return this.roleTranslations[value] || value;
  }
}