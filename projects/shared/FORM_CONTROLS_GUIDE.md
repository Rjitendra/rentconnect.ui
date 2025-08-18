# Angular Material Form Controls Library

A comprehensive collection of Angular Material form controls wrapped in reusable components with consistent styling and functionality.

## Available Components

### ✅ **Existing Components**
- `ng-input` - Text input fields
- `ng-checkbox` - Checkboxes and slide toggles
- `ng-button` - Various button types
- `ng-toggle-button` - Button toggle groups

### 🆕 **New Form Controls**

## 1. ng-select (Dropdown/Select)

```html
<ng-select
  label="Choose Option"
  placeholder="Select an option"
  [options]="selectOptions"
  [multiple]="false"
  [required]="true"
  [(ngModel)]="selectedValue"
  (selectionChange)="onSelectionChange($event)">
</ng-select>
```

**Properties:**
- `options: SelectOption[]` - Array of options
- `multiple: boolean` - Allow multiple selections
- `appearance: 'fill' | 'outline'` - Material form field appearance
- `clarifyText: string` - Help text with icon
- `hint: string` - Hint text below field

## 2. ng-autocomplete (Autocomplete Input)

```html
<ng-autocomplete
  label="Search Users"
  placeholder="Type to search..."
  [options]="userOptions"
  [(ngModel)]="selectedUser"
  (optionSelected)="onUserSelected($event)">
</ng-autocomplete>
```

**Features:**
- Real-time filtering
- Custom display function
- Template support for options

## 3. ng-textarea (Multi-line Text)

```html
<ng-textarea
  label="Description"
  placeholder="Enter description..."
  [rows]="4"
  [maxLength]="500"
  [showCharacterCount]="true"
  [(ngModel)]="description">
</ng-textarea>
```

**Features:**
- Auto-resize capability
- Character count display
- Min/max rows configuration

## 4. ng-datepicker (Date Selection)

```html
<ng-datepicker
  label="Select Date"
  [minDate]="minDate"
  [maxDate]="maxDate"
  [showToggle]="true"
  [(ngModel)]="selectedDate"
  (dateChange)="onDateChange($event)">
</ng-datepicker>
```

**Features:**
- Date range restrictions
- Custom calendar icon
- Touch UI support
- Keyboard navigation

## 5. ng-radio-group (Radio Buttons)

```html
<ng-radio-group
  groupLabel="Select Option"
  [options]="radioOptions"
  [vertical]="true"
  [(ngModel)]="selectedOption"
  (selectionChange)="onRadioChange($event)">
</ng-radio-group>
```

**Features:**
- Horizontal/vertical layout
- Individual option disable
- Group validation

## 6. ng-slider (Range Slider)

```html
<ng-slider
  label="Volume"
  [min]="0"
  [max]="100"
  [step]="5"
  [showValue]="true"
  valueUnit="%"
  [(ngModel)]="volume">
</ng-slider>
```

**Features:**
- Custom min/max/step values
- Discrete or continuous mode
- Tick marks display
- Custom value formatting

## 7. ng-chips (Chip Input)

```html
<ng-chips
  label="Tags"
  placeholder="Add tags..."
  [availableOptions]="availableTags"
  [maxChips]="5"
  [(ngModel)]="selectedTags"
  (chipAdded)="onChipAdded($event)">
</ng-chips>
```

**Features:**
- Autocomplete integration
- Drag and drop support
- Custom chip styling
- Maximum chip limits

## 8. ng-file-upload (File Upload)

```html
<ng-file-upload
  label="Upload Files"
  [config]="uploadConfig"
  [allowRemove]="true"
  [(ngModel)]="uploadedFiles"
  (filesSelected)="onFilesSelected($event)">
</ng-file-upload>
```

**Configuration:**
```typescript
uploadConfig: FileUploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ['image/*', '.pdf'],
  maxFiles: 3,
  allowMultiple: true
};
```

**Features:**
- Drag and drop upload
- File type validation
- Size restrictions
- Progress tracking
- Preview support

## 9. ng-progress-bar (Progress Indicator)

