import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
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
  @Input() label!: string;
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() uniqueId!: string;
  @Input() toolTip!: string;
  @Input() clarifyText!: string;
  @Input() hint!: string;
  @Input() minDate!: Date;
  @Input() maxDate!: Date;
  @Input() startAt!: Date;
  @Input() showToggle = true;
  @Input() customIcon!: string;
  @Input() touchUi = false;
  @Input() opened = false;
  
  @Output() dateInput = new EventEmitter<any>();
  @Output() dateChange = new EventEmitter<any>();
  @Output() pickerOpened = new EventEmitter<void>();
  @Output() pickerClosed = new EventEmitter<void>();

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
    this.pickerOpened.emit();
  }

  onBlur(): void {
    this.onTouched();
  }

  onClosed(): void {
    this.onTouched();
    this.pickerClosed.emit();
  }
}