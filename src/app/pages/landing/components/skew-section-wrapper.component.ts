import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'skew-section-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section 
      [class]="sectionClasses"
      class="relative overflow-hidden">
      
      <!-- Fondo con skew -->
      <div 
        class="absolute inset-0 -z-10"
        [class]="backgroundClasses"
        [style.transform]="skewTransform">
      </div>
      
      <!-- Contenido recto -->
      <div class="relative z-10">
        <ng-content></ng-content>
      </div>
    </section>
  `
})
export class SkewSectionWrapper {
  @Input() skewDirection: 'top' | 'bottom' = 'top';
  @Input() backgroundColor: string = 'bg-slate-50 dark:bg-slate-800';
  @Input() additionalClasses: string = '';

  get skewTransform(): string {
    return this.skewDirection === 'top' ? 'skewY(-2deg)' : 'skewY(2deg)';
  }

  get sectionClasses(): string {
    return `py-20 ${this.additionalClasses}`;
  }

  get backgroundClasses(): string {
    return this.backgroundColor;
  }
}