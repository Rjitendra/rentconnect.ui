import {
  Component,
  forwardRef,
  inject,
  Injector,
  input,
  OnInit,
  output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';
import { NgLabelComponent } from '../ng-label/ng-label.component';

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
    NgLabelComponent,
    NgClarifyTextComponent,
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
export class NgCheckbox implements ControlValueAccessor, OnInit {
  private injector = inject(Injector);
  public ngControl: NgControl | null = null;
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
  internalControl = new FormControl();
  private onChange = (value: boolean) => {};
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

  /** Handle change */
  onCheckboxChange(event: any) {
    this.value = event.checked;
    this.internalControl.setValue(event.checked);
    this.onChange(this.value);
    this.changed.emit(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.value = value || false;
    this.internalControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: boolean) => void): void {
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

  onBlur(): void {
    this.internalControl.markAsTouched();
    // Also mark external control as touched if it exists
    if (this.ngControl?.control) {
      this.ngControl.control.markAsTouched();
    }
    this.onTouched();
  }

  // Note: Validation is now handled automatically by Angular Material
  // No custom validation logic needed - Angular handles invalid/touched states
}
