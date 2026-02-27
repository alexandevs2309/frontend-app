import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role',
  standalone: true
})
export class RolePipe implements PipeTransform {
  private roleTranslations: { [key: string]: string } = {
    'SUPER_ADMIN': 'Super Administrador',
    'CLIENT_ADMIN': 'Administrador',
    'CLIENT_STAFF': 'Empleado',
    'SuperAdmin': 'Super Administrador',
    'Client-Admin': 'Administrador',
    'Client-Staff': 'Empleado',
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
