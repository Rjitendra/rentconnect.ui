import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
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
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
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
  @Input() label!: string;
  @Input() placeholder = '';
  @Input() options: SelectOption[] = [];
  @Input() multiple = false;
  @Input() disabled = false;
  @Input() required = false;
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() uniqueId!: string;
  @Input() toolTip!: string;
  @Input() clarifyText!: string;
  @Input() hint!: string;
  
  @Output() selectionChange = new EventEmitter<any>();
  @Output() openedChange = new EventEmitter<boolean>();

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
    this.disabled = isDisabled;
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
}