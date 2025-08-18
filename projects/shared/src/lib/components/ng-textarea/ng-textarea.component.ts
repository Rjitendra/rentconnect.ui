import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

@Component({
  selector: 'ng-textarea',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
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
  @Input() label!: string;
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() uniqueId!: string;
  @Input() toolTip!: string;
  @Input() clarifyText!: string;
  @Input() hint!: string;
  @Input() ariaLabel!: string;
  @Input() rows = 4;
  @Input() cols!: number;
  @Input() minRows = 2;
  @Input() maxRows = 10;
  @Input() maxLength!: number;
  @Input() showCharacterCount = false;
  
  @Output() inputChange = new EventEmitter<string>();
  @Output() focusEvent = new EventEmitter<FocusEvent>();

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
}