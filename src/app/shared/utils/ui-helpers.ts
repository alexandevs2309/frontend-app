export class UIHelpers {
  static getActionSeverity(action: string): 'success' | 'info' | 'danger' | 'secondary' {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'info';
      case 'DELETE': return 'danger';
      default: return 'secondary';
    }
  }

  static getRoleSeverity(role: string): 'danger' | 'warn' | 'info' | 'secondary' {
    switch (role) {
      case 'SuperAdmin': return 'danger';
      case 'ClientAdmin': return 'warn';
      case 'ClientStaff': return 'info';
      default: return 'secondary';
    }
  }

  static getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }
}