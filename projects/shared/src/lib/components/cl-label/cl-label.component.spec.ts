import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClLabelComponent } from './cl-label.component';

describe('ClLabelComponent', () => {
  let component: ClLabelComponent;
  let fixture: ComponentFixture<ClLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClLabelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ClLabelComponent);
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
    expect(compiled.querySelector('.cl-label')?.textContent?.trim()).toContain('Test Label');
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
    const labelElement = compiled.querySelector('.cl-label') as HTMLElement;
    expect(labelElement.title).toBe('This is a tooltip');
  });
});