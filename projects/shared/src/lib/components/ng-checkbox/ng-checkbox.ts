
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  forwardRef,
  output,
  input
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';
import { ClLabelComponent } from '../cl-label/cl-label.component';
import { ClClarifyTextComponent } from '../cl-clarify-text/cl-clarify-text.component';

@Component({
  selector: 'ng-checkbox',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIconModule,
    NgLabelComponent,
    NgClarifyTextComponent,
    ClLabelComponent,
    ClClarifyTextComponent
],
  templateUrl: './ng-checkbox.html',
  styleUrl: './ng-checkbox.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgCheckbox),
      multi: true,
    },
  ],
})
export class NgCheckbox implements ControlValueAccessor {
  /** Label for the checkbox */
  readonly label = input<string>('Checkbox');
  /** Whether the checkbox is checked */
  readonly checked = input<boolean>(false);
  /** Whether the checkbox is indeterminate */
  readonly indeterminate = input<boolean>(false);
  /** Position of the label: 'before' | 'after' */
  readonly labelPosition = input<'before' | 'after'>('after');
  /** Whether the checkbox is disabled */
  readonly disabled = input<boolean>(false);
  /** FormControl for reactive forms support */
  readonly control = input<FormControl>();
  /** FormControl for reactive forms support (alias) */
  readonly formCtrl = input<FormControl>();
  /** FormGroup for reactive forms support */
  readonly formGroup = input<FormGroup>();
  /** Whether to show as toggle instead of checkbox */
  readonly isToggle = input<boolean>(false);
  /** Whether field is required */
  readonly isRequired = input<boolean>(false);
  /** Tooltip text */
  readonly toolTip = input<string>();
  /** Clarify text for help icon */
  readonly clarifyText = input<string>('');
  /** Color theme */
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
  /** Unique ID for the checkbox */
  readonly uniqueId = input<string>();
  /** Checkbox name */
  readonly checkboxName = input<string>();
  /** Whether to hide label */
  readonly hideLabel = input<boolean>(false);
  /** Icon to display next to the checkbox */
  readonly icon = input<string>();
  /** Whether checkbox has validation error */
  readonly hasError = input<boolean>(false);
  /** Error message to display */
  readonly errorMessage = input<string>('');
  /** Whether checkbox is invalid */
  readonly isInvalid = input<boolean>(false);
  /** Validation message */
  readonly validationMessage = input<string>('');
  /** Output event when checkbox state changes */
  readonly changed = output<boolean>();

  value: boolean = false;
  private onChange = (value: boolean) => {};
  private onTouched = () => {};

  /** Handle change */
  onCheckboxChange(event: any) {
    this.value = event.checked;
    this.onChange(this.value);
    this.changed.emit(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.value = value || false;
   // this.checked = this.value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
   // this.disabled = isDisabled;
  }

  onBlur(): void {
    this.onTouched();
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
