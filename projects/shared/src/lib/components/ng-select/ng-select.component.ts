import { Component, forwardRef, output, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ng-select',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
    MatIconModule,
    NgLabelComponent,
    NgClarifyTextComponent
],
  templateUrl: './ng-select.component.html',
  styleUrl: './ng-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgSelectComponent),
      multi: true,
    },
  ],
})
export class NgSelectComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly options = input<SelectOption[]>([]);
  readonly multiple = input(false);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly appearance = input<'fill' | 'outline'>('outline');
  readonly uniqueId = input<string>('');
  readonly toolTip = input<string>('');
  readonly clarifyText = input<string>('');
  readonly hint = input<string>('');
  readonly suffixIcon = input('');
  readonly prefixIcon = input('');
  readonly hasError = input(false);
  readonly errorMessage = input('');
  readonly isInvalid = input(false);
  readonly validationMessage = input('');
  
  readonly selectionChange = output<any>();
  readonly openedChange = output<boolean>();

  value: any = null;

  private onChange = (value: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // this.disabled = isDisabled;
  }

  onSelectionChange(event: any): void {
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
    this.selectionChange.emit(event);
  }

  onOpenedChange(opened: boolean): void {
    if (!opened) {
      this.onTouched();
    }
    this.openedChange.emit(opened);
  }

  // Check if field has validation errors
  get hasValidationError(): boolean {
    return this.hasError() || this.isInvalid();
  }

  // Get error message
  get displayErrorMessage(): string {
    return this.errorMessage() || this.validationMessage() || '';
  }
}