import { Component, forwardRef, OnInit, output, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { Observable, map, startWith } from 'rxjs';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

export interface AutocompleteOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ng-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    NgLabelComponent,
    NgClarifyTextComponent
  ],
  templateUrl: './ng-autocomplete.component.html',
  styleUrl: './ng-autocomplete.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgAutocompleteComponent),
      multi: true,
    },
  ],
})
export class NgAutocompleteComponent implements ControlValueAccessor, OnInit {
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly options = input<AutocompleteOption[]>([]);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly appearance = input<'fill' | 'outline'>('outline');
  readonly uniqueId = input.required<string>();
  readonly toolTip = input.required<string>();
  readonly clarifyText = input.required<string>();
  readonly hint = input.required<string>();
  
  readonly optionSelected = output<AutocompleteOption>();
  readonly inputChange = output<string>();

  inputControl = new FormControl('');
  filteredOptions!: Observable<AutocompleteOption[]>;
  value: any = null;

  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngOnInit(): void {
    this.filteredOptions = this.inputControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  writeValue(value: any): void {
    this.value = value;
    if (value && typeof value === 'object' && value.label) {
      this.inputControl.setValue(value.label);
    } else if (typeof value === 'string') {
      this.inputControl.setValue(value);
    } else {
      this.inputControl.setValue('');
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.inputControl.disable();
    } else {
      this.inputControl.enable();
    }
  }

  onOptionSelected(event: any): void {
    this.value = event.option.value;
    this.onChange(this.value);
    this.optionSelected.emit(event.option.value);
  }

  onInputChange(event: any): void {
    const inputValue = event.target.value;
    this.inputChange.emit(inputValue);
    
    // If user types something that doesn't match any option, emit the string value
    if (typeof this.value === 'object' && this.value?.label !== inputValue) {
      this.value = inputValue;
      this.onChange(inputValue);
    }
  }

  displayWith = (option: AutocompleteOption): string => {
    return option && option.label ? option.label : '';
  };

  onBlur(): void {
    this.onTouched();
  }

  private _filter(value: string): AutocompleteOption[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return this.options().filter(option =>
      option.label.toLowerCase().includes(filterValue)
    );
  }
}