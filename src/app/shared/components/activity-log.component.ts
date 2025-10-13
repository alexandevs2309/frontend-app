import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ActivityLogService, ActivityLog } from '../../core/services/activity-log/activity-log.service';
import { DatePipe } from '@angular/common';
import { UIHelpers } from '../utils/ui-helpers';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, DatePipe],

  template: `
    <div class="card">
      <h5>Actividad Reciente del Sistema ({{ logStats().total }})</h5>
      <p-table [value]="logs()" [rows]="10" [paginator]="true" [loading]="loading()">
        <ng-template #header>
          <tr>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Recurso</th>
            <th>Detalles</th>
            <th>Fecha</th>
          </tr>
        </ng-template>
        <ng-template #body let-log>
          <tr>
            <td>{{ log.user_email }}</td>
            <td>
              <p-tag [value]="log.action" [severity]="UIHelpers.getActionSeverity(log.action)" />
            </td>
            <td>{{ log.resource_type }}</td>
            <td>{{ log.details }}</td>
            <td>{{ log.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class ActivityLogComponent implements OnInit {
  logs = signal<ActivityLog[]>([]);
  loading = signal(false);
  
  // Computed para estadísticas reactivas
  logStats = computed(() => {
    const logs = this.logs();
    return {
      total: logs.length,
      creates: logs.filter(l => l.action === 'CREATE').length,
      updates: logs.filter(l => l.action === 'UPDATE').length,
      deletes: logs.filter(l => l.action === 'DELETE').length
    };
  });

  constructor(private activityLogService: ActivityLogService) {}

  ngOnInit() {
    this.loadLogs();
    this.activityLogService.logs$.subscribe(logs => this.logs.set(logs));
  }

  loadLogs() {
    this.loading.set(true);
    this.activityLogService.loadLogs();
    this.loading.set(false);
  }

  UIHelpers = UIHelpers;
}
