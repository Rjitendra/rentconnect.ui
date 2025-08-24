import { Component, Input, forwardRef, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

@Component({
  selector: 'ng-slider',
  standalone: true,
  imports: [
    CommonModule,
    MatSliderModule,
    NgLabelComponent,
    NgClarifyTextComponent
  ],
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
  @Input() label!: string;
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() disabled = false;
  @Input() required = false;
  @Input() discrete = false;
  @Input() showTickMarks = false;
  @Input() showMinMax = true;
  @Input() showValue = true;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() uniqueId!: string;
  @Input() name!: string;
  @Input() toolTip!: string;
  @Input() clarifyText!: string;
  @Input() hint!: string;
  @Input() valueUnit = '';
  @Input() displayValue!: string | number;
  
  readonly valueChange = output<number>();
  readonly dragEnd = output<any>();

  value: number = 0;

  private onChange = (value: number) => {};
  private onTouched = () => {};

  writeValue(value: number): void {
    this.value = value ?? this.min;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
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