import {
  Component,
  forwardRef,
  output,
  input,
  Injector,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  NgControl,
  FormControl,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    NgClarifyTextComponent,
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
export class NgSelectComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  private injector = inject(Injector);
  public ngControl: NgControl | null = null;
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
  internalControl = new FormControl();
  private destroyed$ = new Subject<void>();

  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.tryGetNgControl();
    this.setupValidations();
    this.setupValidationSync();
    this.setupControlMonitoring();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private tryGetNgControl() {
    try {
      this.ngControl = this.injector.get(NgControl, null);
    } catch (error) {
      this.ngControl = null;
    }
  }

  private setupValidations() {
    const validators = [];

    if (this.required()) {
      validators.push(Validators.required);
    }

    this.internalControl.setValidators(validators);
  }

  private setupValidationSync() {
    // Sync validation from external control to internal control
    if (this.ngControl?.control) {
      // Copy validators from external control if they exist
      const externalValidators = this.ngControl.control.validator;
      if (externalValidators) {
        const currentValidators = this.internalControl.validator;
        const combinedValidators = [
          currentValidators,
          externalValidators,
        ].filter((v) => v !== null);
        if (combinedValidators.length > 0) {
          this.internalControl.setValidators(combinedValidators);
        }
      }

      // Sync validation state changes
      this.ngControl.control.statusChanges
        ?.pipe(takeUntil(this.destroyed$))
        .subscribe(() => {
          this.internalControl.updateValueAndValidity({ emitEvent: false });
        });
    }
  }

  private setupControlMonitoring() {
    // Monitor internal control changes
    this.internalControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((value) => {
        this.value = value;
        this.onChange(value);
      });

    this.internalControl.statusChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.onTouched();
      });
  }

  writeValue(value: any): void {
    this.value = value;
    this.internalControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: any) => void): void {
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

  onSelectionChange(event: any): void {
    this.value = event.value;
    this.internalControl.setValue(event.value);
    this.internalControl.markAsTouched();
    // Also mark external control as touched if it exists
    if (this.ngControl?.control) {
      this.ngControl.control.markAsTouched();
    }
    this.onChange(this.value);
    this.onTouched();
    this.selectionChange.emit(event);
  }

  onOpenedChange(opened: boolean): void {
    if (!opened) {
      this.internalControl.markAsTouched();
      // Also mark external control as touched if it exists
      if (this.ngControl?.control) {
        this.ngControl.control.markAsTouched();
      }
      this.onTouched();
    }
    this.openedChange.emit(opened);
  }

  // --- Validation logic ---
  get hasValidationError(): boolean {
    // Check internal control first
    if (this.internalControl.invalid && this.internalControl.touched) {
      return true;
    }

    // Check external ngControl if available (safe check)
    if (this.ngControl?.control) {
      const isInvalid = this.ngControl.invalid === true;
      const isTouchedOrDirty =
        this.ngControl.touched === true || this.ngControl.dirty === true;
      return isInvalid && isTouchedOrDirty;
    }

    // Fallback to manual template-driven signals
    return this.hasError() || this.isInvalid();
  }

  get isTouched(): boolean {
    return (
      this.internalControl.touched || this.ngControl?.control?.touched === true
    );
  }

  get displayErrorMessage(): string {
    // Check internal control errors first
    if (this.internalControl.errors) {
      return this.getErrorMessageFromControl(this.internalControl);
    }

    // Check external ngControl errors (safe check)
    if (this.ngControl?.control?.errors) {
      return this.getErrorMessageFromControl(
        this.ngControl.control as FormControl,
      );
    }

    // Fallback to manual error messages
    return (
      this.errorMessage() || this.validationMessage() || 'Invalid selection.'
    );
  }

  private getErrorMessageFromControl(control: FormControl): string {
    const errors = control.errors;
    if (!errors) return '';

    if (errors['required']) return 'This field is required.';

    return 'Invalid selection.';
  }
}
