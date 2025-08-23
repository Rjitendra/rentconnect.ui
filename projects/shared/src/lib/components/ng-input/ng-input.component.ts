import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';


import { InputType } from '../../enums/input-type';

@Component({
  selector: 'ng-input',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './ng-input.component.html',
  styleUrl: './ng-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgInputComponent),
      multi: true,
    },
  ],
})
export class NgInputComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input<InputType>(InputType.Text);
  readonly disabled = input(false);
  readonly suffixIcon = input<string>('');
  readonly prefixIcon = input<string>('');
  readonly suffixText = input<string>('');
  readonly prefixText = input<string>('');
  readonly hasError = input<boolean>(false);
  readonly errorMessage = input<string>('');
  readonly isInvalid = input<boolean>(false);
  readonly validationMessage = input<string>('');

  value: string | null = null;

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    (this.disabled as any).value = isDisabled;
  }

  handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  // Check if field has validation errors
  get hasValidationError(): boolean {
    return this.hasError() || this.isInvalid();
  }

  // Get error message
  get displayErrorMessage(): string {
    return this.errorMessage() || this.validationMessage() || '';
  }

  InputType = InputType; // expose enum to the template (if needed)
}
