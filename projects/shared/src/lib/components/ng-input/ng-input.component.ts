import { 
  Component, 
  forwardRef, 
  OnDestroy, 
  Input, 
  Optional, 
  Self,
  signal,
  OnInit,
  Injector,
  inject,
  AfterViewInit,
  input
} from '@angular/core';
import { 
  ControlValueAccessor, 
  NG_VALUE_ACCESSOR, 
  NgControl, 
  FormControl, 
  Validators,
  ReactiveFormsModule 
} from '@angular/forms';
import { 
  MatFormFieldModule, 
  FloatLabelType 
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InputType } from '../../enums/input-type';


@Component({
  selector: 'ng-input',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule
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
export class NgInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private injector = inject(Injector);

  // Input signals with default values
 

  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input<InputType>(InputType.Text);
  readonly suffixIcon = input('');
  readonly prefixIcon = input('');
  readonly suffixText = input('');
  readonly prefixText = input('');
  readonly required = input(false);
  readonly minlength = input<number | null>(null);
  readonly maxlength = input<number | null>(null);
  readonly readonly = input(false);
  floatLabel = input<FloatLabelType>('auto');

  // Manual validation signals
  hasError = signal(false);
  errorMessage = signal('');
  isInvalid = signal(false);
  validationMessage = signal('');

  // Internal form control for validation
  internalControl = new FormControl();
  
  value: any = null;
  disabled = false;
  private destroyed$ = new Subject<void>();
  private ngControl: NgControl | null = null;

  ngOnInit() {
    // Use setTimeout to avoid circular dependency during initialization
    setTimeout(() => {
      this.tryGetNgControl();
    });
    
    this.setupValidations();
    this.setupControlMonitoring();
  }

  private tryGetNgControl() {
    try {
      // Try to get NgControl from injector without causing circular dependency
      this.ngControl = this.injector.get(NgControl, null);
      
      if (this.ngControl && this.ngControl.valueAccessor === this) {
        // We are the value accessor, this is expected
      }
    } catch (error) {
      // Silently catch circular dependency errors
      this.ngControl = null;
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private setupValidations() {
    const validators = [];

    if (this.required()) {
      validators.push(Validators.required);
    }

    if (this.minlength() !== null) {
      validators.push(Validators.minLength(this.minlength()!));
    }

    if (this.maxlength() !== null) {
      validators.push(Validators.maxLength(this.maxlength()!));
    }

    if (this.type() === InputType.Email) {
      validators.push(Validators.email);
    }

    this.internalControl.setValidators(validators);
  }

  private setupControlMonitoring() {
    // Monitor internal control changes
    this.internalControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(value => {
        this.value = value;
        this.onChange(value);
      });

    this.internalControl.statusChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.onTouched();
      });
  }

  // --- ControlValueAccessor Implementation ---
  writeValue(value: any): void {
    this.value = value;
    this.internalControl.setValue(value, { emitEvent: false });
    
    // Also update external control if it exists
    if (this.ngControl?.control && value !== this.ngControl.control.value) {
      this.ngControl.control.setValue(value, { emitEvent: false });
    }
  }

  onChange = (value: any) => {};
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  onTouched = () => {};
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    isDisabled ? this.internalControl.disable() : this.internalControl.enable();
  }

  // --- Input handling ---
  handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.internalControl.setValue(value, { emitEvent: true });
    this.internalControl.markAsTouched();
  }

  handleBlur() {
    this.internalControl.markAsTouched();
    this.onTouched();
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
      const isTouchedOrDirty = (this.ngControl.touched === true) || (this.ngControl.dirty === true);
      return isInvalid && isTouchedOrDirty;
    }

    // Fallback to manual template-driven signals
    return this.hasError() || this.isInvalid();
  }

  get displayErrorMessage(): string {
    // Check internal control errors first
    if (this.internalControl.errors) {
      return this.getErrorMessageFromControl(this.internalControl);
    }

    // Check external ngControl errors (safe check)
    if (this.ngControl?.control?.errors) {
      return this.getErrorMessageFromControl(this.ngControl.control as FormControl);
    }

    // Fallback to manual error messages
    return this.errorMessage() || this.validationMessage() || 'Invalid input.';
  }

  private getErrorMessageFromControl(control: FormControl): string {
    const errors = control.errors;
    if (!errors) return '';

    if (errors['required']) return 'This field is required.';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters.`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters.`;
    if (errors['email']) return 'Invalid email address.';
    if (errors['pattern']) return 'Invalid format.';
    
    return 'Invalid input.';
  }

  // Expose InputType enum for template
  InputType = InputType;
}