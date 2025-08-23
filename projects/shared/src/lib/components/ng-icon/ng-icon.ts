import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'ng-icon',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './ng-icon.html',
  styleUrl: './ng-icon.scss'
})
export class NgIconComponent {
  /** Material icon name */
  @Input() name: string = '';
  
  /** Icon size: small | medium | large | custom */
  @Input() size: 'small' | 'medium' | 'large' | 'custom' = 'medium';
  
  /** Custom size in pixels (only used when size is 'custom') */
  @Input() customSize?: number;
  
  /** Icon color */
  @Input() color?: string;
  
  /** Whether the icon is disabled */
  @Input() disabled: boolean = false;
  
  /** Tooltip text */
  @Input() tooltip?: string;
  
  /** Additional CSS classes */
  @Input() cssClass?: string;

  get iconClasses(): string {
    const classes = ['ng-icon'];
    
    if (this.size !== 'custom') {
      classes.push(`ng-icon-${this.size}`);
    }
    
    if (this.disabled) {
      classes.push('ng-icon-disabled');
    }
    
    if (this.cssClass) {
      classes.push(this.cssClass);
    }
    
    return classes.join(' ');
  }

  get iconStyles(): any {
    const styles: any = {};
    
    if (this.size === 'custom' && this.customSize) {
      styles.fontSize = `${this.customSize}px`;
      styles.width = `${this.customSize}px`;
      styles.height = `${this.customSize}px`;
    }
    
    if (this.color) {
      styles.color = this.color;
    }
    
    return styles;
  }
}
