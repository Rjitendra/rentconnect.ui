import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'ng-button',
  imports: [MatButtonModule, MatDividerModule, MatIconModule, MatTooltip],
  templateUrl: './ng-button.html',
  styleUrl: './ng-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgButton {
  /** Type of button: text | elevated | outlined | filled | tonal | icon | fab | mini-fab | extended */
  @Input() type: string = 'text';

  /** Button label (for text inside the button) */
  @Input() label: string = 'Button';

  /** Material Icon (for icon/FAB buttons) */
  @Input() icon?: string;

  /** Disable state */
  @Input() disabled: boolean = false;

  /** Link URL (optional for anchor buttons) */
  @Input() href?: string;

  /** Tooltip text */
  @Input() tooltip?: string;

  /** Additional CSS classes */
  @Input() cssClass?: string;

  /** Event emitter for button click */
  @Output() buttonClick = new EventEmitter<void>();

  onClick() {
    if (!this.disabled) {
      this.buttonClick.emit();
    }
  }
}
