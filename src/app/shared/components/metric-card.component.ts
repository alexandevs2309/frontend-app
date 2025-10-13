import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="surface-0 shadow-2 p-3 border-1 border-round">
      <div class="flex justify-content-between mb-3">
        <div>
          <span class="block text-500 font-medium mb-3">{{ title }}</span>
          <div class="text-900 font-medium text-xl">{{ formattedValue }}</div>
        </div>
        <div class="flex align-items-center justify-content-center border-round" 
             [ngClass]="iconBackgroundClass" 
             style="width:2.5rem;height:2.5rem">
          <i [ngClass]="iconClass" class="text-xl"></i>
        </div>
      </div>
      <div *ngIf="subtitle" class="text-500 text-sm">{{ subtitle }}</div>
    </div>
  `
})
export class MetricCardComponent {
  @Input() title: string = '';
  @Input() value: number | string = 0;
  @Input() icon: string = 'pi-info-circle';
  @Input() color: 'blue' | 'green' | 'orange' | 'purple' | 'red' = 'blue';
  @Input() format: 'number' | 'currency' | 'percentage' | 'text' = 'number';
  @Input() subtitle?: string;

  get formattedValue(): string {
    if (typeof this.value === 'string') return this.value;
    
    switch (this.format) {
      case 'currency':
        return `$${this.value.toLocaleString()}`;
      case 'percentage':
        return `${this.value}%`;
      case 'text':
        return this.value.toString();
      default:
        return this.value.toLocaleString();
    }
  }

  get iconClass(): string {
    return `pi ${this.icon} text-${this.color}-500`;
  }

  get iconBackgroundClass(): string {
    return `bg-${this.color}-100`;
  }
}