// ng-input.component.ts
import { Component, forwardRef, Input, input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ErrorStateMatcher } from '@angular/material/core';

// Note: Ensure this path is correct for your project
import { InputType } from '../../enums/input-type';

/**
 * A custom input component that acts as a ControlValueAccessor.
 * It's designed to work with both Angular Reactive and Template-Driven forms.
 */
@Component({
  selector: 'ng-input',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CommonModule
  ],
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
  // Inputs using the new input() decorator
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input<InputType>(InputType.Text);
  readonly suffixIcon = input('');
  readonly prefixIcon = input('');
  readonly suffixText = input('');
  readonly prefixText = input('');
  readonly hasError = input(false);
  readonly errorMessage = input('');
  readonly isInvalid = input(false);
  readonly validationMessage = input('');

  // Optional FormControl for reactive forms
  @Input() formControl: FormControl | null = null;

  value: any = null;
  private _disabled = false; // Internal property to manage the disabled state

  // Error state matcher for better control over when errors are shown
  readonly customErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: () => this.hasValidationError
  };

  // --- ControlValueAccessor methods ---
  writeValue(value: any): void {
    this.value = value;
  }

  onChange = (_: any) => {};
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  onTouched = () => {};
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Correctly handles the disabled state for the component.
   * Angular's forms system calls this method, and we store the state
   * in a private property.
   */
  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  /**
   * A public getter to provide the disabled state to the template.
   * This is the correct way to bind to the `[disabled]` attribute in the template.
   */
  get disabled(): boolean {
    return this._disabled;
  }

  // --- Component logic ---
  handleInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }

  /**
   * A getter that returns true if a validation error should be displayed.
   * It checks for reactive form errors first, then falls back to the
   * template-driven inputs.
   */
  get hasValidationError(): boolean {
    if (this.formControl) {
      return this.formControl.invalid && (this.formControl.touched || this.formControl.dirty);
    }
    return this.hasError() || this.isInvalid();
  }

  /**
   * Provides the appropriate error message based on the form state.
   */
  get displayErrorMessage(): string {
    if (this.formControl && this.formControl.errors) {
      const errors = this.formControl.errors;
      if (errors['required']) return 'This field is required.';
      if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters.`;
      if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters.`;
      if (errors['email']) return 'Invalid email address.';
    }
    return this.errorMessage() || this.validationMessage() || 'Invalid input.';
  }

  InputType = InputType;
}