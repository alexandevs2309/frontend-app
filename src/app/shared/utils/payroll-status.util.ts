/**
 * Utilidades para estados de nómina y períodos de pago
 */

export interface PayrollStatusConfig {
  color: string;
  icon: string;
  severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary';
  label: string;
}

export class PayrollStatusUtil {
  
  /**
   * Configuración de estados visuales
   */
  private static readonly STATUS_CONFIG: Record<string, PayrollStatusConfig> = {
    'in_progress': {
      color: '#6c757d',
      icon: 'pi pi-clock',
      severity: 'secondary',
      label: 'En curso'
    },
    'due': {
      color: '#dc3545',
      icon: 'pi pi-exclamation-circle',
      severity: 'danger',
      label: 'Pago pendiente'
    },
    'overdue': {
      color: '#fd7e14',
      icon: 'pi pi-exclamation-triangle',
      severity: 'warn',
      label: 'Pago atrasado'
    },
    'paid': {
      color: '#198754',
      icon: 'pi pi-check-circle',
      severity: 'success',
      label: 'Pagado'
    },
    'no_earnings': {
      color: '#6c757d',
      icon: 'pi pi-minus-circle',
      severity: 'secondary',
      label: 'Sin ganancias'
    }
  };

  /**
   * Obtiene la configuración visual para un estado
   */
  static getStatusConfig(status: string): PayrollStatusConfig {
    return this.STATUS_CONFIG[status] || {
      color: '#6c757d',
      icon: 'pi pi-question-circle',
      severity: 'secondary',
      label: 'Estado desconocido'
    };
  }

  /**
   * Obtiene el color para un estado
   */
  static getStatusColor(status: string): string {
    return this.getStatusConfig(status).color;
  }

  /**
   * Obtiene el ícono para un estado
   */
  static getStatusIcon(status: string): string {
    return this.getStatusConfig(status).icon;
  }

  /**
   * Obtiene la severidad para componentes PrimeNG
   */
  static getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return this.getStatusConfig(status).severity;
  }

  /**
   * Obtiene el label corto para un estado
   */
  static getStatusLabel(status: string): string {
    return this.getStatusConfig(status).label;
  }

  /**
   * Formatea un período de fechas para mostrar al usuario
   */
  static formatPeriodDates(startDate: string | null, endDate: string | null): string {
    if (!startDate || !endDate) return 'Período no definido';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startDay = start.getDate();
    const endDay = end.getDate();
    const month = end.toLocaleDateString('es-ES', { month: 'short' });
    const year = end.getFullYear();
    
    return `${startDay}-${endDay} ${month} ${year}`;
  }

  /**
   * Determina si un período requiere atención urgente
   */
  static requiresAttention(status: string): boolean {
    return ['due', 'overdue'].includes(status);
  }

  /**
   * Obtiene el mensaje completo de estado para mostrar al usuario
   */
  static getFullStatusMessage(
    periodDisplay: string, 
    statusDisplay: string, 
    status: string
  ): string {
    const emoji = this.getStatusEmoji(status);
    return `${periodDisplay}\nEstado: ${emoji} ${statusDisplay}`;
  }

  /**
   * Obtiene emoji para el estado (para notificaciones o mensajes)
   */
  private static getStatusEmoji(status: string): string {
    const emojiMap: Record<string, string> = {
      'in_progress': '⏳',
      'due': '🔴',
      'overdue': '🟠',
      'paid': '🟢',
      'no_earnings': '⚪'
    };
    return emojiMap[status] || '❓';
  }

  /**
   * Ordena empleados por prioridad de pago (atrasados primero)
   */
  static sortByPaymentPriority(employees: any[]): any[] {
    const priorityOrder = ['overdue', 'due', 'in_progress', 'paid', 'no_earnings'];
    
    return employees.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.period_status || 'no_earnings');
      const bPriority = priorityOrder.indexOf(b.period_status || 'no_earnings');
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Si tienen la misma prioridad, ordenar por nombre
      return (a.employee_name || '').localeCompare(b.employee_name || '');
    });
  }
}