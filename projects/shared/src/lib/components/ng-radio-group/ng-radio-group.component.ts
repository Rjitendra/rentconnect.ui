import { Component, Input, forwardRef, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

export interface RadioOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ng-radio-group',
  standalone: true,
  imports: [
    CommonModule,
    MatRadioModule,
    NgLabelComponent,
    NgClarifyTextComponent
  ],
  templateUrl: './ng-radio-group.component.html',
  styleUrl: './ng-radio-group.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgRadioGroupComponent),
      multi: true,
    },
  ],
})
export class NgRadioGroupComponent implements ControlValueAccessor {
  @Input() groupLabel!: string;
  @Input() options: RadioOption[] = [];
  @Input() disabled = false;
  @Input() required = false;
  @Input() vertical = true;
  @Input() name!: string;
  @Input() toolTip!: string;
  @Input() clarifyText!: string;
  @Input() hint!: string;
  @Input() ariaLabel!: string;
  @Input() ariaLabelledBy!: string;
  
  readonly selectionChange = output<any>();

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
}