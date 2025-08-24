import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgSliderComponent } from './ng-slider.component';
import { MatSliderModule } from '@angular/material/slider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

describe('NgSliderComponent', () => {
  let component: NgSliderComponent;
  let fixture: ComponentFixture<NgSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgSliderComponent,
        MatSliderModule,
        NgLabelComponent,
        NgClarifyTextComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NgSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle value changes', () => {
    const testValue = 50;
    component.writeValue(testValue);
    expect(component.value).toBe(testValue);
  });

  it('should emit valueChange when value changes', () => {
    spyOn(component.valueChange, 'emit');
    const newValue = 75;
    
    component.onValueChange(newValue);
    
    expect(component.valueChange.emit).toHaveBeenCalledWith(newValue);
    expect(component.value).toBe(newValue);
  });

  it('should set disabled state correctly', () => {
    component.setDisabledState(true);
    expect(component.disabled()).toBe(true);
  });

  it('should emit dragEnd when dragging ends', () => {
    spyOn(component.dragEnd, 'emit');
    const mockEvent = { value: 60 };
    
    component.onDragEnd(mockEvent);
    
    expect(component.dragEnd.emit).toHaveBeenCalledWith(mockEvent);
  });

  it('should show current value when showValue is true', () => {
    component.showValue = true;
    component.value = 42;
    fixture.detectChanges();
    
    const valueElement = fixture.nativeElement.querySelector('.current-value');
    expect(valueElement?.textContent?.trim()).toContain('42');
  });

  it('should show min/max values when showMinMax is true', () => {
    component.showMinMax = true;
    component.min = 10;
    component.max = 90;
    fixture.detectChanges();
    
    const minElement = fixture.nativeElement.querySelector('.min-value');
    const maxElement = fixture.nativeElement.querySelector('.max-value');
    
    expect(minElement?.textContent?.trim()).toBe('10');
    expect(maxElement?.textContent?.trim()).toBe('90');
  });

  it('should default to min value when writeValue receives null', () => {
    component.min = 10;
    component.writeValue(null as any);
    expect(component.value).toBe(10);
  });
});