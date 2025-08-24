import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgAutocompleteComponent, AutocompleteOption } from './ng-autocomplete.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

describe('NgAutocompleteComponent', () => {
  let component: NgAutocompleteComponent;
  let fixture: ComponentFixture<NgAutocompleteComponent>;

  const mockOptions: AutocompleteOption[] = [
    { value: '1', label: 'Apple' },
    { value: '2', label: 'Banana' },
    { value: '3', label: 'Cherry' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgAutocompleteComponent,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule,
        NgLabelComponent,
        NgClarifyTextComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NgAutocompleteComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter options based on input', () => {
    component.ngOnInit();
    component.inputControl.setValue('App');
    
    component.filteredOptions.subscribe(filtered => {
      expect(filtered.length).toBe(1);
      expect(filtered[0].label).toBe('Apple');
    });
  });

  it('should handle value changes', () => {
    const testValue = mockOptions[0];
    component.writeValue(testValue);
    expect(component.value).toBe(testValue);
  });

  it('should emit optionSelected when option is selected', () => {
    spyOn(component.optionSelected, 'emit');
    const mockEvent = { option: { value: mockOptions[0] } };
    
    component.onOptionSelected(mockEvent);
    
    expect(component.optionSelected.emit).toHaveBeenCalledWith(mockOptions[0]);
    expect(component.value).toBe(mockOptions[0]);
  });

  it('should display label correctly', () => {
    const option = mockOptions[0];
    const result = component.displayWith(option);
    expect(result).toBe('Apple');
  });

  it('should set disabled state correctly', () => {
    component.setDisabledState(true);
    expect(component.disabled()).toBe(true);
    expect(component.inputControl.disabled).toBe(true);
  });
});