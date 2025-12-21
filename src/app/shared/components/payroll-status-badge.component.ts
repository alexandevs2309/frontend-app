import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { PayrollStatusUtil } from '../utils/payroll-status.util';

@Component({
  selector: 'app-payroll-status-badge',
  standalone: true,
  imports: [CommonModule, TagModule],
  template: `
    <div class="payroll-status-container">
      <!-- Badge principal -->
      <p-tag 
        [value]="displayText" 
        [severity]="severity"
        [style.background-color]="statusColor"
        [style.border-color]="statusColor"
        class="payroll-status-badge">
        <i [class]="statusIcon" class="mr-1"></i>
        {{ displayText }}
      </p-tag>
      
      <!-- Información adicional del período -->
      <div *ngIf="showPeriodInfo && periodDisplay" class="period-info mt-1">
        <small class="text-gray-600">
          {{ periodDisplay }}
        </small>
        <div *ngIf="statusDisplay && statusDisplay !== displayText" class="status-detail">
          <small [style.color]="statusColor">
            {{ statusDisplay }}
          </small>
        </div>
      </div>
      
      <!-- Mensaje completo para tooltips o modales -->
      <div *ngIf="showFullMessage" class="full-message mt-2 p-2 bg-gray-50 rounded text-sm">
        {{ fullMessage }}
      </div>
    </div>
  `,
  styles: [`
    .payroll-status-container {
      display: inline-block;
    }
    
    .payroll-status-badge {
      font-weight: 500;
    }
    
    .period-info {
      font-size: 0.75rem;
      line-height: 1.2;
    }
    
    .status-detail {
      font-weight: 500;
    }
    
    .full-message {
      white-space: pre-line;
      max-width: 250px;
    }
    
    /* Colores específicos para estados críticos */
    .payroll-status-badge[data-status="overdue"] {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `]
})
export class PayrollStatusBadgeComponent {
  @Input() status: string = '';
  @Input() statusDisplay: string = '';
  @Input() periodDisplay: string = '';
  @Input() periodDates: { start: string | null; end: string | null } | null = null;
  @Input() showPeriodInfo: boolean = true;
  @Input() showFullMessage: boolean = false;
  @Input() compact: boolean = false;

  get statusColor(): string {
    return PayrollStatusUtil.getStatusColor(this.status);
  }

  get statusIcon(): string {
    return PayrollStatusUtil.getStatusIcon(this.status);
  }

  get displayText(): string {
    if (this.compact) {
      return PayrollStatusUtil.getStatusLabel(this.status);
    }
    return this.statusDisplay || PayrollStatusUtil.getStatusLabel(this.status);
  }

  get severity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return PayrollStatusUtil.getStatusSeverity(this.status);
  }

  get fullMessage(): string {
    return PayrollStatusUtil.getFullStatusMessage(
      this.periodDisplay,
      this.statusDisplay || PayrollStatusUtil.getStatusLabel(this.status),
      this.status
    );
  }

  get requiresAttention(): boolean {
    return PayrollStatusUtil.requiresAttention(this.status);
  }
}