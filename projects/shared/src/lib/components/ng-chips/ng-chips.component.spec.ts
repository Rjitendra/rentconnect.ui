import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgChipsComponent, ChipOption } from './ng-chips.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

describe('NgChipsComponent', () => {
  let component: NgChipsComponent;
  let fixture: ComponentFixture<NgChipsComponent>;

  const mockOptions: ChipOption[] = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgChipsComponent,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        NgLabelComponent,
        NgClarifyTextComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NgChipsComponent);
    component = fixture.componentInstance;
    component.availableOptions = mockOptions;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle value changes', () => {
    const testChips = [mockOptions[0], mockOptions[1]];
    component.writeValue(testChips);
    expect(component.selectedChips).toEqual(testChips);
  });

  it('should add chip from input', () => {
    spyOn(component.chipAdded, 'emit');
    const mockEvent = { value: 'New Chip', chipInput: { clear: () => {} } };
    
    component.addChipFromInput(mockEvent);
    
    expect(component.chipAdded.emit).toHaveBeenCalled();
    expect(component.selectedChips.length).toBe(1);
    expect(component.selectedChips[0].label).toBe('New Chip');
  });

  it('should remove chip correctly', () => {
    const testChips = [mockOptions[0], mockOptions[1]];
    component.selectedChips = [...testChips];
    spyOn(component.chipRemoved, 'emit');
    
    component.removeChip(mockOptions[0]);
    
    expect(component.chipRemoved.emit).toHaveBeenCalledWith(mockOptions[0]);
    expect(component.selectedChips.length).toBe(1);
    expect(component.selectedChips[0]).toBe(mockOptions[1]);
  });

  it('should not add duplicate chips', () => {
    component.selectedChips = [mockOptions[0]];
    const initialLength = component.selectedChips.length;
    
    // Try to add the same chip again
    component.addChipFromAutocomplete({ option: { value: mockOptions[0] } });
    
    expect(component.selectedChips.length).toBe(initialLength);
  });

  it('should respect maxChips limit', () => {
    component.maxChips = 2;
    component.selectedChips = [mockOptions[0], mockOptions[1]];
    
    const mockEvent = { value: 'Third Chip', chipInput: { clear: () => {} } };
    component.addChipFromInput(mockEvent);
    
    expect(component.selectedChips.length).toBe(2); // Should not exceed maxChips
  });

  it('should set disabled state correctly', () => {
    component.setDisabledState(true);
    expect(component.disabled()).toBe(true);
    expect(component.inputControl.disabled).toBe(true);
  });
});