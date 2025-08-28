import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  output,
  input,
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
  readonly options = input<
    {
      label: string;
      value: any;
    }[]
  >([]); // toggle items
  readonly appearance = input<'standard' | 'legacy'>('standard');
  readonly disabled = input(false);
  readonly multiple = input(false);
  readonly hideSingleSelectionIndicator = input(false);
  readonly hideMultipleSelectionIndicator = input(false);

  /** Outputs */
  readonly selectionChange = output<any>();

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
