import { Injectable } from '@angular/core';
import { EmployeeEarnings, Period } from '../interfaces/employee.interface';

@Injectable({ providedIn: 'root' })
export class EarningsCalculatorService {
  
  calculateCommissionEarnings(totalSales: number, commissionRate: number): number {
    return (totalSales * commissionRate) / 100;
  }

  calculateFixedEarnings(fixedSalary: number): number {
    return fixedSalary || 0;
  }

  calculateTotalEarnings(employee: EmployeeEarnings): number {
    return employee.payment_type === 'fixed' 
      ? this.calculateFixedEarnings(employee.fixed_salary || 0)
      : this.calculateCommissionEarnings(employee.total_sales || 0, employee.commission_rate || 0);
  }

  getCurrentPeriod(): Period {
    const hoy = new Date();
    const dia = hoy.getDate();
    const mes = hoy.getMonth();
    const año = hoy.getFullYear();
    const nombreMes = hoy.toLocaleDateString('es-ES', { month: 'long' });

    if (dia <= 15) {
      return {
        titulo: `1ra Quincena ${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}`,
        fechaInicio: new Date(año, mes, 1),
        fechaFin: new Date(año, mes, 15)
      };
    } else {
      const ultimoDia = new Date(año, mes + 1, 0).getDate();
      return {
        titulo: `2da Quincena ${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}`,
        fechaInicio: new Date(año, mes, 16),
        fechaFin: new Date(año, mes, ultimoDia)
      };
    }
  }
}