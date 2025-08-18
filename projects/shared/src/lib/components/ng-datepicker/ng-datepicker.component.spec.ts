import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgDatepickerComponent } from './ng-datepicker.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

describe('NgDatepickerComponent', () => {
  let component: NgDatepickerComponent;
  let fixture: ComponentFixture<NgDatepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgDatepickerComponent,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
        NgLabelComponent,
        NgClarifyTextComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NgDatepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle value changes', () => {
    const testDate = new Date('2023-12-25');
    component.writeValue(testDate);
    expect(component.value).toBe(testDate);
  });

  it('should emit dateChange when date changes', () => {
    spyOn(component.dateChange, 'emit');
    const mockEvent = { value: new Date('2023-12-25') };
    
    component.onDateChange(mockEvent);
    
    expect(component.dateChange.emit).toHaveBeenCalledWith(mockEvent);
    expect(component.value).toBe(mockEvent.value);
  });

  it('should emit dateInput when date is input', () => {
    spyOn(component.dateInput, 'emit');
    const mockEvent = { value: new Date('2023-12-25') };
    
    component.onDateInput(mockEvent);
    
    expect(component.dateInput.emit).toHaveBeenCalledWith(mockEvent);
  });

  it('should set disabled state correctly', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
  });

  it('should emit pickerOpened when opened', () => {
    spyOn(component.pickerOpened, 'emit');
    
    component.onOpened();
    
    expect(component.pickerOpened.emit).toHaveBeenCalled();
  });

  it('should emit pickerClosed when closed', () => {
    spyOn(component.pickerClosed, 'emit');
    
    component.onClosed();
    
    expect(component.pickerClosed.emit).toHaveBeenCalled();
  });
});