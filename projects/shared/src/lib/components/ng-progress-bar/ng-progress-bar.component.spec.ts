import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgProgressBarComponent } from './ng-progress-bar.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

describe('NgProgressBarComponent', () => {
  let component: NgProgressBarComponent;
  let fixture: ComponentFixture<NgProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgProgressBarComponent,
        MatProgressBarModule,
        NgLabelComponent,
        NgClarifyTextComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NgProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display progress value when showValue is true', () => {
    component.label = 'Test Progress';
    component.showValue = true;
    component.value = 75;
    component.mode = 'determinate';
    fixture.detectChanges();
    
    const valueElement = fixture.nativeElement.querySelector('.progress-value');
    expect(valueElement?.textContent?.trim()).toContain('75%');
  });

  it('should not display progress value when mode is indeterminate', () => {
    component.label = 'Test Progress';
    component.showValue = true;
    component.mode = 'indeterminate';
    fixture.detectChanges();
    
    const valueElement = fixture.nativeElement.querySelector('.progress-value');
    expect(valueElement).toBeFalsy();
  });

  it('should show label when provided', () => {
    component.label = 'Loading Progress';
    fixture.detectChanges();
    
    const labelElement = fixture.nativeElement.querySelector('.progress-label ng-label');
    expect(labelElement).toBeTruthy();
  });

  it('should apply correct size class', () => {
    component.size = 'large';
    fixture.detectChanges();
    
    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBar?.classList).toContain('progress-large');
  });

  it('should show hint when provided', () => {
    component.hint = 'This is a progress hint';
    fixture.detectChanges();
    
    const hintElement = fixture.nativeElement.querySelector('.hint-text');
    expect(hintElement?.textContent?.trim()).toBe('This is a progress hint');
  });

  it('should use custom display value when provided', () => {
    component.label = 'Custom Progress';
    component.showValue = true;
    component.value = 50;
    component.displayValue = 'Half Complete';
    component.mode = 'determinate';
    fixture.detectChanges();
    
    const valueElement = fixture.nativeElement.querySelector('.progress-value');
    expect(valueElement?.textContent?.trim()).toContain('Half Complete');
  });
});