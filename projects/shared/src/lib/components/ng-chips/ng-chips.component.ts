import { Component, Input, Output, EventEmitter, forwardRef, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

export interface ChipOption {
  value: any;
  label: string;
  removable?: boolean;
  selectable?: boolean;
  color?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'ng-chips',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    NgLabelComponent,
    NgClarifyTextComponent
  ],
  templateUrl: './ng-chips.component.html',
  styleUrl: './ng-chips.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgChipsComponent),
      multi: true,
    },
  ],
})
export class NgChipsComponent implements ControlValueAccessor, OnInit {
  @Input() label!: string;
  @Input() placeholder = 'Add item...';
  @Input() disabled = false;
  @Input() required = false;
  @Input() allowInput = true;
  @Input() availableOptions: ChipOption[] = [];
  @Input() separatorKeyCodes: number[] = [13, 188]; // Enter and comma
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() toolTip!: string;
  @Input() clarifyText!: string;
  @Input() hint!: string;
  @Input() maxChips!: number;
  
  @Output() chipAdded = new EventEmitter<ChipOption>();
  @Output() chipRemoved = new EventEmitter<ChipOption>();
  @Output() selectionChange = new EventEmitter<ChipOption[]>();

  @ViewChild('chipInput') chipInput!: ElementRef<HTMLInputElement>;

  selectedChips: ChipOption[] = [];
  inputControl = new FormControl('');
  filteredOptions!: Observable<ChipOption[]>;

  private onChange = (value: ChipOption[]) => {};
  private onTouched = () => {};

  ngOnInit(): void {
    this.filteredOptions = this.inputControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterOptions(value || ''))
    );
  }

  writeValue(value: ChipOption[]): void {
    this.selectedChips = value || [];
  }

  registerOnChange(fn: (value: ChipOption[]) => void): void {
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

  addChipFromInput(event: any): void {
    const value = (event.value || '').trim();
    if (value && this._canAddChip()) {
      const newChip: ChipOption = {
        value: value,
        label: value,
        removable: true,
        selectable: true
      };
      this._addChip(newChip);
      event.chipInput.clear();
      this.inputControl.setValue('');
    }
  }

  addChipFromAutocomplete(event: any): void {
    if (this._canAddChip()) {
      this._addChip(event.option.value);
      this.chipInput.nativeElement.value = '';
      this.inputControl.setValue('');
    }
  }

  removeChip(chip: ChipOption): void {
    const index = this.selectedChips.indexOf(chip);
    if (index >= 0) {
      this.selectedChips.splice(index, 1);
      this.onChange(this.selectedChips);
      this.chipRemoved.emit(chip);
      this.selectionChange.emit(this.selectedChips);
    }
  }

  private _addChip(chip: ChipOption): void {
    // Check if chip already exists
    const exists = this.selectedChips.some(existing => 
      existing.value === chip.value || existing.label === chip.label
    );
    
    if (!exists) {
      this.selectedChips.push(chip);
      this.onChange(this.selectedChips);
      this.chipAdded.emit(chip);
      this.selectionChange.emit(this.selectedChips);
    }
  }

  private _canAddChip(): boolean {
    return !this.maxChips || this.selectedChips.length < this.maxChips;
  }

  private _filterOptions(value: string): ChipOption[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return this.availableOptions.filter(option => {
      const isNotSelected = !this.selectedChips.some(selected => 
        selected.value === option.value
      );
      const matchesFilter = option.label.toLowerCase().includes(filterValue);
      return isNotSelected && matchesFilter;
    });
  }
}