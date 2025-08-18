import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgLabelComponent } from './ng-label.component';

describe('NgLabelComponent', () => {
  let component: NgLabelComponent;
  let fixture: ComponentFixture<NgLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgLabelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NgLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label text', () => {
    component.label = 'Test Label';
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.ng-label')?.textContent?.trim()).toContain('Test Label');
  });

  it('should show asterisk when required is true', () => {
    component.label = 'Required Field';
    component.required = true;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.required-asterisk')).toBeTruthy();
  });

  it('should not show asterisk when required is false', () => {
    component.label = 'Optional Field';
    component.required = false;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.required-asterisk')).toBeFalsy();
  });

  it('should set title attribute when toolTip is provided', () => {
    component.label = 'Test Label';
    component.toolTip = 'This is a tooltip';
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const labelElement = compiled.querySelector('.ng-label') as HTMLElement;
    expect(labelElement.title).toBe('This is a tooltip');
  });
});