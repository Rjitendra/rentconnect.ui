import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'ng-toggle-button',
  imports: [FormsModule, MatButtonToggleModule],
  templateUrl: './ng-toggle-button.html',
  styleUrl: './ng-toggle-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgToggleButton),
      multi: true,
    },
  ],
})
export class NgToggleButton implements ControlValueAccessor {
  /** Inputs for full control */
  @Input() options: { label: string; value: any }[] = []; // toggle items
  @Input() appearance: 'standard' | 'legacy' = 'standard';
  @Input() disabled = false;
  @Input() multiple = false;
  @Input() hideSingleSelectionIndicator = false;
  @Input() hideMultipleSelectionIndicator = false;

  /** Outputs */
  @Output() selectionChange = new EventEmitter<any>();

  /** internal value */
  value: any;

  /** ControlValueAccessor hooks */
  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    this.value = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Handle change */
  onToggleChange(event: any) {
    this.value = event.value;
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
  }
}
