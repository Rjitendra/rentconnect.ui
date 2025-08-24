import { Component, forwardRef, output, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

@Component({
  selector: 'ng-textarea',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    NgLabelComponent,
    NgClarifyTextComponent
  ],
  templateUrl: './ng-textarea.component.html',
  styleUrl: './ng-textarea.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgTextareaComponent),
      multi: true,
    },
  ],
})
export class NgTextareaComponent implements ControlValueAccessor {
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
  readonly ariaLabel = input.required<string>();
  readonly rows = input(4);
  readonly cols = input.required<number>();
  readonly suffixIcon = input('');
  readonly prefixIcon = input('');
  readonly minRows = input(2);
  readonly maxRows = input(10);
  readonly maxLength = input.required<number>();
  readonly showCharacterCount = input(false);
  readonly isInvalid = input(false);
  readonly validationMessage = input('');
  
  readonly inputChange = output<string>();
  readonly focusEvent = output<FocusEvent>();

  value: string = '';

  private onChange = (value: string) => {};
  private onTouched = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  onFocus(event: FocusEvent): void {
    this.focusEvent.emit(event);
  }

  // Check if field has validation errors
  get hasValidationError(): boolean {
    return this.isInvalid();
  }

  // Get error message
  get displayErrorMessage(): string {
    return this.validationMessage() || '';
  }
}