import {JsonPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'ng-checkbox',
  imports: [FormsModule, ReactiveFormsModule, MatCheckboxModule, JsonPipe],
  templateUrl: './ng-checkbox.html',
  styleUrl: './ng-checkbox.scss'
})
export class NgCheckbox {
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

  /** Output event when checkbox state changes */
  @Output() changed = new EventEmitter<boolean>();

  /** Handle change */
  onChange(event: any) {
    this.changed.emit(event.checked);
  }
}