```html
<ng-progress-bar
  label="Upload Progress"
  [value]="uploadProgress"
  mode="determinate"
  [showValue]="true"
  color="primary">
</ng-progress-bar>
```

**Modes:**
- `determinate` - Known progress value
- `indeterminate` - Unknown progress
- `buffer` - Buffered progress
- `query` - Query progress

## 10. ng-stepper (Step-by-Step Form)

```html
<ng-stepper
  [steps]="stepConfigs"
  [linear]="true"
  orientation="horizontal"
  (stepCompleted)="onStepCompleted($event)">
</ng-stepper>
```

**Step Configuration:**
```typescript
stepConfigs: StepConfig[] = [
  { label: 'Basic Info', completed: false },
  { label: 'Details', completed: false },
  { label: 'Review', completed: false }
];
```

## Common Features

### All Form Controls Include:
- **Reactive Forms** support via `ControlValueAccessor`
- **Template-driven forms** support via `ngModel`
- **Validation** integration
- **Accessibility** features (ARIA labels, keyboard navigation)
- **Consistent styling** with Material Design
- **Help text** and tooltips via `clarifyText` and `toolTip`
- **Required field** indicators
- **Disabled state** support

### Common Properties:
```typescript
// Universal properties for all form controls
label: string;           // Field label
required: boolean;       // Required field indicator
disabled: boolean;       // Disabled state
toolTip: string;         // Tooltip text
clarifyText: string;     // Help text with icon
hint: string;           // Hint text below field
uniqueId: string;       // Unique identifier
```

## Usage Examples

### Reactive Forms
```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class MyComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      category: ['', Validators.required],
      birthDate: [''],
      tags: [[]],
      files: [[]]
    });
  }
}
```

```html
<form [formGroup]="form">
  <ng-input 
    label="Name" 
    formControlName="name"
    required="true">
  </ng-input>
  
  <ng-select
    label="Category"
    [options]="categories"
    formControlName="category">
  </ng-select>
  
  <ng-datepicker
    label="Birth Date"
    formControlName="birthDate">
  </ng-datepicker>
</form>
```

### Template-driven Forms
```html
<ng-input 
  label="Username"
  [(ngModel)]="user.username"
  required="true"
  #username="ngModel">
</ng-input>

<div *ngIf="username.invalid && username.touched">
  Username is required
</div>
```

## Installation & Setup

1. **Install Dependencies** (if not already installed):
```bash
npm install @angular/material @angular/cdk @angular/animations
```

2. **Import Components** in your module or component:
```typescript
import { 
  NgSelectComponent,
  NgAutocompleteComponent,
  NgTextareaComponent,
  NgDatepickerComponent,
  NgRadioGroupComponent,
  NgSliderComponent,
  NgChipsComponent,
  NgFileUploadComponent,
  NgProgressBarComponent,
  NgStepperComponent
} from '@your-org/shared';
```

3. **Add to Component Imports** (for standalone components):
```typescript
@Component({
  imports: [
    NgSelectComponent,
    NgAutocompleteComponent,
    // ... other components
  ]
})
```

## Best Practices

1. **Consistent Labeling**: Use clear, descriptive labels for all form controls
2. **Validation**: Implement proper validation with meaningful error messages
3. **Accessibility**: Always provide `toolTip` or `clarifyText` for complex fields
4. **Required Fields**: Mark required fields consistently across your application
5. **Loading States**: Use `ng-progress-bar` for long-running operations
6. **File Uploads**: Set appropriate file size and type restrictions
7. **Multi-step Forms**: Use `ng-stepper` for complex forms with logical groupings

## Styling & Theming

All components inherit from Angular Material's theming system:

```scss
// In your global styles
@use '@angular/material' as mat;

$my-primary: mat.define-palette(mat.$indigo-palette);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
$my-theme: mat.define-light-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
  )
));

@include mat.all-component-themes($my-theme);
```

## Support & Documentation

Each component includes:
- **TypeScript interfaces** for type safety
- **Comprehensive unit tests** for reliability
- **Storybook stories** for interactive documentation
- **JSDoc comments** for IDE support

For additional help, refer to the individual component documentation or the Angular Material documentation.