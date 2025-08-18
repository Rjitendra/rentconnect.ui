import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgSelectComponent, SelectOption } from './ng-select.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

describe('NgSelectComponent', () => {
  let component: NgSelectComponent;
  let fixture: ComponentFixture<NgSelectComponent>;

  const mockOptions: SelectOption[] = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3', disabled: true }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgSelectComponent,
        MatSelectModule,
        MatFormFieldModule,
        MatOptionModule,
        NgLabelComponent,
        NgClarifyTextComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NgSelectComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display options correctly', () => {
    component.options = mockOptions;
    fixture.detectChanges();
    
    const options = fixture.nativeElement.querySelectorAll('mat-option');
    expect(options.length).toBe(3);
  });

  it('should handle value changes', () => {
    const testValue = '2';
    component.writeValue(testValue);
    expect(component.value).toBe(testValue);
  });

  it('should emit selectionChange when selection changes', () => {
    spyOn(component.selectionChange, 'emit');
    const mockEvent = { value: '1' };
    
    component.onSelectionChange(mockEvent);
    
    expect(component.selectionChange.emit).toHaveBeenCalledWith(mockEvent);
    expect(component.value).toBe('1');
  });

  it('should show label when provided', () => {
    component.label = 'Test Label';
    fixture.detectChanges();
    
    const labelElement = fixture.nativeElement.querySelector('ng-label');
    expect(labelElement).toBeTruthy();
  });

  it('should set disabled state correctly', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
  });
});