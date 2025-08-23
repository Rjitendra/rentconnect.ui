import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  forwardRef,
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
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIconModule,
    NgLabelComponent,
    NgClarifyTextComponent,
    ClLabelComponent,
    ClClarifyTextComponent,
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
  @Input() label: string = 'Checkbox';
  /** Whether the checkbox is checked */
  @Input() checked: boolean = false;
  /** Whether the checkbox is indeterminate */
  @Input() indeterminate: boolean = false;
  /** Position of the label: 'before' | 'after' */
  @Input() labelPosition: 'before' | 'after' = 'after';
  /** Whether the checkbox is disabled */
  @Input() disabled: boolean = false;
  /** FormControl for reactive forms support */
  @Input() control?: FormControl;
  /** FormControl for reactive forms support (alias) */
  @Input() formCtrl?: FormControl;
  /** FormGroup for reactive forms support */
  @Input() formGroup?: FormGroup;
  /** Whether to show as toggle instead of checkbox */
  @Input() isToggle: boolean = false;
  /** Whether field is required */
  @Input() isRequired: boolean = false;
  /** Tooltip text */
  @Input() toolTip?: string;
  /** Clarify text for help icon */
  @Input() clarifyText?: string;
  /** Color theme */
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  /** Unique ID for the checkbox */
  @Input() uniqueId?: string;
  /** Checkbox name */
  @Input() checkboxName?: string;
  /** Whether to hide label */
  @Input() hideLabel: boolean = false;
  /** Icon to display next to the checkbox */
  @Input() icon?: string;
  /** Output event when checkbox state changes */
  @Output() changed = new EventEmitter<boolean>();

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
    this.checked = this.value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onBlur(): void {
    this.onTouched();
  }
}
