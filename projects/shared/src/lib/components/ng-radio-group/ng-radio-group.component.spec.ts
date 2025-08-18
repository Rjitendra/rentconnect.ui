import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgRadioGroupComponent, RadioOption } from './ng-radio-group.component';
import { MatRadioModule } from '@angular/material/radio';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

describe('NgRadioGroupComponent', () => {
  let component: NgRadioGroupComponent;
  let fixture: ComponentFixture<NgRadioGroupComponent>;

  const mockOptions: RadioOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgRadioGroupComponent,
        MatRadioModule,
        NgLabelComponent,
        NgClarifyTextComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NgRadioGroupComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all radio options', () => {
    component.options = mockOptions;
    fixture.detectChanges();
    
    const radioButtons = fixture.nativeElement.querySelectorAll('mat-radio-button');
    expect(radioButtons.length).toBe(3);
  });

  it('should handle value changes', () => {
    const testValue = 'option2';
    component.writeValue(testValue);
    expect(component.value).toBe(testValue);
  });

  it('should emit selectionChange when selection changes', () => {
    spyOn(component.selectionChange, 'emit');
    const mockEvent = { value: 'option1' };
    
    component.onSelectionChange(mockEvent);
    
    expect(component.selectionChange.emit).toHaveBeenCalledWith(mockEvent);
    expect(component.value).toBe('option1');
  });

  it('should show group label when provided', () => {
    component.groupLabel = 'Test Group';
    fixture.detectChanges();
    
    const groupLabel = fixture.nativeElement.querySelector('.group-label ng-label');
    expect(groupLabel).toBeTruthy();
  });

  it('should set disabled state correctly', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
  });

  it('should show hint when provided', () => {
    component.hint = 'This is a hint';
    fixture.detectChanges();
    
    const hintElement = fixture.nativeElement.querySelector('.hint-text');
    expect(hintElement?.textContent?.trim()).toBe('This is a hint');
  });
});