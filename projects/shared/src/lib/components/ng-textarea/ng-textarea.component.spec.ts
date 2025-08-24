import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgTextareaComponent } from './ng-textarea.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

describe('NgTextareaComponent', () => {
  let component: NgTextareaComponent;
  let fixture: ComponentFixture<NgTextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgTextareaComponent,
        MatFormFieldModule,
        MatInputModule,
        NgLabelComponent,
        NgClarifyTextComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NgTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle value changes', () => {
    const testValue = 'Test textarea content';
    component.writeValue(testValue);
    expect(component.value).toBe(testValue);
  });

  it('should emit inputChange when text is entered', () => {
    spyOn(component.inputChange, 'emit');
    const mockEvent = {
      target: { value: 'New text' }
    } as any;
    
    component.onInput(mockEvent);
    
    expect(component.inputChange.emit).toHaveBeenCalledWith('New text');
    expect(component.value).toBe('New text');
  });

  it('should show character count when enabled', () => {
    component.showCharacterCount = true;
    component.maxLength = 100;
    component.value = 'Test';
    fixture.detectChanges();
    
    const hint = fixture.nativeElement.querySelector('mat-hint');
    expect(hint?.textContent?.trim()).toContain('4 / 100');
  });

  it('should set disabled state correctly', () => {
    component.setDisabledState(true);
    expect(component.disabled()).toBe(true);
  });

  it('should emit focus event', () => {
    spyOn(component.focusEvent, 'emit');
    const mockEvent = new FocusEvent('focus');
    
    component.onFocus(mockEvent);
    
    expect(component.focusEvent.emit).toHaveBeenCalledWith(mockEvent);
  });
});