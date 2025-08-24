import { Component, forwardRef, output, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

@Component({
  selector: 'ng-datepicker',
  standalone: true,
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule,
    NgLabelComponent,
    NgClarifyTextComponent
  ],
  templateUrl: './ng-datepicker.component.html',
  styleUrl: './ng-datepicker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgDatepickerComponent),
      multi: true,
    },
  ],
})
export class NgDatepickerComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly appearance = input<'fill' | 'outline'>('outline');
  readonly uniqueId = input.required<string>();
  readonly toolTip = input.required<string>();
  readonly clarifyText = input.required<string>();
  readonly hint = input.required<string>();
  readonly minDate = input.required<Date>();
  readonly maxDate = input.required<Date>();
  readonly startAt = input.required<Date>();
  readonly showToggle = input(true);
  readonly customIcon = input.required<string>();
  readonly touchUi = input(false);
  readonly opened = input(false);
  
  readonly dateInput = output<any>();
  readonly dateChange = output<any>();
  readonly pickerOpened = output<void>();
  readonly pickerClosed = output<void>();

  value: Date | null = null;

  private onChange = (value: Date | null) => {};
  private onTouched = () => {};

  writeValue(value: Date | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onDateInput(event: any): void {
    this.value = event.value;
    this.onChange(this.value);
    this.dateInput.emit(event);
  }

  onDateChange(event: any): void {
    this.value = event.value;
    this.onChange(this.value);
    this.dateChange.emit(event);
  }

  onOpened(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.pickerOpened.emit();
  }

  onBlur(): void {
    this.onTouched();
  }

  onClosed(): void {
    this.onTouched();
    // TODO: The 'emit' function requires a mandatory void argument
    this.pickerClosed.emit();
  }
}