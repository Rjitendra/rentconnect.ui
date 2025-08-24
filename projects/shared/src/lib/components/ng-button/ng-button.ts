import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
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
  readonly type = input<string>('text');

  /** Button label (for text inside the button) */
  readonly label = input<string>('Button');

  /** Material Icon (for icon/FAB buttons) */
  readonly icon = input<string>();

  /** Disable state */
  readonly disabled = input<boolean>(false);

  /** Link URL (optional for anchor buttons) */
  readonly href = input<string>();

  /** Tooltip text */
  readonly tooltip = input<string>();

  /** Additional CSS classes */
  readonly cssClass = input<string>();

    readonly buttonType = input<'button' | 'submit' | 'reset'>('button');

  /** Event emitter for button click */
  readonly buttonClick = output<void>();

  onClick() {
    if (!this.disabled() && this.buttonType() !== 'submit') {
      // TODO: The 'emit' function requires a mandatory void argument
      this.buttonClick.emit();
    }
  }
}
