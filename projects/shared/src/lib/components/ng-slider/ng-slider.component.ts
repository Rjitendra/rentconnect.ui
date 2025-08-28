import { Component, forwardRef, output, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { MatSliderModule } from '@angular/material/slider';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

@Component({
  selector: 'ng-slider',
  standalone: true,
  imports: [MatSliderModule, NgLabelComponent, NgClarifyTextComponent],
  templateUrl: './ng-slider.component.html',
  styleUrl: './ng-slider.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgSliderComponent),
      multi: true,
    },
  ],
})
export class NgSliderComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly discrete = input(false);
  readonly showTickMarks = input(false);
  readonly showMinMax = input(true);
  readonly showValue = input(true);
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
  readonly uniqueId = input.required<string>();
  readonly name = input.required<string>();
  readonly toolTip = input.required<string>();
  readonly clarifyText = input.required<string>();
  readonly hint = input.required<string>();
  readonly valueUnit = input('');
  readonly displayValue = input.required<string | number>();

  readonly valueChange = output<number>();
  readonly dragEnd = output<any>();

  value: number = 0;

  private onChange = (value: number) => {};
  private onTouched = () => {};

  writeValue(value: number): void {
    this.value = value ?? this.min();
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    //  this.disabled = isDisabled;
  }

  onValueChange(newValue: number): void {
    this.value = newValue;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onDragEnd(event: any): void {
    this.onTouched();
    this.dragEnd.emit(event);
  }
}
