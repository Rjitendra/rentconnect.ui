import {
  Component,
  forwardRef,
  output,
  input,
  Injector,
  inject,
  OnInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
  FormControl,
} from '@angular/forms';

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
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule,
    NgLabelComponent,
    NgClarifyTextComponent,
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
export class NgDatepickerComponent implements ControlValueAccessor, OnInit {
  private injector = inject(Injector);
  public ngControl: NgControl | null = null;
  readonly label = input<string>('');
  readonly placeholder = input('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly appearance = input<'fill' | 'outline'>('outline');
  readonly uniqueId = input<string>('');
  readonly toolTip = input<string>('');
  readonly clarifyText = input<string>('');
  readonly hint = input<string>();
  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly startAt = input<Date | null>(null);
  readonly showToggle = input(true);
  readonly customIcon = input<string>('');
  readonly touchUi = input(false);
  readonly opened = input(false);
  readonly hasError = input(false);
  readonly errorMessage = input('');
  readonly isInvalid = input(false);
  readonly validationMessage = input('');

  readonly dateInput = output<any>();
  readonly dateChange = output<any>();
  readonly pickerOpened = output<void>();
  readonly pickerClosed = output<void>();

  value: Date | null = null;
  internalControl = new FormControl();

  private onChange = (value: Date | null) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.tryGetNgControl();
    this.setupValidationSync();
  }

  private tryGetNgControl() {
    try {
      this.ngControl = this.injector.get(NgControl, null);
    } catch (error) {
      this.ngControl = null;
    }
  }

  private setupValidationSync() {
    // Sync validation from external control to internal control
    if (this.ngControl?.control) {
      // Copy validators from external control
      this.internalControl.setValidators(this.ngControl.control.validator);
      // Sync validation state changes
      this.ngControl.control.statusChanges?.subscribe(() => {
        this.internalControl.updateValueAndValidity({ emitEvent: false });
      });
    }
  }

  writeValue(value: Date | null): void {
    this.value = value;
    this.internalControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
    this.internalControl.valueChanges.subscribe((value) => {
      this.value = value;
      fn(value);
    });
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.internalControl.disable();
    } else {
      this.internalControl.enable();
    }
  }

  onDateInput(event: any): void {
    this.value = event.value;
    this.internalControl.setValue(event.value);
    this.onChange(this.value);
    this.dateInput.emit(event);
  }

  onDateChange(event: any): void {
    this.value = event.value;
    this.internalControl.setValue(event.value);
    this.onChange(this.value);
    this.dateChange.emit(event);
  }

  onOpened(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.pickerOpened.emit();
  }

  onBlur(): void {
    this.internalControl.markAsTouched();
    // Also mark external control as touched if it exists
    if (this.ngControl?.control) {
      this.ngControl.control.markAsTouched();
    }
    this.onTouched();
  }

  onClosed(): void {
    this.internalControl.markAsTouched();
    // Also mark external control as touched if it exists
    if (this.ngControl?.control) {
      this.ngControl.control.markAsTouched();
    }
    this.onTouched();
    // TODO: The 'emit' function requires a mandatory void argument
    this.pickerClosed.emit();
  }

  // Note: Validation is now handled automatically by Angular Material
  // No custom validation logic needed - Angular handles invalid/touched states
}
