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
  ReactiveFormsModule,
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

@Component({
  selector: 'ng-textarea',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    NgLabelComponent,
    NgClarifyTextComponent,
    ReactiveFormsModule,
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
export class NgTextareaComponent implements ControlValueAccessor, OnInit {
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
  readonly hint = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly rows = input(4);
  readonly cols = input<number>();
  readonly suffixIcon = input('');
  readonly prefixIcon = input('');
  readonly minRows = input(2);
  readonly maxRows = input(10);
  readonly maxLength = input<number>();
  readonly showCharacterCount = input(false);
  readonly isInvalid = input(false);
  readonly validationMessage = input('');

  readonly inputChange = output<string>();
  readonly focusEvent = output<FocusEvent>();

  value: string = '';
  internalControl = new FormControl();

  private onChange = (value: string) => {};
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

  writeValue(value: string): void {
    this.value = value || '';
    this.internalControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
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

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.internalControl.setValue(target.value);
    this.inputChange.emit(this.value);
  }

  onBlur(): void {
    this.internalControl.markAsTouched();
    // Also mark external control as touched if it exists
    if (this.ngControl?.control) {
      this.ngControl.control.markAsTouched();
    }
    this.onTouched();
  }

  onFocus(event: FocusEvent): void {
    this.focusEvent.emit(event);
  }

  // Note: Validation is now handled automatically by Angular Material
  // No custom validation logic needed - Angular handles invalid/touched states
}
