import { Component, input } from '@angular/core';
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
  readonly name = input<string>('');
  
  /** Icon size: small | medium | large | custom */
  readonly size = input<'small' | 'medium' | 'large' | 'custom'>('medium');
  
  /** Custom size in pixels (only used when size is 'custom') */
  readonly customSize = input<number>();
  
  /** Icon color */
  readonly color = input<string>();
  
  /** Whether the icon is disabled */
  readonly disabled = input<boolean>(false);
  
  /** Tooltip text */
  readonly tooltip = input<string>();
  
  /** Additional CSS classes */
  readonly cssClass = input<string>();

  get iconClasses(): string {
    const classes = ['ng-icon'];
    
    const size = this.size();
    if (size !== 'custom') {
      classes.push(`ng-icon-${size}`);
    }
    
    if (this.disabled()) {
      classes.push('ng-icon-disabled');
    }
    
    const cssClass = this.cssClass();
    if (cssClass) {
      classes.push(cssClass);
    }
    
    return classes.join(' ');
  }

  get iconStyles(): any {
    const styles: any = {};
    
    const customSize = this.customSize();
    if (this.size() === 'custom' && customSize) {
      styles.fontSize = `${customSize}px`;
      styles.width = `${customSize}px`;
      styles.height = `${customSize}px`;
    }
    
    const color = this.color();
    if (color) {
      styles.color = color;
    }
    
    return styles;
  }
}
